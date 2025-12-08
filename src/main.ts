import { createPinia } from "pinia";
import { createApp } from "vue";

import "@fontsource-variable/inter";
import App from "./App.vue";
import { i18n } from "./i18n/i18n";
import router from "./router";
import "./styles/theme.css";

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(i18n);

app.mount("#app");
