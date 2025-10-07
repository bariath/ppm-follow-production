const { Activité } = require('../models/activité'); 
const SaveMapping = require("../models/mapping"); 
const EtapeActivite = require('../models/etapeActivite');
const ExcelJS = require("exceljs");
const moment = require("moment");

exports.createActivity = async (req, res, next) => {
  try {
    console.log("Requête reçue pour créer ou mettre à jour une activité :", req.body);

    delete req.body._id;

    const { donnéesDeBase } = req.body;

    if (!donnéesDeBase?.numRéf) {
      console.log("NumRéf manquant dans la requête.");
      return res.status(400).json({ error: "Type ou numRéf manquant." });
    }

    const existing = await Activité.findOne({ 'donnéesDeBase.numRéf': donnéesDeBase.numRéf });

    if (existing) {
      console.log("Activité existante trouvée. Mise à jour non effectuée.");
      return res.status(200).json({ message: "Activité existante." });
    }

    const nvActivite = new Activité({ ...req.body });
    await nvActivite.save();

    console.log("Nouvelle activité enregistrée avec succès :", nvActivite);
    res.status(201).json({ message: "Nouvelle activité enregistrée avec succès", created: nvActivite });

  } catch (error) {
    console.error("Erreur lors de la création/mise à jour de l'activité :", error);
    res.status(500).json({ error: "Erreur interne." });
  }
};

exports.updateActivity = async (req, res) => {
  try {
    const id = req.params._id || null;
    const { donnéesDeBase } = req.body;

    console.log("Requête de mise à jour reçue :", req.body);

    let updated;

    if (id) {
      console.log("Mise à jour par ID :", id);
      updated = await Activité.findByIdAndUpdate(id, { $set: req.body }, { new: true });
    } else if (donnéesDeBase?.numRéf) {
      console.log("Mise à jour par numRéf :", donnéesDeBase.numRéf);
      updated = await Activité.findOneAndUpdate(
        { 'donnéesDeBase.numRéf': donnéesDeBase.numRéf },
        { $set: req.body },
        { new: true }
      );
    } else {
      console.log("ID ou numRéf manquant pour la mise à jour.");
      return res.status(400).json({ error: "ID ou numRéf requis pour la mise à jour." });
    }

    if (!updated) {
      console.log("Aucune activité trouvée pour mise à jour.");
      return res.status(404).json({ error: "Activité non trouvée pour mise à jour." });
    }

    console.log("Activité mise à jour avec succès :", updated);
    res.status(200).json({ message: "Activité mise à jour avec succès", updated });
  } catch (error) {
    console.error("Erreur lors de la mise à jour :", error);
    res.status(500).json({ error: "Erreur interne lors de la mise à jour." });
  }
};

exports.deleteActivity = async (req, res) => {
  try {
    const id = req.params.id;
    console.log("Requête de suppression reçue pour l'activité avec ID :", id);

    const activity = await Activité.findById(id);
    if (!activity) {
      console.warn("Aucune activité trouvée avec cet ID :", id);
      return res.status(404).json({ message: "Activité non trouvée" });
    }
    console.log("Activité trouvée :", activity);
    await Activité.findByIdAndDelete(id);
    console.log("Activité supprimée avec succès :", id);

    res.status(200).json({ message: "Activité supprimée avec succès" });
  } catch (error) {
    console.error("Erreur lors de la suppression :", error);
    res.status(500).json({ message: "Erreur serveur lors de la suppression" });
  }
};

exports.getActivityById = async (req, res) => {
  try {
    const activity = await Activité.findById(req.params._id);
    if (!activity) {
      return res.status(404).json({ error: "Activité non trouvée." });
    }
    res.status(200).json(activity);
  } catch (error) {
    console.error("Erreur lors de la récupération de l'activité :", error);
    res.status(500).json({ error: "Erreur interne lors de la récupération de l'activité." });
  }
};


exports.nbActivitesEnRetardParEtape = async (req, res) => {
  try {
    // Étapes en retard : délai réel > délai prévu
    const etapesEnRetard = await EtapeActivite.aggregate([
      {
        $match: {
          delaiReel: { $exists: true, $ne: null },
          delaiPrevu: { $exists: true, $ne: null },
          $expr: { $gt: ["$delaiReel", "$delaiPrevu"] }
        }
      },
      {
        $group: {
          _id: "$activité" // Regrouper par activité
        }
      }
    ]);

    const activitesEnRetardIds = etapesEnRetard.map(item => item._id);

    // Récupération des détails complets des activités
    const activitesDetails = await Activité.find({ _id: { $in: activitesEnRetardIds } });

    res.status(200).json({
      nbActivitesEnRetard: activitesDetails.length,
      activites: activitesDetails
    });
  } catch (error) {
    console.error("Erreur lors du calcul des activités en retard :", error);
    res.status(500).json({ error: "Erreur serveur." });
  }
};


exports.statActivities = async (req, res) => {
  try {
    const [
      totalActivite,
      activiteEnCours,
      activiteTermine,
      activitePasDemarrer,
      activiteParMode,
      activitéParTypeMarché,
      activitesDetails
    ] = await Promise.all([
      Activité.countDocuments({}),
      Activité.countDocuments({ 'donnéesDeBase.statutActivite': 'En cours' }),
      Activité.countDocuments({ 'donnéesDeBase.statutActivite': 'Terminé' }),
      Activité.countDocuments({ 'donnéesDeBase.statutActivite': 'Non démarrée' }),
      Activité.aggregate([{ $group: { _id: '$donnéesDeBase.modeDePassation', count: { $sum: 1 } } }]),
      Activité.aggregate([{ $group: { _id: '$donnéesDeBase.typeDeMarché', count: { $sum: 1 } } }]),
      // pipeline pour les retards par étape
      EtapeActivite.aggregate([
        {
          $match: {
            delaiReel: { $exists: true, $ne: null },
            delaiPrevu: { $exists: true, $ne: null },
            $expr: { $gt: ['$delaiReel', '$delaiPrevu'] }
          }
        },
        { $group: { _id: '$activité' } }
      ])
      
    ]);

    const nbActivitesEnRetard = activitesDetails.length;
    const tauxRealisation = Math.round((activiteEnCours / totalActivite) * 100);
    const tauxAvecPourcentage = `${tauxRealisation}%`;

    res.status(200).json({
      totalActivite,
      activiteEnCours,
      activiteTermine,
      activitePasDemarrer,
      activiteParMode,
      tauxAvecPourcentage,
      nbActivitesEnRetard,
      activitéParTypeMarché
    });
  } catch (error) {
    console.error('Erreur lors du calcul des statistiques : ', error);
    res.status(500).json({ error: 'Erreur interne lors du calcul des statistiques.' });
  }
};


function formatDate(value) {
  if (value instanceof Date && !isNaN(value.getTime())) {
    return value;
  }

  const dateString = value && value.toString().trim();

  if (dateString && /^(\d{2})-(\d{2})-(\d{4})$/.test(dateString)) {
    const [day, month, year] = dateString.split("-");
    value = `${year}-${month}-${day}`;
  }

  const parsedDate = new Date(value);
  return !isNaN(parsedDate.getTime()) ? parsedDate : null;
}

exports.importFile = async (req, res) => {
  try {
    if (!req.file?.filename) {
      console.log("Fichier non fourni.");
      return res.status(400).json({ error: "Fichier non fourni." });
    }

    console.log("Lecture du fichier :", req.file.filename);
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile("uploads/" + req.file.filename);
    const worksheet = workbook.getWorksheet(1);
    if (!worksheet) {
      console.log("Feuille Excel introuvable.");
      return res.status(400).json({ error: "Feuille Excel introuvable." });
    }

    console.log("Chargement des mappings...");
    const mappings = await SaveMapping.find();
    if (!mappings.length) {
      console.log("Aucun mapping trouvé.");
      return res.status(400).json({ error: "Aucun mapping trouvé." });
    }

    const mappingDict = mappings.reduce((acc, map) => {
      const col = parseInt(map.excelColumn);
      if (!isNaN(col)) acc[col] = map.databaseColumn;
      return acc;
    }, {});
    console.log("Mapping des colonnes :", mappingDict);

    const activitésImportées = [];
    const rowPromises = [];

    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      if (rowNumber <= 2) return;

      rowPromises.push((async () => {
        const data = {};
        let ligneValide = true;

        row.eachCell((cell, colNumber) => {
          const path = mappingDict[colNumber];
          if (!path) return;

          let value = cell.value;

          if (path.toLowerCase().includes("date")) {
            value = formatDate(value);
          }

          if (path === "donnéesDeBase.modeDePassation") {
            const factorised = factorise(value);
            if (!factorised) {
              console.log(`❌ Valeur de modeDePassation invalide à la ligne ${rowNumber} : "${value}"`);
              ligneValide = false;
              return;
            }
            value = factorised;
          }

          setDeepValue(data, path, value);
        });

        if (!ligneValide) return;
const numRéf = data?.donnéesDeBase?.numRéf;
if (numRéf) {
  const segments = numRéf.split("_");

  if (segments.length >= 3) {
    // Déduire typeDeMarché à partir du premier segment
    const codeType = segments[0];
    const typeMapping = {
      S: "Services",
      F: "Fournitures",
      T: "Travaux",
      PI: "Prestations intellectuelles"
    };

    const marché = typeMapping[codeType];
    if (marché) {
      data.donnéesDeBase.typeDeMarché = marché;
    } else {
      console.warn(`⚠️ Type de marché inconnu pour code "${codeType}" à la ligne ${rowNumber}`);
    }

    // Extraire le pole depuis le deuxième segment
    data.donnéesDeBase.pole = segments[1];
  } else {
    console.warn(`⚠️ Format numRéf inattendu à la ligne ${rowNumber} : "${numRéf}"`);
  }

  // Vérification existence
  const exists = await Activité.findOne({ 'donnéesDeBase.numRéf': numRéf });
  if (exists) {
    console.log(`Activité déjà existante (N° Réf ${numRéf}) - Ligne ${rowNumber}`);
    return;
  }
}

        const newAct = new Activité(data);
        try {
          await newAct.save();
          activitésImportées.push(newAct);
        } catch (err) {
          console.error(`Erreur lors de l'enregistrement ligne ${rowNumber} :`, err.message);
        }
      })());
    });

    await Promise.all(rowPromises);
    console.log(`${activitésImportées.length} activités importées avec succès.`);
    res.status(200).json({ message: `${activitésImportées.length} activités importées.` });
  } catch (err) {
    console.error("Erreur d'importation :", err);
    res.status(500).json({ error: "Erreur serveur." });
  }
};

// Fonction de factorisation du mode de passation
function factorise(celValue) {
  switch (celValue?.trim()) {
    case "Avis National à Manifestation d’intérêt + Demande de Proposition":
    case "Avis National à Manifestation d’intérêt + Demande de Proposition (AMI+DPN)":
    case "AMI+DPN":
      return "AMI+DPN";

    case "Avis International à Manifestation d’intérêt + Demande de Proposition":
    case "Avis International à Manifestation d’intérêt + Demande de Proposition (AMI+DPI)":
    case "AMI+DPI":
      return "AMI+DPI";

    case "Appel d'Offres National":
    case "Appel d'Offres National (AON)":
    case "Appel d'Offres National Ouvert":
    case "AON":
      return "AON";

    case "Appel d'Offres International":
    case "Appel d'Offres International (AOI)":
    case "Appel d’Offres International Ouvert":
    case "AOI": 
      return "AOI";

    case "Appel d'Offres Restreint":
    case "Appel d'Offres Restreint (AOR)":
    case "AOR":
      return "AOR";

    case "Demande de Cotation":
    case "Demande de Cotation (DC)":
    case "DC":
      return "DC";

    case "Demande de Renseignement et de prix":
    case "Demande de Renseignement et de prix (DRP)":
    case "DRP":
      return "DRP";

    case "Entente Directe":
    case "Entente Directe (GREGRE)":
    case "Entente Directe (gré à gré)":
    case "GREGRE":
      return "GREGRE";

    default:
      return null;
  }
}

function setDeepValue(obj, path, value) {
  const keys = path.split(".");
  let current = obj;

  keys.forEach((key, index) => {
    if (index === keys.length - 1) {
      current[key] = value;
    } else {
      if (!current[key]) current[key] = {};
      current = current[key];
    }
  });
}

exports.associerUtilisateur = async (req, res) => {
  const { id } = req.params; // ID de l'activité
  const { utilisateurId } = req.body; // ID du user à associer

  try {
    const activite = await Activite.findByIdAndUpdate(
      id,
      { $addToSet: { utilisateurs: utilisateurId } }, // évite les doublons
      { new: true }
    ).populate('utilisateurs');

    res.json(activite);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getActivitiesAll = async (req, res) => {
  try {
    const { modeDePassation, typeDeMarché, numRéf, pole } = req.query;

    const filtres = {};
    console.log('Filtres reçus:', { modeDePassation, typeDeMarché, numRéf, pole });

    if (modeDePassation) {
      filtres["donnéesDeBase.modeDePassation"] = modeDePassation;
    }
    if (typeDeMarché) {
      filtres["donnéesDeBase.typeDeMarché"] = typeDeMarché;
    }
    if (numRéf) {
      filtres["donnéesDeBase.numRéf"] = numRéf;
    }

    if (pole) {
      filtres["donnéesDeBase.pole"] = pole;
    }

    console.log('Filtres appliqués:', filtres);

    const activitéComplet = await Activité.find(filtres);
    console.log('Activités récupérées:', activitéComplet.length);

    // (Statistiques optionnelles ou ajustées selon besoin)
    res.status(200).json(activitéComplet);

  } catch (error) {
    console.error("Erreur lors de la récupération des activités :", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

exports.getActivities = async (req, res) => {
  try {
    const { modeDePassation, typeDeMarché, numRéf, pole } = req.query;

    const filtres = {};

    if (modeDePassation) {
      filtres["donnéesDeBase.modeDePassation"] = modeDePassation;
    }

    if (typeDeMarché) {
      filtres["donnéesDeBase.typeDeMarché"] = typeDeMarché;
    }

    if (numRéf) {
      filtres["donnéesDeBase.numRéf"] = numRéf;
    }

    if (pole) {
      filtres["donnéesDeBase.pole"] = pole;
    }

    const activitesSansEtapes = await fetchActivitesSansEtapes(filtres);

    // (Statistiques optionnelles ou ajustées selon besoin)
    res.status(200).json(activitesSansEtapes);

  } catch (error) {
    console.error("Erreur lors de la récupération des activités :", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};
async function fetchActivitesSansEtapes(filtres = {}) {
  try {
    const activitesAvecEtapes = await EtapeActivite.distinct('activité');

    const activitesSansEtapes = await Activité.find({
      _id: { $nin: activitesAvecEtapes },
      ...filtres
    });

    console.log(`✅ ${activitesSansEtapes.length} activité(s) sans étapes trouvée(s)`);
    return activitesSansEtapes;
  } catch (error) {
    console.error("Erreur lors de la récupération des activités sans étapes :", error);
    return [];
  }
};


