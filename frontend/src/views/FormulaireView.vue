<template>
  <div v-if="hasAnyPermission(['create:Activite', 'update:Activite'])" class="mb-10 px-4 sm:px-6 lg:px-8">
    <h1 class="text-2xl sm:text-3xl font-bold mt-8 text-gray-800 mb-6 pb-2">
      {{ localIsEditing ? "Modifier le marché" : "Créer un nouveau marché " }}
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
        <span class="text-sm sm:text-base">{{ notification.message }}</span>
      </div>
    </transition>

    <form @submit.prevent="submitForm" class="mt-6">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
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
            class="w-full p-3 border-2 border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 focus:bg-blue-50 transition duration-200 text-sm sm:text-base"
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
            placeholder="pôle"
            class="w-full p-3 border-2 border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 focus:bg-blue-50 transition duration-200 text-sm sm:text-base"
          >
        </div>

        <!-- Description -->
        <div class="flex flex-col sm:col-span-2">
          <label for="description" class="block text-sm font-medium text-gray-600 mb-2">
            Description
          </label>
          <input
            v-model="formData.description"
            id="description"
            type="text"
            placeholder="Description"
            class="w-full p-3 border-2 border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 focus:bg-blue-50 transition duration-200 text-sm sm:text-base"
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
            class="w-full p-3 border-2 border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 focus:bg-blue-50 transition duration-200 text-sm sm:text-base"
          >
            <option value="Fournitures">Fournitures</option>
            <option value="Travaux">Travaux</option>
            <option value="Services">Services</option>
            <option value="Prestation Intellectuelle">Prestation Intellectuelle</option>
          </select>
        </div>

        <!-- Organe de Contrôle -->
        <div class="flex flex-col">
          <label for="organeDeControle" class="block text-sm font-medium text-gray-600 mb-2">
            Organe de Contrôle
          </label>
          <input
            v-model="formData.organeDeControle"
            id="organeDeControle"
            type="text"
            placeholder="Organe de Contrôle"
            class="w-full p-3 border-2 border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 focus:bg-blue-50 transition duration-200 text-sm sm:text-base"
          >
        </div>

        <!-- Mode de Passation -->
        <div class="flex flex-col sm:col-span-2 lg:col-span-2">
          <label for="modeDePassation" class="block text-sm font-medium text-gray-600 mb-2">
            Mode de Passation
          </label>
          <select
            v-model="formData.modeDePassation"
            class="w-full p-3 border-2 border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 focus:bg-blue-50 transition duration-200 text-sm sm:text-base"
          >
            <option value="AMI+DPN">Avis National à Manifestation d'intérêt + Demande de Proposition (AMI+DPN)</option>
            <option value="AMI+DPI">Avis International à Manifestation d'intérêt + Demande de Proposition (AMI+DPI)</option>
            <option value="AON">Appel d'Offres National (AON)</option>
            <option value="AOI">Appel d'Offres International (AOI)</option>
            <option value="AOR">Appel d'Offres Restreint (AOR)</option>
            <option value="DC">Demande de Cotation (DC)</option>
            <option value="DRP">Demande de Renseignement et de prix (DRP)</option>
            <option value="GREGRE">Entente Directe (GREGRE)</option>
          </select>
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
            placeholder="xxxxxxxx"
            class="w-full p-3 border-2 border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 focus:bg-blue-50 transition duration-200 text-sm sm:text-base"
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
            class="w-full p-3 border-2 border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 focus:bg-blue-50 transition duration-200 text-sm sm:text-base"
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
            class="w-full p-3 border-2 border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 focus:bg-blue-50 transition duration-200 text-sm sm:text-base"
          >
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
            class="w-full p-3 border-2 border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 focus:bg-blue-50 transition duration-200 text-sm sm:text-base"
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
            class="w-full p-3 border-2 border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 focus:bg-blue-50 transition duration-200 text-sm sm:text-base"
          >
        </div>

        <!-- Date de démarrage -->
        <div class="flex flex-col">
          <label for="dateDeDemarrage" class="block text-sm font-medium text-gray-600 mb-2">
            Date de démarrage
          </label>
          <input
            v-model="formData.dateDeDemarrage"
            id="dateDeDemarrage"
            type="date"
            class="w-full p-3 border-2 border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 focus:bg-blue-50 transition duration-200 text-sm sm:text-base"
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
            class="w-full p-3 border-2 border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 focus:bg-blue-50 transition duration-200 text-sm sm:text-base"
          >
        </div>

        <!-- Montant attribué -->
        <div class="flex flex-col">
          <label for="montantAttribué" class="block text-sm font-medium text-gray-600 mb-2">
            Montant attribué
          </label>
          <input
            v-model="formData.montantAttribué"
            id="montantAttribué"
            type="number"
            placeholder="Montant Attribué"
            class="w-full p-3 border-2 border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 focus:bg-blue-50 transition duration-200 text-sm sm:text-base"
          >
        </div>

        <!-- Date de réception TDRS -->
        <div class="flex flex-col">
          <label for="dateDeReceptionTDRS" class="block text-sm font-medium text-gray-600 mb-2">
            Date de réception des TDRS
          </label>
          <input
            v-model="formData.dateDeReceptionTDRS"
            id="dateDeReceptionTDRS"
            type="date"
            class="w-full p-3 border-2 border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 focus:bg-blue-50 transition duration-200 text-sm sm:text-base"
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

        <!-- Début exécution -->
        <div class="flex flex-col">
          <label for="dateDebutExecution" class="block text-sm font-medium text-gray-600 mb-2">
            Début exécution
          </label>
          <input
            v-model="formData.dateDebutExecution"
            id="dateDebutExecution"
            type="date"
            class="w-full p-3 border-2 border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 focus:bg-blue-50 transition duration-200 text-sm sm:text-base"
          >
        </div>

        <!-- Fin exécution -->
        <div class="flex flex-col">
          <label for="dateFinExecution" class="block text-sm font-medium text-gray-600 mb-2">
            Fin exécution
          </label>
          <input
            v-model="formData.dateFinExecution"
            id="dateFinExecution"
            type="date"
            class="w-full p-3 border-2 border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 focus:bg-blue-50 transition duration-200 text-sm sm:text-base"
          >
        </div>
      </div>

      <!-- Bouton de soumission -->
      <div class="mt-8 flex justify-center sm:justify-start">
        <button 
          type="submit" 
          class="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="isSubmitting || (localIsEditing ? !can('update', 'Activite') : !can('create', 'Activite'))"
        >
          {{ isSubmitting ? "En cours..." : (localIsEditing ? "Modifier" : "Ajouter") }}
        </button>
      </div>
    </form>
  </div>
  
  <!-- Message pour les utilisateurs sans la permission de base -->
  <div v-else class="flex-1 flex items-center justify-center min-h-screen">
    <div class="text-center p-8">
      <i class="fas fa-lock text-5xl text-gray-300 mb-4"></i>
      <h2 class="text-2xl font-semibold text-gray-700">Accès Restreint</h2>
      <p class="text-gray-500 mt-2">Vous n'avez pas les permissions nécessaires pour créer ou modifier un marché.</p>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { usePermissions } from '@/composables/usePermissions';

export default {
  name: 'FormulaireView',
  props: {
    donneesDeBase: {
      default: () => ({
          numRéf: '', description: '', typeDeMarché: '', modeDePassation: '',
          méthodeDeSélection: '', montantEstimatif: null, sourceDeFinancement: '',
          ligneImputation: '', organeDeControle: '', autorisationEngagement: '',
          dateDeDemarrage: '', attributaire: '', montantAttribué: '', pole: '',
          dateFinExecution: '', dateDebutExecution: '', dateDeReceptionTDRS: '',
          dateDeReceptionOrdreService: ''
      })
    },
    isEditing: {
      default: false
    }
  },
  setup() {
    const { can, hasAnyPermission } = usePermissions();
    return { can, hasAnyPermission };
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
    const activityId = this.$route.query.activityId;
    this.localIsEditing = this.$route.query.isEditing === "true";

    if (activityId) {
      // Si on est en mode édition, vérifier la permission de modifier
      if (!this.can('update', 'Activite')) {
        this.notification = { message: "Vous n'avez pas les droits pour modifier ce marché.", type: "error" };
        return;
      }
      axios
        .get(`${import.meta.env.VITE_BACKEND_URL}/api/getActivityById/${activityId}`)
        .then(response => {
          this.activityData = response.data;
          this.formData = {
            ...(this.activityData.donnéesDeBase || {}),
            _id: this.activityData._id
          };
          this.formData.dateDeDemarrage = (this.activityData.donnéesDeBase?.dateDeDemarrage || "").split("T")[0];
          this.formData.dateDeReceptionTDRS = (this.activityData.donnéesDeBase?.dateDeReceptionTDRS || "").split("T")[0];
          this.formData.dateDeReceptionOrdreService = (this.activityData.donnéesDeBase?.dateDeReceptionOrdreService || "").split("T")[0];
          this.formData.dateDebutExecution = (this.activityData.donnéesDeBase?.dateDebutExecution || "").split("T")[0];
          this.formData.dateFinExecution = (this.activityData.donnéesDeBase?.dateFinExecution || "").split("T")[0];
        })
        .catch(error => {
          console.error("Erreur lors du chargement du marché :", error);
          this.notification.message = "Erreur de chargement du marché.";
          this.notification.type = "error";
        });
    } else {
      // Si on est en mode création, vérifier la permission de créer
      if (!this.can('create', 'Activite')) {
        this.notification = { message: "Vous n'avez pas les droits pour créer un marché.", type: "error" };
      }
    }
  },
  methods: {
    async submitForm() {
      if (this.localIsEditing && !this.can('update', 'Activite')) {
        this.notification = { message: "Permissions insuffisantes pour modifier.", type: "error" };
        return;
      }
      if (!this.localIsEditing && !this.can('create', 'Activite')) {
        this.notification = { message: "Permissions insuffisantes pour créer.", type: "error" };
        return;
      }

      this.isSubmitting = true;
      try {
        let response;
        const payload = {
          donnéesDeBase: { ...this.formData }
        };

        if (this.localIsEditing) {
          response = await axios.put(
            `${import.meta.env.VITE_BACKEND_URL}/api/updateActivity/${this.formData._id}`,
            payload
          );
          this.notification.message = "✅ Marché modifié avec succès !";
          this.notification.type = "success";
          this.$emit("activité-modifiee", response.data);
        } else {
          response = await axios.post(
            `${import.meta.env.VITE_BACKEND_URL}/api/createActivity`,
            payload
          );
          this.notification.message = "✅ Marché ajouté avec succès !";
          this.notification.type = "success";
          this.$emit("activité-ajoutee", response.data);
        }
        this.resetForm();
      } catch (error) {
        console.error("Erreur lors de la soumission du marché :", error.response?.data?.message || error.message);
        this.notification.message = "Erreur lors de la soumission : " + (error.response?.data?.message || error.message);
        this.notification.type = "error";
      } finally {
        this.isSubmitting = false;
        setTimeout(() => this.notification.message = "", 4000);
      }
    },
    resetForm() {
      this.formData = {
        numRéf: '', description: '', typeDeMarché: '', modeDePassation: '',
        méthodeDeSélection: '', montantEstimatif: null, sourceDeFinancement: '',
        ligneImputation: '', organeDeControle: '', autorisationEngagement: '',
        dateDeDemarrage: '', attributaire: '', montantAttribué: '', pole: '',
        dateDeReceptionTDRS: '', dateDeReceptionOrdreService: '',
        dateFinExecution: '', dateDebutExecution: '',
      };
      this.localIsEditing = false; // Important pour revenir en mode création après une soumission
    }
  }
};
</script>

