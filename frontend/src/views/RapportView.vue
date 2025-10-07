<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
    <div class="container mx-auto px-4 py-8 space-y-8">
      <!-- En-tête du rapport -->
      <div class="text-center mb-6">
        <h1 class="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
          Rapport - Statistiques
        </h1>
      </div>

      <!-- Filtres améliorés -->
      <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 mb-8">
        <div class="grid grid-cols-1 lg:grid-cols-4 gap-6 items-end">
          <div class="space-y-2">
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              <span class="flex items-center">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
                Année
              </span>
            </label>
            <select v-model="selectedYear" class="enhanced-select">
              <option v-for="year in years" :key="year" :value="year">{{ year }}</option>
            </select>
          </div>

          <div class="space-y-2">
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              <span class="flex items-center">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                Mois de début
              </span>
            </label>
            <select v-model="startMonth" class="enhanced-select">
              <option value="">Tous les mois</option>
              <option v-for="(name, index) in months" :key="'start' + index" :value="index + 1">
                {{ name }}
              </option>
            </select>
          </div>

          <div class="space-y-2">
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              <span class="flex items-center">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                Mois de fin
              </span>
            </label>
            <select v-model="endMonth" class="enhanced-select">
              <option value="">Tous les mois</option>
              <option v-for="(name, index) in months" :key="'end' + index" :value="index + 1">
                {{ name }}
              </option>
            </select>
          </div>

          <div class="space-y-2">
            <label class="block text-sm font-semibold text-gray-700 mb-2 opacity-0">Action</label>
            <button 
              @click="fetchStatistics" 
              class="enhanced-button group w-full"
              :disabled="isLoading"
            >
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
      <div v-if="statistic" class="space-y-8">
        <!-- Statistiques par mode de passation -->
        <div class="modern-card">
          <div class="card-header">
            <div class="header-icon bg-gradient-to-r from-green-500 to-emerald-500">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
            </div>
            <div>
              <h2 class="card-title">Statistiques par mode de passation</h2>
            </div>
          </div>
          
          <div class="overflow-hidden rounded-xl border border-gray-200">
            <table class="enhanced-table">
              <thead class="bg-gradient-to-r from-gray-50 to-blue-50">
                <tr>
                  <th rowspan="2" class="table-header-cell sticky-header">Type de mode de passation</th>
                  <th colspan="2" class="table-header-cell text-center border-l">
                    <span class="inline-flex items-center">
                      <span class="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                      Prévision
                    </span>
                  </th>
                  <th colspan="3" class="table-header-cell text-center border-l">
                    <span class="inline-flex items-center">
                      <span class="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                      Réalisation
                    </span>
                  </th>
                </tr>
                <tr>
                  <th class="table-sub-header border-l">Nombre</th>
                  <th class="table-sub-header">Montant</th>
                  <th class="table-sub-header border-l">Nombre</th>
                  <th class="table-sub-header">Pourcentage</th>
                  <th class="table-sub-header">Montant</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="statistic.activiteParMode.length === 0" class="empty-row">
                  <td colspan="6" class="text-center py-12 text-gray-500">
                    <div class="flex flex-col items-center">
                      <svg class="w-12 h-12 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.562M15 6.306a7.962 7.962 0 00-6 0m6 0a7.962 7.962 0 016 2.562 7.962 7.962 0 01-6 2.562"></path>
                      </svg>
                      <p class="text-lg font-medium">Aucun résultat trouvé</p>
                      <p class="text-sm">Essayez de modifier vos filtres</p>
                    </div>
                  </td>
                </tr>
                <tr v-for="activite in statistic.activiteParMode" :key="activite._id" class="table-row hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50">
                  <td class="table-cell font-semibold text-gray-800">{{ activite._id || 'Non spécifié' }}</td>
                  <td class="table-cell text-center">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {{ activite.count }}
                    </span>
                  </td>
                  <td class="table-cell text-right font-mono text-sm">
                    {{ activite.totalMontantEstimatif.toLocaleString() }} <span class="text-gray-500 text-xs">F CFA</span>
                  </td>
                  <td class="table-cell text-center border-l">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {{ statistic.activiteDemarerParMode.find(a => a._id === activite._id)?.count || 0 }}
                    </span>
                  </td>
                  <td class="table-cell text-center">
                    <div class="flex items-center justify-center">
                      <div class="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div class="bg-gradient-to-r from-green-400 to-emerald-500 h-2 rounded-full transition-all duration-500" 
                             :style="`width: ${Math.min(((statistic.activiteDemarerParMode.find(a => a._id === activite._id)?.count || 0) / activite.count) * 100, 100)}%`">
                        </div>
                      </div>
                      <span class="text-sm font-semibold text-gray-700">
                        {{ (((statistic.activiteDemarerParMode.find(a => a._id === activite._id)?.count || 0) / activite.count) * 100).toFixed(1) }}%
                      </span>
                    </div>
                  </td>
                  <td class="table-cell text-right font-mono text-sm">
                    {{ (statistic.activiteDemarerParMode.find(a => a._id === activite._id)?.totalMontantAttribué || 0).toLocaleString() }} 
                    <span class="text-gray-500 text-xs">F CFA</span>
                  </td>
                </tr>
              </tbody>
              <tfoot v-if="statistic.activiteParMode.length > 0">
                <tr class="bg-gradient-to-r from-gray-100 to-blue-100 font-bold text-gray-800">
                  <td class="table-cell">
                    <span class="flex items-center">
                      <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                      </svg>
                      Total
                    </span>
                  </td>
                  <td class="table-cell text-center">{{ totalStats.totalPrevisionCount }}</td>
                  <td class="table-cell text-right font-mono">{{ totalStats.totalPrevisionMontant.toLocaleString() }} F CFA</td>
                  <td class="table-cell text-center border-l">{{ totalStats.totalRealisationCount }}</td>
                  <td class="table-cell text-center">
                    <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                      {{ ((totalStats.totalRealisationCount / totalStats.totalPrevisionCount) * 100).toFixed(1) }}%
                    </span>
                  </td>
                  <td class="table-cell text-right font-mono">{{ totalStats.totalRealisationMontant.toLocaleString() }} F CFA</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <!-- Statistiques par type de marché -->
        <div class="modern-card">
          <div class="card-header">
            <div class="header-icon bg-gradient-to-r from-purple-500 to-pink-500">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
              </svg>
            </div>
            <div>
              <h2 class="card-title">Statistiques par type de marché</h2>
            </div>
          </div>
          
          <div class="overflow-hidden rounded-xl border border-gray-200">
            <table class="enhanced-table">
              <thead class="bg-gradient-to-r from-gray-50 to-purple-50">
                <tr>
                  <th rowspan="2" class="table-header-cell sticky-header">Type de marché</th>
                  <th colspan="2" class="table-header-cell text-center border-l">
                    <span class="inline-flex items-center">
                      <span class="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                      Prévision
                    </span>
                  </th>
                  <th colspan="3" class="table-header-cell text-center border-l">
                    <span class="inline-flex items-center">
                      <span class="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                      Réalisation
                    </span>
                  </th>
                </tr>
                <tr>
                  <th class="table-sub-header border-l">Nombre total</th>
                  <th class="table-sub-header">Montant</th>
                  <th class="table-sub-header border-l">Nombre</th>
                  <th class="table-sub-header">Pourcentage</th>
                  <th class="table-sub-header">Montant</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="statistic.activitéParTypeMarché.length === 0" class="empty-row">
                  <td colspan="6" class="text-center py-12 text-gray-500">
                    <div class="flex flex-col items-center">
                      <svg class="w-12 h-12 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.562M15 6.306a7.962 7.962 0 00-6 0m6 0a7.962 7.962 0 016 2.562 7.962 7.962 0 01-6 2.562"></path>
                      </svg>
                      <p class="text-lg font-medium">Aucun résultat trouvé</p>
                      <p class="text-sm">Essayez de modifier vos filtres</p>
                    </div>
                  </td>
                </tr>
                <tr v-for="activite in statistic.activitéParTypeMarché" :key="activite._id" class="table-row hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50">
                  <td class="table-cell font-semibold text-gray-800">{{ activite._id || 'Non spécifié' }}</td>
                  <td class="table-cell text-center">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {{ activite.count }}
                    </span>
                  </td>
                  <td class="table-cell text-right font-mono text-sm">
                    {{ activite.totalMontantEstimatif.toLocaleString() }} <span class="text-gray-500 text-xs">F CFA</span>
                  </td>
                  <td class="table-cell text-center border-l">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      {{ statistic.activitéDemarerParTypeMarché.find(a => a._id === activite._id)?.count || 0 }}
                    </span>
                  </td>
                  <td class="table-cell text-center">
                    <div class="flex items-center justify-center">
                      <div class="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div class="bg-gradient-to-r from-purple-400 to-pink-500 h-2 rounded-full transition-all duration-500" 
                             :style="`width: ${Math.min(((statistic.activitéDemarerParTypeMarché.find(a => a._id === activite._id)?.count || 0) / activite.count) * 100, 100)}%`">
                        </div>
                      </div>
                      <span class="text-sm font-semibold text-gray-700">
                        {{ (((statistic.activitéDemarerParTypeMarché.find(a => a._id === activite._id)?.count || 0) / activite.count) * 100).toFixed(1) }}%
                      </span>
                    </div>
                  </td>
                  <td class="table-cell text-right font-mono text-sm">
                    {{ (statistic.activitéDemarerParTypeMarché.find(a => a._id === activite._id)?.totalMontantAttribué || 0).toLocaleString() }} 
                    <span class="text-gray-500 text-xs">F CFA</span>
                  </td>
                </tr>
              </tbody>
              <tfoot v-if="statistic.activitéParTypeMarché.length > 0">
                <tr class="bg-gradient-to-r from-gray-100 to-purple-100 font-bold text-gray-800">
                  <td class="table-cell">
                    <span class="flex items-center">
                      <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                      </svg>
                      Total
                    </span>
                  </td>
                  <td class="table-cell text-center">{{ totalStatsParTypeMarché.totalPrevisionCount }}</td>
                  <td class="table-cell text-right font-mono">{{ totalStatsParTypeMarché.totalPrevisionMontant.toLocaleString() }} F CFA</td>
                  <td class="table-cell text-center border-l">{{ totalStatsParTypeMarché.totalRealisationCount }}</td>
                  <td class="table-cell text-center">
                    <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                      {{ ((totalStatsParTypeMarché.totalRealisationCount / totalStatsParTypeMarché.totalPrevisionCount) * 100).toFixed(1) }}%
                    </span>
                  </td>
                  <td class="table-cell text-right font-mono">{{ totalStatsParTypeMarché.totalRealisationMontant.toLocaleString() }} F CFA</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <!-- Sections simplifiées pour les autres tableaux -->
        <div v-for="(section, index) in detailSections" :key="index" class="modern-card">
          <div class="card-header cursor-pointer" @click="toggleSection(index)">
            <div class="header-icon" :class="section.iconClass">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="section.iconPath"></path>
              </svg>
            </div>
            <div class="flex-1">
              <h2 class="card-title">{{ section.title }}</h2>
            </div>
            <div class="flex items-center space-x-3">
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                {{ section.data.length }} élément{{ section.data.length > 1 ? 's' : '' }}
              </span>
              <button class="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                <svg 
                  class="w-5 h-5 text-gray-500 transform transition-transform duration-300"
                  :class="{ 'rotate-180': expandedSections.includes(index) }"
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>
            </div>
          </div>
          
          <div 
            class="overflow-hidden transition-all duration-500 ease-in-out"
            :class="expandedSections.includes(index) ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'"
          >
            <div class="px-6 pb-6">
              <div class="overflow-hidden rounded-xl border border-gray-200">
                <table class="enhanced-table">
                  <thead :class="section.headerClass">
                    <tr>
                      <th class="table-header-cell">Numéro de référence</th>
                      <th class="table-header-cell">Intitulé du marché</th>
                      <th v-for="col in section.columns" :key="col" class="table-header-cell">{{ col }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-if="section.data.length === 0" class="empty-row">
                      <td :colspan="section.columns.length + 2" class="text-center py-12 text-gray-500">
                        <div class="flex flex-col items-center">
                          <svg class="w-12 h-12 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.562M15 6.306a7.962 7.962 0 00-6 0m6 0a7.962 7.962 0 616 2.562 7.962 7.962 0 01-6 2.562"></path>
                          </svg>
                          <p class="text-lg font-medium">Aucun résultat trouvé</p>
                          <p class="text-sm">Aucune activité dans cette catégorie</p>
                        </div>
                      </td>
                    </tr>
                    <tr v-for="item in section.data" :key="item._id" :class="section.rowClass">
                      <td class="table-cell font-mono text-sm font-semibold text-blue-600">
                        {{ item.activité?.donnéesDeBase?.numRéf || item.donnéesDeBase?.numRéf }}
                      </td>
                      <td class="table-cell max-w-xs relative">
                        <div 
                          class="text-sm font-medium text-gray-900 truncate cursor-pointer hover:text-blue-600 transition-colors duration-200"
                          @click="showDescriptionModal(item.activité?.donnéesDeBase?.description || 'Description non disponible', item.activité?.donnéesDeBase?.numRéf || 'N/A')"
                          :title="item.activité?.donnéesDeBase?.description || item.donnéesDeBase?.description"
                        >
                          {{ item.activité?.donnéesDeBase?.description || item.donnéesDeBase?.description }}
                        </div>
                        <div class="absolute right-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                          </svg>
                        </div>
                      </td>
                  <td v-if="section.showDelais" class="table-cell text-center">
                    <span v-if="item.delaiPrevu" class="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                      {{ formatDate(item.delaiPrevu) }}
                    </span>
                    <span v-else class="text-gray-400">-</span>
                  </td>
                  <td class="table-cell text-center">
                    <span v-if="item.delaiReel || item.delaiReelPrevisionnel" class="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                      {{ formatDate(item.delaiReel || item.delaiReelPrevisionnel) }}
                    </span>
                    <span v-else class="text-gray-400">-</span>
                  </td>
                  <td v-if="section.showRespectDelais" class="table-cell text-center">
                    <span v-if="item.delaiReelPrevisionnel === item.delaiPrevu" class="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                      <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                      </svg>
                      Oui
                    </span>
                    <span v-else-if="item.delaiReelPrevisionnel && item.delaiPrevu" class="inline-flex items-center px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">
                      <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                      </svg>
                      Non
                    </span>
                    <span v-else class="text-gray-400">-</span>
                  </td>
                  <td v-if="section.showEtape" class="table-cell text-center">
                    <span v-if="item.etape" class="inline-flex items-center px-2 py-1 rounded-full text-xs bg-indigo-100 text-indigo-800">
                      {{ item.etape.nom }}
                    </span>
                    <span v-else class="text-gray-400">-</span>
                  </td>
                  <td v-if="section.showOrdreService" class="table-cell text-center">
                    <span v-if="item.donnéesDeBase" class="inline-flex items-center px-2 py-1 rounded-full text-xs bg-indigo-100 text-indigo-800">
                      {{ item.donnéesDeBase?.attributaire || '-'}}
                    </span>
                    <span v-else class="text-gray-400">-</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
  </div>
   </div>
    <!-- État de chargement -->
      <div v-else class="flex flex-col items-center justify-center min-h-[400px] bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20">
        <div class="relative">
          <div class="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <div class="absolute inset-0 w-20 h-20 border-4 border-transparent border-r-indigo-600 rounded-full animate-spin animate-reverse"></div>
        </div>
        <div class="mt-8 text-center">
          <h3 class="text-xl font-semibold text-gray-800 mb-2">Chargement des données</h3>
          <p class="text-gray-600">Préparation du rapport statistique...</p>
        </div>
      </div>
    </div>
</div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    const currentYear = new Date().getFullYear();
    return {
      statistic: null,
      isLoading: true,
      selectedYear: currentYear,
      startMonth: "",
      endMonth: "",
      years: Array.from({ length: 50 }, (_, i) => currentYear - i),
      months: [
        "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
        "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
      ],
      expandedSections: [], // Toutes les sections ouvertes par défaut
      showModal: false,
      modalData: {
        description: '',
        numRef: ''
      }
    };
  },
  computed: {
    totalStats() {
      if (!this.statistic) return {};
      const totalPrevisionCount = this.statistic.activiteParMode.reduce((sum, a) => sum + a.count, 0);
      const totalPrevisionMontant = this.statistic.activiteParMode.reduce((sum, a) => sum + a.totalMontantEstimatif, 0);
      const totalRealisationCount = this.statistic.activiteDemarerParMode.reduce((sum, a) => sum + a.count, 0);
      const totalRealisationMontant = this.statistic.activiteDemarerParMode.reduce((sum, a) => sum + a.totalMontantAttribué, 0);
      return { totalPrevisionCount, totalPrevisionMontant, totalRealisationCount, totalRealisationMontant };
    },
    totalStatsParTypeMarché() {
      if (!this.statistic) return {};
      const totalPrevisionCount = this.statistic.activitéParTypeMarché.reduce((sum, a) => sum + a.count, 0);
      const totalPrevisionMontant = this.statistic.activitéParTypeMarché.reduce((sum, a) => sum + a.totalMontantEstimatif, 0);
      const totalRealisationCount = this.statistic.activitéDemarerParTypeMarché.reduce((sum, a) => sum + a.count, 0);
      const totalRealisationMontant = this.statistic.activitéDemarerParTypeMarché.reduce((sum, a) => sum + a.totalMontantAttribué, 0);
      return { totalPrevisionCount, totalPrevisionMontant, totalRealisationCount, totalRealisationMontant };
    },
    detailSections() {
      if (!this.statistic) return [];
      
      return [
        {
          title: "Dossiers élaborés et transmis à l'organe de contrôle",
          data: this.statistic.ActivitesDossierAuControle || [],
          columns: ["Date prévisionnelle", "Date effective", "Respect des délais"],
          iconClass: "bg-gradient-to-r from-orange-500 to-red-500",
          iconPath: "M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.562M15 6.306a7.962 7.962 0 00-6 0m6 0a7.962 7.962 0 616 2.562 7.962 7.962 0 01-6 2.562",
          headerClass: "bg-gradient-to-r from-gray-50 to-orange-50",
          rowClass: "table-row hover:bg-gradient-to-r hover:from-orange-50 hover:to-red-50",
          showDelais: true,
          showRespectDelais: true
        },
        {
          title: "Lancement des procédures",
          data: this.statistic.ActivitesPublicationEnCours || [],
          columns: ["Date prévisionnelle", "Date effective", "Respect des délais"],
          iconClass: "bg-gradient-to-r from-blue-500 to-cyan-500",
          iconPath: "M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z",
          headerClass: "bg-gradient-to-r from-gray-50 to-blue-50",
          rowClass: "table-row hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50",
          showDelais: true,
          showRespectDelais: true
        },
        {
          title: "Réception et évaluation des offres",
          data: this.statistic.ActivitesEvaluationEnCours || [],
          columns: [ "Date", "Action"],
          iconClass: "bg-gradient-to-r from-teal-500 to-green-500",
          iconPath: "M9 5H7a2 2 0 00-2 2v6a2 2 0 002 2h2m5 0h2a2 2 0 002-2V7a2 2 0 00-2-2h-2m-5 4v6m5-6v6m-5 0l-3-3m3 3l3-3",
          headerClass: "bg-gradient-to-r from-gray-50 to-teal-50",
          rowClass: "table-row hover:bg-gradient-to-r hover:from-teal-50 hover:to-green-50",
          showEtape: true
        },
        {
          title: "Soumission des résultats à l'organe de contrôle",
          data: this.statistic.ActivitesRapportAuControle || [],
          columns: ["Date de soumission"],
          iconClass: "bg-gradient-to-r from-indigo-500 to-purple-500",
          iconPath: "M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z",
          headerClass: "bg-gradient-to-r from-gray-50 to-indigo-50",
          rowClass: "table-row hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50"
        },
        {
          title: "Notification provisoire/Publication des résultats",
          data: this.statistic.ActivitesNotification || [],
          columns: ["Date effective"],
          iconClass: "bg-gradient-to-r from-yellow-500 to-orange-500",
          iconPath: "M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z",
          headerClass: "bg-gradient-to-r from-gray-50 to-yellow-50",
          rowClass: "table-row hover:bg-gradient-to-r hover:from-yellow-50 hover:to-orange-50"
        },
        {
          title: "Marchés soumis à l'examen juridique et technique",
          data: this.statistic.ActivitesContratAuControlePourAvis || [],
          columns: ["Date de soumission"],
          iconClass: "bg-gradient-to-r from-rose-500 to-pink-500",
          iconPath: "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z",
          headerClass: "bg-gradient-to-r from-gray-50 to-rose-50",
          rowClass: "table-row hover:bg-gradient-to-r hover:from-rose-50 hover:to-pink-50"
        },
        {
          title: "Signature des marchés",
          data: this.statistic.ActivitesApprobation || [],
          columns: ["Date de signature"],
          iconClass: "bg-gradient-to-r from-emerald-500 to-teal-500",
          iconPath: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z",
          headerClass: "bg-gradient-to-r from-gray-50 to-emerald-50",
          rowClass: "table-row hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50"
        },
        {
          title: "Marchés notifiés aux titulaires",
          data: this.statistic.ActivitesContratEnregistrement || [],
          columns: ["Date de notification"],
          iconClass: "bg-gradient-to-r from-violet-500 to-purple-500",
          iconPath: "M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
          headerClass: "bg-gradient-to-r from-gray-50 to-violet-50",
          rowClass: "table-row hover:bg-gradient-to-r hover:from-violet-50 hover:to-purple-50"
        },
        {
          title: "Point des réceptions",
          data: this.statistic.ActivitesContratEnregistrement || [],
          columns: ["Date de réception"],
          iconClass: "bg-gradient-to-r from-violet-500 to-purple-500",
          iconPath: "M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
          headerClass: "bg-gradient-to-r from-gray-50 to-violet-50",
          rowClass: "table-row hover:bg-gradient-to-r hover:from-violet-50 hover:to-purple-50"
        },
        {
          title: "Point des Ordres de Service délivrés",
          data: this.statistic.ReceptionOrdreService || [],
          columns: ["Dates", "Prestataires"],
          iconClass: "bg-gradient-to-r from-violet-500 to-purple-500",
          iconPath: "M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
          headerClass: "bg-gradient-to-r from-gray-50 to-violet-50",
          rowClass: "table-row hover:bg-gradient-to-r hover:from-violet-50 hover:to-purple-50",
          showOrdreService: true
        }
      ];
    }
  },
  mounted() {
    this.fetchStatistics();
  },
  methods: {
    formatDate(dateString) {
      if (!dateString) return '-';
      const options = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        timeZone: 'UTC'
      };
      return new Date(dateString).toLocaleDateString('fr-FR', options);
    },

    toggleSection(index) {
      const sectionIndex = this.expandedSections.indexOf(index);
      if (sectionIndex > -1) {
        this.expandedSections.splice(sectionIndex, 1);
      } else {
        this.expandedSections.push(index);
      }
    },

    showDescriptionModal(description, numRef) {
      this.modalData.description = description;
      this.modalData.numRef = numRef;
      this.showModal = true;
      // Empêcher le scroll du body quand la modal est ouverte
      document.body.style.overflow = 'hidden';
    },

    closeModal() {
      this.showModal = false;
      this.modalData = { description: '', numRef: '' };
      // Réactiver le scroll du body
      document.body.style.overflow = 'auto';
    },
    
    fetchStatistics() {
      this.isLoading = true;
      const params = {
        year: this.selectedYear,
        ...(this.startMonth ? { startMonth: this.startMonth } : {}),
        ...(this.endMonth ? { endMonth: this.endMonth } : {})
      };
      
      axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/statistiques/periode`, { params })
        .then(response => {
          this.statistic = response.data;
          this.isLoading = false;
        })
        .catch(error => {
          console.error("Erreur lors de la récupération des statistiques :", error);
          this.isLoading = false;
          // Ici vous pourriez ajouter une notification d'erreur
        });
    }
  },

  // Nettoyer les event listeners au unmount
  beforeUnmount() {
    document.body.style.overflow = 'auto';
  },

  // Gérer la touche Escape pour fermer la modal
  mounted() {
    this.fetchStatistics();
    
    const handleEscape = (e) => {
      if (e.key === 'Escape' && this.showModal) {
        this.closeModal();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    
    // Nettoyer l'event listener
    this.$options.beforeUnmount = () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'auto';
    };
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

* {
  font-family: 'Inter', sans-serif;
}

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

.modern-card {
  @apply bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 
         hover:shadow-2xl transition-all duration-300;
}

.card-header {
  @apply flex items-center p-6 pb-4;
}

.header-icon {
  @apply flex items-center justify-center w-12 h-12 rounded-xl shadow-lg mr-4;
}

.card-title {
  @apply text-3xl font-bold text-gray-800 mb-1;
}

.enhanced-table {
  @apply w-full text-sm border-collapse min-w-[800px];
}

.table-header-cell {
  @apply px-6 py-4 text-center font-bold text-gray-700 border-b-2 border-gray-200
         uppercase text-xs tracking-wider;
}

.sticky-header {
  @apply sticky left-0 bg-white z-10;
}

.table-sub-header {
  @apply px-6 py-3 text-center font-semibold text-gray-600 border-b border-gray-200
         text-xs uppercase tracking-wider;
}

.table-cell {
  @apply px-6 py-4 whitespace-nowrap text-sm;
}

.empty-row {
  @apply bg-gray-50/50;
}

/* Animations personnalisées */
@keyframes spin-reverse {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(-360deg);
  }
}

.animate-reverse {
  animation-direction: reverse;
}

/* Responsive design amélioré */
@media (max-width: 1024px) {
  .container {
    @apply px-2;
  }
  
  .modern-card {
    @apply mx-2;
  }
  
  .card-header {
    @apply p-4;
  }
  
  .table-header-cell, .table-cell {
    @apply px-3 py-2;
  }
}

@media (max-width: 640px) {
  .card-title {
    @apply text-lg;
  }
  
  .header-icon {
    @apply w-10 h-10;
  }
  
  .enhanced-table {
    @apply min-w-[600px];
  }
}

/* Effets de survol personnalisés */
.table-row:hover .table-cell {
  @apply transform translate-x-1;
}

/* Barres de progression améliorées */
.table-cell .bg-gradient-to-r {
  @apply transition-all duration-1000 ease-out;
}

/* Badges améliorés */
.inline-flex.items-center.px-2\.5.py-0\.5 {
  @apply transform hover:scale-105 transition-transform duration-200;
}

/* Scrollbar personnalisée */
.overflow-x-auto::-webkit-scrollbar {
  height: 8px;
}

.overflow-x-auto::-webkit-scrollbar-track {
  @apply bg-gray-100 rounded-full;
}

.overflow-x-auto::-webkit-scrollbar-thumb {
  @apply bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full;
}

.overflow-x-auto::-webkit-scrollbar-thumb:hover {
  @apply from-blue-500 to-indigo-500;
}

/* Animation pour les sections pliables */
.max-h-0 {
  max-height: 0;
}

.max-h-screen {
  max-height: fit-content;
}

/* Overlay de la modal */
.modal-overlay {
  backdrop-filter: blur(4px);
}

/* Animation d'entrée de la modal */
@keyframes modalFadeIn {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(-10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.modal-content {
  animation: modalFadeIn 0.3s ease-out forwards;
}
</style>