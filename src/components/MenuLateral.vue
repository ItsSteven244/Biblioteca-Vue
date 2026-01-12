<template>
  <aside class="menu">
    <div class="menu-superior">
      <div class="usuario-caja">
        <div class="avatar">
          <img src="/Imágenes/User.png" alt="Usuario" />
        </div>
        <div>
          <p class="nombre">{{ userName }}</p>
          <p class="rol">{{ userRoleLabel }}</p>
        </div>
      </div>
    </div>

    <nav class="opciones">
      <RouterLink to="/menu" class="opcion">
        <i class="fas fa-home"></i> Inicio
      </RouterLink>

      <RouterLink to="/libros" class="opcion">
        <i class="fas fa-book"></i> Libros
      </RouterLink>

      <RouterLink to="/prestamos" class="opcion">
        <i class="fas fa-hourglass-half"></i> Préstamos
      </RouterLink>

      <RouterLink to="/estudiantes" class="opcion">
        <i class="fas fa-user-graduate"></i> Estudiantes
      </RouterLink>

      <div class="submenu" :class="{ open: submenuOpen }">
        <a href="javascript:void(0);" class="opcion" @click="submenuOpen = !submenuOpen">
          <span><i class="fas fa-cogs"></i> Administración</span>
          <i class="fas fa-chevron-down flecha-abajo"></i>
        </a>

        <ul class="subopciones">
          <li>
            <RouterLink to="/usuarios">
              <i class="fas fa-users"></i> Usuarios
            </RouterLink>
          </li>

          <li>
            <a href="javascript:void(0);" @click="abrirCambioClave">
              <i class="fas fa-key"></i> Cambio de clave
            </a>
          </li>
        </ul>
      </div>
    </nav>
  </aside>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";

const userName = ref(localStorage.getItem("userName") || "Usuario");
const userRole = ref(localStorage.getItem("userRole") || "Usuario");
const submenuOpen = ref(false);

const userRoleLabel = computed(() => {
  const r = String(userRole.value || "").trim().toLowerCase();

  if (r === "admin") return "Admin";
  if (r === "usuario") return "Usuario";

  // por si llega algo distinto, lo capitaliza
  return r ? r.charAt(0).toUpperCase() + r.slice(1) : "Usuario";
});

function abrirCambioClave() {
  window.dispatchEvent(new Event("open-cambio-clave"));
}

//refresca nombre/rol si cambian en localStorage
function syncSession() {
  userName.value = localStorage.getItem("userName") || "Usuario";
  userRole.value = localStorage.getItem("userRole") || "Usuario";
}

onMounted(() => {
  window.addEventListener("storage", syncSession);
  window.addEventListener("session-updated", syncSession); 
});

onBeforeUnmount(() => {
  window.removeEventListener("storage", syncSession);
  window.removeEventListener("session-updated", syncSession);
});
</script>
