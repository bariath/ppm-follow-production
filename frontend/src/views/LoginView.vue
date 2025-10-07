<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-white to-indigo-200 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8 bg-white bg-opacity-90 p-10 rounded-2xl shadow-2xl">
      <div class="flex flex-col items-center">
        <img src="../assets/logo.png" alt="Logo" class="w-30 h-30 mb-4 mt-0 mb-2 mx-auto" />
        <h2 class="text-center text-3xl font-extrabold text-gray-800">Connexion à votre compte</h2>
        <p class="mt-2 text-sm text-gray-500">Bienvenue ! Veuillez vous connecter pour continuer.</p>
      </div>
      <form class="mt-8 space-y-6" @submit.prevent="login">
        <div>
          <!-- Ici vous pouvez ajouter vos champs email / mot de passe si nécessaire -->
          <button
            type="submit"
            class="w-full flex justify-center py-2 px-4 rounded-md shadow-sm text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Connexion
          </button>
        </div>
      </form>
    </div>
  </div>
</template>


  
  <script>
  import axios from 'axios';

export default {
  data() {
    return {
      username: '',
      password: ''
    };
  },
  methods: {
  async login() {
    const oauthUrl = new URL('https://pprodofficial.service-public.bj/official/login');
    oauthUrl.searchParams.append('client_id', 'asin-ppm');
    oauthUrl.searchParams.append('redirect_uri', `${import.meta.env.VITE_REDIRECT_URI}`);
    oauthUrl.searchParams.append('response_type', 'code');
    oauthUrl.searchParams.append('scope', 'openid');
    oauthUrl.searchParams.append('authError', true);
    const proxyUrl = 'https://cors-anywhere.herokuapp.com/';

    window.location.href = oauthUrl

  }
}

};
  </script>
