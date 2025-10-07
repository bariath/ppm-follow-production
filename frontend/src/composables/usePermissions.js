// composables/usePermissions.js
import { computed } from 'vue';
import { usePermissionsStore } from '@/stores/permissionsStore';

export function usePermissions() {
  const permissionsStore = usePermissionsStore();

  const can = (action, subject, resource = null) => {
    return permissionsStore.can(action, subject, resource);
  };

  const cannot = (action, subject, resource = null) => {
    return permissionsStore.cannot(action, subject, resource);
  };

  const isAdmin = computed(() => permissionsStore.isAdmin);
  const isManager = computed(() => permissionsStore.isManager);
  const isUser = computed(() => permissionsStore.isUser);
  const isViewer = computed(() => permissionsStore.isViewer);
  const userRole = computed(() => permissionsStore.userRole);

  const permissions = {
    activities: {
      canView: computed(() => can('read', 'Activite')),
      canCreate: computed(() => can('create', 'Activite')),
      canUpdate: computed(() => can('update', 'Activite')),
      canDelete: computed(() => can('delete', 'Activite')),
      canManage: computed(() => permissionsStore.canManageActivities())
    },

    steps: {
      canView: computed(() => can('read', 'Etape')),
      canCreate: computed(() => can('create', 'Etape')),
      canUpdate: computed(() => can('update', 'Etape')),
      canDelete: computed(() => can('delete', 'Etape')),
      canManage: computed(() => permissionsStore.canManageSteps())
    },

    stepActivities: {
      canView: computed(() => can('read', 'EtapeActivite')),
      canUpdate: computed(() => can('update', 'EtapeActivite'))
    },

    users: {
      canView: computed(() => can('read', 'User')),
      canCreate: computed(() => can('create', 'User')),
      canUpdate: computed(() => can('update', 'User')),
      canDelete: computed(() => can('delete', 'User')),
      canManage: computed(() => permissionsStore.canManageUsers())
    },

    mapping: {
      canView: computed(() => can('read', 'SaveMapping')),
      canCreate: computed(() => can('create', 'SaveMapping')),
      canUpdate: computed(() => can('update', 'SaveMapping')),
      canDelete: computed(() => can('delete', 'SaveMapping')),
      canManage: computed(() => permissionsStore.canManageMapping())
    },

    reports: {
      canView: computed(() => can('read', 'Rapport')),
      canGenerate: computed(() => permissionsStore.canViewReports())
    },

    statistics: {
      canView: computed(() => can('read', 'Statistique'))
    }
  };

  // Fonctions d'aide pour l'interface
  const getPermissionLevel = () => {
    if (isAdmin.value) return 'admin';
    if (isManager.value) return 'manager';
    if (isUser.value) return 'user';
    if (isViewer.value) return 'viewer';
    return 'none';
  };

  const shouldShowNavItem = (requiredPermission) => {
    const [action, subject] = requiredPermission.split(':');
    return can(action, subject);
  };

  // Fonction pour vérifier plusieurs permissions à la fois
  const hasAnyPermission = (permissionsList) => {
    return permissionsList.some(perm => {
      const [action, subject] = perm.split(':');
      return can(action, subject);
    });
  };

  const hasAllPermissions = (permissionsList) => {
    return permissionsList.every(perm => {
      const [action, subject] = perm.split(':');
      return can(action, subject);
    });
  };

  return {
    can,
    cannot,
    
    isAdmin,
    isManager,
    isUser,
    isViewer,
    userRole,
 
    permissions,
 
    getPermissionLevel,
    shouldShowNavItem,
    hasAnyPermission,
    hasAllPermissions,
 
    permissionsStore
  };
}