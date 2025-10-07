import "./assets/app.css";
import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
// Import des modules de permissions
import permissionDirective from './directives/permission'
import { useAuthStore } from './stores/authStore'

import './axios';

const app = createApp(App);

const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

app.use(pinia);
app.use(router);


// Installation de la directive de permissions
app.use(permissionDirective)

app.mount("#app");


