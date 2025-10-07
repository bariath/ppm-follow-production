<template>
  <div>
    <header class="w-full h-20 bg-white flex flex-row items-center border-b-2 border-gray-200 place-content-between fixed z-50">
      <!-- Bouton hamburger pour mobile -->
      <button
        @click="toggleSidebar"
        class="md:hidden ml-4 p-2 text-gray-600 hover:text-gray-900 focus:outline-none"
        aria-label="Toggle navigation"
      >
        <i class="fas fa-bars text-xl"></i>
      </button>

      <router-link to="/" class="ml-5 md:ml-5">
        <img src="../assets/logo.png" class="h-10 md:h-auto" alt="Logo" />
      </router-link>

      <div class="relative">
        <button
          @click="toggleMenu"
          class="flex items-center gap-3 rounded-full px-4 py-2 mr-6 bg-white hover:bg-gray-100 shadow-sm transition-all duration-300 ease-in-out focus:outline-none"
          aria-label="Menu utilisateur"
        >
          <img 
            :src="avatarSrc" 
            @error="handleAvatarError"
            class="w-8 h-8 rounded-full shadow-md" 
            alt="Avatar utilisateur" 
          />
          <div class="text-left hidden sm:block">
            <p class="text-gray-800 font-semibold text-sm leading-tight">{{ firstName }}</p>
            <p class="text-gray-400 text-xs">Profil</p>
          </div>
          <i class="fas fa-chevron-down text-gray-500 text-sm ml-1"></i>
        </button>

        <transition name="fade-scale">
          <div
            v-if="menuOpen"
            class="absolute right-0 mt-3 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-dropdown"
          >
            <div class="px-6 py-5 bg-gradient-to-r from-indigo-50 via-white to-indigo-50">
              <p class="text-gray-900 font-bold text-md">{{ authStore.userName }}</p>
              <p class="text-gray-500 text-xs mt-1">{{ authStore.userSub }}</p>
            </div>

            <div class="border-t border-gray-100"></div>

            <button
              @click="logout"
              class="flex items-center gap-3 w-full px-6 py-4 text-red-500 hover:bg-red-50 transition-all duration-200 text-sm font-medium"
            >
              <i class="fas fa-sign-out-alt"></i>
              Se déconnecter
            </button>
          </div>
        </transition>
      </div>
    </header>

    <!-- Overlay pour mobile -->
    <div
      v-if="sidebarOpen"
      @click="closeSidebar"
      class="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
    ></div>

    <div class="flex">
      <nav
        :class="[
          'bg-white w-64 fixed left-0 top-20 h-[calc(100%-80px)] shadow-md flex flex-col p-2 transition-transform duration-300 ease-in-out z-50',
          'md:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        ]"
        role="navigation"
        aria-label="Navigation principale"
      >
        <!-- Bouton de fermeture pour mobile -->
        <button
          @click="closeSidebar"
          class="md:hidden self-end mb-4 p-2 text-gray-600 hover:text-gray-900 focus:outline-none"
          aria-label="Fermer navigation"
        >
          <i class="fas fa-times text-xl"></i>
        </button>

        <div class="mt-4 space-y-3">
          <router-link
            v-if="can('read', 'Statistique')"
            to="/"
            @click="closeSidebar"
            class="flex items-center space-x-4 px-5 py-4 text-blue-600 hover:bg-blue-700 hover:text-white rounded-lg transition"
            active-class="bg-blue-700 text-white"
            exact-active-class="bg-blue-700 text-white"
          >
            <i class="fas fa-home w-5"></i>
            <span>Dashboard</span>
          </router-link>
          
          <!-- Sous-menu Gestion -->
          <div v-if="hasAnyPermission(['read:EtapeActivite', 'read:Activite'])">
            <button
              @click="toggleGestion"
              class="flex items-center justify-between w-full px-5 py-4 text-blue-600 hover:bg-blue-700 hover:text-white rounded-lg transition"
            >
              <div class="flex items-center space-x-4">
                <i class="fas fa-briefcase w-5"></i>
                <span>Gestion</span>
              </div>
              <i class="fas fa-chevron-down transition-transform duration-200" :class="{ 'rotate-180': gestionOpen }"></i>
            </button>
            
            <transition name="submenu">
              <div v-if="gestionOpen" class="ml-6 mt-2 space-y-2 border-l-2 border-gray-200 pl-6">
                <router-link
                  v-if="can('read', 'EtapeActivite')"
                  to="/etapeAvancement"
                  @click="closeSidebar"
                  class="flex items-center space-x-4 px-5 py-3 text-blue-600 hover:bg-blue-700 hover:text-white rounded-lg transition text-sm"
                  active-class="bg-blue-700 text-white"
                >
                  <i class="fas fa-chart-line w-4"></i>
                  <span>Suivies</span>
                </router-link>
                <router-link
                  v-if="can('read', 'Activite')"
                  to="/marches-en-retard"
                  @click="closeSidebar"
                  class="flex items-center space-x-4 px-5 py-3 text-blue-600 hover:bg-blue-700 hover:text-white rounded-lg transition text-sm"
                  active-class="bg-blue-700 text-white"
                >
                  <i class="fas fa-business-time w-4"></i>
                  <span>Suivies des étapes</span>
                </router-link>
              </div>
            </transition>
          </div>

          <router-link
            v-if="can('read', 'Statistique')"
            to="/stat"
            @click="closeSidebar"
            class="flex items-center space-x-4 px-5 py-4 text-blue-600 hover:bg-blue-700 hover:text-white rounded-lg transition"
            active-class="bg-blue-700 text-white"
          >
            <i class="fas fa-chart-pie w-5"></i>
            <span>Statistiques</span>
          </router-link>
          
          <router-link
            v-if="can('read', 'Rapport')"
            to="/Rapport"
            @click="closeSidebar"
            class="flex items-center space-x-4 px-5 py-4 text-blue-600 hover:bg-blue-700 hover:text-white rounded-lg transition"
            active-class="bg-blue-700 text-white"
          >
            <i class="fas fa-folder-open w-5"></i>
            <span>Rapport</span>
          </router-link>

          <!-- Sous-menu Paramètres -->
          <div v-if="hasAnyPermission(['read:Activite', 'read:Etape', 'read:SaveMapping', 'read:User'])">
            <button
              @click="toggleParametres"
              class="flex items-center justify-between w-full px-5 py-4 text-blue-600 hover:bg-blue-700 hover:text-white rounded-lg transition"
            >
              <div class="flex items-center space-x-4">
                <i class="fas fa-cogs w-5"></i>
                <span>Paramètres</span>
              </div>
              <i class="fas fa-chevron-down transition-transform duration-200" :class="{ 'rotate-180': parametresOpen }"></i>
            </button>
            
            <transition name="submenu">
              <div v-if="parametresOpen" class="ml-6 mt-2 space-y-2 border-l-2 border-gray-200 pl-6">
                <router-link
                  v-if="can('read', 'Activite')"
                  to="/liste"
                  @click="closeSidebar"
                  class="flex items-center space-x-4 px-5 py-3 text-blue-600 hover:bg-blue-700 hover:text-white rounded-lg transition text-sm"
                  active-class="bg-blue-700 text-white"
                >
                  <i class="fas fa-tasks w-4"></i>
                  <span>Marchés Publics</span>
                </router-link>
                <router-link
                  v-if="can('read', 'Etape')"
                  to="/etape"
                  @click="closeSidebar"
                  class="flex items-center space-x-4 px-5 py-3 text-blue-600 hover:bg-blue-700 hover:text-white rounded-lg transition text-sm"
                  active-class="bg-blue-700 text-white"
                >
                  <i class="fas fa-step-forward w-4"></i>
                  <span>Etapes</span>
                </router-link>
                <router-link
                  v-if="can('read', 'SaveMapping')"
                  to="/mapper"
                  @click="closeSidebar"
                  class="flex items-center space-x-4 px-5 py-3 text-blue-600 hover:bg-blue-700 hover:text-white rounded-lg transition text-sm"
                  active-class="bg-blue-700 text-white"
                >
                  <i class="fas fa-link w-4"></i>
                  <span>Relier les colonnes</span>
                </router-link>
                <router-link
                  v-if="can('read', 'User')"
                  to="/utilisateur"
                  @click="closeSidebar"
                  class="flex items-center space-x-4 px-5 py-3 text-blue-600 hover:bg-blue-700 hover:text-white rounded-lg transition text-sm"
                  active-class="bg-blue-700 text-white"
                >
                  <i class="fas fa-user w-4"></i>
                  <span>Utilisateurs</span>
                </router-link>
                <router-link
                  v-if="can('read', 'Activite')"
                  to="/help"
                  @click="closeSidebar"
                  class="flex items-center space-x-4 px-5 py-3 text-blue-600 hover:bg-blue-700 hover:text-white rounded-lg transition text-sm"
                  active-class="bg-blue-700 text-white"
                >
                  <i class="fas fa-question-circle w-4"></i>
                  <span>En savoir plus</span>
                </router-link>
              </div>
            </transition>
          </div>
          
        </div>
      </nav>

      <div class="ml-0 md:ml-64 flex-1 mt-[80px] p-0 md:p-0"> <!-- Ajustement du mt pour correspondre à la hauteur du header -->
        <router-view></router-view>
      </div>
    </div>
  </div>
</template>

<script>
import { useAuthStore } from '@/stores/authStore';
import { usePermissions } from '@/composables/usePermissions'; // Importation
import avatarImage from '@/assets/avatar-2.jpg';

export default {
  name: "HomeView",
  setup() {
    // Rendre les fonctions de permissions accessibles
    const { can, hasAnyPermission } = usePermissions();
    return { can, hasAnyPermission };
  },
  data() {
    return {
      menuOpen: false,
      sidebarOpen: false,
      parametresOpen: false,
      gestionOpen: false,
      avatarSrc: avatarImage
    };
  },
  computed: {
    authStore() {
      return useAuthStore();
    },
    firstName() {
      return this.authStore.userName ? this.authStore.userName.split(' ')[0] : '';
    }
  },
  mounted() {
    document.addEventListener('click', this.handleClickOutside);
    window.addEventListener('resize', this.handleResize);
  },
  beforeUnmount() {
    document.removeEventListener('click', this.handleClickOutside);
    window.removeEventListener('resize', this.handleResize);
  },
  methods: {
    toggleMenu() { this.menuOpen = !this.menuOpen; },
    toggleSidebar() { this.sidebarOpen = !this.sidebarOpen; },
    toggleParametres() { this.parametresOpen = !this.parametresOpen; },
    toggleGestion() { this.gestionOpen = !this.gestionOpen; },
    closeSidebar() { this.sidebarOpen = false; },
    handleResize() {
      if (window.innerWidth >= 768) { this.sidebarOpen = false; }
    },
    logout() {
      console.log("Déconnexion...");
      this.authStore.clearTokens(); 
      this.$router.push('/login'); 
      this.menuOpen = false; 
      this.sidebarOpen = false;
    },
    handleClickOutside(event) {
      const menuButton = this.$el.querySelector('button[aria-label="Menu utilisateur"]');
      const menuDropdown = this.$el.querySelector('.animate-dropdown');
      
      if (this.menuOpen && !menuButton?.contains(event.target) && !menuDropdown?.contains(event.target)) {
        this.menuOpen = false;
      }
    },
    handleAvatarError() {
      this.avatarSrc = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTYiIGZpbGw9IiNFNUU3RUIiLz4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxMiIgcj0iNSIgZmlsbD0iIzk0QTNCOCIvPgo8cGF0aCBkPSJNMjYgMjZDMjYgMjEuNTgyMiAyMS40MTc4IDE4IDE2IDE4QzEwLjU4MjIgMTggNiAyMS41ODIyIDYgMjZIMjZaIiBmaWxsPSIjOTRBM0I4Ii8+Cjwvc3ZnPgo=';
    }
  },
};
</script>

<style scoped>
@import url("https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css");

.fade-scale-enter-active, .fade-scale-leave-active { transition: all 0.2s ease-in-out; }
.fade-scale-enter-from, .fade-scale-leave-to { opacity: 0; transform: translateY(-10px) scale(0.95); }

/* Animations pour le sous-menu */
.submenu-enter-active, .submenu-leave-active { transition: all 0.3s ease-out; }
.submenu-enter-from, .submenu-leave-to { opacity: 0; max-height: 0; transform: translateY(-10px); }
.submenu-enter-to, .submenu-leave-from { opacity: 1; max-height: 250px; transform: translateY(0); } /* Augmenté max-height */

/* Rotation de la flèche */
.rotate-180 { transform: rotate(180deg); }
</style>
