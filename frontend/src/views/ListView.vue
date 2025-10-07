<template>
  <div v-if="can('read', 'Activite')" class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 sm:p-6 lg:p-8">
    <div class="max-w-7xl mx-auto space-y-6">
      
      <!-- Header avec actions principales -->
      <div class="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
        <div class="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h1 class="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
              Gestion des Marchés
            </h1>
            <p class="text-gray-600 text-sm lg:text-base">
              Gérez vos marchés non associés aux étapes
            </p>
          </div>
          
          <!-- Actions principales -->
          <div class="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <button
              v-if="can('update', 'EtapeActivite')"
              @click="associerEtapesActivites"
              :disabled="isAssociating || activities.length === 0"
              class="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-5 py-2.5 rounded-xl shadow-lg flex items-center gap-2 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              <i class="fa fa-link"></i>
              <span class="hidden sm:inline">Associer à des étapes</span>
              <span class="sm:hidden">Associer</span>
            </button>

            <button
              v-if="can('create', 'Activite')"
              @click="triggerFileInput"
              class="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-5 py-2.5 rounded-xl shadow-lg flex items-center gap-2 transition-all duration-300 transform hover:scale-105"
            >
              <i class="fa fa-file-excel-o"></i>
              <span class="hidden sm:inline">Importer fichier</span>
              <span class="sm:hidden">Importer</span>
            </button>

            <router-link
              v-if="can('create', 'Activite')"
              to="/Formulaire"
              class="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white px-5 py-2.5 rounded-xl shadow-lg flex items-center gap-2 transition-all duration-300 transform hover:scale-105"
            >
              <i class="fas fa-plus"></i>
              <span>Ajouter</span>
            </router-link>
          </div>
        </div>

        <!-- Barre de progression -->
        <div v-if="isAssociating" class="mt-6">
          <div class="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-medium text-blue-700">Association en cours...</span>
              <span class="text-sm text-blue-600">{{ progress }}%</span>
            </div>
            <div class="w-full bg-blue-100 rounded-full h-3 overflow-hidden">
              <div
                class="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500 ease-out"
                :style="{ width: progress + '%' }"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Input caché pour upload -->
      <input
        type="file"
        ref="fileInput"
        class="hidden"
        @change="handleFileUpload"
      />

      <!-- Notifications -->
      <div
        v-if="notification.message"
        :class="[
          'px-6 py-4 rounded-xl shadow-lg text-sm font-medium border-l-4 animate-fade-in-down',
          notification.type === 'success'
            ? 'bg-green-50 text-green-800 border-green-500'
            : 'bg-red-50 text-red-800 border-red-500'
        ]"
      >
        <div class="flex items-center gap-3">
          <i :class="notification.type === 'success' ? 'fa fa-check-circle text-green-600' : 'fa fa-exclamation-triangle text-red-600'"></i>
          {{ notification.message }}
        </div>
      </div>

      <!-- Loading spinner -->
      <div v-if="isLoading" class="flex justify-center items-center h-32">
        <div class="relative">
          <div class="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <div class="absolute inset-0 flex items-center justify-center">
            <div class="w-6 h-6 bg-blue-600 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>

      <!-- Contenu principal -->
      <div class="bg-white shadow-xl rounded-2xl border border-gray-100 overflow-hidden">
        <!-- Header du tableau -->
        <div class="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
          <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 class="text-xl lg:text-2xl font-bold text-gray-900">
              Marchés non associés
              <span class="text-sm font-normal text-gray-500 ml-2">
                ({{ activities.length }} total{{ activities.length > 1 ? 's' : '' }})
              </span>
            </h2>
            
            <!-- Bouton filtre -->
            <div class="relative">
              <button
                @click="toggleFilterPanel"
                class="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-xl shadow-md border border-gray-200 transition-all duration-300"
              >
                <i :class="['fas transition-transform duration-300', showFilterPanel ? 'fa-filter text-blue-600' : 'fa-filter']"></i>
                <span>Filtrer</span>
                <i :class="['fas fa-chevron-down transition-transform duration-300', showFilterPanel ? 'rotate-180' : '']"></i>
              </button>
              
              <!-- Panel de filtres -->
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

        <!-- Tableau responsive -->
        <div class="overflow-x-auto">
          <!-- Version desktop -->
          <div class="max-h-[700px] overflow-y-auto">
            <table class="min-w-full text-sm">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">N° Référence</th>
                  <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mode de passation</th>
                  <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type de marché</th>
                  <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Organe de contrôle</th>
                  <th v-if="hasAnyPermission(['update:Activite', 'delete:Activite'])" class="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-if="activities.length === 0 && !isLoading">
                  <td colspan="6" class="px-6 py-12 text-center text-gray-500">
                    <div class="flex flex-col items-center gap-3">
                      <i class="fa fa-inbox text-4xl text-gray-300"></i>
                      <span class="text-lg">Aucun marché trouvé</span>
                    </div>
                  </td>
                </tr>
                <tr
                  v-for="activity in currentActivities"
                  :key="activity._id"
                  class="hover:bg-gray-50 transition-colors"
                >
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {{ activity.donnéesDeBase?.numRéf ?? '–' }}
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-900">
                    <div class="max-w-xs truncate" :title="activity.donnéesDeBase?.description">
                      {{ activity.donnéesDeBase?.description ?? '–' }}
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ activity.donnéesDeBase?.modeDePassation ?? '–' }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ activity.donnéesDeBase?.typeDeMarché ?? '–' }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ activity.donnéesDeBase?.organeDeControle ?? '–' }}
                  </td>
                  <td v-if="hasAnyPermission(['update:Activite', 'delete:Activite'])" class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div class="flex justify-end gap-2">
                      <button
                        v-if="can('update', 'Activite')"
                        @click="showActivity(activity)"
                        class="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition-all"
                        title="Modifier"
                        :disabled="isAssociating"
                      >
                        <i class="fa fa-pencil"></i>
                      </button>
                      <button
                        v-if="can('delete', 'Activite')"
                        @click="confirmDeleteId = activity._id"
                        class="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-all"
                        :disabled="isAssociating || isDeleting"
                        title="Supprimer"
                      >
                        <i :class="isDeleting && confirmDeleteId === activity._id ? 'fa fa-spinner fa-spin' : 'fa fa-trash'"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Version mobile/tablette (non affichée ici pour la concision, mais elle est dans le code original) -->
        </div>

        <!-- Pagination -->
        <div class="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div class="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div class="text-sm text-gray-700">
              Affichage de {{ activities.length > 0 ? ((currentPage - 1) * itemsPerPage) + 1 : 0 }} à {{ Math.min(currentPage * itemsPerPage, activities.length) }} sur {{ activities.length }} résultats
            </div>
            <div class="flex gap-2">
              <button
                @click="previousPage"
                :disabled="currentPage === 1"
                class="px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <i class="fa fa-chevron-left mr-1"></i>
                Précédent
              </button>
              <button
                @click="nextPage"
                :disabled="currentPage === totalPages"
                class="px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Suivant
                <i class="fa fa-chevron-right ml-1"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de confirmation de suppression -->
    <div
      v-if="confirmDeleteId"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-fade-in-down">
        <div class="p-6">
          <div class="flex items-center gap-4 mb-6">
            <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <i class="fa fa-exclamation-triangle text-red-600 text-xl"></i>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900">Confirmer la suppression</h3>
              <p class="text-gray-600 text-sm">Cette action est irréversible</p>
            </div>
          </div>
          
          <div class="flex justify-end gap-3">
            <button
              class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              @click="confirmDeleteId = null"
            >
              Annuler
            </button>
            <button
              class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
              @click="confirmerSuppression"
              :disabled="isDeleting"
            >
              <i :class="isDeleting ? 'fa fa-spinner fa-spin' : 'fa fa-trash'"></i>
              Supprimer
            </button>
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
import { useRouter } from "vue-router";
import { useAssociationStore } from '@/stores/useAssociationStore';
import { storeToRefs } from 'pinia';
import "font-awesome/css/font-awesome.css";
import { usePermissions } from '@/composables/usePermissions';

export default {
  name: "EtapeAvancementView",
  setup() {
    const assocStore = useAssociationStore();
    const { isAssociating, progress } = storeToRefs(assocStore);
    const router = useRouter();
    const { can, hasAnyPermission } = usePermissions();

    const redirectToUser = () => {
      router.push({ name: 'activiteComplet' });
    };

    return { isAssociating, progress, assocStore, redirectToUser, can, hasAnyPermission };
  },
  data() {
    return {
      etapeEnCours: null,
      showFilterPanel: false,
      confirmDeleteId: null,
      activities: [],
      currentPage: 1,
      itemsPerPage: 10,
      isLoading: false,
      isEditing: false,
      isDeleting: false,
      notification: {
        message: "",
        type: "",
      },
      activiteEnCours: {},
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
    totalPages() {
      return Math.ceil(this.activities.length / this.itemsPerPage);
    },
    currentActivities() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.activities.slice(start, end);
    },
  },
  methods: {
    showActivity(activity) {
      if (!this.can('update', 'Activite')) return;
      const routePath = "/Formulaire"; 
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
    async supprimerActivite(activityId) {
      if (!this.can('delete', 'Activite')) return;
      this.isDeleting = true;
      try {
        await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/deleteActivity/${activityId}`);
        this.notification.message = "Marché supprimé avec succès!";
        this.notification.type = "success";
        await this.filtrerActivités(); 
      } catch (error) {
        this.notification.message = "Erreur lors de la suppression.";
        this.notification.type = "error";
      } finally {
        this.isDeleting = false;
        this.confirmDeleteId = null;
        setTimeout(() => { this.notification.message = ''; }, 5000);
      }
    },
    async confirmerSuppression() {
      if (!this.confirmDeleteId) return;
      await this.supprimerActivite(this.confirmDeleteId);
    },
    previousPage() {
      if (this.currentPage > 1) this.currentPage--;
    },
    nextPage() {
      if (this.currentPage < this.totalPages) this.currentPage++;
    },
    async associerEtapesActivites() {
      if (!this.can('update', 'EtapeActivite')) return;
      this.assocStore.startAssociating();
      const interval = setInterval(() => {
        if (this.assocStore.progress < 80) {
          this.assocStore.setProgress(this.assocStore.progress + 10);
        }
      }, 200);

      try {
        const { data } = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/associerActivitesSansEtapes`);
        this.notification = { message: data.message || 'OK', type: 'success' };
        await this.filtrerActivités();
      } catch (err) {
        this.notification = { message: err.response?.data?.message || 'Erreur', type: 'error' };
      } finally {
        clearInterval(interval);
        this.assocStore.setProgress(100);
        setTimeout(() => { this.assocStore.stopAssociating(); }, 300);
      }
    },
    triggerFileInput() {
      if (!this.can('create', 'Activite')) return;
      this.$refs.fileInput.click();
    },
    async handleFileUpload(event) {
      if (!this.can('create', 'Activite')) return;
      const file = event.target.files[0];
      if (!file) return;

      const formData = new FormData();
      formData.append("excelFile", file);
      this.isLoading = true;

      try {
        const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/importFile`, formData, { headers: { "Content-Type": "multipart/form-data" } });
        this.notification.message = response.data.message || "Fichier importé avec succès !";
        this.notification.type = "success";
        await this.filtrerActivités(); 
      } catch (error) {
        this.notification.message = error.response?.data?.error || "Erreur lors de l'import du fichier.";
        this.notification.type = "error";
      } finally {
        this.isLoading = false;
        setTimeout(() => { this.notification.message = ""; }, 5000);
      }
    },
    toggleFilterPanel() {
      this.showFilterPanel = !this.showFilterPanel;
    },
    resetFilter() {
      this.filterData = { modeDePassation: [], typeDeMarché: [], recherche: "", pole: [] };
      this.applyFilter();
    },
    async applyFilter() {
      this.showFilterPanel = false;
      await this.filtrerActivités();
    },
    async filtrerActivités() {
      if (!this.can('read', 'Activite')) {
        this.isLoading = false;
        this.activities = [];
        return;
      }
      this.isLoading = true;

      try {
        const params = { ...this.filterData };
        Object.keys(params).forEach(key => {
          if (params[key] === "" || (Array.isArray(params[key]) && params[key].length === 0)) {
            delete params[key];
          }
        });

        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/getActivities`, { params });
        this.activities = Array.isArray(response.data) ? response.data : [];
        this.currentPage = 1;
      } catch (error) {
        console.error("❌ Erreur lors de la récupération :", error.response?.data || error.message);
        this.activities = [];
        this.notification = { message: "Erreur lors de la récupération des marchés.", type: "error" };
      } finally {
        this.isLoading = false;
      }
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
/* Styles pour les checkboxes */
.form-checkbox { @apply h-4 w-4 rounded border-gray-300 focus:ring-2 focus:ring-blue-500; }
/* Scrollbar personnalisée */
.overflow-y-auto::-webkit-scrollbar { width: 6px; }
.overflow-y-auto::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 3px; }
.overflow-y-auto::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
.overflow-y-auto::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
/* Animation pour le spinner de chargement */
@keyframes spin { to { transform: rotate(360deg); } }
.animate-spin { animation: spin 1s linear infinite; }
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
.animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
</style>
