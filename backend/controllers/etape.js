const Etape = require("../models/etape");
const ExcelJS = require('exceljs');
const fs = require('fs');


exports.createStep = async (req, res, next) => {
  try {
    const { NumEtape, nom, modeDePassation,delaiGlobalCCMP, delaiGlobalDNCMP,  statutEtape, niveauExecution } = req.body;

    const existingStep = await Etape.findOne({ NumEtape, modeDePassation });
    if (existingStep) {
      return res.status(409).json({ message: "Une étape avec ce numéro et ce mode de passation existe déjà." });
    }

    const newStep = new Etape({ NumEtape, nom, modeDePassation, delaiGlobalCCMP, delaiGlobalDNCMP, statutEtape, niveauExecution });
    const savedStep = await newStep.save();
    console.log("Étape créée avec succès :", savedStep);
    return res.status(201).json(savedStep);
  } catch (error) {
    console.error("Erreur lors de la création d'une étape :", error);
    return res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

exports.getAllSteps = async (req, res, next) => {
  try {
    const etapes = await Etape.find().lean(); // Récupère toutes les étapes

    if (etapes.length === 0) {
      return res.status(404).json({ message: "Aucune étape trouvée." });
    }

    res.json(etapes);
  } catch (error) {
    console.error("❌ Erreur lors de la récupération de toutes les étapes :", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

exports.getSteps = async (req, res, next) => {
  try {
    const { modeDePassation } = req.query;

    if (!modeDePassation) {
      return res.status(400).json({ message: "Le mode de passation est requis." });
    }
    let etapes = await Etape.find({ modeDePassation }).lean();
    if (etapes.length === 0) {
      return res.status(404).json({ message: "Aucune étape trouvée pour ce mode de passation." });
    }
    res.json(etapes);
  } catch (error) {
    console.error("Erreur lors de la récupération des étapes :", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

exports.updateStep = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updatedStep = await Etape.findByIdAndUpdate(id, updates, { new: true });
    if (!updatedStep) {
      return res.status(404).json({ message: "Étape non trouvée." });
    }

    res.json(updatedStep);
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'étape :", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

exports.deleteStep = async (req, res, next) => {
  try {
    const { id } = req.params;

    const deletedStep = await Etape.findByIdAndDelete(id);
    if (!deletedStep) {
      return res.status(404).json({ message: "Étape non trouvée." });
    }

    res.json({ message: "Étape supprimée avec succès." });
  } catch (error) {
    console.error("Erreur lors de la suppression de l'étape :", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

exports.importStepsFromExcel = async (req, res, next) => {
  try {
    if (!req.file || !req.file.filename) {
      console.error("❌ Fichier Excel manquant ou invalide.");
      return res.status(400).json({ error: "Fichier non fourni ou chemin incorrect." });
    }

    const filePath = "uploads/" + req.file.filename;
    console.log(`📂 Lecture du fichier Excel: ${filePath}`);
    
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    console.log("📖 Fichier Excel chargé avec succès.");

    const allSteps = [];
    const processedSteps = new Set(); // Pour éviter les doublons dans le fichier

    // Fonction pour extraire les nombres
    const extractNumber = (str) => {
      const matches = str.match(/[-+]?\d*\.?\d+/g); 
      return matches ? Math.trunc(Number(matches[0])) : 0;
    };

    // Parcourir toutes les feuilles et collecter les données
    for (const worksheet of workbook.worksheets) {
      console.log(`📄 Traitement de la feuille : ${worksheet.name}`);
      
      // Convertir les lignes en array pour un traitement synchrone
      const rows = [];
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber > 1) { // Ignorer l'en-tête
          rows.push({ row, rowNumber });
        }
      });

      // Traiter chaque ligne de manière synchrone
      for (const { row, rowNumber } of rows) {
        const niveauExecution = row.getCell(1).text.trim();  
        const statutEtape = row.getCell(2).text.trim();  
        const numEtape = row.getCell(3).text.trim();  
        const nom = row.getCell(4).text.trim();   
        const delaiGlobalDNCMP = row.getCell(5).text.trim();  
        const delaiGlobalCCMP = row.getCell(6).text.trim(); 
        const modeDePassation = row.getCell(7).text.trim(); 

        const num = extractNumber(numEtape);
        const delaiDNCMP = extractNumber(delaiGlobalDNCMP);
        const delaiCCMP = extractNumber(delaiGlobalCCMP);

        // Validation des données
        if (isNaN(num) || isNaN(delaiDNCMP) || isNaN(delaiCCMP)) {
          console.error(`⚠️ Données invalides à la ligne ${rowNumber}: ${numEtape}, ${delaiGlobalDNCMP}, ${delaiGlobalCCMP}`);
          continue;
        }

        // Vérifier les doublons dans le fichier
        const stepKey = `${nom}-${modeDePassation}-${num}`;
        if (processedSteps.has(stepKey)) {
          console.log(`⚠️ Doublon ignoré dans le fichier à la ligne ${rowNumber}: ${stepKey}`);
          continue; 
        }
        processedSteps.add(stepKey);

        // Ajouter l'étape à traiter
        allSteps.push({
          NumEtape: num,
          nom: nom,
          modeDePassation: modeDePassation,
          delaiGlobalCCMP: delaiCCMP,
          delaiGlobalDNCMP: delaiDNCMP,
          niveauExecution: niveauExecution,
          statutEtape: statutEtape,
          rowNumber: rowNumber // Pour le debug
        });
      }
    }

    console.log(`📊 ${allSteps.length} étape(s) unique(s) trouvée(s) dans le fichier.`);

    // Traiter toutes les étapes en parallèle
    let stepsInserted = 0;
    let stepsIgnored = 0;

    const stepPromises = allSteps.map(async (newStep) => {
      try {
        const existingStep = await Etape.findOne({ 
          nom: newStep.nom, 
          modeDePassation: newStep.modeDePassation 
        });
        
        if (!existingStep) {
          const step = new Etape({
            NumEtape: newStep.NumEtape,
            nom: newStep.nom,
            modeDePassation: newStep.modeDePassation,
            delaiGlobalCCMP: newStep.delaiGlobalCCMP,
            delaiGlobalDNCMP: newStep.delaiGlobalDNCMP,
            niveauExecution: newStep.niveauExecution,
            statutEtape: newStep.statutEtape,
          });
          await step.save();
          console.log(`✅ Étape ajoutée: ${newStep.nom} (${newStep.modeDePassation})`);
          return 'inserted';
        } else {
          console.log(`⚠️ Étape existante ignorée: ${newStep.nom} (${newStep.modeDePassation})`);
          return 'ignored';
        }
      } catch (saveError) {
        console.error(`❌ Erreur lors de la sauvegarde de l'étape ligne ${newStep.rowNumber}:`, saveError);
        return 'error';
      }
    });

    // Attendre toutes les promesses et compter les résultats
    const results = await Promise.all(stepPromises);
    
    stepsInserted = results.filter(result => result === 'inserted').length;
    stepsIgnored = results.filter(result => result === 'ignored').length;
    const stepsError = results.filter(result => result === 'error').length;

    console.log(`✅ Importation terminée ! ${stepsInserted} étape(s) ajoutée(s), ${stepsIgnored} ignorée(s), ${stepsError} erreur(s).`);

    res.status(200).json({
      message: `Importation terminée : ${stepsInserted} étape(s) ajoutée(s), ${stepsIgnored} ignorée(s).`,
      details: {
        inserted: stepsInserted,
        ignored: stepsIgnored,
        errors: stepsError,
        totalProcessed: allSteps.length
      }
    });

  } catch (error) {
    console.error("❌ Erreur lors de l'importation du fichier Excel :", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};