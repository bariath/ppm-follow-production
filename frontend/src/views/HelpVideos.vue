<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
    <!-- Header avec titre et bouton d'upload -->
    <div class="max-w-7xl mx-auto">
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
        <div class="mb-6 lg:mb-0">
          <h1 class="text-4xl font-bold text-gray-800 mb-2">
            <i class="fas fa-video text-blue-600 mr-3"></i>
            En savoir plus
          </h1>
          <p class="text-gray-600 text-lg">Tutoriels et guides vidéo pour maîtriser la plateforme</p>
        </div>
        
        <!-- Bouton d'upload flottant -->
        <button 
          v-if="can('create','HelpVideo')" 
          @click="showUploadForm = !showUploadForm"
          class="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
        >
          <i class="fas fa-plus"></i>
          <span>Ajouter une vidéo</span>
        </button>
      </div>

      <!-- Formulaire d'upload (collapsible) -->
      <div v-if="showUploadForm && can('create','HelpVideo')" class="mb-8">
        <div class="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          <h3 class="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <i class="fas fa-upload text-blue-600"></i>
            Uploader une nouvelle vidéo
          </h3>
          <form @submit.prevent="upload" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Titre *</label>
                <input 
                  type="text" 
                  v-model="title" 
                  placeholder="Titre de la vidéo" 
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" 
                  required 
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <input 
                  type="text" 
                  v-model="description" 
                  placeholder="Description de la vidéo" 
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" 
                />
              </div>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Rôles autorisés</label>
                <select 
                  multiple 
                  v-model="roles" 
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="admin">👑 Administrateur</option>
                  <option value="manager">👨‍💼 Manager</option>
                  <option value="user">👤 Utilisateur</option>
                  <option value="viewer">👁️ Observateur</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Fichier vidéo *</label>
                <input 
                  type="file" 
                  ref="fileInput" 
                  accept="video/mp4,video/webm,video/ogg" 
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" 
                  required 
                />
              </div>
            </div>
            
            <div class="flex justify-end gap-3 pt-4">
              <button 
                type="button" 
                @click="showUploadForm = false" 
                class="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors duration-200"
              >
                Annuler
              </button>
              <button 
                type="submit" 
                class="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
              >
                <i class="fas fa-upload"></i>
                <span>Uploader</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Filtres et pagination (pour les admins) -->
      <div v-if="isAdmin" class="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div class="flex items-center gap-4">
          <label class="text-sm font-medium text-gray-700">Filtrer par rôle:</label>
          <select 
            v-model="filterRole" 
            @change="applyFilter(filterRole)"
            class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tous les rôles</option>
            <option value="admin">👑 Administrateur</option>
            <option value="manager">👨‍💼 Manager</option>
            <option value="user">👤 Utilisateur</option>
            <option value="viewer">👁️ Observateur</option>
          </select>
        </div>
        
        <div class="flex items-center gap-2">
          <button 
            @click="changePage(-1)" 
            :disabled="page <= 1"
            class="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            <i class="fas fa-chevron-left"></i>
          </button>
          <span class="px-4 py-2 text-sm text-gray-600">
            Page {{ page }} sur {{ Math.ceil(total / limit) }}
          </span>
          <button 
            @click="changePage(1)" 
            :disabled="page >= Math.ceil(total / limit)"
            class="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>
      </div>

      <!-- État de chargement -->
      <div v-if="loading" class="flex items-center justify-center py-12">
        <div class="text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p class="text-gray-600 text-lg">Chargement des vidéos...</p>
        </div>
      </div>

      <!-- Grille des vidéos -->
      <div v-else-if="videos.length > 0" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <div v-for="v in videos" :key="v.id" class="video-card bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 overflow-hidden border border-gray-100 fade-in-up">
          <!-- Vidéo -->
          <div class="relative">
            <video 
              :src="v.url" 
              controls 
              class="w-full h-48 object-cover" 
              @error="handleVideoError" 
              @loadstart="handleVideoLoadStart"
              poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23e5e7eb'%3E%3Cpath d='M8 5v14l11-7z'/%3E%3C/svg%3E"
            />
            <div class="absolute top-2 right-2">
              <span class="bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded-full">
                {{ formatSize(v.size) }}
              </span>
            </div>
          </div>
          
          <!-- Contenu -->
          <div class="p-6">
            <div class="flex items-start justify-between mb-3">
              <div class="flex-1">
                <h3 class="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">{{ v.title }}</h3>
                <p class="text-gray-600 text-sm line-clamp-2">{{ v.description }}</p>
              </div>
              
              <!-- Actions -->
              <div v-if="can('update','HelpVideo') || can('delete','HelpVideo')" class="flex items-center gap-2 ml-4">
                <button 
                  v-if="can('update','HelpVideo')" 
                  @click="startEdit(v)" 
                  class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                  title="Modifier"
                >
                  <i class="fas fa-edit"></i>
                </button>
                <button 
                  v-if="can('delete','HelpVideo')" 
                  @click="remove(v)" 
                  class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                  title="Supprimer"
                >
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
            
            <!-- Tags des rôles -->
            <div class="flex flex-wrap gap-2 mb-3">
              <span 
                v-for="role in v.roles" 
                :key="role" 
                class="role-tag inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
                :class="{
                  'bg-purple-100 text-purple-800': role === 'admin',
                  'bg-blue-100 text-blue-800': role === 'manager', 
                  'bg-green-100 text-green-800': role === 'user',
                  'bg-gray-100 text-gray-800': role === 'viewer'
                }"
              >
                <i class="fas fa-user mr-1"></i>
                {{ role }}
              </span>
            </div>
            
            <!-- Métadonnées -->
            <div class="text-xs text-gray-500 flex items-center justify-between">
              <span>
                <i class="fas fa-calendar mr-1"></i>
                {{ new Date(v.createdAt).toLocaleDateString('fr-FR') }}
              </span>
              <span>
                <i class="fas fa-file-video mr-1"></i>
                {{ v.mimeType }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- État vide -->
      <div v-else class="empty-state text-center py-12">
        <div class="text-gray-400 text-6xl mb-4">
          <i class="fas fa-video-slash"></i>
        </div>
        <h3 class="text-xl font-semibold text-gray-600 mb-2">Aucune vidéo trouvée</h3>
        <p class="text-gray-500">Aucune vidéo ne correspond à vos critères de recherche.</p>
      </div>

      <!-- Modal d'édition -->
      <div v-if="edit" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div class="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <i class="fas fa-edit text-blue-600"></i>
              Modifier la vidéo
            </h3>
            <button 
              @click="edit=null" 
              class="text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <i class="fas fa-times text-xl"></i>
            </button>
          </div>
          
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Titre</label>
              <input 
                type="text" 
                v-model="edit.title" 
                placeholder="Titre de la vidéo" 
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" 
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <input 
                type="text" 
                v-model="edit.description" 
                placeholder="Description de la vidéo" 
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" 
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Rôles autorisés</label>
              <select 
                multiple 
                v-model="edit.roles" 
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="admin">👑 Administrateur</option>
                <option value="manager">👨‍💼 Manager</option>
                <option value="user">👤 Utilisateur</option>
                <option value="viewer">👁️ Observateur</option>
              </select>
            </div>
          </div>
          
          <div class="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
            <button 
              @click="edit=null" 
              class="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors duration-200"
            >
              Annuler
            </button>
            <button 
              @click="saveEdit" 
              class="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
            >
              <i class="fas fa-save"></i>
              <span>Enregistrer</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from '@/axios';
import { usePermissions } from '@/composables/usePermissions';

export default {
  name: 'HelpVideos',
  setup() {
    const { can } = usePermissions();
    return { can };
  },
  data() {
    return { 
      loading: false, 
      videos: [], 
      page: 1, 
      limit: 12, 
      total: 0, 
      filterRole: '', 
      title: '', 
      description: '', 
      roles: ['user'], 
      edit: null,
      showUploadForm: false
    };
  },
  mounted() { this.fetch(); },
  methods: {
    async fetch() {
      this.loading = true;
      try {
        const params = { page: this.page, limit: this.limit };
        if (this.filterRole) params.role = this.filterRole;
        const res = await axios.get('/api/help-videos', { params });
        if (Array.isArray(res.data)) {
          // compat rétro si backend ancien
          this.videos = res.data;
          this.total = res.data.length;
        } else {
          this.videos = res.data.items || [];
          this.total = res.data.total || 0;
        }
      } catch (e) {
        console.error('Erreur chargement videos', e);
      } finally {
        this.loading = false;
      }
    },
    formatSize(bytes) {
      if (!bytes && bytes !== 0) return '';
      const units = ['o','Ko','Mo','Go','To'];
      let i = 0; let val = bytes;
      while (val >= 1024 && i < units.length - 1) { val /= 1024; i++; }
      return `${val.toFixed(1)} ${units[i]}`;
    },
    async upload() {
      try {
        const file = this.$refs.fileInput.files[0];
        if (!file) return;
        const form = new FormData();
        form.append('video', file);
        form.append('title', this.title);
        form.append('description', this.description);
        for (const r of this.roles) form.append('roles', r);
        await axios.post('/api/help-videos/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } });
        this.title = ''; this.description = ''; this.roles = ['user']; this.$refs.fileInput.value = '';
        this.showUploadForm = false;
        this.fetch();
      } catch (e) {
        console.error("Erreur upload", e);
      }
    },
    changePage(next) { this.page = Math.max(1, this.page + next); this.fetch(); },
    applyFilter(role) { this.filterRole = role; this.page = 1; this.fetch(); },
    startEdit(v) {
      this.edit = { id: v.id, title: v.title, description: v.description, roles: [...(v.roles||[])] };
    },
    async saveEdit() {
      try {
        const payload = { title: this.edit.title, description: this.edit.description, roles: this.edit.roles };
        await axios.put(`/api/help-videos/${this.edit.id}`, payload);
        this.edit = null;
        this.fetch();
      } catch (e) {
        console.error('Erreur sauvegarde', e);
      }
    },
    async remove(v) {
      if (!confirm('Supprimer cette vidéo ?')) return;
      try {
        await axios.delete(`/api/help-videos/${v.id}`);
        this.fetch();
      } catch (e) {
        console.error('Erreur suppression', e);
      }
    },
    handleVideoError(event) {
      console.error('Erreur vidéo:', event.target.error, 'URL:', event.target.src);
    },
    handleVideoLoadStart(event) {
      console.log('Chargement vidéo démarré:', event.target.src);
    }
  }
}
</script>

<style scoped>
/* Animations personnalisées */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-in-up {
  animation: fadeInUp 0.6s ease-out;
}

/* Limitation de lignes pour les titres et descriptions */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-clamp: 2;
}

/* Styles pour les cartes de vidéo */
.video-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.video-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

/* Styles pour les boutons avec gradients */
.gradient-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  transition: all 0.3s ease;
}

.gradient-button:hover {
  background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
}

/* Styles pour les tags de rôles */
.role-tag {
  transition: all 0.2s ease;
}

.role-tag:hover {
  transform: scale(1.05);
}

/* Styles pour le formulaire d'upload */
.upload-form {
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  border: 2px dashed #cbd5e0;
  transition: all 0.3s ease;
}

.upload-form:hover {
  border-color: #4299e1;
  background: linear-gradient(135deg, #ebf8ff 0%, #bee3f8 100%);
}

/* Animation de chargement personnalisée */
.loading-spinner {
  border: 3px solid #f3f3f3;
  border-top: 3px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Styles pour les vidéos */
video {
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

/* Responsive design amélioré */
@media (max-width: 768px) {
  .video-card {
    margin-bottom: 1rem;
  }
  
  .upload-form {
    padding: 1rem;
  }
}

/* Styles pour les états vides */
.empty-state {
  background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
  border-radius: 16px;
  border: 2px dashed #e2e8f0;
}

/* Amélioration des focus states */
input:focus, select:focus, textarea:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
}

/* Styles pour les modales */
.modal-backdrop {
  backdrop-filter: blur(4px);
  background: rgba(0, 0, 0, 0.5);
}

.modal-content {
  animation: modalSlideIn 0.3s ease-out;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
</style>


