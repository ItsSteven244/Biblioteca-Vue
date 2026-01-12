import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import "./styles/Global.css";

// ===== ADMIN POR DEFECTO (SI NO HAY USUARIOS) =====
const usuarios = JSON.parse(localStorage.getItem("usuarios"));

if (!usuarios || usuarios.length === 0) {
  localStorage.setItem(
    "usuarios",
    JSON.stringify([
      {
        id: 1,
          usuario: "e1311547390@live.uleam.edu.ec",
          password: "admin1",
          nombre: "Alex",
          rol: "Admin",
          estado: "Activo"
      }
    ])
  );
}
// ================================================

createApp(App).use(router).mount("#app");
