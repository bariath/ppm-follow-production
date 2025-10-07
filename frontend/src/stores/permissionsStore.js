import { defineStore } from 'pinia';
import { createMongoAbility } from '@casl/ability';
import axios from 'axios';

export const usePermissionsStore = defineStore('permissions', {
  state: () => ({
    ability: null,
    permissions: {},
    userRole: null,
    loading: false,
    error: null,
    isLoaded: false // Ajout d'un flag pour savoir si les permissions ont déjà été chargées
  }),

  getters: {
    can: (state) => {
      return (action, subject, resource = null) => {
        if (!state.ability) return false;
        return state.ability.can(action, subject, resource);
      };
    },
    
    cannot: (state) => {
      return (action, subject, resource = null) => {
        if (!state.ability) return true;
        return state.ability.cannot(action, subject, resource);
      };
    },

    hasRole: (state) => {
      return (role) => state.userRole === role;
    },

    isAdmin: (state) => state.userRole === 'admin',
    isManager: (state) => state.userRole === 'manager',
    isUser: (state) => state.userRole === 'user',
    isViewer: (state) => state.userRole === 'viewer',
  },

  actions: {
    // Helpers utilisés par usePermissions
    canManageActivities() {
      if (!this.ability) return false;
      return this.ability.can('create', 'Activite') || this.ability.can('update', 'Activite') || this.ability.can('delete', 'Activite') || this.ability.can('manage', 'all');
    },
    canManageSteps() {
      if (!this.ability) return false;
      return this.ability.can('create', 'Etape') || this.ability.can('update', 'Etape') || this.ability.can('delete', 'Etape') || this.ability.can('manage', 'all');
    },
    canManageUsers() {
      if (!this.ability) return false;
      return this.ability.can('create', 'User') || this.ability.can('update', 'User') || this.ability.can('delete', 'User') || this.ability.can('manage', 'all');
    },
    canManageMapping() {
      if (!this.ability) return false;
      return this.ability.can('create', 'SaveMapping') || this.ability.can('update', 'SaveMapping') || this.ability.can('delete', 'SaveMapping') || this.ability.can('manage', 'all');
    },
    canViewReports() {
      if (!this.ability) return false;
      return this.ability.can('read', 'Rapport') || this.ability.can('manage', 'all');
    },
    async fetchPermissions() {
      // Évite les rechargements multiples si déjà fait
      if (this.loading) return; 

      this.loading = true;
      this.error = null;

      try {
        console.log('🔄 Récupération des permissions utilisateur...');
        
        const response = await axios.get('/api/user-permissions');
        
        if (response.data.success) {
          const { user } = response.data;
          
          this.userRole = user.role;
          this.permissions = user.permissions || {}; // S'assurer que permissions est un objet
          
          this.ability = this.createAbilityFromPermissions(this.permissions, user.role);
          this.isLoaded = true; // Marquer comme chargé
          
          console.log(`✅ Permissions chargées pour ${user.mail} (${user.role})`);
          
          return { success: true, user: user };
        }
        
      } catch (error) {
        console.error('❌ Erreur lors du chargement des permissions:', error);
        this.error = error.response?.data?.error || 'Erreur de chargement des permissions';
        this.clearPermissions();
        
        return { success: false, error: this.error };
      } finally {
        this.loading = false;
      }
    },

    createAbilityFromPermissions(permissions, role) {
      const rules = [];

      Object.keys(permissions).forEach(subject => {
        Object.keys(permissions[subject]).forEach(action => {
          if (permissions[subject][action]) {
            rules.push({ action, subject });
          }
        });
      });

      // Règle spéciale pour l'admin
      if (role === 'admin') {
        rules.push({ action: 'manage', subject: 'all' });
      } 
      // *** AMÉLIORATION ***
      // Si un manager n'a aucune permission explicite, on lui donne un set par défaut.
      // Ceci est une SÉCURITÉ. La vraie solution est de configurer les permissions côté backend.
      else if (role === 'manager' && rules.length === 0) {
        console.warn("⚠️ Aucune permission explicite reçue pour le manager. Application de règles par défaut.");
        rules.push(
            { action: ['read', 'create', 'update'], subject: 'Activite' },
            { action: ['read', 'create', 'update'], subject: 'Etape' },
            { action: 'read', subject: 'Statistique' },
            { action: 'read', subject: 'Rapport' },
            { action: 'read', subject: 'User' }
        );
      }

      console.log(`🔐 Règles CASL créées:`, rules);
      
      return createMongoAbility(rules);
    },

    clearPermissions() {
      this.ability = null;
      this.permissions = {};
      this.userRole = null;
      this.error = null;
      this.isLoaded = false; // Réinitialiser le flag
    },
  }
});
