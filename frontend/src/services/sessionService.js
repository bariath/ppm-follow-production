// src/services/sessionService.js
import axios from 'axios';

class SessionService {
  constructor() {
    this.lastCheck = 0;
    this.checkInterval = 5 * 60 * 1000; // 5 minutes
    this.isChecking = false;
  }

  // Vérifier la session avec cache pour éviter trop de requêtes
  async checkSession(force = false) {
    const now = Date.now();
    
    // Si on a vérifié récemment et ce n'est pas forcé, pas besoin de re-vérifier
    if (!force && (now - this.lastCheck) < this.checkInterval && !this.isChecking) {
      console.log('🕐 Utilisation du cache de session (vérifié récemment)');
      return { valid: true, cached: true };
    }

    // Éviter les vérifications simultanées
    if (this.isChecking) {
      console.log('⏳ Vérification de session déjà en cours...');
      return new Promise((resolve) => {
        const checkReady = () => {
          if (!this.isChecking) {
            resolve(this.checkSession(false));
          } else {
            setTimeout(checkReady, 100);
          }
        };
        checkReady();
      });
    }

    this.isChecking = true;
    
    try {
      console.log('🔄 Vérification de la session côté serveur...');
      const response = await axios.get('/api/check-session', {
        timeout: 5000 // Timeout de 5 secondes
      });
      
      this.lastCheck = now;
      this.isChecking = false;
      
      return {
        valid: true,
        user: response.data.user,
        cached: false
      };
      
    } catch (error) {
      this.isChecking = false;
      console.log('❌ Vérification session échouée:', error.response?.data?.error || error.message);
      
      // En cas d'erreur réseau, on peut être plus permissif
      if (error.code === 'ECONNABORTED' || error.code === 'NETWORK_ERROR') {
        console.log('⚠️ Erreur réseau, maintien de la session locale temporairement');
        return {
          valid: true,
          networkError: true,
          cached: false
        };
      }
      
      return {
        valid: false,
        error: error.response?.data?.error || 'Erreur de vérification de session',
        cached: false
      };
    }
  }

  // Forcer une nouvelle vérification (utile après des actions importantes)
  async forceCheck() {
    return await this.checkSession(true);
  }

  // Réinitialiser le cache (utile après déconnexion)
  resetCache() {
    this.lastCheck = 0;
    this.isChecking = false;
  }
}

// Instance unique du service
export const sessionService = new SessionService();