// stores/authStore.js (version mise à jour)
import { defineStore } from 'pinia';
import { usePermissionsStore } from './permissionsStore';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    session: null,
    isLoggedIn: false
  }),

  getters: {
    isAuthenticated: (state) => state.isLoggedIn && !!state.session,
    getUser: (state) => state.session,
    userName: (state) => state.session?.name || '',
    userSub: (state) => state.session?.mail || '',
    userRole: (state) => state.session?.role || null,
    access_token: (state) => state.session?.access_token || null
  },

  actions: {
    async setUser(payload) {
      this.session = payload.session;
      this.isLoggedIn = true;
      
      // Sauvegarde dans localStorage
      localStorage.setItem('authSession', JSON.stringify({
        session: payload.session,
        isLoggedIn: true
      }));

      // Charger les permissions après connexion
      const permissionsStore = usePermissionsStore();
      const result = await permissionsStore.fetchPermissions();
      
      if (!result.success) {
        console.warn('⚠️ Échec du chargement des permissions:', result.error);
      }

      return result;
    },

    clearTokens() {
      this.session = null;
      this.isLoggedIn = false;
      localStorage.removeItem('authSession');
      
      // Nettoyer aussi les permissions
      const permissionsStore = usePermissionsStore();
      permissionsStore.clearPermissions();
    },

    loadFromStorage() {
      try {
        const saved = localStorage.getItem('authSession');
        if (saved) {
          const parsed = JSON.parse(saved);
          this.session = parsed.session;
          this.isLoggedIn = parsed.isLoggedIn || false;
          
          // Si l'utilisateur est connecté depuis le storage, charger les permissions
          if (this.isLoggedIn && this.session) {
            const permissionsStore = usePermissionsStore();
            permissionsStore.fetchPermissions().catch(error => {
              console.warn('⚠️ Échec du rechargement des permissions depuis storage:', error);
            });
          }
        }
      } catch (error) {
        console.error('❌ Error loading from storage:', error);
        this.clearTokens();
      }
    }
  },

  persist: {
    key: 'auth-store',
    storage: localStorage,
    paths: ['session', 'isLoggedIn']
  }
});