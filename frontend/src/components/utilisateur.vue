<template>
  <div v-if="can('update', 'Activite')">
    <!-- MODALE DE CONFIRMATION -->
    <div v-if="showConfirmModal" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div class="bg-white rounded-lg p-6 shadow-lg w-full max-w-md text-center">
        <h2 class="text-lg font-semibold text-gray-800 mb-4">Confirmer la suppression</h2>
        <p class="text-gray-600 mb-6">Êtes-vous sûr de vouloir supprimer cette association ?</p>
        <div class="flex justify-center space-x-4">
          <button @click="deleteUser" class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">Supprimer</button>
          <button @click="cancelDelete" class="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400">Annuler</button>
        </div>
      </div>
    </div>

    <div class="max-w-screen-lg mx-auto px-6 py-6 bg-white shadow-md rounded-lg">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-semibold text-gray-800">Associer un utilisateur à un marché</h1>
      </div>

      <div class="space-y-4">
        <div class="flex items-center">
          <label for="baseSelect" class="w-1/3 text-gray-600 font-medium">Liste des utilisateurs :</label>
          <select id="baseSelect" v-model="selectedUser" class="w-2/3 p-2 border rounded-md focus:ring focus:ring-blue-300">
            <option disabled value="" class="text-gray-400 font-normal">-- Sélectionnez un utilisateur --</option>
            <option
              v-for="utilisateur in utilisateurs"
              :key="utilisateur._id"
              :value="utilisateur"
            >
              {{ utilisateur.nom }} {{ utilisateur.prenom }} — {{ utilisateur.mail }}
            </option>
          </select>
        </div>

        <div class="flex justify-center">
          <button @click="addUser" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md">
            Ajouter l'association
          </button>
        </div>
      </div>

      <div class="mt-6 overflow-x-auto">
        <table class="w-full text-sm text-left border border-gray-200 rounded-lg">
          <thead class="text-xs bg-gray-50 text-gray-700 uppercase">
            <tr>
              <th class="px-6 py-3 text-center">Nom</th>
              <th class="px-6 py-3 text-center">Prénom</th>
              <th class="px-6 py-3 text-center">Email</th>
              <th v-if="can('update', 'Activite')" class="px-6 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(userItem, index) in userList" :key="index" class="bg-white border-b hover:bg-gray-100">
              <td class="px-6 py-4 text-center">{{ userItem.nom }}</td>
              <td class="px-6 py-4 text-center">{{ userItem.prenom }}</td>
              <td class="px-6 py-4 text-center">{{ userItem.mail }}</td>
              <td v-if="can('update', 'Activite')" class="px-6 py-4 flex justify-center space-x-2">
                <button @click="confirmDelete(index)" class="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-md">Supprimer</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <!-- Message pour les utilisateurs sans la permission de base -->
  <div v-else class="flex-1 flex items-center justify-center min-h-screen">
    <div class="text-center p-8">
      <i class="fas fa-lock text-5xl text-gray-300 mb-4"></i>
      <h2 class="text-2xl font-semibold text-gray-700">Accès Restreint</h2>
      <p class="text-gray-500 mt-2">Vous n'avez pas les permissions nécessaires pour gérer les utilisateurs d'un marché.</p>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { usePermissions } from '@/composables/usePermissions';

export default {
  name: 'UtilisateurAssociation',
  setup() {
    const { can } = usePermissions();
    return { can };
  },
  data() {
    return {
      visible: false,
      utilisateurs: [],
      selectedUser: "",
      userList: [],
      activityId: null,
      message: "",
      type: "success",
      showConfirmModal: false,
      userToDeleteIndex: null,
    };
  },
  computed: {
    typeClass() {
      return this.type === 'success'
        ? 'border-green-500 bg-green-100'
        : 'border-red-500 bg-red-100';
    },
  },
  mounted() {
    // On ne charge les données que si l'utilisateur a le droit de voir la page
    if (this.can('update', 'Activite')) {
      this.activityId = this.$route.params.id;
      this.fetchUsers();
      this.fetchColumns();
    }
  },
  methods: {
    showMessage(msg, type = "success") {
      this.message = msg;
      this.type = type;
      this.visible = true;
      setTimeout(() => {
        this.visible = false;
      }, this.duration || 3000);
    },

    async addUser() {
      if (!this.can('update', 'Activite')) return;
      if (!this.selectedUser) {
        this.showMessage("Veuillez sélectionner un utilisateur.", "error");
        return;
      }
      const exists = this.userList.some(user => user._id === this.selectedUser._id);
      if (exists) {
        this.showMessage("Cette association existe déjà.", "error");
        return;
      }
      try {
        await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/associerUtilisateurActivite`,
          {
            idActivite: this.activityId,
            idUtilisateur: this.selectedUser._id, // Envoyer juste l'ID
          }
        );
        this.selectedUser = "";
        await this.fetchUsers();
        this.showMessage("Utilisateur associé avec succès.");
      } catch (error) {
        console.error("Erreur lors de l'ajout :", error);
        this.showMessage("Erreur lors de la sauvegarde.", "error");
      }
    },

    async fetchColumns() {
      // Pour lister tous les utilisateurs, on a besoin du droit 'read:User'
      if (!this.can('read', 'User')) return;
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/listerUtilisateurs`);
        this.utilisateurs = response.data;
      } catch (error) {
        console.error("Erreur lors de la récupération des champs :", error);
      }
    },

    async fetchUsers() {
      if (!this.activityId) return;
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/utilisateursAssocies/${this.activityId}`);
        this.userList = response.data.utilisateurs;
      } catch (error) {
        console.error("Erreur lors de la récupération des utilisateurs :", error);
      }
    },

    confirmDelete(index) {
      if (!this.can('update', 'Activite')) return;
      this.userToDeleteIndex = index;
      this.showConfirmModal = true;
    },

    async deleteUser() {
      if (!this.can('update', 'Activite')) return;
      const index = this.userToDeleteIndex;
      const userItem = this.userList[index];
      this.showConfirmModal = false;

      try {
        const params = {
          idActivite: this.activityId,
          idUtilisateur: userItem._id,
        };
        await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/deleteUser`, { data: params });
        await this.fetchUsers();
        this.showMessage("L'association a été supprimée.");
      } catch (error) {
        console.error("Erreur suppression :", error);
        this.showMessage("Erreur lors de la suppression.", "error");
      }
    },

    cancelDelete() {
      this.showConfirmModal = false;
      this.userToDeleteIndex = null;
    },

    resetForm() {
      this.selectedUser = "";
    }
  },
};
</script>
