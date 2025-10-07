const config = require("./config");
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const routes = require("./routes");
const app = express();
var cors = require("cors");
const session = require('express-session');
const User = require("./models/user");
const logger = require('./logger');
const { errorHandler } = require('./middleware/errorHandler');
const path = require('path');

app.use(cors({
  origin: process.env.VITE_FRONTEND_URL, // URL spécifique du frontend
  credentials: true, // Permet l'envoi des cookies de session
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization']
}));


app.use(express.json());

app.use(bodyParser.json());

mongoose
  .connect(config.db_uri, config.db_options)
  .then(async () => {
    logger.info({ db: config.db_uri }, "Connexion à MongoDB réussie");

    // Vérifie si un admin existe déjà
    const admin = await User.findOne({ role: "admin" });
    if (!admin) {
      await User.create({
        nom: "ADECHI",
        prenom: "Bariatou Olaïdé",
        mail: "badechi@asin.bj",
        role: "admin"
      });
      logger.warn("Admin par défaut créé !");
    } else {
      logger.info({ mail: admin.mail }, "Admin déjà présent");
    }
  })
  .catch((err) => {
    logger.error({ err }, "Connexion à MongoDB échouée");
  });

  // Sécurité des sessions
  if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
  }

  app.use(
    session({
      secret: process.env.SESSION_SECRET || 'change_this_secret',
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 1000 * 60 * 60 * 24 
      }
    })
  );

// Service des vidéos (AVANT les routes protégées)
app.get('/api/videos/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, 'uploads', filename);
  
  // Vérifier que le fichier existe
  const fs = require('fs');
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Fichier non trouvé' });
  }
  
  // Headers pour les vidéos
  if (filename.endsWith('.mp4')) {
    res.setHeader('Content-Type', 'video/mp4');
  } else if (filename.endsWith('.webm')) {
    res.setHeader('Content-Type', 'video/webm');
  } else if (filename.endsWith('.ogg')) {
    res.setHeader('Content-Type', 'video/ogg');
  }
  
  res.setHeader('Accept-Ranges', 'bytes');
  res.sendFile(filePath);
});

// Route de test supprimée - retour à l'authentification normale

app.use("/api", routes);

// Endpoint de santé
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime() });
});

// Middleware global d'erreurs (dernier)
app.use(errorHandler);

module.exports = app;
