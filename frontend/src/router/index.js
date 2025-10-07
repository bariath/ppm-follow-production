// router/index.js (version mise à jour)
import { createRouter, createWebHistory } from "vue-router";
import ListView from "../views/ListView.vue";
import HomeView from "../views/HomeView.vue";
import EtapeAvancementView from "../views/EtapeAvancementView.vue";
import DashboardView from "../views/DashboardView.vue";
import FormulaireView from "../views/FormulaireView.vue";
import Formulaire2View from "../views/Formulaire2View.vue";
import LoginView from "../views/LoginView.vue";
import RapportView from "../views/RapportView.vue";
import StatActivités from "../views/StatActivités.vue"
import HelpVideos from "../views/HelpVideos.vue";
import CallBackView from "../views/CallBackView.vue";
import MappingView from "../views/MappingView.vue";
import { useAuthStore } from '@/stores/authStore';
import { usePermissionsStore } from '@/stores/permissionsStore';
import ActivityList from "../components/ActivityList.vue";
import utilisateur from "../components/utilisateur.vue";
import EtapeView from "../views/EtapeView.vue";
import UserView from "../views/UserView.vue";
import MarchesEnRetard from '../components/MarchesEnRetard.vue';
import EtapesSemaine from '../components/EtapesSemaine.vue'
import { sessionService } from '@/services/sessionService';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/login",
      name: "login",
      component: LoginView,
    },
    { 
      path: '/oauth/callback',
      name: "callback",
      component: CallBackView 
    },
    {
      path: "/",
      name: "home",
      component: HomeView,
      meta: {
        requiresAuth: true,
      },
      children: [
        {
          name: "liste",
          path: "/liste",
          component: ListView,
          meta: {
            requiresPermission: 'read:Activite'
          }
        },
        {
          name: "activiteDetails",
          path: "/activite/:id",
          component: ActivityList,
          meta: {
            requiresPermission: 'read:Activite'
          }
        },
        {
          name: "etapeAvancement",
          path: "/etapeAvancement",
          component: EtapeAvancementView,
          meta: {
            requiresPermission: 'read:EtapeActivite'
          }
        },
        {
          name: "dashboard",
          path: "",
          component: DashboardView,
          meta: {
            requiresPermission: 'read:Statistique'
          }
        },
        {
          name: "Formulaire",
          path: "/Formulaire",
          component: FormulaireView,
          meta: {
            requiresPermission: 'create:Activite'
          }
        },
        {
          name: "Formulaire2",
          path: "/Formulaire2",
          component: Formulaire2View,
          meta: {
            requiresPermission: 'create:Activite'
          }
        },
        {
          name: "Rapport",
          path: "/Rapport",
          component: RapportView,
          meta: {
            requiresPermission: 'read:Rapport'
          }
        },
        {
          name: "Etape",
          path: "/etape",
          component: EtapeView,
          meta: {
            requiresPermission: 'read:Etape'
          }
        },
        {
          name: "Statistics",
          path: "/stat",
          component: StatActivités,
          meta: {
            requiresPermission: 'read:Statistique'
          }
        },
        {
          name: "HelpVideos",
          path: "/help",
          component: HelpVideos,
          meta: {
            requiresPermission: 'read:Activite' // accès général aux utilisateurs authentifiés ayant au moins lecture
          }
        },
        {
          name: "mapping",
          path: "/mapper",
          component: MappingView,
          meta: {
            requiresPermission: 'read:SaveMapping'
          }
        },
        {
          name: "user",
          path: "/utilisateur",
          component: UserView,
          meta: {
            requiresPermission: 'read:User'
          }
        },
        {
          path: "/activite/:id/utilisateurs",
          name: "modifierUtilisateurs",
          component: utilisateur,
          meta: {
            requiresPermission: 'update:Activite'
          }
        },
        {
          path: '/marches-en-retard',
          name: 'marchesEnRetard',
          component: MarchesEnRetard,
          meta: {
            requiresPermission: 'read:Activite'
          }
        },
        {
          path: '/etapes-semaine',
          name: 'etapesSemaine',
          component: EtapesSemaine,
          meta: {
            requiresPermission: 'read:Etape'
          }
        }
      ],
    },
  ],
});

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  const permissionsStore = usePermissionsStore();

  const publicPages = ['/login', '/oauth/callback'];
  const isPublicPage = publicPages.includes(to.path);

  // Gère les pages publiques comme avant
  if (isPublicPage) {
    if (authStore.isAuthenticated && to.path === '/login') {
      return next('/');
    }
    return next();
  }

  if (!authStore.isAuthenticated) {
    console.log('🤔 Store non authentifié, tentative de validation de session...');
    const sessionCheck = await sessionService.checkSession();

    if (sessionCheck.valid && sessionCheck.user) {
      console.log('✅ Session valide, mise à jour du store...');
      await authStore.setUser({ session: sessionCheck.user });
    } else {
      console.log('❌ Pas de session valide, redirection vers login.');
      authStore.clearTokens();
      return next('/login');
    }
  }

  if (to.meta.requiresPermission) {
    if (!permissionsStore.isLoaded) {
      console.log('🔄 Chargement des permissions...');
      await permissionsStore.fetchPermissions();
    }

    const [action, subject] = to.meta.requiresPermission.split(':');
    
    if (!permissionsStore.can(action, subject)) {
      console.log(`❌ Permission refusée pour ${to.meta.requiresPermission}`);
      return next({
        name: 'dashboard',
        query: { error: 'permission_denied' }
      });
    }
  }

  console.log(`✅ Accès autorisé à ${to.path}`);
  next();
});

export default router;