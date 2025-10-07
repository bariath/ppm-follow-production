const mongoose = require("mongoose");
const Etape = require("./etape");
const EtapeActivite = require("./etapeActivite");


const activitéSchema = new mongoose.Schema({
  donnéesDeBase: {
    numRéf: String,
    description: String,
    modeDePassation: String,
    méthodeDeSélection: String,
    montantEstimatif: Number,
    sourceDeFinancement: String,
    ligneImputation: String,
    organeDeControle: String,
    autorisationEngagement: String,
     dateDeDemarrage: {
      type: Date
    },
    attributaire: String, 
    montantAttribué: Number,
    pole: String,
    dateDeReceptionTDRS: Date,
    dateDeReceptionOrdreService: Date,
    dateDebutExecution: Date,
    dateFinExecution: Date,
    typeDeMarché: { type: String },
    statutActivite: {
      type: String, 
    },
    NiveauExécution: String, 
  },
  utilisateursAssociés: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }]
});

let Activité = mongoose.model("Activité", activitéSchema);

module.exports = {
  Activité: Activité,
};
