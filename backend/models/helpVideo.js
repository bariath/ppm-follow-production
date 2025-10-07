const mongoose = require('mongoose');

const helpVideoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  roles: { type: [String], default: ['user'] },
  filename: { type: String, required: true },
  mimeType: { type: String, required: true },
  size: { type: Number, required: true },
  uploadedBy: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('HelpVideo', helpVideoSchema);


