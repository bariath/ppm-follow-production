<template>
  <div v-if="can('read', 'Etape')" class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
    <div class="max-w-7xl mx-auto space-y-6">
      <!-- Formulaire d'ajout/modification, visible seulement si on peut créer ou modifier -->
      <AddStep
        v-if="hasAnyPermission(['create:Etape', 'update:Etape'])"
        :etape="etapeEnCours || { NumEtape: '', nom: '', modeDePassation: '', delaiGlobalCCMP: '', delaiGlobalDNCMP: '', statutEtape: '', niveauExecution: ''}"
        :isEditing="isEditing"
        @etape-ajoutee="sauvegarderEtape"
        @etape-modifiee="sauvegarderEtape"
      />

      <div v-if="notification.message"
        :class="[
          'p-3 mb-4 rounded-lg text-sm sm:text-base',
          notification.type === 'success' ? 'bg-green-100 text-green-800 border border-green-300' : 'bg-red-100 text-red-800 border border-red-300'
        ]"
      >
        {{ notification.message }}
      </div>

      <div class="mt-6">
        <h2 class="text-lg sm:text-xl lg:text-2xl font-semibold mb-4 text-gray-800">Liste des étapes par mode de passation</h2>
        
        <!-- Section responsive des contrôles -->
        <div class="flex flex-col sm:flex-row gap-4 mb-4">
          <!-- Sélecteur de mode -->
          <div class="flex-1 min-w-0">
            <label class="block text-sm font-medium text-gray-700 mb-2 sm:hidden">Mode de passation</label>
            <select
              v-model="selectedMode"
              @change="debouncedGetEtapes"
              class="block w-full p-2.5 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="AMI+DPN">AMI+DPN - Avis National à Manifestation d'intérêt</option>
              <option value="AMI+DPI">AMI+DPI - Avis International à Manifestation d'intérêt</option>
              <option value="AON">AON - Appel d'Offres National</option>
              <option value="AOI">AOI - Appel d'Offres International</option>
              <option value="AOR">AOR - Appel d'Offres Restreint</option>
              <option value="DC">DC - Demande de Cotation</option>
              <option value="DRP">DRP - Demande de Renseignement et de prix</option>
              <option value="GREGRE">GREGRE - Entente Directe</option>
            </select>
          </div>

          <!-- Bouton Importer, visible seulement si on peut créer -->
          <div v-if="can('create', 'Etape')" class="flex-shrink-0">
            <input type="file" ref="fileInput" @change="handleFileUpload" class="hidden" />
            <button @click="triggerFileInput"
              class="w-full sm:w-auto bg-blue-500 text-white px-4 py-2.5 rounded-lg hover:bg-blue-600 transition-colors font-medium text-sm flex items-center justify-center gap-2"
            >
              <i class="fa fa-upload"></i>
              <span class="hidden sm:inline">Importer Excel</span>
              <span class="sm:hidden">Importer</span>
            </button>
          </div>
        </div>

        <!-- Conteneur de table responsive -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div class="overflow-x-auto">
            <div class="min-w-full h-[400px] sm:h-[500px] lg:h-[530px] overflow-y-auto">
              <table class="min-w-full text-sm text-gray-700 divide-y divide-gray-200">
                <thead class="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    <th class="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <span class="hidden sm:inline">Numéro</span><span class="sm:hidden">N°</span>
                    </th>
                    <th class="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Étape</th>
                    <th class="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <span class="hidden lg:inline">Délai CCMP</span><span class="lg:hidden">CCMP</span>
                    </th>
                    <th class="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <span class="hidden lg:inline">Délai DNCMP</span><span class="lg:hidden">DNCMP</span>
                    </th>
                    <th class="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Mode</th>
                    <th class="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Statut</th>
                    <th class="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden xl:table-cell">
                      <span class="hidden xl:inline">Niveau d'exécution</span><span class="xl:hidden">Niveau</span>
                    </th>
                    <th v-if="hasAnyPermission(['update:Etape', 'delete:Etape'])" class="px-3 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-if="isLoading">
                    <td colspan="8" class="px-6 py-8 text-center text-gray-500">
                      <i class="fa fa-spinner fa-spin text-lg mb-2"></i><div>Chargement...</div>
                    </td>
                  </tr>
                  <tr v-else-if="paginatedEtapes.length === 0">
                    <td colspan="8" class="px-6 py-8 text-center text-gray-500">
                      <i class="fa fa-search text-2xl mb-2 text-gray-400"></i><div>Aucun résultat trouvé pour ce mode de passation.</div>
                    </td>
                  </tr>
                  <tr v-for="etape in paginatedEtapes" :key="etape._id" class="hover:bg-gray-50 transition-colors">
                    <td class="px-3 sm:px-6 py-4 whitespace-nowrap font-medium text-gray-900">{{ etape.NumEtape }}</td>
                    <td class="px-3 sm:px-6 py-4"><div class="text-sm font-medium text-gray-900 truncate max-w-xs" :title="etape.nom">{{ etape.nom }}</div></td>
                    <td class="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ etape.delaiGlobalCCMP }}</td>
                    <td class="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ etape.delaiGlobalDNCMP }}</td>
                    <td class="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell"><span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">{{ etape.modeDePassation }}</span></td>
                    <td class="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden lg:table-cell"><span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">{{ etape.statutEtape }}</span></td>
                    <td class="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden xl:table-cell">{{ etape.niveauExecution }}</td>
                    <td v-if="hasAnyPermission(['update:Etape', 'delete:Etape'])" class="px-3 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div class="flex justify-end space-x-2">
                        <button v-if="can('update', 'Etape')" @click="modifierEtape(etape)" 
                          class="text-gray-400 hover:text-blue-600 transition-colors p-1 rounded-md hover:bg-blue-50" title="Modifier">
                          <i class="fa fa-pencil text-sm"></i>
                        </button>
                        <button v-if="can('delete', 'Etape')" @click="supprimerEtape(etape)" 
                          class="text-gray-400 hover:text-red-600 transition-colors p-1 rounded-md hover:bg-red-50" :disabled="isDeleting" title="Supprimer">
                          <i class="fa fa-trash text-sm"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
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
import { debounce } from 'lodash';
import AddStep from "@/components/AddStep.vue";
import { usePermissions } from '@/composables/usePermissions'; // Importation

export default {
  name: "EtapeView",
  components: {
    AddStep,
  },
  setup() {
    // Rendre les fonctions de permissions accessibles
    const { can, hasAnyPermission } = usePermissions();
    return { can, hasAnyPermission };
  },
  data() {
    return {
      etapes: [],
      selectedMode: 'AON',
      isLoading: false,
      isEditing: false,
      isDeleting: false,
      etapeEnCours: null,
      notification: { message: "", type: "" },
      debouncedGetEtapes: debounce(this.getEtapes, 300), // Délai réduit pour réactivité
    };
  },
  computed: {
    paginatedEtapes() {
      return this.etapes.sort((a, b) => a.NumEtape - b.NumEtape);
    },
  },
  methods: {
    async getEtapes() {
      if (!this.can('read', 'Etape')) return; // Contrôle d'accès
      if (!this.selectedMode) {
        this.etapes = [];
        return;
      }
      this.isLoading = true;
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/step/getSteps`,
          { params: { modeDePassation: this.selectedMode } }
        );
        this.etapes = response.data;
      } catch (error) {
        console.error("Erreur lors de la récupération des étapes :", error);
        this.etapes = [];
      } finally {
        this.isLoading = false;
      }
    },

    modifierEtape(etape) {
      if (!this.can('update', 'Etape')) return; // Contrôle d'accès
      this.etapeEnCours = { ...etape };
      this.isEditing = true;
    },

    sauvegarderEtape(etape) {
      // Le composant AddStep est déjà caché, mais double sécurité
      if (!this.hasAnyPermission(['create:Etape', 'update:Etape'])) return;

      if (this.isEditing) {
        const index = this.etapes.findIndex((e) => e._id === etape._id);
        if (index !== -1) {
          this.etapes.splice(index, 1, etape);
          this.notification = { message: "Étape modifiée avec succès", type: "success" };
        }
      } else {
        this.etapes.push(etape);
        this.notification = { message: "Étape ajoutée avec succès", type: "success" };
      }
      this.etapeEnCours = null;
      this.isEditing = false;
      setTimeout(() => this.notification.message = "", 3000);
    },

    async supprimerEtape(etape) {
      if (!this.can('delete', 'Etape')) return; // Contrôle d'accès
      this.isDeleting = true;
      try {
        if (!confirm("Êtes-vous sûr de vouloir supprimer cette étape ?")) return;
        await axios.delete(
          `${import.meta.env.VITE_BACKEND_URL}/api/step/deleteStep/${etape._id}`
        );
        this.etapes = this.etapes.filter(e => e._id !== etape._id);
        this.notification = { message: "Étape supprimée avec succès", type: "success" };
      } catch (error) {
        console.error("Erreur :", error);
        this.notification = { message: "Erreur lors de la suppression de l'étape", type: "error" };
      } finally {
        this.isDeleting = false;
        setTimeout(() => this.notification.message = "", 3000);
      }
    },

    triggerFileInput() {
      if (!this.can('create', 'Etape')) return; // Contrôle d'accès
      this.$refs.fileInput.click();
    },

    async handleFileUpload(event) {
      if (!this.can('create', 'Etape')) return; // Contrôle d'accès
      const file = event.target.files[0];
      if (file) {
        const validTypes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
        if (!validTypes.includes(file.type)) {
          this.notification = { message: "Le fichier doit être un fichier Excel.", type: "error" };
          return;
        }

        const formData = new FormData();
        formData.append("excelFile", file);

        try {
          this.isLoading = true; // Afficher un loader pendant l'upload
          await axios.post(
            `${import.meta.env.VITE_BACKEND_URL}/api/import`,
            formData,
            { headers: { "Content-Type": "multipart/form-data" } }
          );
          this.notification = { message: "Fichier importé avec succès !", type: "success" };
          await this.getEtapes();
          this.$refs.fileInput.value = "";
        } catch (error) {
          console.error("Erreur lors de l'import du fichier :", error);
          this.notification = { message: "Erreur lors de l'importation", type: "error" };
        } finally {
           this.isLoading = false;
           setTimeout(() => this.notification.message = "", 3000);
        }
      }
    },
  },
  async mounted() {
    await this.getEtapes();
  },
  watch: {
    selectedMode() {
      this.debouncedGetEtapes();
    },
  },
};
</script>
