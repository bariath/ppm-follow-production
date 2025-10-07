const mongoose = require("mongoose");

const collectionsToDrop = ["etapeactivites", "savemappings", "activité"];

exports.deleteCollections = async (req, res) => {
  console.log("🔔  Requête de purge reçue :", new Date().toISOString());

  try {
    const deleted = [];

    for (const name of collectionsToDrop) {
      console.log(`➡️  Vérification de l'existence de la collection « ${name} »…`);

      const exists = await mongoose.connection.db
        .listCollections({ name })
        .hasNext();

      console.log(`   └─ Existe ? ${exists ? "✅ OUI" : "❌ NON"}`);

      if (exists) {
        console.log(`   ⏳ Suppression de « ${name} » en cours…`);
        await mongoose.connection.db.dropCollection(name);
        console.log(`   ✔️  Collection « ${name} » supprimée.`);
        deleted.push(name);
      }
    }

    console.log("🏁  Suppression terminée:", deleted);

    return res.status(200).json({
      message: "Collections supprimées avec succès",
      deleted,
    });
  } catch (err) {
    console.error("❌  Erreur lors de la purge :", err);
    return res
      .status(500)
      .json({ error: "Erreur lors de la purge des collections" });
  }
};
