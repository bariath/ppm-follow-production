<template>
  <div v-if="can('read', 'Etape')" class="p-6 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
    <!-- Header avec animation -->
    <div class="mb-8">
      <h2 class="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
        Étapes prévues cette semaine
      </h2>
    </div>

    <!-- Loading State avec skeleton -->
    <div v-if="loading" class="space-y-4">
      <div class="animate-pulse">
        <div class="bg-white rounded-2xl shadow-sm p-6">
          <div class="flex space-x-4">
            <div class="h-4 bg-gray-200 rounded w-1/4"></div>
            <div class="h-4 bg-gray-200 rounded w-1/3"></div>
            <div class="h-4 bg-gray-200 rounded w-1/4"></div>
            <div class="h-4 bg-gray-200 rounded w-1/6"></div>
          </div>
        </div>
      </div>
      <div class="animate-pulse">
        <div class="bg-white rounded-2xl shadow-sm p-6">
          <div class="flex space-x-4">
            <div class="h-4 bg-gray-200 rounded w-1/4"></div>
            <div class="h-4 bg-gray-200 rounded w-1/3"></div>
            <div class="h-4 bg-gray-200 rounded w-1/4"></div>
            <div class="h-4 bg-gray-200 rounded w-1/6"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="etapes.length === 0" class="text-center py-16">
      <div class="mb-6">
        <div class="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
          <i class="fa-solid fa-calendar-xmark text-gray-400 text-3xl"></i>
        </div>
      </div>
      <h3 class="text-xl font-semibold text-gray-700 mb-2">Aucune étape planifiée</h3>
      <p class="text-gray-500 max-w-md mx-auto">
        Il n'y a pas d'étapes prévues pour cette semaine. Les nouvelles étapes apparaîtront ici automatiquement.
      </p>
    </div>

    <!-- Table moderne avec cards responsive -->
    <div v-else class="space-y-4">
      <!-- Stats summary -->
      <div class="bg-white rounded-2xl shadow-sm p-6 mb-6">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-lg font-semibold text-gray-800">
              {{ etapes.length }} étape{{ etapes.length > 1 ? 's' : '' }} planifiée{{ etapes.length > 1 ? 's' : '' }}
            </h3>
            <p class="text-gray-500">Pour la semaine du {{ getCurrentWeekRange() }}</p>
          </div>
          <div class="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-xl">
            <i class="fa-solid fa-calendar-check text-blue-500"></i>
            <span class="text-blue-700 font-medium">Cette semaine</span>
          </div>
        </div>
      </div>

      <!-- Desktop Table -->
      <div class="hidden md:block bg-white rounded-2xl shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full">
            <thead class="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
              <tr>
                <th class="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Étape
                </th>
                <th class="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Nom de l'étape
                </th>
                <th class="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Activité
                </th>
                <th class="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Échéance
                </th>
                <th v-if="can('read', 'Activite')" class="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr 
                v-for="(etape, index) in etapes" 
                :key="index" 
                class="hover:bg-gray-50 transition-all duration-200 group"
              >
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                      <span class="text-blue-600 font-bold text-sm">{{ etape.numEtape || '?' }}</span>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <div class="text-sm font-medium text-gray-900 line-clamp-2">
                    {{ etape.nomEtape || 'Nom non défini' }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="relative">
                    <div
                      class="flex items-center cursor-pointer"
                      @mouseover="showTooltip(index)"
                      @mouseleave="hideTooltip(index)"
                      @click="toggleTooltip(index)"
                    >
                      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors">
                        {{ etape.numRefActivite || 'N/A' }}
                      </span>
                    </div>

                    <!-- Tooltip affiché au survol ou au clic -->
                    <div 
                      v-if="tooltipVisible[index]" 
                      class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-20 bg-gray-900 text-white p-4 rounded-lg shadow-xl text-sm min-w-64 max-w-md whitespace-normal"
                      style="width: max-content;"
                    >
                      <div class="font-medium leading-relaxed">
                        {{ etape.description || 'Activité sans nom' }}
                      </div>
                      <!-- Flèche du tooltip -->
                      <div class="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center gap-2">
                    <i class="fa-solid fa-calendar-day text-gray-400 text-sm"></i>
                    <span class="text-sm text-gray-900">
                      {{ formatDate(etape.delaiReel) }}
                    </span>
                  </div>
                </td>
                <td v-if="can('read', 'Activite')" class="px-6 py-4 whitespace-nowrap">
                  <button
                    @click="redirectToActivity(etape.id)"
                    class="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 hover:text-blue-800 transition-all duration-200 group-hover:scale-105 font-medium text-sm"
                    title="Voir les détails de l'activité"
                  >
                    <i class="fa fa-eye mr-2"></i>
                    Voir
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Mobile Cards -->
      <div class="md:hidden space-y-4">
        <div
          v-for="(etape, index) in etapes"
          :key="index"
          class="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition-all duration-200 border-l-4 border-blue-400"
        >
          <div class="flex items-start justify-between mb-4">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <span class="text-blue-600 font-bold">{{ etape.numEtape || '?' }}</span>
              </div>
              <div>
                <h3 class="font-semibold text-gray-900 text-sm line-clamp-2">
                  {{ etape.nomEtape || 'Nom non défini' }}
                </h3>
                <div class="relative mt-1">
                  <span 
                    class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 cursor-pointer hover:bg-gray-200 transition-colors"
                    @click="toggleTooltip(`mobile-${index}`)"
                  >
                    {{ etape.numRefActivite || 'N/A' }}
                  </span>
                  <!-- Tooltip mobile -->
                  <div 
                    v-if="tooltipVisible[`mobile-${index}`]" 
                    class="absolute top-full left-0 mt-2 z-20 bg-gray-900 text-white p-4 rounded-lg shadow-xl text-sm min-w-64 max-w-sm whitespace-normal"
                    style="width: max-content;"
                  >
                    <div class="font-medium leading-relaxed">
                      {{ etape.description || 'Activité sans nom' }}
                    </div>
                    <!-- Flèche du tooltip -->
                    <div class="absolute bottom-full left-4 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-900"></div>
                  </div>
                </div>
              </div>
            </div>
            <button
              v-if="can('read', 'Activite')"
              @click="redirectToActivity(etape.id)"
              class="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors"
              title="Voir détails"
            >
              <i class="fa fa-chevron-right"></i>
            </button>
          </div>
          
          <div class="flex items-center justify-between text-sm">
            <div class="flex items-center gap-2 text-gray-600">
              <i class="fa-solid fa-calendar-day"></i>
              <span>{{ formatDate(etape.delaiReel) }}</span>
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

<script setup>
import { ref, onMounted, reactive } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { usePermissions } from '@/composables/usePermissions';

const router = useRouter();
const { can } = usePermissions();
const etapes = ref([]);
const loading = ref(true);
const tooltipVisible = reactive({});

const showTooltip = (index) => {
  tooltipVisible[index] = true;
};

const hideTooltip = (index) => {
  tooltipVisible[index] = false;
};

const toggleTooltip = (index) => {
  tooltipVisible[index] = !tooltipVisible[index];
};

const fetchEtapes = async () => {
  try {
    const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/etapes/semaine`);
    etapes.value = response.data.sort((a, b) => new Date(a.delaiReel) - new Date(b.delaiReel));
  } catch (error) {
    console.error('Erreur lors de la récupération des étapes de la semaine :', error);
  } finally {
    loading.value = false;
  }
};

const formatDate = (dateStr) => {
  const options = { 
    weekday: 'short',
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric' 
  };
  return new Date(dateStr).toLocaleDateString('fr-FR', options);
};

const getCurrentWeekRange = () => {
  const now = new Date();
  const monday = new Date(now);
  monday.setDate(now.getDate() - now.getDay() + 1);
  
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  
  return `${monday.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })} - ${sunday.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}`;
};

const redirectToActivity = (activityId) => {
  if (can('read', 'Activite')) {
    router.push({ name: 'activiteDetails', params: { id: activityId } });
  }
};

onMounted(() => {
  if (can('read', 'Etape')) {
    fetchEtapes();
  } else {
    loading.value = false;
  }
});
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.bg-gradient-to-br {
  animation: fadeIn 0.6s ease-out;
}
</style>
