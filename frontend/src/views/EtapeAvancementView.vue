<template>
  <div v-if="can('read', 'Activite')" class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
    <div class="max-w-7xl mx-auto space-y-6">
      <!-- Header avec titre et bouton filtrer -->
      <div class="bg-white rounded-2xl shadow-lg p-6">
        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <h1 class="text-2xl lg:text-2xl font-bold text-gray-800 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Liste des marchés 
          </h1>

          <div class="relative">
            <button
              @click="toggleFilterPanel"
              class="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-2xl shadow-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 w-full lg:w-auto justify-center"
            >
              <i :class="['fas', showFilterPanel ? 'fa-chevron-up rotate-180' : 'fa-chevron-down', 'transition-transform duration-300']" />
              <span class="font-medium">Filtrer</span>
            </button>
           
            <!-- Panel de filtrage -->
            <div
              v-if="showFilterPanel"
              class="absolute right-0 mt-2 w-full lg:w-96 bg-white border border-gray-200 shadow-2xl rounded-2xl p-6 z-50 animate-fade-in-down"
            >
              <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg font-semibold text-gray-800">Filtres</h3>
                <button
                  @click="showFilterPanel = false"
                  class="text-gray-400 hover:text-red-500 transition-colors duration-200 p-2 rounded-full hover:bg-red-50"
                  title="Fermer"
                >
                  <i class="fa-solid fa-xmark text-xl"></i>
                </button>
              </div>

              <div class="space-y-6">
                <!-- Numéro de référence -->
                <div>
                  <label class="block text-gray-700 font-medium mb-2">Numéro de Référence ou Description :</label>
                  <input
                    v-model="filterData.recherche"
                    type="text"
                    placeholder="Rechercher par N° Réf ou description"
                    class="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    @keyup.enter="applyFilter"
                  />
                </div>

                 <!-- Mode de passation -->
                <div>
                  <label class="block text-gray-700 font-medium mb-2">Mode de passation :</label>
                  <div class="max-h-32 overflow-y-auto space-y-2 bg-gray-50 rounded-lg p-3">
                     <div
                      v-for="mode in modes"
                      :key="mode"
                      class="flex items-center gap-3 text-sm"
                    >
                      <input
                        type="checkbox"
                        v-model="filterData.modeDePassation"
                        :value="mode"
                        class="form-checkbox text-indigo-600 rounded-md"
                      />
                      <span>{{ mode }}</span>
                    </div>
                  </div>
                </div>

                 <!-- Pôles -->
                  <div>
                    <label class="block text-gray-700 font-medium mb-2">Pôles :</label>
                    <div class="max-h-32 overflow-y-auto space-y-2 bg-gray-50 rounded-lg p-3">
                      <div
                        v-for="poleItem in poles"
                        :key="poleItem"
                        class="flex items-center gap-3 text-sm"
                      >
                        <input
                          type="checkbox"
                          v-model="filterData.pole"
                          :value="poleItem"
                          class="form-checkbox text-indigo-600 rounded-md"
                        />
                        <span>{{ poleItem }}</span>
                      </div>
                    </div>
                  </div>

                <!-- Type de marché -->
                <div>
                  <label class="block text-gray-700 font-medium mb-2">Type de marché :</label>
                  <div class="space-y-2 bg-gray-50 rounded-lg p-3">
                    <label v-for="marche in marches" :key="marche" class="flex items-center gap-3 cursor-pointer hover:bg-white rounded-lg p-2 transition-colors">
                      <input
                        type="checkbox"
                        v-model="filterData.typeDeMarché"
                        :value="marche"
                        class="form-checkbox h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                        @keyup.enter="applyFilter" 
                      />
                      <span class="text-sm text-gray-700">{{ marche }}</span>
                    </label>
                  </div>
                </div>

                <!-- Boutons d'action -->
                <div class="flex flex-col sm:flex-row gap-3 pt-3">
                  <button 
                    @click="resetFilter" 
                    class="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors duration-200 font-medium"
                  >
                    Réinitialiser
                  </button>
                  <button 
                    @click="applyFilter" 
                    class="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium"
                  >
                    Appliquer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Contenu principal -->
      <div class="bg-white shadow-xl rounded-2xl overflow-hidden">
        <!-- Version desktop - Tableau -->
        <div class="hidden lg:block">
          <div class="h-[700px] overflow-auto">
            <!-- Loading -->
            <div v-if="isLoading" class="flex justify-center items-center h-full">
              <div class="flex items-center gap-3">
                <svg class="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 000 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z"/>
                </svg>
                <span class="text-gray-600 font-medium">Chargement...</span>
              </div>
            </div>

            <!-- Aucun marché trouvé -->
            <div v-else-if="!currentActivities.length" class="text-center text-gray-500 py-20">
              <i class="fas fa-inbox text-6xl text-gray-300 mb-4"></i>
              <p class="text-xl font-medium">Aucun marché trouvé</p>
              <p class="text-gray-400 mt-2">Essayez de modifier vos filtres</p>
            </div>

            <!-- Tableau -->
            <table v-else class="w-full text-sm text-gray-700">
              <thead class="text-xs uppercase bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 sticky top-0">
                <tr>
                  <th class="px-6 py-4 font-semibold">N° Référence</th>
                  <th class="px-6 py-4 font-semibold">Description</th>
                  <th class="px-6 py-4 text-left  font-semibold">Mode de passation</th>
                  <th class="px-6 py-4 font-semibold">Type de marché</th>
                  <th class="px-6 py-4 font-semibold">Pôle</th>
                  <th v-if="hasAnyPermission(['update:Activite', 'read:Activite'])" class="px-6 py-4 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="activity in currentActivities"
                  :key="activity._id"
                  class="border-b border-gray-100 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200"
                >
                  <td class="px-6 py-4">
                    <span class="font-semibold text-blue-600">{{ activity.donnéesDeBase.numRéf }}</span>
                  </td>
                  <td class="px-6 py-4">
                    <span class="text-gray-800">{{ activity.donnéesDeBase.description }}</span>
                  </td>
                  <td class="px-6 py-4">
                    <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {{ activity.donnéesDeBase.modeDePassation }}
                    </span>
                  </td>
                  <td class="px-6 py-4">
                    <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {{ activity.donnéesDeBase.typeDeMarché }}
                    </span>
                  </td>
                  <td class="px-6 py-4">
                    <span class="text-gray-700">{{ activity.donnéesDeBase.pole }}</span>
                  </td>
                  <td v-if="hasAnyPermission(['update:Activite', 'read:Activite'])" class="px-6 py-4">
                    <div class="flex items-center justify-end space-x-3">
                      <button
                        v-if="can('update', 'Activite')"
                        @click="showActivity(activity)"
                        class="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all duration-200"
                        title="Modifier"
                      >
                        <i class="fa fa-pencil text-lg"></i>
                      </button>
                      <button
                        v-if="can('read', 'Activite')"
                        @click="redirectToActivity(activity._id)"
                        class="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-full transition-all duration-200"
                        title="Voir les détails"
                      >
                        <i class="fa fa-eye"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Version mobile - Cards -->
        <div class="lg:hidden">
          <div class="h-[500px] overflow-auto p-4">
            <!-- Loading mobile -->
            <div v-if="isLoading" class="flex justify-center items-center h-full">
              <div class="flex flex-col items-center gap-3">
                <svg class="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 000 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z"/>
                </svg>
                <span class="text-gray-600 font-medium">Chargement...</span>
              </div>
            </div>

            <!-- Aucun marché trouvé mobile -->
            <div v-else-if="!currentActivities.length" class="text-center text-gray-500 py-20">
              <i class="fas fa-inbox text-6xl text-gray-300 mb-4"></i>
              <p class="text-xl font-medium">Aucun marché trouvé</p>
              <p class="text-gray-400 mt-2">Essayez de modifier vos filtres</p>
            </div>

            <!-- Cards mobile -->
            <div v-else class="space-y-4">
              <div
                v-for="activity in currentActivities"
                :key="activity._id"
                class="bg-gradient-to-r from-white to-gray-50 rounded-xl shadow-md border border-gray-200 p-4 hover:shadow-lg transition-all duration-200"
              >
                <div class="flex justify-between items-start mb-3">
                  <div class="flex-1">
                   <h3
                  @click="redirectToActivity(activity._id)"
                  class="font-semibold text-blue-600 text-lg mb-1 cursor-pointer hover:underline hover:text-blue-800 transition"
                  title="Voir les détails de l'activité"
                >
                  {{ activity.donnéesDeBase.numRéf }}
                </h3>

                    <p class="text-gray-800 text-sm line-clamp-2">
                      {{ activity.donnéesDeBase.description }}
                    </p>
                  </div>
                  <div v-if="hasAnyPermission(['update:Activite', 'read:Activite'])" class="flex space-x-2 ml-4">
                    <button
                      v-if="can('update', 'Activite')"
                      @click="showActivity(activity)"
                      class="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all duration-200"
                      title="Modifier"
                    >
                      <i class="fa fa-pencil"></i>
                    </button>
                    <button
                      v-if="can('read', 'Activite')"
                      @click="redirectToActivity(activity._id)"
                      class="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-full transition-all duration-200"
                      title="Voir les détails"
                    >
                      <i class="fa fa-plus-circle"></i>
                    </button>
                  </div>
                </div>
                
                <div class="space-y-2">
                  <div class="flex flex-wrap gap-2">
                    <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {{ activity.donnéesDeBase.modeDePassation }}
                    </span>
                    <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {{ activity.donnéesDeBase.typeDeMarché }}
                    </span>
                  </div>
                  <div class="text-sm text-gray-600">
                    <span class="font-medium">Pôle:</span> {{ activity.donnéesDeBase.pole }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div class="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div class="text-sm text-gray-600">
              <span class="font-medium">Total: {{ activities.length }}</span> marchés
            </div>
            
            <div class="flex items-center gap-2">
              <button
                @click="previousPage"
                :disabled="currentPage === 1"
                class="px-4 py-2 rounded-xl text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <i class="fas fa-chevron-left"></i>
                <span class="hidden sm:inline">Précédente</span>
              </button>
              
              <div class="flex items-center gap-2 mx-4">
                <span class="text-sm text-gray-600">
                  Page {{ currentPage }} sur {{ totalPages }}
                </span>
              </div>
              
              <button
                @click="nextPage"
                :disabled="currentPage >= totalPages"
                class="px-4 py-2 rounded-xl text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <span class="hidden sm:inline">Suivante</span>
                <i class="fas fa-chevron-right"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal de confirmation de suppression (pas de permissions nécessaires, la logique est déjà sur le bouton qui l'appelle) -->
      <div
        v-if="confirmDeleteId"
        class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      >
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
          <div class="bg-gradient-to-r from-red-500 to-red-600 p-6 text-white">
            <h3 class="text-lg font-semibold flex items-center gap-2">
              <i class="fas fa-exclamation-triangle"></i>
              Confirmer la suppression
            </h3>
          </div>
          <div class="p-6 space-y-4">
            <p class="text-gray-700">Êtes-vous sûr de vouloir supprimer ce marché ? Cette action est irréversible.</p>
            <div class="flex flex-col sm:flex-row gap-3">
              <button
                class="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors duration-200 font-medium"
                @click="confirmDeleteId = null"
              >
                Annuler
              </button>
              <button
                class="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-200 font-medium disabled:opacity-50"
                @click="confirmerSuppression"
                :disabled="isDeleting"
              >
                <span v-if="isDeleting">Suppression...</span>
                <span v-else>Supprimer</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  
  <!-- Message pour les utilisateurs sans la permission de base -->
  <div v-else class="flex-1 flex items-center justify-center min-h-screen">
    <div class="text-center p-8">
      <i class="fas fa-lock text-5xl text-gray-300 mb-4"></i>
      <h2 class="text-2xl font-semibold text-gray-700">Accès Restreint</h2>
      <p class="text-gray-500 mt-2">Vous n'avez pas les permissions nécessaires pour consulter cette page.</p>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import "font-awesome/css/font-awesome.css";
import { useRouter } from "vue-router";
import { usePermissions } from '@/composables/usePermissions'; // Importation

export default {
  name: "ListView",
  setup() {
    const router = useRouter();
    const { can, hasAnyPermission } = usePermissions(); // Utilisation

    const redirectToActivity = (activityId) => {
      // On peut ajouter une vérification ici par sécurité, bien que le bouton soit déjà protégé
      if (can('read', 'Activite')) {
        router.push({ name: "activiteDetails", params: { id: activityId } });
      }
    };
    
    // Rendre les fonctions accessibles au template
    return { redirectToActivity, can, hasAnyPermission };
  },
  data() {
    return {
      etapeEnCours: null,
      confirmDeleteId: null,
      isLoading: false,
      isEditing: false,
      isDeleting: false,
      showFilterPanel: false,
      activities: [],
      itemsPerPage: 10,
      currentPage: 1,
      currentActivity: {},
       filterData: {
        modeDePassation: [],
        typeDeMarché: [],
        recherche: "",
        pole: [],
      },
     modes: ["AMI+DPN", "AMI+DPI", "AON", "AOI", "AOR", "DC", "DRP", "GREGRE"],
      marches: ["Fournitures", "Travaux", "Services", "Prestation Intellectuelle"],
      poles: ["CASE", "CCMEN", "DAF", "DEP", "DPMO", "DSA", "IN", "SN"],
    };
  },
  computed: {
    totalActivities() {
      return this.activities.length;
    },
    totalPages() {
      return Math.ceil(this.totalActivities / this.itemsPerPage);
    },
    currentActivities() { 
      const startIndex = (this.currentPage - 1) * this.itemsPerPage;
      const endIndex = startIndex + this.itemsPerPage;
      return this.activities.slice(startIndex, endIndex);
    },
  },
  methods: {
    showActivity(activity) {
      if (!this.can('update', 'Activite')) return; // Contrôle d'accès

      const routePath = "/Formulaire2"; 
      this.activiteEnCours = { ...activity };
      this.isEditing = true;
      this.$router.push({
        path: routePath,
        query: {
          activityId: activity._id,
          isEditing: this.isEditing,
        },
      });
    },
    nextPage() {
      if (this.currentPage < this.totalPages) this.currentPage++;
    },
    previousPage() {
      if (this.currentPage > 1) this.currentPage--;
    },
    toggleFilterPanel() {
      this.showFilterPanel = !this.showFilterPanel;
    },
    resetFilter() {
      this.filterData = {
        modeDePassation: [],
        typeDeMarché: [],
        recherche: "",
        pole: [],
      };
      this.applyFilter(); // Relancer le filtre après réinitialisation
    },
    async applyFilter() {
      this.showFilterPanel = false;
      await this.filtrerActivités();
    },
    async filtrerActivités() {
      if (!this.can('read', 'Activite')) { // Contrôle d'accès
        this.isLoading = false;
        return;
      }
      this.isLoading = true;

      try {
        const params = {
          modeDePassation: this.filterData.modeDePassation,
          typeDeMarché: this.filterData.typeDeMarché,
          recherche: this.filterData.recherche,
          pole: this.filterData.pole
        };

        Object.keys(params).forEach(key => {
          if (
            params[key] === "" ||
            (Array.isArray(params[key]) && params[key].length === 0)
          ) {
            delete params[key];
          }
        });

        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/getActivitesAvecEtapes`, {
          params
        });
        this.activities = Array.isArray(response.data) ? response.data : [];
        this.currentPage = 1;
      } catch (error) {
        console.error("❌ Erreur lors de la récupération :", error.response?.data || error.message);
        this.activities = [];
      } finally {
        this.isLoading = false;
      }
    },
    async confirmerSuppression() {
      // NOTE: Le bouton qui appelle cette méthode devrait être protégé par v-if="can('delete', 'Activite')"
      // Par sécurité, on peut rajouter un check ici aussi.
      if (!this.can('delete', 'Activite')) return;

      // Logique de suppression à implémenter
      this.isDeleting = true;
      console.log(`Suppression de l'activité ${this.confirmDeleteId}`);
      // await axios.delete(...)
      this.isDeleting = false;
      this.confirmDeleteId = null;
      await this.filtrerActivités(); // Recharger la liste
    }
  },
  async mounted() {
    await this.filtrerActivités();
  },
};
</script>

<style scoped>
@keyframes fade-in-down {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in-down { animation: fade-in-down 0.3s ease-out; }
.line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
/* Styles pour les checkboxes (simplifié) */
.form-checkbox { appearance: none; background-color: #fff; margin: 0; font: inherit; width: 1rem; height: 1rem; border: 2px solid #d1d5db; border-radius: 0.25rem; transform: translateY(-0.075em); display: grid; place-content: center; }
.form-checkbox:checked { background-color: #2563eb; border-color: #2563eb; }
.form-checkbox:checked::before { content: "✓"; color: white; font-size: 0.75rem; font-weight: bold; }
/* Scrollbar personnalisée */
::-webkit-scrollbar { width: 8px; }
::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 4px; }
::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
</style>
