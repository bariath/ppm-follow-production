<template>
  <div v-if="can('read', 'User')" class="w-full py-4 px-2 sm:px-4 lg:px-6 mt-4 max-w-7xl mx-auto">
    <User
      v-if="hasAnyPermission(['create:User', 'update:User'])"
      :user="userEnCours || { nom: '', prenom: '', mail: '', role: ''}"
      :isEditing="isEditing"
      @user-ajoutee="sauvegarderUser"
      @user-modifiee="sauvegarderUser"
    />
  
    <div v-if="notification.message"
      :class="[
        'p-2 mb-4 rounded',
        notification.type === 'success' ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
      ]"
    >
      {{ notification.message }}
    </div>
  
    <div class="mt-6">
  
      <div class="w-full h-[530px] overflow-auto bg-gray-50 rounded-lg px-4 shadow-inner mt-4">
        <table class="w-full text-sm text-left border border-gray-200 text-gray-700 rounded-md">
          <thead class="text-xs uppercase bg-gray-200 text-gray-700">
            <tr>
              <th class="px-6 py-3 text-center">Nom</th>
              <th class="px-6 py-3 text-center">Prenom</th>
              <th class="px-6 py-3 text-center">Email</th>
              <th class="px-6 py-3 text-center">Rôle</th>
              <th v-if="hasAnyPermission(['update:User', 'delete:User'])" class="px-6 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="isLoading">
              <td :colspan="hasAnyPermission(['update:User', 'delete:User']) ? 5 : 4" class="px-6 py-4 text-center text-gray-600">Chargement...</td>
            </tr>
            <tr v-for="user in paginatedUsers" :key="user._id" class="bg-white border-b hover:bg-gray-50">
              <td class="px-6 py-4 text-center">{{ user.nom }}</td>
              <td class="px-6 py-4 text-center">{{ user.prenom }}</td>
              <td class="px-6 py-4 text-center">{{ user.mail }}</td>
              <td class="px-6 py-4 text-center">{{ user.role }}</td>
              <td v-if="hasAnyPermission(['update:User', 'delete:User'])" class="px-6 py-4 flex justify-center space-x-2">
                <button v-if="can('update', 'User')" @click="modifierUser(user)" class="text-gray-500 hover:text-blue-500">
                  <i class="fa fa-pencil text-lg"></i>
                </button>
                <button v-if="can('delete', 'User')" @click="supprimerUser(user)" class="text-gray-500 hover:text-red-500" :disabled="isDeleting">
                  <i class="fa fa-trash text-lg"></i>
                </button>
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
      <p class="text-gray-500 mt-2">Vous n'avez pas les permissions nécessaires pour consulter cette page.</p>
    </div>
  </div>
</template>
  
<script>
import axios from "axios";
import { debounce } from 'lodash';
import User from "@/components/User.vue";
import { usePermissions } from '@/composables/usePermissions';

export default {
  name: "UserView",
  components: {
      User,
  },
  setup() {
    const { can, hasAnyPermission } = usePermissions();
    return { can, hasAnyPermission };
  },
  data() {
    return {
      users: [],
      isLoading: false,
      isEditing: false,
      isDeleting: false,
      userEnCours: null,
      notification: {
        message: "",
        type: "",
      },
      debouncedGetUser: debounce(this.getUsers, 500),
    };
  },
  computed: {
    paginatedUsers() {
      return this.users.sort((a, b) => a.nom.localeCompare(b.nom));
    },
  },
  mounted() {
    this.getUsers();
  },
  methods: {
    async getUsers() {
      if (!this.can('read', 'User')) return;
      this.isLoading = true;
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/listerUtilisateurs`,
        );
        this.users = response.data;
      } catch (error) {
        console.error("Erreur lors de la récupération des utilisateurs :", error);
        this.users = [];
      } finally {
        this.isLoading = false;
      }
    },

    modifierUser(user) {
      if (!this.can('update', 'User')) return;
      this.userEnCours = { ...user };
      this.isEditing = true;
    },

    sauvegarderUser(user) {
      if (this.isEditing) {
        if (!this.can('update', 'User')) return;
        const index = this.users.findIndex((e) => e._id === user._id);
        if (index !== -1) {
          this.users.splice(index, 1, user);
          this.notification = { message: "Utilisateur modifié avec succès", type: "success" };
        }
      } else {
        if (!this.can('create', 'User')) return;
        this.users.push(user);
        this.notification = { message: "Utilisateur ajouté avec succès", type: "success" };
      }
      this.userEnCours = null;
      this.isEditing = false;
      setTimeout(() => this.notification.message = "", 3000);
    },

    async supprimerUser(user) {
      if (!this.can('delete', 'User')) return;
      this.isDeleting = true;
      try {
        if (!confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")) return;
        await axios.delete(
          `${import.meta.env.VITE_BACKEND_URL}/api/supprimerUtilisateur/${user._id}`
        );
        this.users = this.users.filter(e => e._id !== user._id);
        this.notification = { message: "Utilisateur supprimé avec succès", type: "success" };
      } catch (error) {
        console.error("Erreur :", error);
        this.notification = { message: "Erreur lors de la suppression de l'utilisateur", type: "error" };
      } finally {
        this.isDeleting = false;
        setTimeout(() => this.notification.message = "", 3000);
      }
    }
  },
  watch: {
    selectedMode() {
      this.debouncedGetUser();
    },
  },
};
</script>
