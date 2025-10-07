<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center min-h-96">
        <div class="text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p class="text-gray-600 text-lg font-medium">Chargement des données...</p>
        </div>
      </div>
      
      <div v-else class="space-y-6 lg:space-y-8">
        <!-- Header avec titre et badge -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 class="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
              Informations sur le marché
            </h1>
            <p class="text-gray-600 mt-1">Gestion et suivi des étapes du marché</p>
          </div>
          <div class="flex items-center gap-3">
            <span class="text-sm text-gray-500">Réf:</span>
            <span class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
              {{ activity?.donnéesDeBase?.numRéf || 'N/A' }}
            </span>
          </div>
        </div>

        <!-- Carte principale avec informations -->
        <div class="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-200">
          <div class="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
            <h2 class="text-xl font-semibold text-white">Détails du marché</h2>
          </div>
          
          <div class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-12 gap-6">
              <!-- Description -->
              <div class="md:col-span-10 space-y-2">
                <div class="flex items-center gap-2"><div class="w-2 h-2 bg-blue-500 rounded-full"></div><p class="text-sm font-semibold text-gray-500 uppercase tracking-wide">Description</p></div>
                <p class="text-gray-800 font-medium">{{ activity?.donnéesDeBase?.description || "Non spécifiée" }}</p>
              </div>
              <!-- Statut -->
              <div class="md:col-span-2 space-y-2">
                <div class="flex items-center gap-2"><div class="w-2 h-2 bg-orange-500 rounded-full"></div><p class="text-sm font-semibold text-gray-500 uppercase tracking-wide">Statut</p></div>
                <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium transition-colors"
                      :class="{
                        'bg-green-100 text-green-800 border border-green-200': activity?.donnéesDeBase?.statutActivite === 'Terminé',
                        'bg-yellow-100 text-yellow-800 border border-yellow-200': activity?.donnéesDeBase?.statutActivite === 'En cours',
                        'bg-red-100 text-red-800 border border-red-200': activity?.donnéesDeBase?.statutActivite === 'En attente',
                        'bg-gray-100 text-gray-800 border border-gray-200': !['Terminé', 'En cours', 'En attente'].includes(activity?.donnéesDeBase?.statutActivite)
                      }">
                  {{ activity?.donnéesDeBase?.statutActivite || 'Non spécifié' }}
                </span>
              </div>
              <!-- Type de marché -->
              <div class="md:col-span-5 space-y-2">
                <div class="flex items-center gap-2"><div class="w-2 h-2 bg-purple-500 rounded-full"></div><p class="text-sm font-semibold text-gray-500 uppercase tracking-wide">Type de marché</p></div>
                <p class="text-gray-800 font-medium">{{ activity?.donnéesDeBase?.typeDeMarché || "Non spécifiée" }}</p>
              </div>
              <!-- Pôle -->
              <div class="md:col-span-4 space-y-2">
                <div class="flex items-center gap-2"><div class="w-2 h-2 bg-green-500 rounded-full"></div><p class="text-sm font-semibold text-gray-500 uppercase tracking-wide">Pôle</p></div>
                <p class="text-gray-800 font-medium">{{ activity?.donnéesDeBase?.pole || "Non spécifiée" }}</p>
              </div>
              <!-- Date de début -->
              <div class="md:col-span-3 space-y-2 text-center">
                <div class="flex justify-center items-center gap-2"><div class="w-2 h-2 bg-indigo-500 rounded-full"></div><p class="text-sm font-semibold text-gray-500 uppercase tracking-wide">Date de début</p></div>
                <p class="text-gray-800 font-medium">{{ formatDate(activity?.donnéesDeBase?.dateDeDemarrage) }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Section des étapes -->
        <div class="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-200">
          <div class="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 flex items-center justify-between">
            <h2 class="text-xl font-semibold text-white">Étapes du marché</h2>
            <p class="text-indigo-100 text-sm">{{ etapes.length }} étape(s) au total</p>
          </div>

          <!-- Version Desktop -->
          <div class="hidden lg:block overflow-x-auto">
            <table class="w-full text-sm">
              <thead class="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th class="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">#</th>
                  <th class="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Nom</th>
                  <th class="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Statut</th>
                  <th class="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Prévisionnel</th>
                  <th class="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Recalculé</th>
                  <th class="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Réel</th>
                  <th v-if="can('update', 'EtapeActivite')" class="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                <tr v-for="etape in etapes" :key="etape._id" class="hover:bg-gray-50 transition-colors">
                  <td class="px-6 py-4 whitespace-nowrap"><span class="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">{{ etape.etape.NumEtape }}</span></td>
                  <td class="px-6 py-4 font-medium text-gray-900">{{ etape.etape.nom }}</td>
                  <td class="px-6 py-4"><span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{{ etape.statut }}</span></td>
                  <td class="px-6 py-4 text-gray-600">{{ formatDate(etape.delaiPrevu) }}</td>
                  <td class="px-6 py-4 text-gray-600">{{ formatDate(etape.delaiReelPrevisionnel) }}</td>
                  <td class="px-6 py-4 text-gray-600">{{ formatDate(etape.delaiReel) }}</td>
                  <td v-if="can('update', 'EtapeActivite')" class="px-6 py-4">
                    <button @click="ouvrirFormulaire(etape)" class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
                      <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                      Modifier
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Version Mobile -->
          <div class="lg:hidden p-4 space-y-4">
            <div v-for="etape in etapes" :key="etape._id" class="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center gap-3">
                  <span class="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">{{ etape.etape.NumEtape }}</span>
                  <h3 class="font-semibold text-gray-900">{{ etape.etape.nom }}</h3>
                </div>
                <button v-if="can('update', 'EtapeActivite')" @click="ouvrirFormulaire(etape)" class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors">
                  <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                  Modifier
                </button>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div><span class="text-gray-500 font-medium">Statut:</span><span class="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{{ etape.statut }}</span></div>
                <div><span class="text-gray-500 font-medium">Prévisionnel:</span><span class="ml-2 text-gray-800">{{ formatDateShort(etape.delaiPrevu) }}</span></div>
                <div><span class="text-gray-500 font-medium">Recalculé:</span><span class="ml-2 text-gray-800">{{ formatDateShort(etape.delaiReelPrevisionnel) }}</span></div>
                <div><span class="text-gray-500 font-medium">Réel:</span><span class="ml-2 text-gray-800">{{ formatDateShort(etape.delaiReel) }}</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal amélioré -->
      <transition name="modal">
        <div v-if="etapeSelectionnee" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
          <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all">
            <div class="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 rounded-t-2xl">
              <h3 class="text-xl font-semibold text-white">Modifier la date réelle</h3>
              <p class="text-blue-100 text-sm mt-1">Étape: {{ etapeSelectionnee.etape.nom }}</p>
            </div>
            <div class="p-6">
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Date réelle</label>
                  <input type="date" v-model="dateReelle" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"/>
                </div>
                <div class="flex flex-col sm:flex-row gap-3 pt-4">
                  <button @click="fermerFormulaire" class="flex-1 px-4 py-3 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 font-medium transition-colors">Annuler</button>
                  <button @click="sauvegarderDateReelle" class="flex-1 px-4 py-3 rounded-lg bg-green-600 text-white hover:bg-green-700 font-medium transition-colors">Enregistrer</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script>
import axios from '@/axios'; // CORRECTION: Importer l'instance d'axios configurée
import { usePermissions } from '@/composables/usePermissions'; // Importation du composable pour les permissions

export default {
  name: 'ActivityList',
  props: ['id'],
  setup() {
    // Rendre les fonctions de permission disponibles dans le composant
    const { can } = usePermissions();
    return { can };
  },
  data() {
    return {
      activityId: null,
      activity: null, // Initialisé à null
      etapes: [],
      loading: true,
      etapeSelectionnee: null,
      dateReelle: ''
    };
  },
  watch: {
    '$route.params.id': {
      handler(newId) {
        if (newId) {
          this.activityId = newId;
          this.fetchActivityData();
        }
      },
      immediate: true // Pour que ça se déclenche au montage initial
    }
  },
  methods: {
    async fetchActivityData() {
      if (!this.activityId) return;
      this.loading = true;
      try {
        // CORRECTION: Utiliser axios au lieu de fetch
        const response = await axios.get(`/api/getEtapesByActivite/${this.activityId}`);
        const data = response.data; // axios met les données directement dans .data

        if (Array.isArray(data) && data.length > 0) {
          const firstItemWithActivite = data.find(item => item.activité);
          this.activity = firstItemWithActivite ? firstItemWithActivite.activité : null;
          this.etapes = data
            .filter(e => e.etape && typeof e.etape.NumEtape === 'number')
            .sort((a, b) => a.etape.NumEtape - b.etape.NumEtape);
        } else {
          this.activity = null;
          this.etapes = [];
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des données de l'activité:", error);
      } finally {
        this.loading = false;
      }
    },
    
    ouvrirFormulaire(etape) {
      if (!this.can('update', 'EtapeActivite')) return; // Contrôle de permission
      this.etapeSelectionnee = etape;
      // Formater la date pour l'input type="date"
      this.dateReelle = etape.delaiReel ? new Date(etape.delaiReel).toISOString().split('T')[0] : '';
    },
    
    fermerFormulaire() {
      this.etapeSelectionnee = null;
      this.dateReelle = '';
    },
    
    async sauvegarderDateReelle() {
      if (!this.can('update', 'EtapeActivite')) return; // Contrôle de permission
      if (!this.etapeSelectionnee || !this.dateReelle || !this.activityId) return;

      try {
        // CORRECTION: Utiliser axios au lieu de fetch pour la requête PUT
        await axios.put('/api/ajouterDelaiReel', {
          activiteId: this.activityId,
          etapeId: this.etapeSelectionnee._id,
          delaiReel: this.dateReelle
        });

        console.log("Mise à jour réussie !");
        await this.fetchActivityData(); 
        this.fermerFormulaire();
      } catch (error) {
        console.error("Erreur serveur :", error);
      }
    },
    
    formatDate(date) {
      if (date) {
        const formattedDate = new Date(date);
        return formattedDate.toLocaleDateString('fr-FR', {
          weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });
      }
      return 'Non définie';
    },
    
    formatDateShort(date) {
      if (date) {
        const formattedDate = new Date(date);
        return formattedDate.toLocaleDateString('fr-FR', {
          year: 'numeric', month: 'short', day: 'numeric'
        });
      }
      return 'Non définie';
    }
  }
};
</script>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: all 0.3s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; transform: scale(0.95); }
@media (max-width: 640px) { .modal-enter-from, .modal-leave-to { transform: scale(0.95) translateY(20px); } }
@keyframes spin { to { transform: rotate(360deg); } }
.animate-spin { animation: spin 1s linear infinite; }
.backdrop-blur-sm { backdrop-filter: blur(4px); }
.transition-colors { transition: background-color 0.15s ease-in-out, color 0.15s ease-in-out, border-color 0.15s ease-in-out; }
</style>
