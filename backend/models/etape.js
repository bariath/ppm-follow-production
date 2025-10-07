const mongoose = require("mongoose");
const EtapeActivite = require("./etapeActivite");
const Activité = require("./activité");

const etapeSchema = new mongoose.Schema({
  NumEtape: Number,
  nom: String,
  modeDePassation: String,
  delaiGlobalCCMP: Number,
  delaiGlobalDNCMP: Number,
  statutEtape: String,
  niveauExecution: String,
},{ timestamps: true });

module.exports = mongoose.model("Etape", etapeSchema);