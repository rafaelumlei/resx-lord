import { createApp } from 'vue';
import App from './App.vue';

// Register VSCode components
import '@vscode/webview-ui-toolkit/dist/toolkit';

const mountEl = document.querySelector("#app") as HTMLElement;

// Create Vue app
const app = createApp(App, { resources: JSON.parse(decodeURIComponent(mountEl.dataset.resources as string)) });

// Mount the app
app.mount('#app');
