const axios = require('axios');
const FormData = require('form-data');
const moment = require('moment'); 
const {Activité} = require("../models/activité");
const EtapeActivite = require('../models/etapeActivite');
const User = require("../models/user");
const mongoose = require('mongoose');

async function envoyerEmail({ to, cc = [], bcc = [], subject, body, isHtml = true }) {
  const form = new FormData();

  const contacts = [
    { email: to, type: 'to' },
    ...cc.map(email => ({ email, type: 'cc' })),
    ...bcc.map(email => ({ email, type: 'bcc' })),
  ];

  form.append('contacts', JSON.stringify(contacts));
  form.append('body', body);
  form.append('object', subject);
  form.append('isHtmlContent', isHtml.toString());
  form.append('template', 'false');

  try {
    const response = await axios.post('https://notifyer.service-public.bj/api/v1/mails', form, {
      headers: {
        ...form.getHeaders(),
       'api_key': process.env.NOTIER_API_KEY
      },
    });

    console.log('✅ Email envoyé avec succès :', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Erreur lors de l’envoi de l’email :', error.response?.data || error.message);
    throw error;
  }
}

async function getEmailsEnCopie(idsActivites) {
  const emails = new Set();

  for (const idActivite of idsActivites) {
    if (!mongoose.Types.ObjectId.isValid(idActivite)) {
      console.warn("ID d'activité invalide ignoré :", idActivite);
      continue;
    }

    const activite = await Activité.findById(idActivite).populate("utilisateursAssociés");

    if (activite && activite.utilisateursAssociés.length) {
      activite.utilisateursAssociés.forEach(utilisateur => {
        if (utilisateur.mail) {
          emails.add(utilisateur.mail);
        }
      });
    }
  }

  return Array.from(emails); 
}

async function planifierEmail() {
  const demain = moment().add(1, 'day').startOf('day');

  const activitesEnCours = await Activité.find({ 'donnéesDeBase.statutActivite': 'En cours' });
  if (!activitesEnCours.length) return console.log('❌ Aucune activité en cours');

  const idsActivites = activitesEnCours.map(a => a._id);

  const etapes = await EtapeActivite.find({
    activité: { $in: idsActivites },
    delaiReel: { $gte: demain.toDate(), $lt: moment(demain).endOf('day').toDate() }
  })
    .populate('activité')
    .populate('etape');

  if (!etapes.length) return console.log('❌ Aucune étape se terminant demain');

  const demainTxt = moment(demain).format('DD/MM/YYYY');
  let tableRows = '', i = 0;
  const idsDesActivites = new Set();

  etapes.forEach(e => {
    const numEtape = e.etape?.NumEtape || '—';
    const nomEtape = e.etape?.nom || '—';
    const numRef   = e.activité?.donnéesDeBase?.numRéf || '—';
    const bg = i++ % 2 ? '#f9f9f9' : '#ffffff';
    tableRows += `
      <tr style="background:${bg};">
        <td style="padding:8px 12px; border:1px solid #ddd;">${numEtape}</td>
        <td style="padding:8px 12px; border:1px solid #ddd;">${nomEtape}</td>
        <td style="padding:8px 12px; border:1px solid #ddd;">${numRef}</td>
      </tr>`;
    idsDesActivites.add(e.activité._id.toString());
  });

  const emailBody = `
  <div style="font-family:Arial,Helvetica,sans-serif; color:#333;">
    <h2 style="color:#2d7dd2;">📅 Étapes à échéance le ${demainTxt}</h2>
    <p>Bonjour,<br>Voici la liste des étapes prenant fin <strong>demain</strong>.</p>
    <table cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse; max-width:600px;">
      <thead>
        <tr style="background:#f0f6ff;">
          <th style="padding:10px 12px; border:1px solid #ddd;" align="left">#</th>
          <th style="padding:10px 12px; border:1px solid #ddd;" align="left">Nom de l’étape</th>
          <th style="padding:10px 12px; border:1px solid #ddd;" align="left">N° Réf.</th>
        </tr>
      </thead>
      <tbody>${tableRows}</tbody>
    </table>
    <p style="margin:24px 0 8px;">Cordialement,<br>L’équipe L’équipe PRMP</p>
    <hr style="border:none; border-top:1px solid #eee;">
    <small style="color:#777;">Mail automatique – ne pas répondre.</small>
  </div>`;

  /* ---- Emails en copie ---- */
  const emailsCc      = await getEmailsEnCopie([...idsDesActivites]);
  const emailRegex    = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const validEmailsCc = emailsCc.filter(e => emailRegex.test(e));

  /* ---- Envoi ---- */
  await envoyerEmail({
    to: 'crgbaguidi@presidence.bj',
    cc: validEmailsCc,
    subject: `Alerte : ${etapes.length} étape(s) échues le ${demainTxt}`,
    body: emailBody,
    isHtml: true
  });
}

const cron = require('node-cron');
cron.schedule('0 6 * * *', () => {
console.log("🕒 Lancement de l'envoi des emails...");
planifierEmail();
});
 //planifierEmail();
 //console.log('🕒 Tâche planifiée : Envoi d\'emails chaque jour à 6h du matin');

module.exports = envoyerEmail;

