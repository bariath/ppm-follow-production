import axios from 'axios';
import router from '@/router';
import { useAuthStore } from '@/stores/authStore';

// Configuration de base
axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;
axios.defaults.withCredentials = true; // TRÈS IMPORTANT pour les sessions

// Pas d'ajout de header Authorization: authentification par cookie de session

// Intercepteur de réponse pour gérer les erreurs d'authentification
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const authStore = useAuthStore();
      authStore.clearTokens();
      router.push('/login');
    }
    return Promise.reject(error);
  }
);

export default axios;