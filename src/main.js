import { createApp } from 'vue';
import PrimeVue from 'primevue/config';
import Aura from '@primevue/themes/aura'; // Or your preferred theme
import App from './App.vue';

// IMPORTANT: This provides the UnoCSS utility classes
import 'virtual:uno.css';
// IMPORTANT: This resets browser defaults so it's not all black/weird
import '@unocss/reset/tailwind.css'; 

const app = createApp(App);

app.use(PrimeVue, {
    theme: {
        preset: Aura,
        options: {
            darkModeSelector: '.my-app-dark', // Prevents forced dark mode if not wanted
        }
    }
});

app.mount('#app');