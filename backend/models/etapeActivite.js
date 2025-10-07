const mongoose = require("mongoose");
const Activité = require("./activité");
const Etape = require("./etape");

const etapeActiviteSchema = new mongoose.Schema({
  activité: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Activité',
    required: true
  },
  etape: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Etape', 
    required: true
  },
  numEtape: {
    type: Number,
    required: true
  },
  delaiPrevu: {
    type: Date, 
    required: true
  },
  delaiReelPrevisionnel: {
    type: Date, 
  },
  delaiReel: {
    type: Date, 
  },
  statut: {
    type: String, 
  },
  delaiGlobal: {
    type: String
  },
  dateDeDemarrage: {
    type: Date
  },
  statutEtape: {
    type: String
  },
  niveauExecutions: {
    type: String
  },
  Confirmer: {
    type: String
  }
}, { timestamps: true }); 
module.exports = mongoose.model("EtapeActivite", etapeActiviteSchema);


