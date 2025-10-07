<template>
  <div v-if="can('read', 'Activite')" class="flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
    <!-- Section des statistiques -->
    <div v-if="can('read', 'Statistique')" class="relative pt-6 pb-8 lg:pt-10 lg:pb-16">
      <div class="px-4 md:px-6 lg:px-8 mx-auto max-w-full">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 lg:gap-6">
          <!-- Cartes de statistiques -->
          <div v-for="(stat, key) in statsConfig" :key="key" 
               class="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border cursor-pointer transform hover:-translate-y-1"
               :class="[`border-${stat.color}-100`, { [`ring-2 ring-${stat.color}-500`]: viewState === key }]"
               @click="handleClick(key)">
            <div class="flex items-center justify-between">
              <div>
                <h5 class="text-gray-500 uppercase font-semibold text-xs mb-2 tracking-wider">{{ stat.label }}</h5>
                <p class="text-3xl font-bold text-gray-800">{{ statistics[stat.field] || 0 }}</p>
              </div>
              <div :class="`bg-${stat.color}-500 p-3 rounded-full`">
                <i :class="`fas ${stat.icon} text-white text-xl`"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Panel de filtrage -->
    <div v-if="showFilterPanel"
         class="absolute right-0 mt-2 w-full lg:w-96 bg-white border border-gray-200 shadow-2xl rounded-2xl p-6 z-50 animate-fade-in-down lg:mr-8">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-semibold text-gray-800">Filtres</h3>
        <button @click="showFilterPanel = false"
                class="text-gray-400 hover:text-red-500 transition-colors duration-200 p-2 rounded-full hover:bg-red-50"
                title="Fermer">
          <i class="fa-solid fa-xmark text-xl"></i>
        </button>
      </div>

      <div class="space-y-6">
        <!-- Champ de recherche -->
        <div>
          <label class="block text-gray-700 font-medium mb-2">Numéro de Référence ou Description :</label>
          <input v-model="filterData.recherche" type="text"
                 placeholder="Rechercher par N° Réf ou description"
                 class="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                 @keyup.enter="applyFilter" />
        </div>

        <!-- Filtres par checkboxes -->
        <div v-for="filter in checkboxFilters" :key="filter.key">
          <label class="block text-gray-700 font-medium mb-2">{{ filter.label }} :</label>
          <div class="max-h-32 overflow-y-auto space-y-2 bg-gray-50 rounded-lg p-3">
            <div v-for="item in filter.options" :key="item"
                 class="flex items-center gap-3 text-sm">
              <input type="checkbox" v-model="filterData[filter.key]" :value="item"
                     class="form-checkbox text-indigo-600 rounded-md" />
              <span>{{ item }}</span>
            </div>
          </div>
        </div>

        <!-- Boutons d'action -->
        <div class="flex flex-col sm:flex-row gap-3 pt-3">
          <button @click="resetFilter" 
                  class="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors duration-200 font-medium">
            Réinitialiser
          </button>
          <button @click="applyFilter" 
                  class="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium">
            Appliquer
          </button>
        </div>
      </div>
    </div>

    <!-- Section du tableau -->
    <div class="flex-1 px-4 md:px-6 lg:px-8 mx-auto max-w-7xl w-full pb-8">
      <div class="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        <!-- En-tête du tableau -->
        <div class="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h3 class="text-xl lg:text-2xl font-bold text-white">{{ getTableTitle() }}</h3>
            <button @click="toggleFilterPanel"
                    class="flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-xl shadow-lg hover:bg-white/30 transition-all duration-200 border border-white/30">
              <i :class="['fas', showFilterPanel ? 'fa-times' : 'fa-filter', 'transition-transform duration-300']" />
              <span class="font-medium">Filtrer</span>
            </button>
          </div>
        </div>

        <!-- Tableau responsive -->
        <div class="overflow-x-auto">
          <div class="max-h-[700px] overflow-y-auto">
            <!-- Version desktop -->
            <table class="hidden lg:table min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th rowspan="2" class="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider border-r border-gray-200">
                    Numéro de référence
                  </th>
                  <th rowspan="2" class="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider border-r border-gray-200">
                    Description
                  </th>
                  <!-- Colonnes dynamiques -->
                  <template v-for="(col, idx) in getTableColumns()" :key="idx">
                    <th :colspan="col.colspan || 1" :rowspan="col.rowspan || 1"
                        class="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider border-r border-gray-200"
                        :class="col.class">
                      {{ col.title }}
                    </th>
                  </template>
                  <th rowspan="2" class="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider" v-if="hasAnyPermission(['update:Activite', 'read:Activite'])">
                    Actions
                  </th>
                </tr>
                <tr v-if="viewState === 'enCours' || viewState === 'enRetard'">
                  <th v-for="subCol in getSubColumns()" :key="subCol"
                      class="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider border-r border-gray-200">
                    {{ subCol }}
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-if="!activités.length">
                  <td :colspan="getColspan()" class="px-6 py-8 text-center text-gray-500">
                     <div class="flex flex-col items-center">
                       <i class="fas fa-inbox text-4xl text-gray-300 mb-3"></i>
                       <p class="text-lg font-medium">{{ getEmptyMessage() }}</p>
                       <p class="text-sm text-gray-400">{{ getEmptySubMessage() }}</p>
                     </div>
                  </td>
                </tr>
                <tr v-for="activité in activités" :key="activité._id" class="hover:bg-gray-50 transition-colors">
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-r border-gray-200">
                    {{ getNumRef(activité) }}
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-600 border-r border-gray-200 max-w-xs truncate">
                    {{ getDescription(activité) }}
                  </td>
                  <!-- Contenu dynamique des colonnes -->
                  <template v-for="(value, idx) in getRowData(activité)" :key="idx">
                    <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-600 border-r border-gray-200">
                      <span v-if="typeof value === 'object' && value.isStatus" 
                            :class="value.class">{{ value.text }}</span>
                      <span v-else>{{ value || '-' }}</span>
                    </td>
                  </template>
                  <td class="px-6 py-4 whitespace-nowrap text-center" v-if="hasAnyPermission(['update:Activite', 'read:Activite'])">
                    <div class="flex justify-center items-center space-x-3">
                      <button v-if="can('update', 'Activite')" @click="redirectToUser(getId(activité))" 
                              class="text-gray-400 hover:text-blue-500 transition-colors p-2 rounded-lg hover:bg-blue-50"
                              title="Ajouter des utilisateurs au marché">
                        <i class="fa fa-user-plus text-lg"></i>
                      </button>
                      <button v-if="can('read', 'Activite')" @click="redirectToActivity(getId(activité))" 
                              class="text-gray-400 hover:text-green-500 transition-colors p-2 rounded-lg hover:bg-green-50"
                              title="Voir les détails du marché">
                        <i class="fa fa-eye text-lg"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>

            <!-- Version mobile -->
            <div class="lg:hidden p-4 space-y-4">
               <div v-if="!activités.length" class="text-center py-12">
                  <div class="flex flex-col items-center">
                    <i class="fas fa-inbox text-4xl text-gray-300 mb-3"></i>
                    <p class="text-lg font-medium text-gray-500">{{ getEmptyMessage() }}</p>
                    <p class="text-sm text-gray-400">{{ getEmptySubMessage() }}</p>
                  </div>
               </div>
              <div v-for="activité in activités" :key="activité._id" 
                   class="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div class="p-4">
                  <div class="flex justify-between items-start mb-3">
                    <div>
                      <h4 class="font-semibold text-gray-900 text-sm">{{ getNumRef(activité) }}</h4>
                      <p class="text-gray-600 text-xs mt-1 line-clamp-2">{{ getDescription(activité) }}</p>
                    </div>
                    <div v-if="hasAnyPermission(['update:Activite', 'read:Activite'])" class="flex space-x-2 ml-4">
                      <button v-if="can('update', 'Activite')" @click="redirectToUser(getId(activité))" 
                              class="text-gray-400 hover:text-blue-500 transition-colors p-2 rounded-lg hover:bg-blue-50"
                              title="Ajouter des utilisateurs">
                        <i class="fa fa-user-plus text-base"></i>
                      </button>
                      <button v-if="can('read', 'Activite')" @click="redirectToActivity(getId(activité))" 
                              class="text-gray-400 hover:text-green-500 transition-colors p-2 rounded-lg hover:bg-green-50"
                              title="Voir les détails">
                        <i class="fa fa-eye text-base"></i>
                      </button>
                    </div>
                  </div>
                  
                  <!-- Contenu mobile dynamique -->
                  <div class="grid grid-cols-2 gap-4 text-xs">
                    <div v-for="(item, idx) in getMobileData(activité)" :key="idx">
                      <h5 class="font-medium text-gray-700 mb-2">{{ item.label }}</h5>
                      <p v-for="(value, vIdx) in item.values" :key="vIdx" class="text-gray-600">{{ value }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
  </div>

    <!-- Message pour les utilisateurs sans la permission de base -->
    <div v-else class="flex-1 flex items-center justify-center">
        <div class="text-center p-8">
            <i class="fas fa-lock text-5xl text-gray-300 mb-4"></i>
            <h2 class="text-2xl font-semibold text-gray-700">Accès Restreint</h2>
            <p class="text-gray-500 mt-2">Vous n'avez pas les permissions nécessaires pour consulter ce tableau de bord.</p>
        </div>
    </div>
</template>

<script>
import moment from 'moment';
import "font-awesome/css/font-awesome.css";
import { useRouter } from "vue-router";
import axios from 'axios';
import { usePermissions } from '@/composables/usePermissions'; // Importation du composable

export default {
  props: ['id'],
  name: "DashboardView",
  setup() {
    const router = useRouter();
    const { can, hasAnyPermission } = usePermissions(); // Utilisation du composable

    const redirectToActivity = (id) => {
      if (can('read', 'Activite')) {
        router.push({ name: "activiteDetails", params: { id } });
      }
    };
    const redirectToUser = (id) => {
      if (can('update', 'Activite')) {
        router.push({ name: "modifierUtilisateurs", params: { id } });
      }
    };
    
    return { 
      redirectToActivity,
      redirectToUser,
      can,
      hasAnyPermission
    };
  },
  data() {
    return {
      viewState: 'enCours',
      showFilterPanel: false,
      statistics: {},
      activités: [],
      loading: false,
      filterData: { modeDePassation: [], typeDeMarché: [], recherche: "", pole: [] },
      statsConfig: {
        total: { label: "Nombre de marchés", field: "totalActivite", icon: "fa-chart-bar", color: "blue" },
        enCours: { label: "En cours", field: "activiteEnCours", icon: "fa-clock", color: "pink" },
        termines: { label: "Terminés", field: "activiteTermine", icon: "fa-check-circle", color: "green" },
        nonDemarres: { label: "Non démarrés", field: "activitePasDemarrer", icon: "fa-pause-circle", color: "yellow" },
        enRetard: { label: "En retard", field: "nbActivitesEnRetard", icon: "fa-exclamation-triangle", color: "red" }
      },
      checkboxFilters: [
        { key: "modeDePassation", label: "Mode de passation", options: ["AMI+DPN", "AMI+DPI", "AON", "AOI", "AOR", "DC", "DRP", "GREGRE"] },
        { key: "pole", label: "Pôles", options: ["CASE", "CCMEN", "DAF", "DEP", "DPMO", "DSA", "IN", "SN"] },
        { key: "typeDeMarché", label: "Type de marché", options: ["Fournitures", "Travaux", "Services", "Prestation Intellectuelle"] }
      ],
      tableConfigs: {
        enCours: { endpoint: 'filtrerActivitiesEnCours', title: 'Liste des marchés en cours' },
        termines: { endpoint: 'filtrerActivitiesTermine', title: 'Liste des marchés terminés' },
        nonDemarres: { endpoint: 'filtrerActivitiesNonDemarer', title: 'Liste des marchés non démarrés' },
        enRetard: { endpoint: 'filtrerActivitiesEnRetard', title: 'Liste des marchés en retard' },
        total: { endpoint: 'filtrerActivitiesAll', title: 'Tous les marchés' }
      }
    };
  },
  methods: {
    async getStatistics() {
      if (!this.can('read', 'Statistique')) return; // Contrôle d'accès
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/statActivities`);
        this.statistics = response.data;
      } catch (error) {
        console.error("Erreur lors de la récupération des statistiques:", error);
      }
    },
    toggleFilterPanel() { this.showFilterPanel = !this.showFilterPanel; },
    resetFilter() { 
      this.filterData = { modeDePassation: [], typeDeMarché: [], recherche: "", pole: [] };
      this.applyFilter();
    },
    async applyFilter() { this.showFilterPanel = false; await this.loadDataForView(); },
    async loadDataForView() {
      if (!this.can('read', 'Activite')) { // Contrôle d'accès
        this.activités = [];
        return;
      }
      this.loading = true;
      try {
        const config = this.tableConfigs[this.viewState] || this.tableConfigs.total;
        let params = { ...this.filterData };
        Object.keys(params).forEach(key => {
          if (params[key] === "" || (Array.isArray(params[key]) && params[key].length === 0)) {
            delete params[key];
          }
        });
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/${config.endpoint}`, { params });
        this.activités = Array.isArray(response.data) ? response.data : [];
      } catch (error) {
        console.error("❌ Erreur lors de la récupération :", error.response?.data || error.message);
        this.activités = [];
      } finally {
        this.loading = false;
      }
    },
    async handleClick(type) { this.viewState = type; await this.loadDataForView(); },
    formatDate(date) { return date ? moment(date).format('DD/MM/YYYY') : '-'; },
    calculerDuree(dateDebut, dateFin) {
      if (!dateDebut || !dateFin) return '-';
      const jours = Math.floor(moment.duration(moment(dateFin).diff(moment(dateDebut))).asDays());
      return `${jours} jour${jours > 1 ? 's' : ''}`;
    },
    getNumRef(activité) { return activité.activité?.donnéesDeBase?.numRéf || activité.numRéf; },
    getDescription(activité) { return activité.activité?.donnéesDeBase?.description || activité.description; },
    getId(activité) { return activité.activité?._id || activité._id; },
    getTableTitle() { return this.tableConfigs[this.viewState]?.title || 'Liste des marchés'; },
    getTableColumns() {
      if (this.viewState === 'enCours' || this.viewState === 'enRetard') {
        return [
          { title: 'Étape actuelle', colspan: 2, class: 'text-center' },
          { title: 'Étape prochaine', colspan: 2, class: 'text-center' }
        ];
      } else if (this.viewState === 'termines') {
        return [{ title: 'Date de fin' }, { title: 'Durée totale' }];
      } else if (this.viewState === 'nonDemarres') {
        return [{ title: 'Date de demarrage' }, { title: 'Statut' }];
      } else {
        return [{ title: 'Type de marché' }, { title: 'Mode de passation' }];
      }
    },
    getSubColumns() { return ['Date provisoire', 'Date réelle', 'Date provisoire', 'Date réelle']; },
    getRowData(activité) {
      if (this.viewState === 'enCours' || this.viewState === 'enRetard') {
        return [
          this.formatDate(activité.étapes?.[0]?.delaiPrevu),
          this.formatDate(activité.étapes?.[0]?.delaiReel),
          this.formatDate(activité.étapes?.[1]?.delaiPrevu),
          this.formatDate(activité.étapes?.[1]?.delaiReel)
        ];
      } else if (this.viewState === 'termines') {
        return [this.formatDate(activité.dateFin), this.calculerDuree(activité.dateDebut, activité.dateFin)];
      } else if (this.viewState === 'nonDemarres') {
        return [
          this.formatDate(activité.activité?.donnéesDeBase?.dateDeDemarrage),
          { isStatus: true, text: 'A venir', class: 'px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full' }
        ];
      } else {
        return [
          activité.activité?.donnéesDeBase?.typeDeMarché || activité.typeDeMarché,
          activité.activité?.donnéesDeBase?.modeDePassation || activité.modeDePassation
        ];
      }
    },
    getMobileData(activité) {
      if (this.viewState === 'enCours' || this.viewState === 'enRetard') {
        return [
          { label: 'Étape actuelle', values: [`Prév: ${this.formatDate(activité.étapes?.[0]?.delaiPrevu)}`, `Réel: ${this.formatDate(activité.étapes?.[0]?.delaiReel)}`] },
          { label: 'Étape prochaine', values: [`Prév: ${this.formatDate(activité.étapes?.[1]?.delaiPrevu)}`, `Réel: ${this.formatDate(activité.étapes?.[1]?.delaiReel)}`] }
        ];
      } else if (this.viewState === 'termines') {
        return [
          { label: 'Date de fin', values: [this.formatDate(activité.dateFin)] },
          { label: 'Durée', values: [this.calculerDuree(activité.dateDebut, activité.dateFin)] }
        ];
      } else {
        return [
          { label: 'Type', values: [activité.activité?.donnéesDeBase?.typeDeMarché || activité.typeDeMarché || '-'] },
          { label: 'Mode', values: [activité.activité?.donnéesDeBase?.modeDePassation || activité.modeDePassation || '-'] }
        ];
      }
    },
    getEmptyMessage() {
      const messages = { total: 'Aucun marché trouvé', enCours: 'Aucun marché en cours', termines: 'Aucun marché terminé', nonDemarres: 'Aucun marché non démarré', enRetard: 'Aucun marché en retard' };
      return messages[this.viewState] || 'Aucun marché trouvé';
    },
    getEmptySubMessage() {
      const subMessages = { total: 'Tous les marchés apparaîtront ici', enCours: 'Les marchés en cours apparaîtront ici', termines: 'Les marchés terminés apparaîtront ici', nonDemarres: 'Les marchés non démarrés apparaîtront ici', enRetard: 'Les marchés en retard apparaîtront ici' };
      return subMessages[this.viewState] || 'Les marchés apparaîtront ici une fois créés';
    },
    getColspan() {
      if (this.viewState === 'enCours' || this.viewState === 'enRetard') return 7;
      else if (this.viewState === 'termines' || this.viewState === 'nonDemarres') return 5;
      else return 5;
    },
  },
  async mounted() {
    await this.getStatistics();
    await this.loadDataForView();
  }
};
</script>

