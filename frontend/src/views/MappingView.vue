<template>
  <div v-if="can('read', 'SaveMapping')" class="max-w-screen-lg mt-2 mx-auto px-4 sm:px-6 py-6 bg-white shadow-md rounded-lg">
    <!-- Notifications Toast -->
    <div class="fixed top-4 right-4 z-50 space-y-2">
      <div 
        v-for="notification in notifications" 
        :key="notification.id"
        :class="[
          'p-4 rounded-lg shadow-lg transform transition-all duration-300 max-w-sm',
          notification.type === 'success' ? 'bg-green-500 text-white' : 
          notification.type === 'error' ? 'bg-red-500 text-white' : 
          notification.type === 'warning' ? 'bg-yellow-500 text-white' : 
          'bg-blue-500 text-white'
        ]"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-2">
            <svg v-if="notification.type === 'success'" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
            <svg v-else-if="notification.type === 'error'" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/></svg>
            <svg v-else-if="notification.type === 'warning'" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>
            <span class="font-medium">{{ notification.message }}</span>
          </div>
          <button @click="removeNotification(notification.id)" class="ml-4 hover:opacity-75"><svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/></svg></button>
        </div>
      </div>
    </div>

    <!-- Header -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
      <h1 class="text-xl sm:text-3xl font-semibold text-gray-800">Relier les colonnes</h1>
      <button v-if="can('create', 'SaveMapping')" @click="triggerFileInput" class="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors">
        Importer un fichier
      </button>
      <input type="file" ref="fileInput" class="hidden" @change="handleFileUpload" />
    </div>

    <!-- Form Section -->
    <div v-if="hasAnyPermission(['create:SaveMapping', 'update:SaveMapping'])" class="space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0">
        <label for="columnSelect" class="w-full sm:w-1/3 text-gray-600 font-medium">Nom dans le fichier Excel :</label>
        <select 
          id="columnSelect" 
          v-model="selectedColumn" 
          class="w-full sm:w-2/3 p-2 border rounded-md focus:ring focus:ring-blue-300 focus:border-blue-500 outline-none"
        >
          <option value="">Sélectionnez une colonne</option>
          <option v-for="(header, index) in headers" :key="index" :value="header">{{ header }}</option>
        </select>
      </div>

      <div class="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0">
        <label for="baseSelect" class="w-full sm:w-1/3 text-gray-600 font-medium">Nom en Base :</label>
        <select 
          id="baseSelect" 
          v-model="selectedBase" 
          class="w-full sm:w-2/3 p-2 border rounded-md focus:ring focus:ring-blue-300 focus:border-blue-500 outline-none"
        >
          <option value="">Sélectionnez une colonne</option>
          <option v-for="headerBase in headerBases" :key="headerBase" :value="headerBase">{{ headerBase }}</option>
        </select>
      </div>

      <div class="flex justify-center pt-4">
        <button 
          v-if="isEditing" 
          @click="updateMapping" 
          :disabled="!can('update', 'SaveMapping')"
          class="w-full sm:w-auto bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded-md transition-colors disabled:opacity-50"
        >
          Modifier l'association
        </button>
        <button 
          v-else 
          @click="addMapping"
          :disabled="!can('create', 'SaveMapping')"
          class="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md transition-colors disabled:opacity-50"
        >
          Ajouter l'association
        </button>
      </div>
    </div>

    <!-- Table Section -->
    <div class="mt-6">
      <!-- Mobile View -->
      <div class="block sm:hidden space-y-4">
        <div 
          v-for="(mappingItem, index) in mappingList" 
          :key="index" 
          class="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
        >
          <div class="space-y-2">
            <div>
              <span class="text-xs font-medium text-gray-500 uppercase">Fichier Excel</span>
              <p class="text-sm text-gray-900">{{ mappingItem.excelColumn }}</p>
            </div>
            <div>
              <span class="text-xs font-medium text-gray-500 uppercase">Base</span>
              <p class="text-sm text-gray-900">{{ mappingItem.databaseColumn.replace('donnéesDeBase.', '') }}</p>
            </div>
            <div v-if="hasAnyPermission(['update:SaveMapping', 'delete:SaveMapping'])" class="flex space-x-2 pt-2">
              <button 
                v-if="can('update', 'SaveMapping')"
                @click="editMapping(index)" 
                class="flex-1 bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-2 rounded-md text-sm transition-colors"
              >
                Modifier
              </button>
              <button 
                v-if="can('delete', 'SaveMapping')"
                @click="deleteMapping(index)" 
                class="flex-1 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-md text-sm transition-colors"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Desktop View -->
      <div class="hidden sm:block overflow-x-auto">
        <table class="w-full text-sm text-left border border-gray-200 rounded-lg">
          <thead class="text-xs bg-gray-50 text-gray-700 uppercase">
            <tr>
              <th class="px-6 py-3">Nom dans le fichier Excel</th>
              <th class="px-6 py-3">Nom en base</th>
              <th v-if="hasAnyPermission(['update:SaveMapping', 'delete:SaveMapping'])" class="px-6 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(mappingItem, index) in mappingList" :key="index" class="bg-white border-b hover:bg-gray-50 transition-colors">
              <td class="px-6 py-4">{{ mappingItem.excelColumn }}</td>
              <td class="px-6 py-4">{{ mappingItem.databaseColumn.replace('donnéesDeBase.', '') }}</td>
              <td v-if="hasAnyPermission(['update:SaveMapping', 'delete:SaveMapping'])" class="px-6 py-4">
                <div class="flex justify-center space-x-2">
                  <button 
                    v-if="can('update', 'SaveMapping')"
                    @click="editMapping(index)" 
                    class="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-2 rounded-md transition-colors"
                  >
                    Modifier
                  </button>
                  <button 
                    v-if="can('delete', 'SaveMapping')"
                    @click="deleteMapping(index)" 
                    class="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-md transition-colors"
                  >
                    Supprimer
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Confirmation Modal -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Confirmer la suppression</h3>
        <p class="text-gray-600 mb-6">Êtes-vous sûr de vouloir supprimer cette association ?</p>
        <div class="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
          <button 
            @click="confirmDelete" 
            class="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition-colors"
          >
            Supprimer
          </button>
          <button 
            @click="cancelDelete" 
            class="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md transition-colors"
          >
            Annuler
          </button>
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
import axios from 'axios';
import * as XLSX from "xlsx";
import { usePermissions } from '@/composables/usePermissions';

export default {
  name: 'MappingView',
  setup() {
    const { can, hasAnyPermission } = usePermissions();
    return { can, hasAnyPermission };
  },
  data() {
    return {
      headers: [],
      headerBases: [],
      selectedColumn: "",
      selectedBase: "",
      mappingList: [],
      isEditing: false,
      editingIndex: null,
      notifications: [],
      showDeleteModal: false,
      itemToDelete: null,
    };
  },
  mounted() {
    if (this.can('read', 'SaveMapping')) {
      this.fetchColumns();
      this.fetchMappings();

      const savedHeaders = localStorage.getItem("excelHeaders");
      if (savedHeaders) {
        this.headers = JSON.parse(savedHeaders);
      }

      const savedMappings = localStorage.getItem("mappings");
      if (savedMappings) {
        this.mappingList = JSON.parse(savedMappings); 
      }
    }
  },
  methods: {
    // Gestion des notifications
    showNotification(message, type = 'info') {
      const id = Date.now() + Math.random();
      this.notifications.push({ id, message, type });
      setTimeout(() => {
        this.removeNotification(id);
      }, 5000);
    },

    removeNotification(id) {
      this.notifications = this.notifications.filter(n => n.id !== id);
    },

    async addMapping() {
      if (!this.can('create', 'SaveMapping')) return;
      if (!this.selectedColumn || !this.selectedBase) {
        this.showNotification("Veuillez sélectionner une colonne Excel et une colonne en base.", "warning");
        return;
      }
      const exists = this.mappingList.some(
        (mapping) =>
          mapping.excelColumn === this.selectedColumn ||
          mapping.databaseColumn === `donnéesDeBase.${this.selectedBase}`
      );
      if (exists) {
        this.showNotification("Cette association existe déjà. Veuillez en sélectionner une autre.", "warning");
        return;
      }
      try {
        const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/mapping/save`, {
          excelColumn: this.selectedColumn,
          databaseColumn: `donnéesDeBase.${this.selectedBase}`,
        });
        this.mappingList.push(response.data);
        this.resetForm();
        this.showNotification("Association ajoutée avec succès!", "success");
      } catch (error) {
        console.error("Erreur lors de l'ajout de l'association :", error);
        this.showNotification("Une erreur s'est produite lors de la sauvegarde.", "error");
      }
    },

    async fetchColumns() {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/mapping/fields`);
        this.headerBases = response.data
          .filter(field => field.startsWith("donnéesDeBase.") && field !== "donnéesDeBase.utilisateursAssociés"
        && field !==  "donnéesDeBase.statutActivite" && field !==  "donnéesDeBase.typeDeMarché" && field !==  "donnéesDeBase.pole" && field !==  "donnéesDeBase.NiveauExécution")
          .map(field => field.replace("donnéesDeBase.", ""));
      } catch (error) {
        console.error("Erreur lors de la récupération des champs :", error);
        this.showNotification("Erreur lors de la récupération des champs.", "error");
      }
    },

    async fetchMappings() {
      try {
        const url = `${import.meta.env.VITE_BACKEND_URL}/api/mapping`;
        const response = await axios.get(url);
        this.mappingList = response.data;
      } catch (error) {
        console.error("Erreur lors de la récupération des mappings :", error.response?.data || error.message);
        this.showNotification("Erreur lors de la récupération des mappings.", "error");
      }
    },

    triggerFileInput() {
      if (!this.can('create', 'SaveMapping')) return;
      this.$refs.fileInput.click();
    },

    handleFileUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: "array" });

    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    if (jsonData.length > 0) {
      // Récupérer les titres des colonnes et leurs numéros de cellules associés
      const headersWithCells = Object.assign(jsonData[0], jsonData[1]).map((title, index) => {
        return `${index + 1} - ${title}`;
      });

      this.headers = headersWithCells;

      // Enregistrer dans localStorage
      localStorage.setItem("excelHeaders", JSON.stringify(this.headers));
    } else {
      this.headers = [];
      localStorage.removeItem("excelHeaders");
    }
  };
  reader.readAsArrayBuffer(file);
},


    async editMapping(index) {
      if (!this.can('update', 'SaveMapping')) return;
      const mappingItem = this.mappingList[index];
      this.selectedColumn = mappingItem.excelColumn;
      this.selectedBase = mappingItem.databaseColumn.replace("donnéesDeBase.", "");
      this.isEditing = true; 
      this.editingIndex = index; 
    },

    async updateMapping() {
      if (!this.can('update', 'SaveMapping')) return;
      if (!this.selectedColumn || !this.selectedBase) {
        this.showNotification("Veuillez sélectionner une colonne Excel et une colonne en base.", "warning");
        return;
      }

      const baseField = `donnéesDeBase.${this.selectedBase}`;
      const exists = this.mappingList.some(
        (mapping, index) =>
          index !== this.editingIndex &&
          (mapping.excelColumn === this.selectedColumn || mapping.databaseColumn === baseField)
      );

      if (exists) {
        this.showNotification("Cette association existe déjà. Veuillez en sélectionner une autre.", "warning");
        return;
      }

      try {
        const mappingId = this.mappingList[this.editingIndex]._id;
        const response = await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/mapping/update/${mappingId}`, {
          excelColumn: this.selectedColumn,
          databaseColumn: baseField,
        });

        this.mappingList.splice(this.editingIndex, 1, response.data);
        this.resetForm();
        this.showNotification("Association modifiée avec succès!", "success");
      } catch (error) {
        console.error("Erreur lors de la mise à jour de l'association :", error);
        this.showNotification("Une erreur s'est produite lors de la mise à jour.", "error");
      }
    },

    resetForm() {
      this.selectedColumn = "";
      this.selectedBase = "";
      this.isEditing = false;
      this.editingIndex = null;
    },

    deleteMapping(index) {
      if (!this.can('delete', 'SaveMapping')) return;
      this.itemToDelete = index;
      this.showDeleteModal = true;
    },

    async confirmDelete() {
      if (!this.can('delete', 'SaveMapping')) return;
      const index = this.itemToDelete;
      const mappingItem = this.mappingList[index];

      try {
        await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/mapping/delete/${mappingItem._id}`);
        this.mappingList.splice(index, 1);
        this.showNotification("L'association a été supprimée avec succès.", "success");
      } catch (error) {
        console.error("Erreur lors de la suppression de l'association :", error);
        this.showNotification("Une erreur s'est produite lors de la suppression.", "error");
      }

      this.cancelDelete();
    },

    cancelDelete() {
      this.showDeleteModal = false;
      this.itemToDelete = null;
    },
  },
};
</script>
