<template>
  <div v-if="can('read', 'Etape')" class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-8 flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 mb-2">Étapes en Retard</h1>
          <p class="text-gray-600">Suivi des étapes d'activités qui ont dépassé leur délai prévu</p>
        </div>
        <button
          v-if="can('read', 'Etape')"
          @click="redirectToUser"
          class="flex items-center gap-3 bg-blue-600 text-white px-6 py-3 rounded-2xl shadow-md hover:bg-blue-700 transition-all duration-300"
        >
          <i class="fa-solid fa-calendar-week text-xl"></i>
          <span class="font-semibold text-sm select-none">Étapes prévues cette semaine</span>
        </button>
      </div>
      
      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span class="ml-3 text-gray-600">Chargement des étapes...</span>
      </div>

      <!-- Error State -->
      <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <div class="flex items-center">
          <div class="flex-shrink-0"><svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" /></svg></div>
          <div class="ml-3"><h3 class="text-sm font-medium text-red-800">Erreur</h3><p class="text-sm text-red-700 mt-1">{{ error }}</p></div>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0"><div class="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center"><svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg></div></div>
            <div class="ml-4"><h3 class="text-lg font-medium text-gray-900">Total en retard</h3><p class="text-2xl font-bold text-red-600">{{ etapesEnRetard.length }}</p></div>
          </div>
        </div>
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0"><div class="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center"><svg class="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div></div>
            <div class="ml-4"><h3 class="text-lg font-medium text-gray-900">Retard critique</h3><p class="text-2xl font-bold text-orange-600">{{ etapesCritiques.length }}</p></div>
          </div>
        </div>
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0"><div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center"><svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg></div></div>
            <div class="ml-4"><h3 class="text-lg font-medium text-gray-900">Retard non critique</h3><p class="text-2xl font-bold text-blue-600">{{ etapesNonCritiques.length }}</p></div>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-lg shadow p-6 mb-6">
        <div class="flex flex-wrap gap-4 items-center">
          <div class="flex-1 min-w-64"><label class="block text-sm font-medium text-gray-700 mb-2">Rechercher</label><input v-model="searchTerm" type="text" placeholder="Rechercher par nom d'activité ou étape..." class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"/></div>
          <div><label class="block text-sm font-medium text-gray-700 mb-2">Statut</label><select v-model="selectedStatus" class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"><option value="">Tous les statuts</option><option value="En cours">En cours</option><option value="Terminé">Terminé</option></select></div>
          <div><label class="block text-sm font-medium text-gray-700 mb-2">Tri</label><select v-model="sortBy" class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"><option value="delaiReel">Date de retard</option><option value="activité">Nom d'activité</option><option value="etape">Nom d'étape</option></select></div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="!loading && !error && etapesEnRetard.length === 0" class="text-center py-12">
        <div class="w-24 h-24 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4"><svg class="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">Aucune étape en retard</h3>
        <p class="text-gray-600">Toutes les étapes sont à jour !</p>
      </div>

      <!-- Etapes List -->
      <div v-if="!loading && !error && filteredEtapes.length > 0" class="space-y-4">
        <div v-for="etape in filteredEtapes" :key="etape._id" class="bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200">
          <div class="p-6">
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <div class="flex gap-2"><h2 class="text-lg font-semibold text-gray-900">{{ etape.activité?.donnéesDeBase?.description || 'Activité sans nom' }}</h2></div>
                <div class="flex items-center gap-3 mb-3">
                  <h3 class="text-lg font-normal text-gray-900">{{ etape.etape?.nom || 'Étape sans nom' }}</h3>
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">{{ etape.activité?.donnéesDeBase?.pole }}</span>
                  <span :class="getRetardClass(etape.delaiReel)" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">{{ getRetardText(etape.delaiReel) }}</span>
                </div>
                <div class="text-sm text-gray-600 mb-3">
                  <p class="mb-1"><span class="font-medium">Délai prévu:</span> {{ formatDate(etape.delaiReel) }}</p>
                  <p v-if="etape.etape?.description" class="text-gray-500">{{ etape.etape.description }}</p>
                </div>
                <div class="flex items-center gap-4 text-sm text-gray-500">
                  <div class="flex items-center gap-1"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg><span>{{ getDaysLate(etape.delaiReel) }} jours de retard</span></div>
                  <div v-if="etape.etape?.dureeEstimee" class="flex items-center gap-1"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg><span>{{ etape.etape.dureeEstimee }} heures estimées</span></div>
                </div>
              </div>
              <div class="flex items-center gap-2 ml-4">
                <button v-if="can('update', 'EtapeActivite')" @click="ouvrirConfirmation(etape)" class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors">
                  <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
                  Marquer terminée
                </button>
                <button @click="redirectToActivity(etape.activité?._id)" class="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
                  <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  Détails
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="flex justify-center mt-8">
        <nav class="flex space-x-2">
          <button @click="currentPage--" :disabled="currentPage === 1" class="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">Précédent</button>
          <span class="px-3 py-2 text-sm text-gray-700">Page {{ currentPage }} sur {{ totalPages }}</span>
          <button @click="currentPage++" :disabled="currentPage === totalPages" class="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">Suivant</button>
        </nav>
      </div>
    </div>

    <!-- Modal de confirmation -->
    <div v-if="showConfirmation" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" @click="fermerConfirmation"></div>
        <div class="inline-block px-4 pt-5 pb-4 overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <div class="sm:flex sm:items-start">
            <div class="flex items-center justify-center flex-shrink-0 w-12 h-12 mx-auto bg-green-100 rounded-full sm:mx-0 sm:h-10 sm:w-10"><svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg></div>
            <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
              <h3 class="text-lg font-medium leading-6 text-gray-900">Confirmer l'achèvement de l'étape</h3>
              <div class="mt-2">
                <p class="text-sm text-gray-500">Êtes-vous sûr de vouloir marquer l'étape <span class="font-medium text-gray-700">"{{ etapeAConfirmer?.etape?.nom || 'Étape sans nom' }}"</span> comme terminée ?</p>
                <p class="text-xs text-gray-400 mt-2">Activité : {{ etapeAConfirmer?.activité?.donnéesDeBase?.description || 'Activité sans nom' }}</p>
              </div>
            </div>
          </div>
          <div class="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
            <button @click="confirmerMarquerTerminee" :disabled="confirmationLoading" class="inline-flex justify-center w-full px-4 py-2 text-base font-medium text-white bg-green-600 border border-transparent rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed">
              <svg v-if="confirmationLoading" class="w-4 h-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              {{ confirmationLoading ? 'En cours...' : 'Confirmer' }}
            </button>
            <button @click="fermerConfirmation" :disabled="confirmationLoading" class="inline-flex justify-center w-full px-4 py-2 mt-3 text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm disabled:opacity-50">Annuler</button>
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

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from "vue-router";
import axios from '@/axios'; // CORRECTION: Importer axios
import { usePermissions } from '@/composables/usePermissions'; // Importation des permissions

// --- SETUP ---
const router = useRouter();
const { can } = usePermissions(); // Utilisation du composable de permissions

// --- État réactif ---
const etapesEnRetard = ref([]);
const loading = ref(true);
const error = ref('');
const searchTerm = ref('');
const selectedStatus = ref('');
const sortBy = ref('delaiReel');
const currentPage = ref(1);
const itemsPerPage = ref(10);
const showConfirmation = ref(false);
const etapeAConfirmer = ref(null);
const confirmationLoading = ref(false);

// --- Computed Properties ---
const filteredEtapes = computed(() => {
  let filtered = etapesEnRetard.value;
  if (searchTerm.value) {
    const term = searchTerm.value.toLowerCase();
    filtered = filtered.filter(etape => 
      etape.etape?.nom?.toLowerCase().includes(term) ||
      etape.activité?.donnéesDeBase?.description?.toLowerCase().includes(term)
    );
  }
  if (selectedStatus.value) {
    filtered = filtered.filter(etape => etape.statut === selectedStatus.value);
  }
  filtered.sort((a, b) => {
    switch (sortBy.value) {
      case 'delaiReel': return new Date(a.delaiReel) - new Date(b.delaiReel);
      case 'activité': return (a.activité?.donnéesDeBase?.description || '').localeCompare(b.activité?.donnéesDeBase?.description || '');
      case 'etape': return (a.etape?.nom || '').localeCompare(b.etape?.nom || '');
      default: return 0;
    }
  });
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filtered.slice(start, end);
});

const totalPages = computed(() => {
  // Recalculer le filtrage pour obtenir le nombre total d'éléments
  let filtered = etapesEnRetard.value;
  if (searchTerm.value) {
    const term = searchTerm.value.toLowerCase();
    filtered = filtered.filter(etape => 
      etape.etape?.nom?.toLowerCase().includes(term) ||
      etape.activité?.donnéesDeBase?.description?.toLowerCase().includes(term)
    );
  }
  if (selectedStatus.value) {
    filtered = filtered.filter(etape => etape.statut === selectedStatus.value);
  }
  return Math.ceil(filtered.length / itemsPerPage.value);
});


const etapesCritiques = computed(() => {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
  return etapesEnRetard.value.filter(etape => new Date(etape.delaiReel) < sevenDaysAgo);
});

const etapesNonCritiques = computed(() => {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
  return etapesEnRetard.value.filter(etape => new Date(etape.delaiReel) >= sevenDaysAgo);
});

// --- Méthodes ---
const fetchEtapesRetard = async () => {
  loading.value = true;
  error.value = '';
  try {
    // CORRECTION: Utiliser axios
    const response = await axios.get('/api/etapes-retard');
    etapesEnRetard.value = response.data.data || [];
  } catch (err) {
    error.value = `Erreur lors du chargement des étapes: ${err.response?.data?.error || err.message}`;
    console.error('Erreur:', err);
  } finally {
    loading.value = false;
  }
};

const ouvrirConfirmation = (etape) => {
  if (!can('update', 'EtapeActivite')) return;
  etapeAConfirmer.value = etape;
  showConfirmation.value = true;
};

const fermerConfirmation = () => {
  if (!confirmationLoading.value) {
    showConfirmation.value = false;
    etapeAConfirmer.value = null;
  }
};

const confirmerMarquerTerminee = async () => {
  if (!etapeAConfirmer.value || !can('update', 'EtapeActivite')) return;
  confirmationLoading.value = true;
  try {
    // CORRECTION: Utiliser axios
    await axios.patch(`/api/etapes/${etapeAConfirmer.value._id}/terminer`);
    await fetchEtapesRetard(); // Actualiser
    fermerConfirmation();
  } catch (err) {
    error.value = `Erreur lors de la mise à jour: ${err.response?.data?.error || err.message}`;
    console.error('Erreur:', err);
  } finally {
    confirmationLoading.value = false;
  }
};

const redirectToActivity = (activityId) => {
  if (activityId) {
    router.push({ name: "activiteDetails", params: { id: activityId } });
  }
};

const redirectToUser = () => {
  router.push({ name: 'etapesSemaine' });
};

// --- Fonctions d'aide ---
const formatDate = (dateString) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('fr-FR', {
    year: 'numeric', month: 'long', day: 'numeric'
  });
};

const getDaysLate = (delaiReel) => {
  const now = new Date();
  const delai = new Date(delaiReel);
  const diffTime = Math.abs(now - delai);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const getRetardClass = (delaiReel) => {
  const daysLate = getDaysLate(delaiReel);
  if (daysLate > 7) return 'bg-red-100 text-red-800';
  if (daysLate > 3) return 'bg-orange-100 text-orange-800';
  return 'bg-yellow-100 text-yellow-800';
};

const getRetardText = (delaiReel) => {
  const daysLate = getDaysLate(delaiReel);
  if (daysLate > 7) return 'Retard critique';
  if (daysLate > 3) return 'Retard important';
  return 'Retard léger';
};

// --- Lifecycle Hook ---
onMounted(() => {
  if (can('read', 'Etape')) {
    fetchEtapesRetard();
  } else {
    loading.value = false;
    error.value = "Vous n'avez pas les droits pour voir cette page.";
  }
});

</script>

<style scoped>
.animate-spin { animation: spin 1s linear infinite; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
</style>
