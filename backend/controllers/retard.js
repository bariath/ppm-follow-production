const moment = require('moment');
const { Activité } = require('../models/activité');
const EtapeActivite = require('../models/etapeActivite');

/**
 * GET /api/etapes-retard
 * Récupère toutes les étapes en retard
 */
exports.etapesretard = async (req, res) => {
  try {
    const maintenant = moment().startOf('day').toDate();

    const etapesEnRetard = await EtapeActivite.find({
      delaiReel: { $lt: maintenant }, // Date déjà passée
      statut: { $ne: 'Terminée' }, // Statut différent de "Terminée"
      Confirmer: { $ne: 'OK' }
    })
      .populate('activité')
      .populate('etape');

    if (!etapesEnRetard.length) {
      console.log('❌ Aucune étape en retard trouvée.');
      return res.status(200).json({ message: 'Aucune étape en retard trouvée', data: [] });
    }

    console.log(`✅ ${etapesEnRetard.length} étape(s) en retard trouvée(s).`);
    return res.status(200).json({ data: etapesEnRetard });
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des étapes en retard :', error.message);
    return res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

/**
 * PATCH /api/etapes/:id/confirmer
 * Confirme une étape en mettant le champ Confirmer à "OK"
 */
exports.confirmerEtape = async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifier si l'ID est valide
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ 
        message: 'ID d\'étape invalide',
        error: 'L\'ID fourni n\'est pas un ObjectId MongoDB valide' 
      });
    }

    // Chercher l'étape
    const etape = await EtapeActivite.findById(id);

    if (!etape) {
      console.log(`❌ Étape avec ID ${id} non trouvée.`);
      return res.status(404).json({ 
        message: 'Étape non trouvée',
        error: `Aucune étape trouvée avec l'ID ${id}` 
      });
    }

    // Vérifier si l'étape n'est pas déjà confirmée
    if (etape.Confirmer === 'OK') {
      console.log(`⚠️ Étape ${id} déjà confirmée.`);
      return res.status(200).json({ 
        message: 'Étape déjà confirmée',
        data: etape 
      });
    }

    // Mettre à jour le champ Confirmer
    const etapeConfirmee = await EtapeActivite.findByIdAndUpdate(
      id,
      { 
        Confirmer: 'OK',
        // Optionnel : ajouter une date de confirmation
        dateConfirmation: new Date()
      },
      { 
        new: true, // Retourner le document mis à jour
        runValidators: true // Exécuter les validateurs du schéma
      }
    ).populate('activité').populate('etape');

    console.log(`✅ Étape ${id} confirmée avec succès.`);
    
    return res.status(200).json({
      message: 'Étape confirmée avec succès',
      data: etapeConfirmee
    });

  } catch (error) {
    console.error('❌ Erreur lors de la confirmation de l\'étape :', error.message);
    return res.status(500).json({ 
      message: 'Erreur serveur lors de la confirmation', 
      error: error.message 
    });
  }
};

exports.getEtapesDeLaSemaine = async (req, res) => {
  try {
    const debutSemaine = moment().startOf('isoWeek').toDate(); // lundi
    const finSemaine = moment().endOf('isoWeek').toDate();     // dimanche

    const activitesEnCours = await Activité.find({ 'donnéesDeBase.statutActivite': 'En cours' });

    if (!activitesEnCours.length) {
      return res.status(200).json([]);
    }

    const idsActivites = activitesEnCours.map(a => a._id);

    const etapes = await EtapeActivite.find({
      activité: { $in: idsActivites },
      delaiReel: { $gte: debutSemaine, $lte: finSemaine }
    })
      .populate('activité')
      .populate('etape');

    const resultats = etapes.map(e => ({
      id: e.activité?.id || null,
      numEtape: e.etape?.NumEtape || null,
      nomEtape: e.etape?.nom || null,
      numRefActivite: e.activité?.donnéesDeBase?.numRéf || null,
      description: e.activité?.donnéesDeBase?.description || null,
      delaiReel: e.delaiReel,
    }));

    return res.status(200).json(resultats);
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des étapes de la semaine :', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};