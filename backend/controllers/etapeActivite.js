const Etape = require('../models/etape');
const { Activité } = require('../models/activité'); 
const EtapeActivite = require('../models/etapeActivite');
const moment = require('moment');
const mongoose = require("mongoose");

function ajouterJoursOuvrables(date, jours) {
  let result = moment(date);
  let ajoutés = 0;
  
  while (ajoutés < jours) {
      result = result.add(1, 'days');
      if (result.isoWeekday() !== 6 && result.isoWeekday() !== 7) { // 6 = Samedi, 7 = Dimanche
          ajoutés++;
      }
  }
  return result.toDate();
}

exports.calculerDelaisEtapes = async (req, res) => {
  try {
    const { activiteId } = req.body;
    console.log("🟦 ID reçu depuis le frontend :", activiteId);

    if (!activiteId) {
      console.warn("⚠️ ID de l'activité manquant");
      return res.status(400).json({ message: "ID de l'activité manquant" });
    }

    const activite = await Activité.findById(activiteId);
    if (!activite) {
      console.warn("❌ Activité non trouvée avec l'ID :", activiteId);
      return res.status(404).json({ message: "Activité non trouvée" });
    }

    console.log("✅ Activité trouvée :", activite);

    const { modeDePassation, organeDeControle } = activite.donnéesDeBase || {};
    console.log("📄 Mode de passation :", modeDePassation);
    console.log("📄 Organe de contrôle :", organeDeControle);

    if (!modeDePassation) {
      console.warn(`⚠️ Mode de passation introuvable pour l'activité ${activiteId}`);
      return res.status(400).json({ message: "Mode de passation introuvable, association annulée." });
    }

    let dateDeDemarrage = activite.donnéesDeBase.dateDeDemarrage;
    console.log("📅 Date de démarrage :", dateDeDemarrage);

    const etapes = await Etape.find({ modeDePassation }).sort({ NumEtape: 1 });

    if (etapes.length === 0) {
      console.warn("⚠️ Aucune étape trouvée pour ce mode de passation :", modeDePassation);
      return res.status(404).json({ message: "Aucune étape trouvée pour cette activité" });
    }

    console.log(`📋 ${etapes.length} étapes trouvées et triées`);

    let dateCourante = dateDeDemarrage;

    for (let etape of etapes) {
      let delaiGlobal = organeDeControle === "CCMP" ? etape.delaiGlobalCCMP : etape.delaiGlobalDNCMP;
      let delaiPrevu = ajouterJoursOuvrables(dateCourante, delaiGlobal);
      let delaiReel = ajouterJoursOuvrables(dateCourante, delaiGlobal);
       let delaiReelPrevisionnel = ajouterJoursOuvrables(dateCourante, delaiGlobal);
      let numEtape = etape.NumEtape;
      let statutEtape = etape.statutEtape;
      let niveauExecutions = etape.niveauExecution;

      console.log(`🔄 Traitement de l'étape ${numEtape} (ID: ${etape._id})`);
      console.log(`  ➤ Délai global : ${delaiGlobal}`);
      console.log(`  ➤ Date de démarrage : ${dateCourante}`);
      console.log(`  ➤ Date prévue : ${delaiPrevu}`);

      const resultatUpdate = await EtapeActivite.findOneAndUpdate(
        { activité: activite._id, etape: etape._id },
        {
          $set: {
            activité: activite._id,
            etape: etape._id,
            delaiPrevu,
            delaiGlobal,
            delaiReel,
            delaiReelPrevisionnel,
            dateDeDemarrage: dateCourante,
            numEtape,
            statutEtape,
            niveauExecutions
          },
        },
        { upsert: true, new: true }
      );

      console.log("  ✅ Étape activité mise à jour :", resultatUpdate._id);

      dateCourante = delaiPrevu;
    }

    console.log("✅ Tous les délais ont été calculés et mis à jour avec succès.");
     await mettreAJourStatuts(activiteId);
    await mettreAJourStatutActivite(activiteId);
    res.status(200).json({ message: "Délais des étapes calculés et mis à jour avec l'enchaînement correct" });
  } catch (error) {
    console.error("❌ Erreur lors du calcul des délais :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

async function fetchActivitesSansEtapes() {
  try {
    const activitesAvecEtapes = await EtapeActivite.distinct('activité');
    const activitesSansEtapes = await Activité.find({ _id: { $nin: activitesAvecEtapes } });

    console.log(`✅ ${activitesSansEtapes.length} activité(s) sans étapes trouvée(s)`);
    return activitesSansEtapes;
  } catch (error) {
    console.error("Erreur serveur lors de la récupération des activités sans étapes :", error);
    return [];
  }
}

exports.associerActivitesSansEtapes = async (req, res) => {
  try {
    console.log("🔄 Début de l'association des activités sans étapes...");

    const activitesSansEtapes = await fetchActivitesSansEtapes();

    if (activitesSansEtapes.length === 0) {
      console.log("⚠️ Aucune activité sans étapes trouvée.");
      return res.status(404).json({ message: "Aucune activité sans étapes." });
    }

    for (let activite of activitesSansEtapes) {
      // Simuler un appel d'API pour récupérer le résultat
      const response = {
        status: (code) => ({
          json: (msg) => {
            console.log(`📝 Réponse simulée [${code}]:`, msg);
            return { code, msg };
          },
        }),
      };

      const result = await exports.calculerDelaisEtapes({ body: { activiteId: activite._id } }, response);

      if (result?.code !== 200) {
        continue; 
      }
    }

    res.status(200).json({ message: "Les activités valides ont été associées avec succès." });
  } catch (error) {
    console.error("❌ Erreur lors de l'association :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

exports.getActivitesAvecEtapes = async (req, res) => {
  try {
    // Extraction des paramètres de la requête
    const { typeDeMarché, modeDePassation, numRéf, pole } = req.query;
    console.log("Paramètres de la requête reçus :", { typeDeMarché, modeDePassation, numRéf, pole });

    // Récupération des IDs des activités associées à des étapes
    const activitesAvecEtapesIds = await EtapeActivite.distinct('activité');
    
    // Vérification si des activités avec étapes existent
    if (activitesAvecEtapesIds.length === 0) {
      console.log("Aucune activité trouvée avec des étapes.");
      return res.status(200).json([]);
    }

    // Construction du filtre pour les activités
    const filter = { _id: { $in: activitesAvecEtapesIds } };

    // Application des filtres additionnels si présents
    if (typeDeMarché) {
      filter["donnéesDeBase.typeDeMarché"] = typeDeMarché;
      console.log("Filtre appliqué - Type de marché :", typeDeMarché);
    }

    if (modeDePassation) {
      filter["donnéesDeBase.modeDePassation"] = modeDePassation;
      console.log("Filtre appliqué - Mode de passation :", modeDePassation);
    }

    if (numRéf) {
      filter["donnéesDeBase.numRéf"] = numRéf;
      console.log("Filtre appliqué - Numéro de référence :", numRéf);
    }

    if (pole) {
      filter["donnéesDeBase.pole"] = pole;
      console.log("Filtre appliqué - Pôle :", pole);
    }

    // Récupération des activités filtrées
    const activitésFiltrées = await Activité.find(filter);
    console.log("Activités filtrées :", activitésFiltrées);

    // Vérification si des activités filtrées ont été trouvées
    if (activitésFiltrées.length === 0) {
      console.log("Aucune activité trouvée avec les filtres appliqués.");
      return res.status(200).json([]);
    }

    // Renvoi des activités filtrées
    res.status(200).json(activitésFiltrées);
  } catch (error) {
    // Gestion des erreurs
    console.error("❌ Erreur lors de la récupération des activités (filtrées ou non) :", error);
    res.status(500).json({
      error: "Une erreur s'est produite lors de la récupération des activités avec étapes.",
    });
  }
};

exports.getEtapesByActivite = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "ID d'activité invalide" });
    }
    const activitéId = new mongoose.Types.ObjectId(id);

    const activitéAvecEtapes = await EtapeActivite.find({ activité: activitéId })
      .populate({
        path: 'activité', 
        model: 'Activité'
      })
      .populate({
        path: 'etape', 
        model: 'Etape'
      });

    if (!activitéAvecEtapes || activitéAvecEtapes.length === 0) {
      return res.status(404).json({ message: "Aucune étape trouvée pour cette activité" });
    }

    res.status(200).json(activitéAvecEtapes);
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des étapes :", error);
    res.status(500).json({ message: "Erreur du serveur" });
  }
};

exports.ajouterDelaiReel = async (req, res) => {
  const { activiteId, etapeId, delaiReel } = req.body;
  try {
    const activite = await Activité.findById(activiteId);
    if (!activite) {
      return res.status(404).json({ message: 'Activité non trouvée' });
    }
   
    const objectIdEtapeId = new mongoose.Types.ObjectId(etapeId);
    const etapeActivite = await EtapeActivite.findOne({ _id: objectIdEtapeId });

    if (!etapeActivite) {
      return res.status(404).json({ message: 'Étape non trouvée pour cette activité' });
    }
    etapeActivite.delaiReelPrevisionnel = new Date(delaiReel);
    etapeActivite.delaiReel = new Date(delaiReel);
    etapeActivite.Confirmer = "OK";
    await etapeActivite.save();
   
    const etapes = await EtapeActivite.find({ activité: activiteId }).sort({ numEtape: 1 });
    
    let miseAJour = false;
    let dateDeReference = new Date(etapeActivite.delaiReelPrevisionnel); 

    for (let i = 0; i < etapes.length; i++) {
      const etape = etapes[i];

      if (miseAJour) {
        const joursGlobal = parseInt(etape.delaiGlobal);
        dateDeReference = ajouterJoursOuvrables(dateDeReference, joursGlobal);
        etape.delaiReelPrevisionnel = dateDeReference;
        etape.delaiReel = dateDeReference;
        await etape.save();
      }

      if (etape._id.equals(etapeActivite._id)) {
        miseAJour = true;
        console.log(`🟢 Début du recalcul à partir de l'étape : ${etape.numEtape}`);
      }
    }
    await mettreAJourStatuts(activiteId);
    await mettreAJourStatutActivite(activiteId);

    return res.status(200).json({
      message: 'Délai réel mis à jour avec succès et étapes suivantes recalculées',
    });

  } catch (err) {
    console.error("❌ Erreur lors de la mise à jour du délai réel :", err);
    return res.status(500).json({ message: 'Erreur interne du serveur' });
  }
};

async function mettreAJourStatuts(activiteId) {
  const aujourdHui = moment().startOf('day');
  const etapes = await EtapeActivite.find({ activité: activiteId }).sort({ numEtape: 1 });

  for (let i = 0; i < etapes.length; i++) {
    const etape = etapes[i];
    const delaiReelPrevisionnel = moment(etape.delaiReelPrevisionnel).startOf('day');
    const etapePrecedente = i > 0 ? etapes[i - 1] : null;
    let nouveauStatut = 'À venir';

    if (aujourdHui.isAfter(delaiReelPrevisionnel)) {
      nouveauStatut = 'Terminé';
    } else if (
      etapePrecedente &&
      etapePrecedente.statut === 'Terminé' &&
      aujourdHui.isSameOrBefore(delaiReelPrevisionnel)
    ) {
      nouveauStatut = 'En cours';
    } else if (
      etapePrecedente &&
      etapePrecedente.statut !== 'Terminé' &&
      aujourdHui.isBefore(delaiReelPrevisionnel)
    ) {
      nouveauStatut = 'À venir';
    }

    // Mettre à jour seulement si le statut a changé
    if (etape.statut !== nouveauStatut) {
      etape.statut = nouveauStatut;
      await etape.save();
    }
  }
}

async function mettreAJourStatutActivite(activiteId) {
  try {
    const etapes = await EtapeActivite.find({ activité: activiteId });

    if (etapes.length === 0) {
      console.log("⚠️ Aucune étape trouvée pour l'activité :", activiteId);
      return;
    }

    const tousTermines = etapes.every(e => e.statut === 'Terminé');
    const auMoinsUneEnCours = etapes.some(e => e.statut === 'En cours');
    const tousAVenir = etapes.every(e => e.statut === 'À venir');

    let nouveauStatut;

    if (tousTermines) {
      nouveauStatut = 'Terminé';
    } else if (auMoinsUneEnCours) {
      nouveauStatut = 'En cours';
    } else if (tousAVenir) {
      nouveauStatut = 'Non démarrée';
    } else {
      nouveauStatut = 'mixte'; // Cas mixte
      console.log("Mixte:", nouveauStatut)
    }

    const activite = await Activité.findById(activiteId);
    if (!activite) {
      console.log("❌ Activité introuvable :", activiteId);
      return;
    }

    if (activite.donnéesDeBase?.statutActivite !== nouveauStatut) {
      activite.donnéesDeBase.statutActivite = nouveauStatut;
      await activite.save();
    } else {
      console.log("ℹ️ Statut de l'activité déjà à jour :", nouveauStatut);
    }

     await mettreAJourNiveauExecution(activiteId);
  } catch (err) {
    console.error("❌ Erreur lors de la mise à jour du statut de l'activité :", err);
  }
}

exports.filtrerActivitiesEnCours = async (req, res) => {
  try {
    const { typeDeMarché, modeDePassation, recherche, pole } = req.query;

    // Création dynamique du filtre
    const filter = { 'donnéesDeBase.statutActivite': 'En cours' };
    if (typeDeMarché) filter['donnéesDeBase.typeDeMarché'] = typeDeMarché;
    if (modeDePassation) filter['donnéesDeBase.modeDePassation'] = modeDePassation;
    if (recherche) {
  filter["$or"] = [
    { 'donnéesDeBase.numRéf': { $regex: recherche, $options: "i" } },
    { 'donnéesDeBase.description': { $regex: recherche, $options: "i" } }
  ];
}
     if (pole) filter['donnéesDeBase.pole'] = pole;


    console.log("🔍 Filtres appliqués :", filter);

    const activitesEnCours = await Activité.find(filter);
    console.log("📋 Activités en cours trouvées :", activitesEnCours.length);

    if (!activitesEnCours.length) {
      return res.status(200).json([]);
    }
    
    const idsActivites = activitesEnCours.map(act => act._id);
    console.log("🆔 IDs des activités :", idsActivites);

    // Recherche des étapes associées
    const etapes = await EtapeActivite.find({ activité: { $in: idsActivites } })
      .populate('activité')
      .populate('etape');

    console.log("📌 Étapes trouvées :", etapes.length);

    if (!etapes.length) {
      return res.status(200).json([]);
    }    

    // Regroupement par activité
    const regroupement = {};

    etapes.forEach(etapeActivite => {
      const idActivite = etapeActivite.activité._id.toString();

      if (!regroupement[idActivite]) {
        regroupement[idActivite] = {
          activité: etapeActivite.activité.toObject(),
          étapes: []
        };
      }

      const etapeClean = etapeActivite.toObject();
      delete etapeClean.activité;
      etapeClean.etape = etapeActivite.etape.toObject();

      regroupement[idActivite].étapes.push(etapeClean);
    });

    console.log("📦 Regroupement par activité :", Object.keys(regroupement).length);

    // Filtrage des étapes : on garde l'étape "En cours" et la suivante
    const result = Object.values(regroupement).map(activiteGroup => {
      const etapesTriees = activiteGroup.étapes.sort((a, b) => a.etape.ordre - b.etape.ordre);

      const indexEnCours = etapesTriees.findIndex(e => e.statut === 'En cours');
      const etapesAFournir = [];

      if (indexEnCours !== -1) {
        etapesAFournir.push(etapesTriees[indexEnCours]);

        if (etapesTriees[indexEnCours + 1]) {
          etapesAFournir.push(etapesTriees[indexEnCours + 1]);
        }
      }

      return {
        activité: activiteGroup.activité,
        étapes: etapesAFournir
      };
    });

    console.log("✅ Résultat final envoyé au client :", result.length, "activités");

    res.status(200).json(result);
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des activités en cours avec étapes :", error);
    res.status(500).json({ message: "Erreur du serveur" });
  }
};

exports.filtrerActivitiesTermine = async (req, res) => {
  try {
    const { typeDeMarché, modeDePassation, recherche, pole } = req.query;
    
    // Création dynamique du filtre
    const filter = { 'donnéesDeBase.statutActivite': 'Terminé' };
    if (typeDeMarché) filter['donnéesDeBase.typeDeMarché'] = typeDeMarché;
    if (modeDePassation) filter['donnéesDeBase.modeDePassation'] = modeDePassation;
    if (recherche) {
      filter["$or"] = [
        { 'donnéesDeBase.numRéf': { $regex: recherche, $options: "i" } },
        { 'donnéesDeBase.description': { $regex: recherche, $options: "i" } }
      ];
    }
    if (pole) filter['donnéesDeBase.pole'] = pole;
    
    console.log("🔍 Filtres appliqués :", filter);
    
    const activitesTermine = await Activité.find(filter);
    console.log("📋 Activités terminé trouvées :", activitesTermine.length);
    
    if (!activitesTermine.length) {
      return res.status(200).json([]);
    }
    
    const idsActivites = activitesTermine.map(act => act._id);
    console.log("🆔 IDs des activités :", idsActivites);
    
    // Recherche des étapes associées
    const etapes = await EtapeActivite.find({ activité: { $in: idsActivites } })
      .populate('activité')
      .populate('etape');
    
    console.log("📌 Étapes trouvées :", etapes.length);
    
    if (!etapes.length) {
      return res.status(200).json([]);
    }
    
    // Regroupement par activité
    const regroupement = {};
    etapes.forEach(etapeActivite => {
      const idActivite = etapeActivite.activité._id.toString();
      if (!regroupement[idActivite]) {
        regroupement[idActivite] = {
          activité: etapeActivite.activité.toObject(),
          étapes: []
        };
      }
      const etapeClean = etapeActivite.toObject();
      delete etapeClean.activité;
      etapeClean.etape = etapeActivite.etape.toObject();
      regroupement[idActivite].étapes.push(etapeClean);
    });
    
    console.log("📦 Regroupement par activité :", Object.keys(regroupement).length);
    
    // Filtrage des étapes : on garde la dernière étape terminée
    const result = Object.values(regroupement).map(activiteGroup => {
      const etapesTriees = activiteGroup.étapes.sort((a, b) => a.etape.ordre - b.etape.ordre);
      const etapesAFournir = [];
      
      // Trouver la dernière étape terminée
      let derniereEtapeTerminee = null;
      let dateDebut = null;
      let dateFin = null;
      
      for (let i = etapesTriees.length - 1; i >= 0; i--) {
        const etape = etapesTriees[i];
        if (etape.delaiReel && etape.statut === 'Terminé') {
          derniereEtapeTerminee = etape;
          dateFin = etape.delaiReel;
          break;
        }
      }
      
      // Trouver la première étape pour la date de début
      if (etapesTriees.length > 0) {
        const premiereEtape = etapesTriees[0];
        dateDebut = premiereEtape.delaiReel || premiereEtape.delaiPrevu;
      }
      
      if (derniereEtapeTerminee) {
        etapesAFournir.push(derniereEtapeTerminee);
      } else if (etapesTriees.length > 0) {
        // Si aucune étape n'est marquée comme terminée, prendre la dernière
        etapesAFournir.push(etapesTriees[etapesTriees.length - 1]);
        dateFin = etapesTriees[etapesTriees.length - 1].delaiReel || etapesTriees[etapesTriees.length - 1].delaiPrevu;
      }
      
      return {
        activité: activiteGroup.activité,
        étapes: etapesAFournir,
        dateFin: dateFin,
        dateDebut: dateDebut,
        dateCreation: activiteGroup.activité.createdAt || activiteGroup.activité.dateCreation
      };
    });
    
    console.log("✅ Résultat final envoyé au client :", result.length, "activités");
    res.status(200).json(result);
    
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des activités terminé avec étapes :", error);
    res.status(500).json({ message: "Erreur du serveur" });
  }
};

exports.filtrerActivitiesNonDemarer = async (req, res) => {
  try {
    const { typeDeMarché, modeDePassation, recherche, pole } = req.query;

    // Création dynamique du filtre
    const filter = { 'donnéesDeBase.statutActivite': 'Non démarrée' };
    if (typeDeMarché) filter['donnéesDeBase.typeDeMarché'] = typeDeMarché;
    if (modeDePassation) filter['donnéesDeBase.modeDePassation'] = modeDePassation;
    if (recherche) {
  filter["$or"] = [
    { 'donnéesDeBase.numRéf': { $regex: recherche, $options: "i" } },
    { 'donnéesDeBase.description': { $regex: recherche, $options: "i" } }
  ];
}
     if (pole) filter['donnéesDeBase.pole'] = pole;


    console.log("🔍 Filtres appliqués :", filter);

    const activitesNonDemarer = await Activité.find(filter);
    console.log("📋 Activités en cours trouvées :", activitesNonDemarer.length);

    if (!activitesNonDemarer.length) {
      return res.status(200).json([]);
    }
    
    const idsActivites = activitesNonDemarer.map(act => act._id);
    console.log("🆔 IDs des activités :", idsActivites);

    // Recherche des étapes associées
    const etapes = await EtapeActivite.find({ activité: { $in: idsActivites } })
      .populate('activité')
      .populate('etape');

    console.log("📌 Étapes trouvées :", etapes.length);

    if (!etapes.length) {
      return res.status(200).json([]);
    }    

    // Regroupement par activité
    const regroupement = {};

    etapes.forEach(etapeActivite => {
      const idActivite = etapeActivite.activité._id.toString();

      if (!regroupement[idActivite]) {
        regroupement[idActivite] = {
          activité: etapeActivite.activité.toObject(),
          étapes: []
        };
      }

      const etapeClean = etapeActivite.toObject();
      delete etapeClean.activité;
      etapeClean.etape = etapeActivite.etape.toObject();

      regroupement[idActivite].étapes.push(etapeClean);
    });

    console.log("📦 Regroupement par activité :", Object.keys(regroupement).length);

    // Filtrage des étapes : on garde l'étape "En cours" et la suivante
    const result = Object.values(regroupement).map(activiteGroup => {
      const etapesTriees = activiteGroup.étapes.sort((a, b) => a.etape.ordre - b.etape.ordre);

      const indexNonDemarer = etapesTriees.findIndex(e => e.statut === 'En cours');
      const etapesAFournir = [];

      if (indexNonDemarer !== -1) {
        etapesAFournir.push(etapesTriees[indexNonDemarer]);

        if (etapesTriees[indexNonDemarer + 1]) {
          etapesAFournir.push(etapesTriees[indexNonDemarer + 1]);
        }
      }

      return {
        activité: activiteGroup.activité,
        étapes: etapesAFournir
      };
    });

    console.log("✅ Résultat final envoyé au client :", result.length, "activités");

    res.status(200).json(result);
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des activités non demarer avec étapes :", error);
    res.status(500).json({ message: "Erreur du serveur" });
  }
};

exports.filtrerActivitiesAll = async (req, res) => {
  try {
    const { typeDeMarché, modeDePassation, recherche, pole } = req.query;

    // Création dynamique du filtre
   const filter = { 'donnéesDeBase.statutActivite': { $in: ['Non démarrée', 'En cours', 'Terminé'] } };
    if (typeDeMarché) filter['donnéesDeBase.typeDeMarché'] = typeDeMarché;
    if (modeDePassation) filter['donnéesDeBase.modeDePassation'] = modeDePassation;
    if (recherche) {
  filter["$or"] = [
    { 'donnéesDeBase.numRéf': { $regex: recherche, $options: "i" } },
    { 'donnéesDeBase.description': { $regex: recherche, $options: "i" } }
  ];
}
     if (pole) filter['donnéesDeBase.pole'] = pole;


    console.log("🔍 Filtres appliqués :", filter);

    const activitéComplet = await Activité.find(filter);
    console.log("📋 Activités complet trouvées :", activitéComplet.length);

    if (!activitéComplet.length) {
      return res.status(200).json([]);
    }
    
    const idsActivites = activitéComplet.map(act => act._id);
    console.log("🆔 IDs des activités :", idsActivites);

    // Recherche des étapes associées
    const etapes = await EtapeActivite.find({ activité: { $in: idsActivites } })
      .populate('activité')
      .populate('etape');

    console.log("📌 Étapes trouvées :", etapes.length);

    if (!etapes.length) {
      return res.status(200).json([]);
    }    

    // Regroupement par activité
    const regroupement = {};

    etapes.forEach(etapeActivite => {
      const idActivite = etapeActivite.activité._id.toString();

      if (!regroupement[idActivite]) {
        regroupement[idActivite] = {
          activité: etapeActivite.activité.toObject(),
          étapes: []
        };
      }

      const etapeClean = etapeActivite.toObject();
      delete etapeClean.activité;
      etapeClean.etape = etapeActivite.etape.toObject();

      regroupement[idActivite].étapes.push(etapeClean);
    });

    console.log("📦 Regroupement par activité :", Object.keys(regroupement).length);

    // Filtrage des étapes : on garde l'étape "En cours" et la suivante
    const result = Object.values(regroupement).map(activiteGroup => {
      return {
        activité: activiteGroup.activité,
      };
    });

    console.log("✅ Résultat final envoyé au client :", result.length, "activités");

    res.status(200).json(result);
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des activités non demarer avec étapes :", error);
    res.status(500).json({ message: "Erreur du serveur" });
  }
};

// Fonction pour mettre à jour le niveau d'exécution de l'activité
async function mettreAJourNiveauExecution(activiteId) {
  try {
    const activite = await Activité.findById(activiteId);
    if (!activite) {
      console.log("❌ Activité introuvable :", activiteId);
      return;
    }

    const etapes = await EtapeActivite.find({ activité: activiteId }).sort({ numEtape: 1 });
    if (etapes.length === 0) {
      console.log("⚠️ Aucune étape trouvée pour l'activité :", activiteId);
      return;
    }

    const aujourdHui = moment().startOf('day');
    const dateDebutExecution = activite.donnéesDeBase.dateDebutExecution;
    let nouveauNiveauExecution = activite.donnéesDeBase.NiveauExécution;

    // Vérifier si toutes les étapes sont terminées
    const toutesEtapesTerminees = etapes.every(etape => {
      const delaiReel = moment(etape.delaiReel).startOf('day');
      return delaiReel.isBefore(aujourdHui) || delaiReel.isSame(aujourdHui);
    });

    // Cas 1: Si toutes les étapes sont terminées et dateDebutExecution <= aujourd'hui
    if (toutesEtapesTerminees) {
      const derniereEtape = etapes[etapes.length - 1];
      const delaiReelDerniereEtape = moment(derniereEtape.delaiReel).startOf('day');
      
      if (delaiReelDerniereEtape.isBefore(aujourdHui) || delaiReelDerniereEtape.isSame(aujourdHui)) {
        if (dateDebutExecution && moment(dateDebutExecution).startOf('day').isSameOrBefore(aujourdHui)) {
          nouveauNiveauExecution = "Exécution";
        } else {
          nouveauNiveauExecution = "En cours de contractualisation";
        }
      }
    } else {
      // Cas 2: Activité en cours - prendre le niveau de l'étape en cours
      const etapeEnCours = etapes.find(etape => etape.statut === 'En cours');
      
      if (etapeEnCours && etapeEnCours.niveauExecutions) {
        nouveauNiveauExecution = etapeEnCours.niveauExecutions;
      } else {
        // Si aucune étape en cours, prendre le niveau de la première étape non terminée
        const prochineEtape = etapes.find(etape => etape.statut === 'À venir');
        if (prochineEtape && prochineEtape.niveauExecutions) {
          nouveauNiveauExecution = prochineEtape.niveauExecutions;
        }
      }
    }

    // Mettre à jour seulement si le niveau a changé
    if (activite.donnéesDeBase.NiveauExécution !== nouveauNiveauExecution) {
      activite.donnéesDeBase.NiveauExécution = nouveauNiveauExecution;
      await activite.save();
      console.log(`✅ Niveau d'exécution mis à jour pour l'activité ${activiteId}: ${nouveauNiveauExecution}`);
    } else {
      console.log(`ℹ️ Niveau d'exécution déjà à jour pour l'activité ${activiteId}: ${nouveauNiveauExecution}`);
    }

  } catch (error) {
    console.error("❌ Erreur lors de la mise à jour du niveau d'exécution :", error);
  }
}
