const express = require('express');
const fetch = require('node-fetch');
const jwt = require('jsonwebtoken');

require('dotenv').config();
const User = require('../models/user');

const app = express();
app.use(express.json());

exports.callback_uri = async (req, res, next) => {
  const code = req.body.code;

  if (!code) {
    return res.status(400).json({ error: 'Code manquant dans la requête' });
  }

  const tokenUrl = process.env.VITE_OAUTH_TOKEN_URL;
  const redirectUri = process.env.VITE_REDIRECT_URI;
  const authorizationHeader = `Basic ${Buffer.from(
    `${process.env.VITE_OAUTH_CLIENT_ID}:${process.env.VITE_OAUTH_CLIENT_SECRET}`
  ).toString('base64')}`;

  const tokenParams = new URLSearchParams({
    grant_type: 'authorization_code',
    redirect_uri: redirectUri,
    code: code,
  });

  try {
    console.log('Envoi de la requête à OAuth2 pour récupérer le token...');
    const tokenResponse = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Authorization': authorizationHeader,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: tokenParams,
    });

    if (tokenResponse.ok) {
      const tokenData = await tokenResponse.json();

      let userInfo;
      try {
        userInfo = jwt.decode(tokenData.id_token);
      } catch (err) {
        console.error("Erreur lors du décodage de l'id_token :", err);
        return res.status(500).json({ error: "Impossible de décoder le id_token" });
      }

      console.log("✅ Informations de l'utilisateur :", userInfo);

      // Vérifier si l'utilisateur existe dans la base de données par son email
      const email = userInfo.sub; // L'email de l'utilisateur est généralement dans le "sub" du token

      console.log("Vérification de l'utilisateur avec l'email :", email);
      const utilisateur = await User.findOne({ mail: email });

      if (!utilisateur) {
        console.log("❌ Aucun utilisateur trouvé avec l'email :", email);
        return res.status(400).json({ 
          error: "Utilisateur non autorisé : email non trouvé dans la base" 
        });
      }

      console.log("✅ Utilisateur trouvé dans la base :", {
        mail: utilisateur.mail,
        role: utilisateur.role,
        nom: utilisateur.nom
      });

      // Enregistrer la session utilisateur avec toutes les infos nécessaires
      req.session.user = {
        access_token: tokenData.access_token,
        mail: userInfo.sub,
        name: userInfo.name || utilisateur.nom,
        company: userInfo.company,
        loginTime: Date.now(),
        // Ajouter le rôle depuis la base de données
        role: utilisateur.role,
        userId: utilisateur._id
      };

      console.log("✅ Session sauvegardée avec rôle :", {
        mail: req.session.user.mail,
        role: req.session.user.role
      });

      // Retourner une réponse avec les informations de l'utilisateur
      return res.json({
        message: "Utilisateur connecté avec succès",
        user: {
          mail: req.session.user.mail,
          name: req.session.user.name,
          company: req.session.user.company,
          role: req.session.user.role,
          loginTime: req.session.user.loginTime
        }
      });

    } else {
      const errorDetails = await tokenResponse.text();
      console.error('Erreur lors de la récupération du jeton d\'accès:', errorDetails);
      return res.status(tokenResponse.status).json({
        error: 'Erreur lors de la récupération du jeton d\'accès',
        details: errorDetails,
      });
    }
  } catch (error) {
    console.error('Erreur lors de la communication avec le serveur OAuth2:', tokenUrl, error);
    return res.status(500).json({
      error: 'Erreur lors de la communication avec le serveur OAuth2',
      details: error.message
    });
  }
};