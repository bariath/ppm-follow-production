const mongoose = require("mongoose");
const EtapeActivite = require("./etapeActivite");
const Activité = require("./activité");

const userSchema = new mongoose.Schema({
  nom: String,
  prenom: String,
  mail: String,
 role: {
    type: String,
    enum: ['admin', 'manager', 'user', 'viewer'],
    default: 'user'
  },
})

module.exports = mongoose.model("User", userSchema);