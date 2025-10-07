<template>
  <div class="mb-10 mt-4">
    <h2 class="text-3xl font-semibold mb-4">
      {{ isEditing ? "Modifier un utilisateur" : "Ajouter un utilisateur" }}
    </h2>

    <div
      v-if="notification.message"
      :class="[
        'p-2 mb-4 rounded',
        notification.type === 'success' ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
      ]"
    >
      {{ notification.message }}
    </div>

    <form @submit.prevent="submitForm" class="flex flex-wrap gap-6 items-end">
      <div class="flex flex-col w-full md:w-72">
        <label class="text-sm font-medium text-gray-600">Nom de l'utilisateur :</label>
        <input
          type="text"
          class="mt-2 p-2 rounded-md border border-gray-300 focus:ring text-black focus:ring-blue-200"
          v-model="formData.nom"
          required
        >
      </div>
      <div class="flex flex-col w-full md:w-72">
        <label class="text-sm font-medium text-gray-600">Prenom de l'utilisateur :</label>
        <input
          type="text"
          class="mt-2 p-2 rounded-md border border-gray-300 text-black focus:ring focus:ring-blue-200"
          v-model="formData.prenom"
          required
        >
      </div>
      <div class="flex flex-col w-full md:w-72">
        <label class="text-sm font-medium text-gray-600">Email :</label>
        <input
          type="email"
          class="mt-2 p-2 rounded-md border text-black border-gray-300 focus:ring focus:ring-blue-200"
          v-model="formData.mail"
          required
        >
      </div>
       <div class="flex flex-col w-full md:w-72">
        <label class="text-sm font-medium text-gray-600">Rôle :</label>
        <select
        v-model="formData.role"
        class="block w-full md:w-72 p-2 rounded-md border border-gray-300 focus:ring focus:ring-blue-200"
      >
        <option value="admin"> Admin </option>
        <option value="manager">  Manager</option>
        <option value="user"> User</option>
      </select>
      </div>
       
      <button 
        type="submit" 
        class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
        :disabled="isSubmitting || (isEditing ? !can('update', 'User') : !can('create', 'User'))"
      >
        {{ isSubmitting ? "En cours..." : (isEditing ? "Modifier" : "Ajouter") }}
      </button>
    </form>
  </div>  
</template>

<script>
import axios from "axios";
import { usePermissions } from '@/composables/usePermissions'; // Importation

export default {
  name: 'UserComponent',
  props: {
    user: {
      type: Object,
      default: () => ({
        prenom: '',
        nom: '',
        mail: '',
        role: '',
      })
    },
    isEditing: {
      type: Boolean,
      default: false
    }
  },
  setup() {
    // Rendre les fonctions de permissions accessibles
    const { can } = usePermissions();
    return { can };
  },
  data() {
    return {
      formData: { ...this.user },
      notification: {
        message: "",
        type: "" // "success" ou "error"
      },
      isSubmitting: false
    };
  },
  watch: {
    user: {
      handler(newVal) {
        this.formData = { ...newVal };
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    async submitForm() {
      // Contrôle de permission crucial avant d'envoyer la requête
      if (this.isEditing && !this.can('update', 'User')) {
        this.notification = { message: "Permissions insuffisantes pour modifier.", type: "error" };
        return;
      }
      if (!this.isEditing && !this.can('create', 'User')) {
        this.notification = { message: "Permissions insuffisantes pour créer.", type: "error" };
        return;
      }

      if (!this.formData.nom.trim() || !this.formData.mail.trim()) {
        this.notification.message = "Tous les champs doivent être remplis.";
        this.notification.type = "error";
        return;
      }

      this.isSubmitting = true;
      
      try {
        let response;
        if (this.isEditing) {
          response = await axios.put(
            `${import.meta.env.VITE_BACKEND_URL}/api/modifierUtilisateur/${this.formData._id}`,
            this.formData
          );
          this.notification.message = "✅ Utilisateur modifié avec succès !";
          this.notification.type = "success";
          this.$emit("user-modifiee", response.data);
        } else {
          response = await axios.post(
            `${import.meta.env.VITE_BACKEND_URL}/api/creerUtilisateur`,
            this.formData
          );
          this.notification.message = "✅ Utilisateur ajouté avec succès !";
          this.notification.type = "success";
          this.$emit("user-ajoutee", response.data);
          
          // Réinitialiser le formulaire
          this.formData = {
            prenom: '',
            nom: '',
            mail: '',
            role: '',
          };

        }
      } catch (error) {
        console.error("Erreur lors de la soumission de l'utilisateur :", error.response?.data?.message || error.message);
        this.notification.message = "Erreur lors de la soumission de l'utilisateur : " + (error.response?.data?.message || error.message);
        this.notification.type = "error";
      } finally {
        this.isSubmitting = false;
        // Effacer la notification après 3 secondes
        setTimeout(() => {
          this.notification.message = "";
          this.notification.type = "";
        }, 3000);
      }
    }
  }
};
</script>
