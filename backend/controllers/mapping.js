const SaveMapping = require("../models/mapping"); 
const ExcelJS = require("exceljs");
const { Activité } = require('../models/activité'); 

function getAllFields(schema, prefix = "") {
  const fields = [];

  for (const [key, path] of Object.entries(schema.paths)) {
    if (key === "_id" || key === "__v") continue;

    if (path.schema) {
      const nestedFields = getAllFields(path.schema, prefix + key + ".");
      fields.push(...nestedFields);
    } else {
      fields.push(prefix + key);
    }
  }

  return fields;
}

exports.getMappingFields = async (req, res) => {
  try {
    const baseFields = getAllFields(Activité.schema);

    const allFields = [...baseFields];

    res.status(200).json(allFields);
  } catch (error) {
    console.error("Erreur lors de la récupération des champs :", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

exports.getMappings = async (req, res) => {
  try {
    const mappings = await SaveMapping.find(); 
    res.status(200).json(mappings); 
  } catch (error) {
    console.error("Erreur lors de la récupération des mappings :", error);
    res.status(500).json({ message: "Erreur interne du serveur." });
  }
};

// Ajouter une méthode pour récupérer les mappings
exports.getMappingSave = async (req, res) => {
  console.log("getMappingSave");
  try {
    const { excelColumn, databaseColumn } = req.body;

    // Validation des données
    if (!excelColumn || !databaseColumn) {
      return res.status(400).json({ message: 'Les deux colonnes sont requises.' });
    }
    const newMapping = new SaveMapping({ excelColumn, databaseColumn });
    await newMapping.save();
    res.status(201).json(newMapping); // Renvoie l'association créée
  } catch (error) {
    console.error('Erreur lors de l\'ajout de l\'association :', error);
    res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
};

exports.updateMapping = async (req, res) => {
  const mappingId = req.params.id; // Récupérer l'ID du mapping à partir de l'URL
  const { excelColumn, databaseColumn } = req.body; // Récupérer les nouvelles valeurs

  try {
    // Trouver le mapping par ID et mettre à jour ses valeurs
    const updatedMapping = await SaveMapping.findByIdAndUpdate(
      mappingId,
      { excelColumn, databaseColumn },
      { new: true } // Retourne l'objet mis à jour
    );

    if (!updatedMapping) {
      return res.status(404).json({ message: 'Mapping non trouvé' });
    }

    res.status(200).json(updatedMapping); // Renvoie le mapping mis à jour
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.deleteMapping = async (req, res) => {
  try {
    const mappingId = req.params.id; // Récupérer l'ID depuis l'URL
    const result = await SaveMapping.findByIdAndDelete(mappingId); // Supprimer l'élément par ID

    if (!result) {
      return res.status(404).send('Association non trouvée');
    }

    res.status(200).send('Association supprimée avec succès');
  } catch (error) {
    console.error(error);
    res.status(500).send('Erreur serveur');
  }
};