<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-100 via-white to-indigo-200 px-4 py-12">
    <div v-if="isLoading" class="flex flex-col items-center space-y-4">
      <svg class="animate-spin h-12 w-12 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle
          class="opacity-25"
          cx="12" cy="12" r="10"
          stroke="currentColor" stroke-width="4"
        ></circle>
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
        ></path>
      </svg>
      <p class="text-indigo-700 text-lg font-medium">Connexion en cours...</p>
    </div>

    <div
      v-else-if="notification.message"
      :class="[
        'max-w-md w-full rounded-lg p-4 text-center shadow-lg',
        notification.type === 'success' ? 'bg-green-100 text-green-800 border border-green-300' : 'bg-red-100 text-red-800 border border-red-300'
      ]"
    >
      {{ notification.message }}
    </div>
  </div>
</template>

<script>
import { useAuthStore } from '@/stores/authStore'
import axios from 'axios'

export default {
  data() {
    return {
      notification: {
        message: '',
        type: ''
      },
      isLoading: true,
    }
  },

  async created() {
    await this.handleCallback();
  },

  methods: {
    async handleCallback() {
      const code = this.$route.query.code;
      const authStore = useAuthStore();

      if (!code) {
        this.showError("Code d'autorisation manquant");
        return;
      }

      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/oauth/callback`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json'
          },
          credentials: 'include', // CRUCIAL pour les sessions
          body: JSON.stringify({ code })
        });

        const data = await response.json();
        this.isLoading = false;

        if (response.ok) {
        
          authStore.setUser({ session: data.session });
          this.showSuccess("Connexion réussie !");
          
          // Redirection immédiate vers le dashboard
          setTimeout(() => {
            this.$router.push('/');
          }, 1500);

        } else {
          console.error("❌ Erreur backend:", data);
          this.showError(data.error || "Erreur lors de la connexion");
        }

      } catch (error) {
        console.error("❌ Erreur réseau:", error);
        this.isLoading = false;
        this.showError("Erreur de communication avec le serveur");
      }
    },

    showSuccess(message) {
      this.notification = { message, type: 'success' };
    },

    showError(message) {
      this.notification = { message, type: 'error' };
      // Redirection vers login après 3 secondes en cas d'erreur
      setTimeout(() => {
        this.$router.push('/login');
      }, 3000);
    }
  }
}
</script>