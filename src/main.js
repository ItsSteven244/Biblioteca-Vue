import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import "./styles/Global.css";

createApp(App).use(router).mount("#app");
