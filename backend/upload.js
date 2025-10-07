const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { randomUUID } = require('crypto');

// Définir le répertoire de destination
const uploadDir = path.join(__dirname, "uploads");

// Vérifier si le dossier existe, sinon il est créé
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Configuration du stockage pour Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const id = randomUUID();
    cb(null, `${id}${ext}`);
  },
});

// Définir la taille maximale du fichier (par défaut 300 Mo pour supporter les vidéos)
const upload = multer({
  storage,
  limits: {
    fileSize: 300 * 1024 * 1024, // 300 Mo
  },
  fileFilter: (req, file, cb) => {
    const name = file.originalname.toLowerCase();
    const excel = /\.(xlsx)$/.test(name) && file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    const video = /\.(mp4|webm|ogg)$/.test(name) && /^video\//.test(file.mimetype);
    if (!excel && !video) {
      return cb(new Error('Seuls les fichiers Excel (.xlsx) ou videos (.mp4,.webm,.ogg) sont autorisés'));
    }
    cb(null, true);
  },
});

module.exports = upload;
