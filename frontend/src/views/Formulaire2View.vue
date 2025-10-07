<template>
  <div v-if="can('update', 'Activite')" class="w-full py-4 px-2 sm:px-4 lg:px-6 mt-4 max-w-7xl mx-auto">
    <h1 class="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 pb-2">
      Modifier le marché
    </h1>

    <transition name="fade">
      <div
        v-if="notification.message"
        :class="[
          'flex items-center gap-2 p-3 rounded-md shadow-sm mb-6',
          notification.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        ]"
      >
        <span v-if="notification.type === 'success'">✅</span>
        <span v-else>⚠️</span>
        {{ notification.message }}
      </div>
    </transition>

    <form @submit.prevent="submitForm" class="mt-6">
      <!-- Grid responsive pour les champs -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        
        <!-- Numéro de Référence -->
        <div class="flex flex-col">
          <label for="numRef" class="block text-sm font-medium text-gray-600 mb-2">
            Numéro de Référence
          </label>
          <input
            v-model="formData.numRéf"
            id="numRef"
            type="text"
            placeholder="PI_SN_75358"
            class="w-full p-3 border-2 border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 focus:bg-blue-50 transition duration-200"
          >
        </div>

        <!-- Pôle -->
        <div class="flex flex-col">
          <label for="pole" class="block text-sm font-medium text-gray-600 mb-2">
            Pôle
          </label>
          <input
            v-model="formData.pole"
            id="pole"
            type="text"
            placeholder="Pôle"
            class="w-full p-3 border-2 border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 focus:bg-blue-50 transition duration-200"
          >
        </div>

        <!-- Description -->
        <div class="flex flex-col sm:col-span-2 lg:col-span-1">
          <label for="description" class="block text-sm font-medium text-gray-600 mb-2">
            Description
          </label>
          <input
            v-model="formData.description"
            id="description"
            type="text"
            placeholder="Description"
            class="w-full p-3 border-2 border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 focus:bg-blue-50 transition duration-200"
          >
        </div>

        <!-- Type de Marché -->
        <div class="flex flex-col">
          <label for="typeDeMarché" class="block text-sm font-medium text-gray-600 mb-2">
            Type de Marché
          </label>
          <select
            v-model="formData.typeDeMarché"
            id="typeDeMarché"
            class="w-full p-3 border-2 border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 focus:bg-blue-50 transition duration-200"
          >
            <option value="">Sélectionnez un type</option>
            <option value="Fournitures">Fournitures</option>
            <option value="Travaux">Travaux</option>
            <option value="Services">Services</option>
            <option value="Prestation Intellectuelle">Prestation Intellectuelle</option>
          </select>
        </div>

        <!-- Méthode de Sélection -->
        <div class="flex flex-col">
          <label for="methodeDeSelection" class="block text-sm font-medium text-gray-600 mb-2">
            Méthode de Sélection
          </label>
          <input
            v-model="formData.méthodeDeSélection"
            id="methodeDeSelection"
            type="text"
            placeholder="Méthode de Sélection"
            class="w-full p-3 border-2 border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 focus:bg-blue-50 transition duration-200"
          >
        </div>

        <!-- Montant Estimatif -->
        <div class="flex flex-col">
          <label for="montantEstimatif" class="block text-sm font-medium text-gray-600 mb-2">
            Montant Estimatif
          </label>
          <input
            v-model="formData.montantEstimatif"
            id="montantEstimatif"
            type="number"
            placeholder="Montant en FCFA"
            class="w-full p-3 border-2 border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 focus:bg-blue-50 transition duration-200"
          >
        </div>

        <!-- Source de Financement -->
        <div class="flex flex-col">
          <label for="sourceDeFinancement" class="block text-sm font-medium text-gray-600 mb-2">
            Source de Financement
          </label>
          <input
            v-model="formData.sourceDeFinancement"
            id="sourceDeFinancement"
            type="text"
            placeholder="Source de Financement"
            class="w-full p-3 border-2 border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 focus:bg-blue-50 transition duration-200"
          >
        </div>

        <!-- Ligne d'Imputation -->
        <div class="flex flex-col">
          <label for="ligneImputation" class="block text-sm font-medium text-gray-600 mb-2">
            Ligne d'Imputation
          </label>
          <input
            v-model="formData.ligneImputation"
            id="ligneImputation"
            type="text"
            placeholder="Ligne d'Imputation"
            class="w-full p-3 border-2 border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 focus:bg-blue-50 transition duration-200"
          >
        </div>

        <!-- Autorisation d'Engagement -->
        <div class="flex flex-col">
          <label for="autorisationEngagement" class="block text-sm font-medium text-gray-600 mb-2">
            Autorisation d'Engagement
          </label>
          <input
            v-model="formData.autorisationEngagement"
            id="autorisationEngagement"
            type="text"
            placeholder="Autorisation d'Engagement"
            class="w-full p-3 border-2 border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 focus:bg-blue-50 transition duration-200"
          >
        </div>

        <!-- Attributaire -->
        <div class="flex flex-col">
          <label for="attributaire" class="block text-sm font-medium text-gray-600 mb-2">
            Attributaire
          </label>
          <input
            v-model="formData.attributaire"
            id="attributaire"
            type="text"
            placeholder="Attributaire"
            class="w-full p-3 border-2 border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 focus:bg-blue-50 transition duration-200"
          >
        </div>

        <!-- Montant Attribué -->
        <div class="flex flex-col">
          <label for="montantAttribué" class="block text-sm font-medium text-gray-600 mb-2">
            Montant Attribué
          </label>
          <input
            v-model="formData.montantAttribué"
            id="montantAttribué"
            type="number"
            placeholder="Montant Attribué"
            class="w-full p-3 border-2 border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 focus:bg-blue-50 transition duration-200"
          >
        </div>

        <!-- Date de Réception TDRS -->
        <div class="flex flex-col">
          <label for="dateDeReceptionTDRS" class="block text-sm font-medium text-gray-600 mb-2">
            Date de Réception des TDRS
          </label>
          <input
            v-model="formData.dateDeReceptionTDRS"
            id="dateDeReceptionTDRS"
            type="date"
            class="w-full p-3 border-2 border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 focus:bg-blue-50 transition duration-200"
          >
        </div>

        <!-- Date Début Exécution -->
        <div class="flex flex-col">
          <label for="dateDebutExecution" class="block text-sm font-medium text-gray-600 mb-2">
            Date Début Exécution
          </label>
          <input
            v-model="formData.dateDebutExecution"
            id="dateDebutExecution"
            type="date"
            class="w-full p-3 border-2 border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 focus:bg-blue-50 transition duration-200"
          >
        </div>

        <!-- Date Fin Exécution -->
        <div class="flex flex-col">
          <label for="dateFinExecution" class="block text-sm font-medium text-gray-600 mb-2">
            Date Fin Exécution
          </label>
          <input
            v-model="formData.dateFinExecution"
            id="dateFinExecution"
            type="date"
            class="w-full p-3 border-2 border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 focus:bg-blue-50 transition duration-200"
          >
        </div>

        <!-- Date de réception d'ordre de service -->
        <div class="flex flex-col">
          <label for="dateDeReceptionOrdreService" class="block text-sm font-medium text-gray-600 mb-2">
            Date de réception d'ordre de service
          </label>
          <input
            v-model="formData.dateDeReceptionOrdreService"
            id="dateDeReceptionOrdreService"
            type="date"
            class="w-full p-3 border-2 border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 focus:bg-blue-50 transition duration-200 text-sm sm:text-base"
          >
        </div>
      </div>

      <!-- Bouton de soumission -->
      <div class="flex justify-center sm:justify-start">
        <button 
          type="submit" 
          class="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-8 py-3 rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-200"
          :disabled="isSubmitting || !can('update', 'Activite')"
        >
          <span v-if="isSubmitting" class="flex items-center justify-center">
            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            En cours...
          </span>
          <span v-else>Modifier</span>
        </button>
      </div>
    </form>
  </div>
  
  <!-- Message pour les utilisateurs sans la permission de base -->
  <div v-else class="flex-1 flex items-center justify-center min-h-screen">
    <div class="text-center p-8">
      <i class="fas fa-lock text-5xl text-gray-300 mb-4"></i>
      <h2 class="text-2xl font-semibold text-gray-700">Accès Restreint</h2>
      <p class="text-gray-500 mt-2">Vous n'avez pas les permissions nécessaires pour modifier un marché.</p>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { usePermissions } from '@/composables/usePermissions'; // Importation

export default {
  name: "Formulaire2View",
  props: {
    donneesDeBase: {
      default: () => ({
        numRéf: '', description: '', typeDeMarché: '', méthodeDeSélection: '',
        montantEstimatif: null, sourceDeFinancement: '', ligneImputation: '',
        autorisationEngagement: '', attributaire: '', montantAttribué: '',
        pole: '', dateFinExecution: '', dateDebutExecution: '',
        dateDeReceptionTDRS: '', dateDeReceptionOrdreService: ''
      })
    },
    isEditing: {
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
      formData: { ...this.donneesDeBase },
      notification: { message: "", type: "" },
      isSubmitting: false,
      localIsEditing: this.isEditing,  
    };
  },
  watch: {
    isEditing(newVal) {
      this.localIsEditing = newVal;
    },
    donneesDeBase: {
      handler(newVal) {
        this.formData = { ...newVal };
      },
      deep: true,
      immediate: true
    }
  },
  mounted() {
    if (!this.can('update', 'Activite')) {
      // Si l'utilisateur n'a pas la permission, on ne charge rien
      return;
    }

    const activityId = this.$route.query.activityId;
    this.localIsEditing = this.$route.query.isEditing === "true";

    if (activityId) {
      axios
        .get(`${import.meta.env.VITE_BACKEND_URL}/api/getActivityById/${activityId}`)
        .then(response => {
          this.activityData = response.data;
          this.formData = {
            ...(this.activityData.donnéesDeBase || {}),
            _id: this.activityData._id
          };
          // Formatage des dates pour les inputs
          this.formData.dateDeDemarrage = (this.activityData.donnéesDeBase?.dateDeDemarrage || "").split("T")[0];
          this.formData.dateDeReceptionTDRS = (this.activityData.donnéesDeBase?.dateDeReceptionTDRS || "").split("T")[0];
          this.formData.dateDeReceptionOrdreService = (this.activityData.donnéesDeBase?.dateDeReceptionOrdreService || "").split("T")[0];
          this.formData.dateDebutExecution = (this.activityData.donnéesDeBase?.dateDebutExecution || "").split("T")[0];
          this.formData.dateFinExecution = (this.activityData.donnéesDeBase?.dateFinExecution || "").split("T")[0];

          console.log("Mode édition activé :", this.activityData);
        })
        .catch(error => {
          console.error("Erreur lors du chargement de l'activité :", error);
          this.notification.message = "Erreur de chargement de l'activité.";
          this.notification.type = "error";
        })
        .finally(() => {
          this.isSubmitting = false;
        });
    } else {
      this.isSubmitting = false;
      console.log("Mode création activé");
    }
  },
  methods: {
    async submitForm() {
      // Contrôle de permission crucial avant d'envoyer la requête
      if (!this.can('update', 'Activite')) {
        this.notification = { message: "Permissions insuffisantes pour effectuer cette action.", type: "error" };
        return;
      }

      this.isSubmitting = true;
      try {
        let response;
        const payload = {
          donnéesDeBase: {
            ...this.formData
          }
        };

        if (this.localIsEditing) {
          response = await axios.put(
            `${import.meta.env.VITE_BACKEND_URL}/api/updateActivity/${this.formData._id}`,
            payload
          );
          this.notification.message = "✅ Activité modifiée avec succès !";
          this.notification.type = "success";
          this.$emit("activité-modifiee", response.data);
          this.resetForm();
        } 
      } catch (error) {
        console.error("Erreur lors de la soumission de l'activité :", error.response?.data?.message || error.message);
        this.notification.message = "Erreur lors de la soumission de l'activité : " + (error.response?.data?.message || error.message);
        this.notification.type = "error";
      } finally {
        this.isSubmitting = false;
        setTimeout(() => this.notification.message = "", 4000); // Cacher la notif après 4s
      }
    },
    resetForm() {
      this.formData = {
        numRéf: '', description: '', typeDeMarché: '', méthodeDeSélection: '',
        montantEstimatif: null, sourceDeFinancement: '', ligneImputation: '',
        autorisationEngagement: '', attributaire: '', montantAttribué: '',
        pole: '', dateDeReceptionTDRS: '', dateDeReceptionOrdreService:'',
        dateFinExecution: '', dateDebutExecution: ''
      };
    }
  }
};
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
