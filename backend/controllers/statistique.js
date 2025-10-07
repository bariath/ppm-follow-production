const { Activité } = require('../models/activité');
const EtapeActivite = require('../models/etapeActivite');
const Etape = require('../models/etape');

const getMontantReel = async (ids) => {
  console.log("💰 Calcul du montant réel pour les IDs :", ids);
  
  if (ids.length === 0) {
    console.log("⚠️ Aucun ID fourni pour le calcul du montant réel");
    return [{ totalMontantReel: 0 }];
  }
  
  console.log(`🔢 Calcul en cours pour ${ids.length} activité(s)...`);
  
  const result = await Activité.aggregate([
    { $match: { _id: { $in: ids } } },
    {
      $group: {
        _id: null,
        totalMontantReel: {
          $sum: { $ifNull: ["$donnéesDeBase.montantAttribué", 0] }
        }
      }
    }
  ]);
  
  console.log("📊 Résultat agrégation montant réel :", result);
  
  const finalResult = result.length > 0 ? result : [{ totalMontantReel: 0 }];
  console.log("✅ Montant réel final :", finalResult[0]?.totalMontantReel || 0);
  
  return finalResult;
};

const getMontantEstimatif = async (ids) => {
  console.log("📈 Calcul du montant estimatif pour les IDs :", ids);
  
  if (ids.length === 0) {
    console.log("⚠️ Aucun ID fourni pour le calcul du montant estimatif");
    return [{ totalMontantEstimatif: 0 }];
  }
  
  console.log(`🔢 Calcul en cours pour ${ids.length} activité(s)...`);
  
  const result = await Activité.aggregate([
    { $match: { _id: { $in: ids } } },
    {
      $group: {
        _id: null,
        totalMontantEstimatif: {
          $sum: { $ifNull: ["$donnéesDeBase.montantEstimatif", 0] }
        }
      }
    }
  ]);
  
  console.log("📊 Résultat agrégation montant estimatif :", result);
  
  const finalResult = result.length > 0 ? result : [{ totalMontantEstimatif: 0 }];
  console.log("✅ Montant estimatif final :", finalResult[0]?.totalMontantEstimatif || 0);
  
  return finalResult;
};

const getPeriodeDates = (year, startMonth = 1, endMonth = 12) => {
  const yearNum = parseInt(year);
  const startMonthNum = parseInt(startMonth);
  const endMonthNum = parseInt(endMonth);

  if (
    isNaN(yearNum) || isNaN(startMonthNum) || isNaN(endMonthNum) ||
    startMonthNum < 1 || startMonthNum > 12 ||
    endMonthNum < 1 || endMonthNum > 12
  ) {
    throw new Error("Année ou mois invalides");
  }

  const start = new Date(yearNum, startMonthNum - 1, 1);
  const end = new Date(yearNum, endMonthNum, 0, 23, 59, 59, 999);
  return { start, end };
};

exports.getStatistiques = async (req, res) => {
  try {
    const { year, startMonth, endMonth } = req.query;

    console.log("📥 Requête reçue avec :", { year, startMonth, endMonth });

    if (!year) {
      console.warn("⚠️ L'année est requise.");
      return res.status(400).json({ error: "L'année est requise." });
    }
    const { start, end } = getPeriodeDates(year, startMonth, endMonth);
     console.log("📅 Période calculée :", { year, start, end });

     const today = new Date(); 
     console.log("Date actuelle :", today)
    const activitesDemarrer = await EtapeActivite.find({
      numEtape: 1,
      delaiPrevu: { $gte: start, $lte: end },
    delaiReel: { $lte: today }
    });
    
    console.log(`🔍 ${activitesDemarrer.length} activité(s) prévue(s) trouvée(s) (filtrées par période)`);

    const idsActivitesFiltrees = activitesDemarrer.map(e => e.activité);
    console.log("🆔 IDs des activités filtrées :", idsActivitesFiltrees);

    if (idsActivitesFiltrees.length === 0) {
      console.log("⚠️ Aucune activité trouvée pour la période spécifiée");
      return res.json({ 
        activitéParTypeMarché: [],
        activitéParOrganeDeControle: [],
        activitéParPole: [],
        activitéParNiveauExecution: [],
        sommeMontantEstimatif: 0,
        MontantReel: 0
      });
    }

    console.log(`✅ ${idsActivitesFiltrees.length} activité(s) trouvée(s) pour traitement`);

    // Agrégations pour les statistiques avec sous-regroupement par niveau d'exécution
    console.log("📊 Début des agrégations pour les statistiques...");
    
    // 1. Activités par type de marché avec niveau d'exécution
    const activitéParTypeMarché = await Activité.aggregate([
      { $match: { _id: { $in: idsActivitesFiltrees } } },
      {
        $group: {
          _id: {
            typeDeMarché: "$donnéesDeBase.typeDeMarché",
            niveauExecution: "$donnéesDeBase.NiveauExécution"
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: "$_id.typeDeMarché",
          total: { $sum: "$count" },
          niveauxExecution: {
            $push: {
              niveau: "$_id.niveauExecution",
              count: "$count"
            }
          }
        }
      },
      { $sort: { total: -1 } }
    ]);

    console.log("📊 Activités par type de marché avec niveaux :", activitéParTypeMarché);

    // 2. Activités par organe de contrôle avec niveau d'exécution
    const activitéParOrganeDeControle = await Activité.aggregate([
      { $match: { _id: { $in: idsActivitesFiltrees } } },
      {
        $group: {
          _id: {
            organeDeControle: "$donnéesDeBase.organeDeControle",
            niveauExecution: "$donnéesDeBase.NiveauExécution"
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: "$_id.organeDeControle",
          total: { $sum: "$count" },
          niveauxExecution: {
            $push: {
              niveau: "$_id.niveauExecution",
              count: "$count"
            }
          }
        }
      },
      { $sort: { total: -1 } }
    ]);

    console.log("📊 Activités par organe de contrôle avec niveaux :", activitéParOrganeDeControle);

    // 3. Activités par pôle avec niveau d'exécution
    const activitéParPole = await Activité.aggregate([
      { $match: { _id: { $in: idsActivitesFiltrees } } },
      {
        $group: {
          _id: {
            pole: "$donnéesDeBase.pole",
            niveauExecution: "$donnéesDeBase.NiveauExécution"
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: "$_id.pole",
          total: { $sum: "$count" },
          niveauxExecution: {
            $push: {
              niveau: "$_id.niveauExecution",
              count: "$count"
            }
          }
        }
      },
      { $sort: { total: -1 } }
    ]);

    console.log("📊 Activités par pôle avec niveaux :", activitéParPole);

    // 4. Regroupement général par niveau d'exécution (conservé)
    const activitéParNiveauExecution = await Activité.aggregate([
      { $match: { _id: { $in: idsActivitesFiltrees } } },
      {
        $group: {
          _id: "$donnéesDeBase.NiveauExécution",
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    console.log("📊 Activités par niveau d'exécution général :", activitéParNiveauExecution);

    // Calcul des montants
    console.log("💰 Début du calcul des montants...");
    const montantReelResult = await getMontantReel(idsActivitesFiltrees);
    const montantReel = montantReelResult[0]?.totalMontantReel || 0;
    console.log("📊 Montant réel final :", montantReel);

    const montantEstimatifResult = await getMontantEstimatif(idsActivitesFiltrees);
    const sommeMontantEstimatif = montantEstimatifResult[0]?.totalMontantEstimatif || 0;
    console.log("📊 Montant estimatif final :", sommeMontantEstimatif);

    // Ajoutez ceci juste avant la préparation de la réponse finale

// ===== CONSTANTES POUR LE FRONTEND =====

// 1. Total des activités par type de marché (simplifié)
const totalParTypeMarche = activitéParTypeMarché.reduce((acc, item) => {
  acc[item._id] = item.total;
  return acc;
}, {});

// 2. Total des activités par organe de contrôle (simplifié)
const totalParOrganeControle = activitéParOrganeDeControle.reduce((acc, item) => {
  acc[item._id] = item.total;
  return acc;
}, {});

// 3. Total des activités par pôle (simplifié)
const totalParPole = activitéParPole.reduce((acc, item) => {
  acc[item._id] = item.total;
  return acc;
}, {});

// 4. Total des activités par niveau d'exécution (simplifié)
const totalParNiveauExecution = activitéParNiveauExecution.reduce((acc, item) => {
  acc[item._id] = item.count;
  return acc;
}, {});

// 5. Totaux généraux
const totauxGeneraux = {
  nombreTotalActivites: idsActivitesFiltrees.length,
  montantEstimatifTotal: sommeMontantEstimatif,
  montantReelTotal: montantReel,
  differenceEstimatifReel: sommeMontantEstimatif - montantReel,
  tauxRealisationMontant: sommeMontantEstimatif > 0 ? ((montantReel / sommeMontantEstimatif) * 100).toFixed(2) : 0
};

// 6. Listes pour les graphiques/dropdowns
const listeTypesMarche = activitéParTypeMarché.map(item => item._id).filter(Boolean);
const listeOrganesControle = activitéParOrganeDeControle.map(item => item._id).filter(Boolean);
const listePoles = activitéParPole.map(item => item._id).filter(Boolean);
const listeNiveauxExecution = activitéParNiveauExecution.map(item => item._id).filter(Boolean);

// 7. Données formatées pour les graphiques (Chart.js, D3, etc.)
const dataGraphiques = {
  // Pour un graphique en secteurs des types de marché
  pieChartTypeMarche: {
    labels: listeTypesMarche,
    data: listeTypesMarche.map(type => totalParTypeMarche[type] || 0)
  },
  
  // Pour un graphique en barres des organes de contrôle
  barChartOrganeControle: {
    labels: listeOrganesControle,
    data: listeOrganesControle.map(organe => totalParOrganeControle[organe] || 0)
  },
  
  // Pour un graphique en barres des pôles
  barChartPole: {
    labels: listePoles,
    data: listePoles.map(pole => totalParPole[pole] || 0)
  },
  
  // Pour un graphique des niveaux d'exécution
  barChartNiveauExecution: {
    labels: listeNiveauxExecution,
    data: listeNiveauxExecution.map(niveau => totalParNiveauExecution[niveau] || 0)
  }
};

// 8. Statistiques avancées
const statistiquesAvancees = {
  typeMarchemostFrequent: activitéParTypeMarché.length > 0 ? activitéParTypeMarché[0]._id : null,
  organeMostFrequent: activitéParOrganeDeControle.length > 0 ? activitéParOrganeDeControle[0]._id : null,
  poleMoreFrequent: activitéParPole.length > 0 ? activitéParPole[0]._id : null,
  niveauExecutionMostFrequent: activitéParNiveauExecution.length > 0 ? activitéParNiveauExecution[0]._id : null
};

console.log("📊 Constantes frontend générées :", {
  totalParTypeMarche,
  totalParOrganeControle,
  totalParPole,
  totalParNiveauExecution,
  totauxGeneraux,
  dataGraphiques,
  statistiquesAvancees
});

// ===== FIN DES CONSTANTES =====

// Préparation de la réponse (modifiée pour inclure les constantes)
const response = {
  // Données originales
  activitéParTypeMarché,
  activitéParOrganeDeControle,
  activitéParPole,
  activitéParNiveauExecution,
  sommeMontantEstimatif,
  MontantReel: montantReel,
  periode: {
    debut: start,
    fin: end
  },
  
  // ⭐ NOUVELLES CONSTANTES POUR LE FRONTEND ⭐
  constantes: {
    totalParTypeMarche,
    totalParOrganeControle,
    totalParPole,
    totalParNiveauExecution,
    totauxGeneraux,
    listes: {
      typesMarche: listeTypesMarche,
      organesControle: listeOrganesControle,
      poles: listePoles,
      niveauxExecution: listeNiveauxExecution
    },
    dataGraphiques,
    statistiquesAvancees
  }
};
    // Réponse finale
    res.json(response);

  } catch (error) {
    console.error("❌ Erreur lors de la récupération des statistiques :", error);
    res.status(500).json({ 
      error: "Erreur serveur",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};