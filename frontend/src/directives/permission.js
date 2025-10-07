// directives/permission.js
import { usePermissionsStore } from '@/stores/permissionsStore';

export const vPermission = {
  mounted(el, binding) {
    checkPermission(el, binding);
  },
  updated(el, binding) {
    checkPermission(el, binding);
  }
};

function checkPermission(el, binding) {
  const permissionsStore = usePermissionsStore();
  
  // Si pas d'ability, cacher l'élément
  if (!permissionsStore.ability) {
    hideElement(el);
    return;
  }

  let hasPermission = false;

  if (typeof binding.value === 'string') {
    // Format: v-permission="'read:Activite'"
    const [action, subject] = binding.value.split(':');
    hasPermission = permissionsStore.can(action, subject);
  } 
  else if (Array.isArray(binding.value)) {
    // Format: v-permission="['read:Activite', 'update:Activite']"
    // Par défaut, l'utilisateur doit avoir TOUTES les permissions (ET logique)
    hasPermission = binding.value.every(perm => {
      const [action, subject] = perm.split(':');
      return permissionsStore.can(action, subject);
    });

    // Si le modificateur 'any' est utilisé, alors OU logique
    if (binding.modifiers.any) {
      hasPermission = binding.value.some(perm => {
        const [action, subject] = perm.split(':');
        return permissionsStore.can(action, subject);
      });
    }
  }
  else if (typeof binding.value === 'object') {
    // Format: v-permission="{ action: 'read', subject: 'Activite' }"
    hasPermission = permissionsStore.can(binding.value.action, binding.value.subject, binding.value.resource);
  }

  // Gestion de l'affichage
  if (hasPermission) {
    showElement(el);
  } else {
    if (binding.modifiers.hide) {
      // v-permission.hide - cache l'élément
      hideElement(el);
    } else if (binding.modifiers.disable) {
      // v-permission.disable - désactive l'élément
      disableElement(el);
    } else {
      // Comportement par défaut : cacher
      hideElement(el);
    }
  }
}

function hideElement(el) {
  el.style.display = 'none';
}

function showElement(el) {
  el.style.display = '';
}

function disableElement(el) {
  el.disabled = true;
  el.style.opacity = '0.5';
  el.style.pointerEvents = 'none';
  el.title = 'Action non autorisée';
}

// Plugin pour installer la directive globalement
export default {
  install(app) {
    app.directive('permission', vPermission);
  }
};