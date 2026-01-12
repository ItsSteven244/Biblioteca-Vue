import { createRouter, createWebHistory } from "vue-router";

import Iniciose from "../views/Iniciose.vue";
import Menu from "../views/Menu.vue";
import Libros from "../views/Libros.vue";
import Usuarios from "../views/Usuarios.vue";
import Prestamos from "../views/Prestamos.vue";
import Estudiantes from "../views/Estudiantes.vue";


const routes = [
  { path: "/", redirect: "/iniciose" },
  { path: "/iniciose", component: Iniciose },
  { path: "/menu", component: Menu },
  { path: "/libros", component: Libros },
  { path: "/usuarios", component: Usuarios },
  { path: "/prestamos", component: Prestamos },
  { path: "/estudiantes", component: Estudiantes },

];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
