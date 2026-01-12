<template>
  <div class="menu-page">
    <aside class="menu">
      <div class="menu-superior">
        <div class="usuario-caja">
          <div class="avatar">
            <img src="/Imágenes/User.png" alt="Usuario" />
          </div>
          <div>
            <p class="nombre">{{ userName }}</p>
            <p class="rol">{{ userRole }}</p>
          </div>
        </div>
      </div>

      <nav class="opciones">
        <!-- Inicio: SIEMPRE -->
        <RouterLink to="/menu" class="opcion">
          <i class="fas fa-home"></i> Inicio
        </RouterLink>

        <!-- Libros (solo Admin navega) -->
        <RouterLink v-if="isAdmin" to="/libros" class="opcion">
          <i class="fas fa-book"></i> Libros
        </RouterLink>
        <a v-else class="opcion" href="javascript:void(0);" @click.prevent>
          <i class="fas fa-book"></i> Libros
        </a>

        <!-- Préstamos (solo Admin navega) -->
        <RouterLink v-if="isAdmin" to="/prestamos" class="opcion">
          <i class="fas fa-hourglass-half"></i> Préstamos
        </RouterLink>
        <a v-else class="opcion" href="javascript:void(0);" @click.prevent>
          <i class="fas fa-hourglass-half"></i> Préstamos
        </a>

        <!-- Estudiantes (solo Admin navega) -->
        <RouterLink v-if="isAdmin" to="/estudiantes" class="opcion">
          <i class="fas fa-user-graduate"></i> Estudiantes
        </RouterLink>
        <a v-else class="opcion" href="javascript:void(0);" @click.prevent>
          <i class="fas fa-user-graduate"></i> Estudiantes
        </a>

        <!-- Administración (se puede abrir para TODOS) -->
        <div class="submenu" :class="{ open: submenuOpen }" ref="submenuRef">
          <a href="javascript:void(0);" class="opcion" @click="toggleSubmenu">
            <span><i class="fas fa-cogs"></i> Administración</span>
            <i class="fas fa-chevron-down flecha-abajo"></i>
          </a>

          <ul class="subopciones">
            <!-- Usuarios (solo Admin navega) -->
            <li>
              <RouterLink v-if="isAdmin" to="/usuarios">
                <i class="fas fa-users"></i> Usuarios
              </RouterLink>
              <a v-else href="javascript:void(0);" @click.prevent>
                <i class="fas fa-users"></i> Usuarios
              </a>
            </li>

            <!-- Cambio de clave (SIEMPRE) -->
            <li>
              <a href="javascript:void(0);" @click="abrirCambioClave">
                <i class="fas fa-key"></i> Cambio de clave
              </a>
            </li>
          </ul>
        </div>
      </nav>
    </aside>

    <main class="contenido">
      <h1 class="titulo">Panel de Administración</h1>

      <!-- Tarjetas (solo Admin navega) -->
      <section class="tarjetas">
        <RouterLink v-if="isAdmin" to="/libros" class="tarjeta">
          <span class="ico"><i class="fas fa-book"></i></span>
          <span class="texto">Libros</span>
        </RouterLink>
        <a v-else class="tarjeta" href="javascript:void(0);" @click.prevent>
          <span class="ico"><i class="fas fa-book"></i></span>
          <span class="texto">Libros</span>
        </a>

        <RouterLink v-if="isAdmin" to="/prestamos" class="tarjeta">
          <span class="ico"><i class="fas fa-hourglass-half"></i></span>
          <span class="texto">Préstamos</span>
        </RouterLink>
        <a v-else class="tarjeta" href="javascript:void(0);" @click.prevent>
          <span class="ico"><i class="fas fa-hourglass-half"></i></span>
          <span class="texto">Préstamos</span>
        </a>

        <RouterLink v-if="isAdmin" to="/estudiantes" class="tarjeta">
          <span class="ico"><i class="fas fa-user-graduate"></i></span>
          <span class="texto">Estudiantes</span>
        </RouterLink>
        <a v-else class="tarjeta" href="javascript:void(0);" @click.prevent>
          <span class="ico"><i class="fas fa-user-graduate"></i></span>
          <span class="texto">Estudiantes</span>
        </a>
      </section>

      <!-- Catálogo de libros: SIEMPRE visible -->
      <section class="panel">
        <h2 class="panel-titulo">Catálogo de Libros</h2>

        <div class="filtros-caja">
          <div class="filtro-grupo">
            <label>Filtrar por:</label>
            <select class="filtro-select" v-model="filtroCampo">
              <option value="materia">Materia</option>
              <option value="autor">Autor</option>
              <option value="editorial">Editorial</option>
            </select>
          </div>

          <div class="filtro-grupo">
            <label>Es igual a:</label>
            <select class="filtro-select" v-model="filtroOperador">
              <option value="igual">Igual</option>
              <option value="contiene">Contiene</option>
            </select>
          </div>

          <div class="filtro-grupo">
            <label>Valor:</label>
            <input
              ref="filtroValorRef"
              class="filtro-input"
              v-model.trim="filtroValor"
              placeholder="Escribe para filtrar..."
              @keydown.enter.prevent="aplicarFiltros"
              @input="removerMensajesFiltro"
            />
          </div>

          <button class="btn-filtrar" @click="aplicarFiltros">
            <i class="fas fa-filter"></i> Aplicar
          </button>

          <button class="btn-limpiar" @click="limpiarFiltros">
            <i class="fas fa-times"></i> Limpiar
          </button>
        </div>

        <div class="resultados-caja">
          <div class="libros-grid">
            <template v-if="librosMostrados.length === 0">
              <div class="libro-vacio">
                <i class="fas fa-search"></i>
                <p>No hay libros registrados</p>
              </div>
            </template>

            <div class="libro-card" v-for="libro in librosMostrados" :key="libro.isbn">
              <div class="libro-imagen">
                <img v-if="libro.logo" :src="libro.logo" :alt="libro.titulo" class="img-libro" />
                <span v-else class="no-img">Sin imagen</span>
              </div>

              <div class="libro-info">
                <h3 class="libro-titulo">{{ libro.titulo }}</h3>
                <p class="libro-isbn"><strong>ISBN:</strong> {{ libro.isbn }}</p>

                <span class="libro-cantidad" :class="libro.cantidad > 0 ? 'disponible' : 'agotado'">
                  <i class="fas" :class="libro.cantidad > 0 ? 'fa-check' : 'fa-times'"></i>
                  {{ libro.cantidad }} disponible(s)
                </span>

                <div class="libro-metadata">
                  <span><strong>Materia:</strong> {{ libro.materia }}</span>
                  <span><strong>Autor:</strong> {{ libro.autor }}</span>
                  <span><strong>Editorial:</strong> {{ libro.editorial }}</span>
                </div>

                <div v-if="libro.pdf" style="margin-top: 12px;">
                  <button class="btn-ver-pdf" @click.stop="abrirPDF(libro)">
                    Ver PDF
                  </button>
                </div>
                <div v-else style="margin-top:12px; font-size:13px; color:#6b7280;">
                  PDF no disponible
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from "vue";
import { readStorage } from "../scripts/storage";
import { mostrarErrorFiltro, removerMensajesFiltro } from "../scripts/Menu";

const userName = ref(localStorage.getItem("userName") || "Usuario");
const userRole = ref(localStorage.getItem("userRole") || "Usuario");
const isAdmin = computed(() => userRole.value === "Admin");

const submenuOpen = ref(false);
const submenuRef = ref(null);

const filtroCampo = ref("materia");
const filtroOperador = ref("igual");
const filtroValor = ref("");
const filtroValorRef = ref(null);

const libros = ref([]);
const librosMostrados = ref([]);

function cargarLibros() {
  libros.value = readStorage("libros", []);
  librosMostrados.value = [...libros.value];
}

function aplicarFiltros() {
  removerMensajesFiltro();
  const valor = filtroValor.value.toLowerCase();

  if (!valor) {
    mostrarErrorFiltro(filtroValorRef.value, "Ingrese un valor");
    librosMostrados.value = [...libros.value];
    return;
  }

  librosMostrados.value = libros.value.filter((l) => {
    const campo = String(l[filtroCampo.value] ?? "").toLowerCase();
    return filtroOperador.value === "igual" ? campo === valor : campo.includes(valor);
  });
}

function limpiarFiltros() {
  filtroValor.value = "";
  filtroCampo.value = "materia";
  filtroOperador.value = "igual";
  librosMostrados.value = [...libros.value];
  removerMensajesFiltro();
}

function toggleSubmenu() {
  submenuOpen.value = !submenuOpen.value;
}

function handleDocClick(e) {
  if (!submenuRef.value) return;
  if (!submenuRef.value.contains(e.target)) submenuOpen.value = false;
}

function abrirCambioClave() {
  localStorage.setItem("abrirCambioClave", "1");
  window.dispatchEvent(new Event("open-cambio-clave"));
  submenuOpen.value = false;
}

function abrirPDF(libro) {
  if (!libro.pdf) return;

  setTimeout(() => {
    const nuevaPestana = window.open();
    if (!nuevaPestana) return;

    nuevaPestana.document.write(`
      <html>
        <head><title>${libro.titulo}</title></head>
        <body style="margin:0">
          <iframe src="${libro.pdf}" style="width:100%;height:100vh;" frameborder="0"></iframe>
        </body>
      </html>
    `);
  }, 100);
}

onMounted(() => {
  cargarLibros();
  document.addEventListener("click", handleDocClick);
  window.addEventListener("storage", cargarLibros);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", handleDocClick);
  window.removeEventListener("storage", cargarLibros);
});
</script>

<style>
@import "../styles/Menu.css";

/* Estilo del botón Ver PDF */
.btn-ver-pdf {
  background-color: #0ea5a5;
  color: #fff;
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  transition: background 0.2s;
}

.btn-ver-pdf:hover {
  background-color: #0d9488;
}
</style>
