<template>
  <div v-if="can('read', 'Statistique')" class="bg-gray-50 min-h-screen">
    <div class="container mx-auto px-4 py-8 space-y-8 max-w-7xl">
      <!-- Titre principal -->
      <div class="text-center mb-6">     
        <h1 class="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
          Tableau de bord 
        </h1>
      </div>

      <!-- Filtres améliorés -->
      <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 mb-8">
        <div class="grid grid-cols-1 lg:grid-cols-4 gap-6 items-end">
          <div class="space-y-2" v-for="filter in filters" :key="filter.key">
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              <span class="flex items-center">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="filter.icon"></path>
                </svg>
                {{ filter.label }}
              </span>
            </label>
            <select v-model="filter.value" class="enhanced-select">
              <option v-for="option in filter.options" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </div>

          <div class="space-y-2">
            <label class="block text-sm font-semibold text-gray-700 mb-2 opacity-0">Action</label>
            <button @click="fetchStatistics" class="enhanced-button group w-full" :disabled="isLoading">
              <span v-if="!isLoading" class="flex items-center justify-center">
                <svg class="w-5 h-5 mr-2 group-hover:rotate-180 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                </svg>
                Actualiser
              </span>
              <span v-else class="flex items-center justify-center">
                <svg class="animate-spin w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                </svg>
                Chargement...
              </span>
            </button>
          </div>
        </div>
      </div>

      <!-- Contenu principal -->
      <transition name="fade" mode="out-in">
        <!-- État de chargement -->
        <div v-if="isLoading" class="flex items-center justify-center py-16">
          <div class="text-center">
            <svg class="animate-spin h-8 w-8 text-indigo-600 mx-auto mb-4" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
            </svg>
            <span class="text-gray-600 text-sm sm:text-base">Chargement des données...</span>
          </div>
        </div>

        <!-- Graphiques -->
        <div v-else-if="hasStatisticsData" key="charts" class="space-y-6">
          <!-- Statistiques générales -->
          <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-3 mb-6">
            <div class="stat-card" v-for="stat in stats" :key="stat.key">
              <div class="stat-icon" :class="stat.iconClass">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="stat.icon"></path>
                </svg>
              </div>
              <div class="stat-content">
                <p class="stat-label">{{ stat.label }}</p>
                <p class="stat-value">{{ formatNumber(stat.value) }}</p>
              </div>
            </div>
          </div>

          <!-- Grille responsive des graphiques -->
          <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div class="chart-card" v-for="chart in charts" :key="chart.key">
              <div class="chart-header">
                <h2 class="chart-title">{{ chart.title }}</h2>
              </div>
              <div class="chart-container">
                <apexchart
                  v-if="chart.data.series.length > 0"
                  :type="chart.type"
                  :height="chartHeight"
                  :options="chart.data.options"
                  :series="chart.data.series"
                />
                <div v-else class="no-data-message">
                  <p>Aucun résultat pour ce graphique.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- État sans données -->
        <div v-else key="no-data" class="flex flex-col items-center justify-center py-16">
          <svg class="h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 17v-6h6v6m2 4H7a2 2 0 01-2-2V7a2 2 0 012-2h5l2 2h5a2 2 0 012 2v10a2 2 0 01-2 2z"/>
          </svg>
          <p class="text-gray-500 text-center text-sm sm:text-base">
            Aucun résultat trouvé pour cette période.
          </p>
        </div>
      </transition>
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
import VueApexCharts from "vue3-apexcharts";
import { usePermissions } from '@/composables/usePermissions';

export default {
  name: "Statistiques",
  components: { apexchart: VueApexCharts },
  setup() {
    const { can } = usePermissions();
    return { can };
  },
  data() {
    const currentYear = new Date().getFullYear();
    const months = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
    
    return {
      statistics: null,
      totalMontantEstimatif: 0,
      totalMontantReel: 0,
      totalActivites: 0,
      isLoading: true,
      selectedYear: currentYear,
      startMonth: "",
      endMonth: "",
      windowWidth: window.innerWidth,
      chartDataMarket: { series: [], options: {} },
      chartDataOrgane: { series: [], options: {} },
      chartDataPole: { series: [], options: {} },
      chartDataMontants: { series: [], options: {} },
      
      niveauExecutionColors: {
        "En cours d'évaluation": "#667eea",
        "En cours de passation": "#764ba2", 
        "Exécution": "#f093fb",
        "En cours de préparation": "#4facfe",
        "En cours de contractualisation": "#43e97b"
      },

      // Palette de couleurs modernes pour les graphiques
      modernColors: [
        "#667eea", "#764ba2", "#f093fb", "#4facfe", "#43e97b",
        "#ff6b6b", "#4ecdc4", "#45b7d1", "#96ceb4", "#feca57",
        "#ff9ff3", "#54a0ff", "#5f27cd", "#00d2d3", "#ff9f43"
      ],

      baseStackedChartOptions: {
        chart: { type: "bar", stacked: true, toolbar: { show: false }, foreColor: '#374151', fontFamily: 'Inter, system-ui, sans-serif' },
        plotOptions: { bar: { horizontal: false, columnWidth: '60%', borderRadius: 4 } },
        dataLabels: { enabled: true },
        xaxis: {
          labels: {
            formatter: (value) => typeof value === 'string' && value.length > 15 ? value.substring(0, 15) + '...' : String(value),
            style: { fontSize: '12px', fontWeight: '500' },
            rotate: -45
          },
          axisBorder: { show: false },
          axisTicks: { show: false }
        },
        yaxis: {
          title: { text: "Nombre d'activités", style: { fontSize: '14px', fontWeight: '600' } },
          labels: { style: { fontSize: '12px' } }
        },
        grid: { borderColor: "#e5e7eb", strokeDashArray: 3, xaxis: { lines: { show: false } } },
        tooltip: {
          theme: "light",
          style: { fontSize: '12px' },
          y: { formatter: (value) => `${value} activités` }
        },
        legend: { show: true, position: "bottom", horizontalAlign: "center", fontSize: '12px', markers: { width: 12, height: 12, radius: 2 } },
        responsive: [{ breakpoint: 768, options: { xaxis: { labels: { style: { fontSize: '10px' } } }, legend: { fontSize: '10px' } } }]
      },

      filters: [
        {
          key: 'year',
          label: 'Année',
          value: currentYear,
          icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
          get options() { return Array.from({ length: 50 }, (_, i) => ({ value: currentYear - i, label: currentYear - i })); }
        },
        {
          key: 'startMonth',
          label: 'Mois de début',
          value: '',
          icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
          options: [{ value: '', label: 'Tous les mois' }, ...months.map((name, i) => ({ value: i + 1, label: name }))]
        },
        {
          key: 'endMonth',
          label: 'Mois de fin',
          value: '',
          icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
          options: [{ value: '', label: 'Tous les mois' }, ...months.map((name, i) => ({ value: i + 1, label: name }))]
        }
      ]
    };
  },

  computed: {
    hasStatisticsData() {
      return this.statistics && [this.chartDataMarket, this.chartDataOrgane, this.chartDataPole, this.chartDataMontants].some(chart => chart.series.length > 0);
    },
    chartHeight() {
      return this.windowWidth < 640 ? 300 : this.windowWidth < 1024 ? 350 : 480;
    },
    stats() {
      return [
        { key: 'activites', label: 'Total Activités', value: this.totalActivites, icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', iconClass: 'bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-600' },
        { key: 'estimatif', label: 'Montant Estimatif', value: this.totalMontantEstimatif, icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1', iconClass: 'bg-gradient-to-br from-cyan-100 to-blue-100 text-cyan-600' },
        { key: 'attribue', label: 'Montant Attribué', value: this.totalMontantReel, icon: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z', iconClass: 'bg-gradient-to-br from-emerald-100 to-green-100 text-emerald-600' }
      ];
    },
    charts() {
      return [
        { key: 'market', title: '📊 Marchés par type', type: 'bar', data: this.chartDataMarket },
        { key: 'organe', title: '📋 Marchés par organe de contrôle', type: 'bar', data: this.chartDataOrgane },
        { key: 'pole', title: '📊 Marchés par pôle', type: 'bar', data: this.chartDataPole },
        { key: 'montants', title: '💰 Montant Prévu vs Réalisé', type: 'bar', data: this.chartDataMontants }
      ];
    }
  },

  mounted() {
    this.fetchStatistics();
    window.addEventListener('resize', this.handleResize);
    this.filters.forEach(filter => {
      this.$watch(`filters.${this.filters.indexOf(filter)}.value`, (newVal) => {
        this[filter.key === 'year' ? 'selectedYear' : filter.key] = newVal;
      });
    });
  },

  beforeUnmount() {
    window.removeEventListener('resize', this.handleResize);
  },

  methods: {
    handleResize() { this.windowWidth = window.innerWidth; },
    formatNumber(value) { return new Intl.NumberFormat('fr-FR').format(value); },
    
    resetAllCharts() {
      [this.chartDataMarket, this.chartDataOrgane, this.chartDataPole, this.chartDataMontants].forEach(chart => {
        chart.series = [];
        chart.options = {};
      });
      this.totalMontantEstimatif = this.totalMontantReel = this.totalActivites = 0;
    },

    createStackedChartData(data, title) {
      if (!data || data.length === 0) return { series: [], options: {} };
      const categories = data.map(item => item._id);
      const allNiveaux = new Set();
      data.forEach(item => item.niveauxExecution?.forEach(niveau => niveau.niveau && allNiveaux.add(niveau.niveau)));
      const niveauxArray = Array.from(allNiveaux);
      const series = niveauxArray.map(niveau => ({
        name: niveau || 'Non défini',
        data: categories.map(category => {
          const categoryItem = data.find(item => item._id === category);
          const niveauItem = categoryItem?.niveauxExecution?.find(n => n.niveau === niveau);
          return niveauItem ? niveauItem.count : 0;
        })
      }));
      const totalsPerCategory = categories.map(category => data.find(item => item._id === category)?.total || 0);
      const options = {
        ...this.baseStackedChartOptions,
        xaxis: { ...this.baseStackedChartOptions.xaxis, categories },
        colors: niveauxArray.map((niveau, index) => this.niveauExecutionColors[niveau] || this.modernColors[index % this.modernColors.length]),
        plotOptions: {
          bar: {
            ...this.baseStackedChartOptions.plotOptions.bar,
            dataLabels: {
              total: {
                enabled: true, offsetX: 0, offsetY: -5,
                style: { fontSize: '12px', fontWeight: 600, color: '#374151' },
                formatter: (val, opts) => totalsPerCategory[opts.dataPointIndex]
              }
            }
          }
        }
      };
      return { series, options };
    },

    fetchStatistics() {
      if (!this.can('read', 'Statistique')) {
        this.isLoading = false;
        return;
      }

      this.isLoading = true;
      this.statistics = null;
      this.resetAllCharts();

      const params = {
        year: this.selectedYear,
        ...(this.startMonth && { startMonth: this.startMonth }),
        ...(this.endMonth && { endMonth: this.endMonth })
      };

      axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/getStatistiques`, { params })
        .then((response) => {
          this.isLoading = false;
          this.statistics = response.data;

          if (!this.statistics) return;

          this.totalMontantEstimatif = this.statistics.sommeMontantEstimatif || 0;
          this.totalMontantReel = this.statistics.MontantReel || 0;
          this.totalActivites = this.statistics.constantes?.totauxGeneraux?.nombreTotalActivites || 0;

          // Graphiques empilés
          this.chartDataMarket = this.createStackedChartData(this.statistics.activitéParTypeMarché, "Types de marché");
          this.chartDataOrgane = this.createStackedChartData(this.statistics.activitéParOrganeDeControle, "Organes de contrôle");
          this.chartDataPole = this.createStackedChartData(this.statistics.activitéParPole, "Pôles");

          // Graphique des montants
          if (this.totalMontantEstimatif > 0 || this.totalMontantReel > 0) {
            this.chartDataMontants = {
              series: [
                { name: "Montant Estimatif", data: [this.totalMontantEstimatif] },
                { name: "Montant Attribué", data: [this.totalMontantReel] }
              ],
              options: {
                chart: { type: "bar", toolbar: { show: false }, foreColor: '#374151', fontFamily: 'Inter, system-ui, sans-serif' },
                plotOptions: { bar: { horizontal: false, columnWidth: "50%", borderRadius: 8, distributed: false } },
                dataLabels: { enabled: false },
                xaxis: { categories: ["Montants"], labels: { style: { fontSize: '12px', fontWeight: '500' } }, axisBorder: { show: false }, axisTicks: { show: false } },
                yaxis: {
                  title: { text: "Montants (en unités)", style: { fontSize: '14px', fontWeight: '600' } },
                  labels: { formatter: (value) => this.formatNumber(value), style: { fontSize: '12px' } }
                },
                colors: ["#667eea", "#43e97b"],
                legend: { show: true, position: "bottom", horizontalAlign: "center" },
                tooltip: { y: { formatter: (value) => this.formatNumber(value) + ' unités' } },
                grid: { borderColor: "#e5e7eb", strokeDashArray: 3, xaxis: { lines: { show: false } } }
              }
            };
          }
        })
        .catch((error) => {
          this.isLoading = false;
          console.error("❌ Erreur lors de la récupération des statistiques:", error);
          this.resetAllCharts();
        });
    }
  }
};
</script>

<style scoped>
.enhanced-select {
  @apply w-full px-4 py-3 border border-gray-300 rounded-xl text-sm text-gray-700 
         bg-white/80 backdrop-blur-sm transition-all duration-200
         focus:ring-4 focus:ring-blue-100 focus:border-blue-500 focus:outline-none
         hover:border-gray-400 hover:shadow-md;
}

.enhanced-button {
  @apply w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 
         hover:from-blue-700 hover:to-indigo-700 text-white font-semibold 
         rounded-xl shadow-lg hover:shadow-xl transition-all duration-300
         focus:outline-none focus:ring-4 focus:ring-blue-200
         disabled:opacity-50 disabled:cursor-not-allowed
         disabled:hover:from-blue-600 disabled:hover:to-indigo-600;
}

.stat-card {
  @apply bg-white rounded-xl shadow-lg border border-gray-100 p-6 flex items-center space-x-4 transition-all duration-300 transform hover:scale-105;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.stat-card:hover {
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.stat-icon {
  @apply w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0;
}

.stat-content {
  @apply flex-1 min-w-0;
}

.stat-label {
  @apply text-sm font-medium text-gray-600 truncate;
}

.stat-value {
  @apply text-2xl font-bold text-gray-900 truncate;
}

.chart-card {
  @apply bg-white shadow-lg rounded-xl border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300;
}

.chart-header {
  @apply p-4 sm:p-6 border-b border-gray-100;
}

.chart-title {
  @apply text-lg sm:text-xl font-semibold text-gray-900 truncate;
}

.chart-container {
  @apply p-4 sm:p-6;
}

.no-data-message {
  @apply flex items-center justify-center h-64 text-gray-500 text-center;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease-in-out;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

@media (max-width: 640px) {
  .chart-title { @apply text-base; }
  .chart-container { @apply px-2 py-4; }
  .stat-card { @apply p-4 space-x-3; }
  .stat-icon { @apply w-10 h-10; }
  .stat-value { @apply text-xl; }
}

@media (min-width: 641px) and (max-width: 1024px) {
  .chart-container { @apply p-4; }
}

@media (min-width: 1280px) {
  .container { max-width: 1280px; }
}
</style> 
