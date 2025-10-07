const express = require('express');
const router = express.Router();
const upload = require('../upload');
const isAuthenticated = require('../middleware/auth');
const { authorize } = require('../middleware/authorization');
const { validate, validateHelpVideo, validatePagination, validateObjectId } = require('../middleware/validation');
const { asyncHandler, createError } = require('../middleware/errorHandler');
const HelpVideo = require('../models/helpVideo');

// Lister les vidéos accessibles selon le rôle, avec pagination et filtre optionnel
router.get('/help-videos', isAuthenticated, validate(validatePagination), asyncHandler(async (req, res) => {
  try {
    const viewerRole = req.user?.role || 'user';
    const filterRole = req.query.role; // admin peut filtrer
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || '12', 10), 1), 100);
    const skip = (page - 1) * limit;

    let query = {};
    if (viewerRole !== 'admin') {
      query = { roles: viewerRole };
    } else if (filterRole) {
      query = { roles: filterRole };
    }

    const [items, total] = await Promise.all([
      HelpVideo.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      HelpVideo.countDocuments(query)
    ]);

    const payload = items.map(v => ({
      id: v._id,
      title: v.title,
      description: v.description,
      roles: v.roles,
      url: `${req.protocol}://${req.get('host')}/api/videos/${v.filename}`,
      size: v.size,
      mimeType: v.mimeType,
      createdAt: v.createdAt
    }));

    res.json({ items: payload, total, page, limit });
  } catch (e) {
    throw createError('Erreur lors du chargement des vidéos', 500);
  }
}));

// Upload vidéo: réservé admin/manager
// Upload vidéo avec gestion explicite des erreurs Multer
router.post(
  '/help-videos/upload',
  isAuthenticated,
  authorize('create', 'HelpVideo'),
  validate(validateHelpVideo),
  (req, res, next) => {
    upload.single('video')(req, res, function(err) {
      if (err && err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ error: 'Fichier trop volumineux (max 300 Mo)' });
      }
      if (err) {
        return res.status(400).json({ error: 'Erreur de téléchargement: ' + err.message });
      }
      next();
    })
  },
  async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ error: 'Fichier vidéo requis' });
      const { title, description } = req.body;
      // roles peut arriver multiple fois; normaliser en tableau
      const rolesRaw = req.body.roles;
      const rolesArray = Array.isArray(rolesRaw)
        ? rolesRaw.map(r => String(r).trim()).filter(Boolean)
        : (rolesRaw ? String(rolesRaw).split(',').map(r => r.trim()) : ['user']);

      const video = await HelpVideo.create({
        title,
        description,
        roles: rolesArray,
        filename: req.file.filename,
        mimeType: req.file.mimetype,
        size: req.file.size,
        uploadedBy: req.user?.mail
      });
      res.status(201).json({ success: true, id: video._id });
    } catch (e) {
      res.status(500).json({ error: "Erreur lors de l'upload" });
    }
  }
);

// Mise à jour des métadonnées (titre/description/roles)
router.put('/help-videos/:id', isAuthenticated, authorize('update', 'HelpVideo'), validate(validateObjectId), validate(validateHelpVideo), asyncHandler(async (req, res) => {
  try {
    const { title, description, roles } = req.body;
    const rolesArray = Array.isArray(roles) ? roles : (roles ? roles.split(',').map(r => r.trim()) : undefined);
    const update = {};
    if (title !== undefined) update.title = title;
    if (description !== undefined) update.description = description;
    if (rolesArray !== undefined) update.roles = rolesArray;
    const video = await HelpVideo.findByIdAndUpdate(req.params.id, { $set: update }, { new: true });
    if (!video) return res.status(404).json({ error: 'Vidéo non trouvée' });
    res.json({ success: true });
  } catch (e) {
    throw createError('Erreur lors de la mise à jour', 500);
  }
}));

// Suppression d'une vidéo (métadonnées et fichier sur disque)
router.delete('/help-videos/:id', isAuthenticated, authorize('delete', 'HelpVideo'), validate(validateObjectId), asyncHandler(async (req, res) => {
  try {
    const video = await HelpVideo.findByIdAndDelete(req.params.id);
    if (!video) return res.status(404).json({ error: 'Vidéo non trouvée' });
    // Tentative de suppression du fichier
    try {
      const fs = require('fs');
      const path = require('path');
      const file = path.join(__dirname, '..', 'uploads', video.filename);
      if (fs.existsSync(file)) fs.unlinkSync(file);
    } catch (_) {}
    res.json({ success: true });
  } catch (e) {
    throw createError('Erreur lors de la suppression', 500);
  }
}));

// Route supprimée - les vidéos sont servies directement par app.js

module.exports = router;


