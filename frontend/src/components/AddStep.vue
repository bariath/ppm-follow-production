<template>
  <div class="mb-10">
    <p class="text-3xl font-semibold mb-4">
      {{ isEditing ? "Modifier l'étape" : "Créer une nouvelle étape" }}
    </p>

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
        <label class="text-sm font-medium text-gray-600">Numéro de l'étape :</label>
        <input
          type="number"
          class="mt-2 p-2 rounded-md border border-gray-300 focus:ring text-black focus:ring-blue-200"
          v-model.number="formData.NumEtape"
          min="1"
          required
        >
      </div>
      <div class="flex flex-col w-full md:w-72">
        <label class="text-sm font-medium text-gray-600">Étape :</label>
        <input
          type="text"
          class="mt-2 p-2 rounded-md border border-gray-300 text-black focus:ring focus:ring-blue-200"
          v-model="formData.nom"
          required
        >
      </div>
      <div class="flex flex-col w-full md:w-72">
        <label class="text-sm font-medium text-gray-600">Mode de passation :</label>
        <input
          type="text"
          class="mt-2 p-2 rounded-md border text-black border-gray-300 focus:ring focus:ring-blue-200"
          v-model="formData.modeDePassation"
          required
        >
      </div>
      <div class="flex flex-col w-full md:w-72">
        <label class="text-sm font-medium text-gray-600">Délai global CCMP :</label>
        <input
          type="number"
          class="mt-2 p-2 rounded-md border border-gray-300 text-black focus:ring focus:ring-blue-200"
          v-model.number="formData.delaiGlobalCCMP"
        >
      </div>
      <div class="flex flex-col w-full md:w-72">
        <label class="text-sm font-medium text-gray-600">Délai global DNCMP :</label>
        <input
          type="number"
          class="mt-2 p-2 rounded-md border border-gray-300 text-black focus:ring focus:ring-blue-200"
          v-model.number="formData.delaiGlobalDNCMP"
        >
      </div>
       <div class="flex flex-col w-full md:w-72">
        <label class="text-sm font-medium text-gray-600">Statut de l'étape :</label>
        <input
          type="text"
          class="mt-2 p-2 rounded-md border border-gray-300 text-black focus:ring focus:ring-blue-200"
          v-model="formData.statutEtape"
        >
      </div>
       <div class="flex flex-col w-full md:w-72">
        <label class="text-sm font-medium text-gray-600">Niveau d'exécution :</label>
        <input
          type="text"
          class="mt-2 p-2 rounded-md border border-gray-300 text-black focus:ring focus:ring-blue-200"
          v-model="formData.niveauExecution"
        >
      </div>
      <button 
        type="submit" 
        class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
        :disabled="isSubmitting || (isEditing ? !can('update', 'Etape') : !can('create', 'Etape'))"
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
  name: 'AddStep',
  props: {
    etape: {
      type: Object,
      default: () => ({
        NumEtape: '',
        nom: '',
        delaiGlobalCCMP: '',
        delaiGlobalDNCMP: '', 
        modeDePassation: '',
        statutEtape: '', 
        niveauExecution: ''
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
      formData: { ...this.etape },
      notification: {
        message: "",
        type: "" // "success" ou "error"
      },
      isSubmitting: false
    };
  },
  watch: {
    etape: {
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
      if (this.isEditing && !this.can('update', 'Etape')) {
        this.notification = { message: "Permissions insuffisantes pour modifier.", type: "error" };
        return;
      }
      if (!this.isEditing && !this.can('create', 'Etape')) {
        this.notification = { message: "Permissions insuffisantes pour créer.", type: "error" };
        return;
      }

      if (this.formData.NumEtape < 1) {
        this.notification.message = "Le numéro de l'étape doit être strictement positif.";
        this.notification.type = "error";
        return;
      }

      if (!this.formData.nom.trim() || !this.formData.modeDePassation.trim()) {
        this.notification.message = "Tous les champs obligatoires doivent être remplis.";
        this.notification.type = "error";
        return;
      }

      this.isSubmitting = true;
      try {
        let response;
        if (this.isEditing) {
          response = await axios.put(
            `${import.meta.env.VITE_BACKEND_URL}/api/step/updateStep/${this.formData._id}`,
            this.formData
          );
          this.notification.message = "✅ Étape modifiée avec succès !";
          this.notification.type = "success";
          this.$emit("etape-modifiee", response.data);
        } else {
          response = await axios.post(
            `${import.meta.env.VITE_BACKEND_URL}/api/step/createStep`,
            this.formData
          );
          this.notification.message = "✅ Étape ajoutée avec succès !";
          this.notification.type = "success";
          this.$emit("etape-ajoutee", response.data);
          
          this.formData = {
            NumEtape: '', nom: '', delaiGlobalCCMP: '', delaiGlobalDNCMP: '', 
            modeDePassation: '', statutEtape: '', niveauExecution: ''
          };
        }
      } catch (error) {
        console.error("Erreur lors de la soumission de l'étape :", error.response?.data?.message || error.message);
        this.notification.message = "Erreur lors de la soumission : " + (error.response?.data?.message || error.message);
        this.notification.type = "error";
      } finally {
        this.isSubmitting = false;
        setTimeout(() => {
          this.notification.message = "";
          this.notification.type = "";
        }, 3000);
      }
    }
  }
};
</script>
