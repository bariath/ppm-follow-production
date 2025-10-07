const User = require("../models/user");
const { Activité } = require("../models/activité");
const mongoose = require("mongoose");

exports.ajouterUtilisateur = async (req, res) => {
    try {
      const { nom, prenom, mail, role } = req.body;
  
      const utilisateurExistant = await User.findOne({ mail });
      if (utilisateurExistant) {
        return res.status(400).json({ message: "Un utilisateur avec ce mail existe déjà." });
      }
  
      const user = new User({ nom, prenom, mail, role });
      await user.save();
      res.status(201).json(user);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
  exports.modifierUtilisateur = async (req, res) => {
    try {
      const { id } = req.params;
      const { nom, prenom, mail, role } = req.body;
  
      const utilisateurExistant = await User.findOne({ mail, _id: { $ne: id } });
      if (utilisateurExistant) {
        return res.status(400).json({ message: "Un autre utilisateur avec ce mail existe déjà." });
      }
  
      const user = await User.findByIdAndUpdate(
        id,
        { nom, prenom, mail, role },
        { new: true }
      );
  
      if (!user) {
        return res.status(404).json({ message: "Utilisateur non trouvé" });
      }
  
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
  exports.supprimerUtilisateur = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await User.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Utilisateur non trouvé" });
    res.json({ message: "Utilisateur supprimé avec succès" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.listerUtilisateurs = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.associerUtilisateurActivite = async (req, res) => {
  const { idActivite, idUtilisateur } = req.body;

  try {
    // Vérifier si l'activité existe
    const activite = await Activité.findById(idActivite);
    if (!activite) {
      return res.status(404).json({ message: "Activité non trouvée." });
    }
   
    const utilisateur = await User.findById(idUtilisateur);
    if (!utilisateur) {
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }
    const estDejaAssocie = activite.utilisateursAssociés.includes(idUtilisateur);
    if (estDejaAssocie) {
      return res.status(400).json({ message: "Utilisateur déjà associé à cette activité." });
    }
    activite.utilisateursAssociés.push(idUtilisateur);
    await activite.save();

    console.log("Utilisateur associé avec succès.");

    return res.status(200).json({ message: "Utilisateur associé avec succès.", activite });
  } catch (error) {
    console.error("Erreur lors de l'association :", error);
    return res.status(500).json({ message: "Erreur serveur." });
  }
};

exports.getUtilisateursAssocies = async (req, res) => {
  const { idActivite } = req.params; // ou req.body selon ta route

  console.log("ID d'activité reçu :", idActivite);

  // Vérifie si l'ID d'activité est valide
  if (!mongoose.Types.ObjectId.isValid(idActivite)) {
    console.error("ID d'activité invalide :", idActivite);
    return res.status(400).json({ message: "ID d'activité invalide." });
  }

  try {
    const activite = await Activité.findById(idActivite).populate("utilisateursAssociés");

    if (!activite) {
      console.error("Activité non trouvée pour l'ID :", idActivite);
      return res.status(404).json({ message: "Activité non trouvée." });
    }
    return res.status(200).json({
      utilisateurs: activite.utilisateursAssociés
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des utilisateurs associés pour l'ID :", idActivite, error);
    return res.status(500).json({ message: "Erreur serveur." });
  }
};

exports.deleteUser = async (req, res) => {
  const { idActivite, idUtilisateur } = req.body;

  try {
    const activite = await Activité.findById(idActivite);
    if (!activite) {
      return res.status(404).json({ message: "Activité non trouvée." });
    }

    const utilisateur = await User.findById(idUtilisateur);
    if (!utilisateur) {
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }

    const estAssocie = activite.utilisateursAssociés.includes(idUtilisateur);
    if (!estAssocie) {
      return res.status(400).json({ message: "Utilisateur non associé à cette activité." });
    }

    // Supprimer l'utilisateur de la liste des utilisateurs associés
    activite.utilisateursAssociés = activite.utilisateursAssociés.filter(
      (utilisateurId) => utilisateurId.toString() !== idUtilisateur
    );

    // Sauvegarder les modifications
    await activite.save();
    console.log("Association supprimée avec succès.");
    
    return res.status(200).json({ message: "Association supprimée avec succès.", activite });
  } catch (error) {
    console.error("Erreur lors de la suppression de l'association :", error);
    return res.status(500).json({ message: "Erreur serveur." });
  }
};
exports.verifierUtilisateurParEmail = async (req, res) => {
  const email = req.query.email;

  console.log("🟡 Requête de vérification reçue avec l'email :", email);

  if (!email) {
    console.warn("⚠️ Aucune adresse email reçue dans la requête");
    return res.status(400).json({ error: "Email requis." });
  }

  try {
    const utilisateur = await User.findOne({ mail: email });

    if (utilisateur) {
      console.log("✅ Utilisateur trouvé dans la base :", utilisateur.mail);
    } else {
      console.log("❌ Aucun utilisateur trouvé avec l'email :", email);
    }

    res.json({ exists: !!utilisateur });
  } catch (error) {
    console.error("🛑 Erreur lors de la vérification d'utilisateur :", error);
    res.status(500).json({ error: "Erreur serveur." });
  }
};

