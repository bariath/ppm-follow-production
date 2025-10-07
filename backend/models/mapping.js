const mongoose = require("mongoose");
const Activité = require("./activité");

const saveMappingSchema = new mongoose.Schema({
  excelColumn: { type: String, required: true },
  databaseColumn: { type: String, required: true }, 
  createdAt: { type: Date, default: Date.now, expires: 86400 }
})

module.exports = mongoose.model("SaveMapping", saveMappingSchema);
