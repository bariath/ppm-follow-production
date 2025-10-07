const Etape = require('../models/etape');
const { Activité } = require('../models/activité'); 
const EtapeActivite = require('../models/etapeActivite');
const mongoose = require("mongoose");

const getPeriodeDates = (year, startMonth = 1, endMonth = 12) => {
  const yearNum = parseInt(year);
  const startMonthNum = parseInt(startMonth);
  const endMonthNum = parseInt(endMonth);

  if (
    isNaN(yearNum) || isNaN(startMonthNum) || isNaN(endMonthNum) ||
    startMonthNum < 1 || startMonthNum > 12 ||
    endMonthNum < 1 || endMonthNum > 12
  ) {
    throw new Error("Année ou mois invalides");
  }

  const start = new Date(yearNum, startMonthNum - 1, 1);
  const end = new Date(yearNum, endMonthNum, 0, 23, 59, 59, 999);

  return { start, end };
};

const getActivitesPrevu = async (start, end) => {
  return await EtapeActivite.find({
    numEtape: 1,
    delaiPrevu: { $gte: start, $lte: end }
  });
};

// Fonction générique pour l'agrégation par mode ou type
const getActiviteAggregate = async (ids, groupField, sumField = "montantEstimatif") => {
  return await Activité.aggregate([
    { $match: { _id: { $in: ids } } },
    {
      $group: {
        _id: `$donnéesDeBase.${groupField}`,
        count: { $sum: 1 },
        [`total${sumField.charAt(0).toUpperCase() + sumField.slice(1)}`]: {
          $sum: { $ifNull: [`$donnéesDeBase.${sumField}`, 0] }
        }
      }
    }
  ]);
};

const getActiviteParMode = async (ids) => {
  return await getActiviteAggregate(ids, "modeDePassation");
};

const getActiviteParType = async (ids) => {
  return await getActiviteAggregate(ids, "typeDeMarché");
};

const getActiviteDemarees = async (start, end) => {
  const today = new Date();
  return await EtapeActivite.find({
    numEtape: 1,
    delaiPrevu: { $gte: start, $lte: end },
    delaiReel: { $lte: today } 
  });
};

const getActiviteDemareeParMode = async (ids) => {
  return await getActiviteAggregate(ids, "modeDePassation", "montantAttribué");
};

const getActiviteDemareeParType = async (ids) => {
  return await getActiviteAggregate(ids, "typeDeMarché", "montantAttribué");
};

// Fonction générique pour récupérer les activités par statut d'étape
const getActivitesByStatutEtape = async (ids, statutEtape) => {
  const today = new Date();
  
  const etapes = await EtapeActivite.find({
    activité: { $in: ids },
    statutEtape,
    delaiReel: { $lte: today }  
  })
    .populate("activité")
    .populate("etape")
    .sort({ NumEtape: -1 });

  // Utilisation d'un Map pour éviter les doublons et ne garder que la dernière étape par activité
  const uniqueMap = new Map();
  for (const e of etapes) {
    if (e.activité && !uniqueMap.has(e.activité._id.toString())) {
      uniqueMap.set(e.activité._id.toString(), e);
    }
  }

  return Array.from(uniqueMap.values());
};

// Toutes les fonctions spécifiques utilisant la fonction générique
const getActivitesDossierAuControle = async (ids) => {
  return await getActivitesByStatutEtape(ids, "Dossier au contrôle");
};

const getActivitesPublicationEnCours = async (ids) => {
  return await getActivitesByStatutEtape(ids, "Publication en cours");
};

const getActivitesEvaluationEnCours = async (ids) => {
  return await getActivitesByStatutEtape(ids, "Evaluation en cours");
};

const getActivitesRapportAuControle = async (ids) => {
  return await getActivitesByStatutEtape(ids, "Rapport au Contrôle");
};

const getActivitesNotification = async (ids) => {
  return await getActivitesByStatutEtape(ids, "Notification");
};

const getActivitesContratAuControlePourAvis = async (ids) => {
  return await getActivitesByStatutEtape(ids, "Contrat au contrôle pour avis");
};

const getActivitesApprobation = async (ids) => {
  return await getActivitesByStatutEtape(ids, "Approbation");
};

const getActivitesContratEnregistrement = async (ids) => {
  return await getActivitesByStatutEtape(ids, "Contrat à l'enregistrement");
};

const getActivitesBydateDeReceptionOrdreService = async (ids) => {
  const today = new Date();
  return await Activité.find({
  _id: { $in: ids },
 "donnéesDeBase.dateDeReceptionOrdreService": { $lte: today }
});
};

exports.getStatistiquesParPeriode = async (req, res) => {
  try {
    const { year, startMonth, endMonth } = req.query;

    console.log("📥 Requête reçue avec :", { year, startMonth, endMonth });

    if (!year) {
      console.warn("⚠️ L'année est requise.");
      return res.status(400).json({ error: "L'année est requise." });
    }

    const { start, end } = getPeriodeDates(year, startMonth, endMonth);
    console.log("📅 Période calculée :", { start, end });

    const activites = await getActivitesPrevu(start, end);
    console.log(`🔍 ${activites.length} activité(s) trouvée(s) (filtrées par période)`);

    const idsActivitesFiltrees = activites.map(e => e.activité);
    console.log("🆔 IDs des activités filtrées :", idsActivitesFiltrees);

    // Exécution en parallèle des requêtes d'agrégation pour les activités prévues
    const [activiteParMode, activitéParTypeMarché, ReceptionOrdreService] = await Promise.all([
      getActiviteParMode(idsActivitesFiltrees),
      getActiviteParType(idsActivitesFiltrees),
      getActivitesBydateDeReceptionOrdreService(idsActivitesFiltrees)
    ]);
    
    console.log("📊 Activités par mode de passation :", activiteParMode);
    console.log("📊 Activités par type de marché :", activitéParTypeMarché);
    console.log("📊 Activités par ordre de service :", ReceptionOrdreService);

    const activiteDemarer = await getActiviteDemarees(start, end);
    console.log(`🚀 ${activiteDemarer.length} activité(s) démarrée(s)`);

    const idsActiviteDemarerFiltrees = activiteDemarer.map(e => e.activité);
    console.log("🆔 IDs des activités démarrées :", idsActiviteDemarerFiltrees);

    // Exécution en parallèle de toutes les requêtes restantes
    const [
      activiteDemarerParMode,
      activitéDemarerParTypeMarché,
      ActivitesDossierAuControle,
      ActivitesPublicationEnCours,
      ActivitesEvaluationEnCours,
      ActivitesRapportAuControle,
      ActivitesContratAuControlePourAvis,
      ActivitesNotification,
      ActivitesApprobation,
      ActivitesContratEnregistrement
    ] = await Promise.all([
      getActiviteDemareeParMode(idsActiviteDemarerFiltrees),
      getActiviteDemareeParType(idsActiviteDemarerFiltrees),
      getActivitesDossierAuControle(idsActiviteDemarerFiltrees),
      getActivitesPublicationEnCours(idsActiviteDemarerFiltrees),
      getActivitesEvaluationEnCours(idsActiviteDemarerFiltrees),
      getActivitesRapportAuControle(idsActiviteDemarerFiltrees),
      getActivitesContratAuControlePourAvis(idsActiviteDemarerFiltrees),
      getActivitesNotification(idsActiviteDemarerFiltrees),
      getActivitesApprobation(idsActiviteDemarerFiltrees),
      getActivitesContratEnregistrement(idsActiviteDemarerFiltrees)
    ]);

    console.log("📊 Activités démarrées par mode de passation :", activiteDemarerParMode);
    console.log("📊 Activités démarrées par type de marché :", activitéDemarerParTypeMarché);
    console.log("✅ Dossier au contrôle :", ActivitesDossierAuControle.length);
    console.log("✅ Publication en cours :", ActivitesPublicationEnCours.length);
    console.log("✅ Evaluation en cours:", ActivitesEvaluationEnCours.length);
    console.log("✅ Rapport au Contrôle :", ActivitesRapportAuControle.length);
    console.log("✅ Contrat au contrôle pour avis:", ActivitesContratAuControlePourAvis.length);
    console.log("✅ Notification :", ActivitesNotification.length);
    console.log("✅ Approbation :", ActivitesApprobation.length);
    console.log("✅ Contrat à l'enregistrement :", ActivitesContratEnregistrement.length);

    res.json({
      activiteParMode,
      activitéParTypeMarché,
      ReceptionOrdreService,
      activiteDemarerParMode,
      activitéDemarerParTypeMarché,
      ActivitesDossierAuControle,
      ActivitesPublicationEnCours,
      ActivitesEvaluationEnCours,
      ActivitesRapportAuControle,
      ActivitesContratAuControlePourAvis,
      ActivitesNotification,
      ActivitesApprobation,
      ActivitesContratEnregistrement
    });      

  } catch (error) {
    console.error("❌ Erreur lors de la récupération des statistiques :", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};