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
        <RouterLink to="/menu" class="opcion">
          <i class="fas fa-home"></i> Inicio
        </RouterLink>

        <RouterLink v-if="isAdmin" to="/libros" class="opcion">
          <i class="fas fa-book"></i> Libros
        </RouterLink>
        <a v-else class="opcion" href="javascript:void(0);" @click.prevent>
          <i class="fas fa-book"></i> Libros
        </a>

        <RouterLink v-if="isAdmin" to="/prestamos" class="opcion">
          <i class="fas fa-hourglass-half"></i> Préstamos
        </RouterLink>
        <a v-else class="opcion" href="javascript:void(0);" @click.prevent>
          <i class="fas fa-hourglass-half"></i> Préstamos
        </a>

        <RouterLink v-if="isAdmin" to="/estudiantes" class="opcion">
          <i class="fas fa-user-graduate"></i> Estudiantes
        </RouterLink>
        <a v-else class="opcion" href="javascript:void(0);" @click.prevent>
          <i class="fas fa-user-graduate"></i> Estudiantes
        </a>

        <div class="submenu" :class="{ open: submenuOpen }" ref="submenuRef">
          <a href="javascript:void(0);" class="opcion" @click="toggleSubmenu">
            <span><i class="fas fa-cogs"></i> Administración</span>
            <i class="fas fa-chevron-down flecha-abajo"></i>
          </a>

          <ul class="subopciones">
            <li>
              <RouterLink v-if="isAdmin" to="/usuarios">
                <i class="fas fa-users"></i> Usuarios
              </RouterLink>
              <a v-else href="javascript:void(0);" @click.prevent>
                <i class="fas fa-users"></i> Usuarios
              </a>
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

    <main class="contenido">
      <h1 class="titulo">Panel de Administración</h1>

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

      <section class="panel">
        <h2 class="panel-titulo">Catálogo de Libros</h2>

        <div class="filtros-caja">
          <div class="filtro-grupo">
            <label>Filtrar por:</label>
            <select class="filtro-select" v-model="filtroCampo">
              <option value="todo">Todo</option>
              <option value="materia">Materia</option>
              <option value="autor">Autor</option>
              <option value="isbn">ISBN</option>
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

          <!-- BOTONES CON ÍCONOS (como en tu código antiguo) -->
          <button class="btn-filtrar" @click="aplicarFiltros">
            <i class="fas fa-filter"></i> Aplicar
          </button>

          <button class="btn-limpiar" @click="limpiarFiltros">
            <i class="fas fa-times"></i> Limpiar
          </button>
        </div>

        <div class="paginacion-barra" v-if="librosMostrados.length > 0">
          <button class="btn-pag" :disabled="paginaActual === 1" @click="irAnterior">
            ‹ Anterior
          </button>

          <span class="pag-info">
            Página {{ paginaActual }} de {{ totalPaginas }}
          </span>

          <button class="btn-pag" :disabled="paginaActual === totalPaginas" @click="irSiguiente">
            Siguiente ›
          </button>
        </div>

        <div class="resultados-caja">
          <div class="libros-grid">
            <div class="libro-card" v-for="libro in librosPaginados" :key="libro.isbn">
              <div class="libro-imagen">
                <img v-if="libro.logo" :src="libro.logo" :alt="libro.titulo" class="img-libro" />
                <span v-else class="no-img">Sin imagen</span>

                <!-- BOTÓN PDF FLOTANTE SOBRE LA IMAGEN -->
                <button
                  v-if="libro.pdf"
                  class="btn-pdf-float"
                  @click.stop="abrirPDF(libro)"
                  title="Ver PDF"
                  type="button"
                >
                  PDF
                </button>
              </div>

              <div class="libro-info">
                <h3 class="libro-titulo">{{ libro.titulo }}</h3>
                <p class="libro-isbn">ISBN: {{ libro.isbn }}</p>

                <span class="libro-cantidad" :class="libro.cantidad > 0 ? 'disponible' : 'agotado'">
                  {{ libro.cantidad }} disponible(s)
                </span>

                <div class="libro-metadata">
                  <span>Materia: {{ libro.materia }}</span>
                  <span>Autor: {{ libro.autor }}</span>
                  <!-- QUITADO: Editorial -->
                </div>

                <!-- (Quitado) botón Ver PDF al final -->
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

const filtroCampo = ref("todo");
const filtroOperador = ref("igual");
const filtroValor = ref("");
const filtroValorRef = ref(null);

const libros = ref([]);
const librosMostrados = ref([]);

const paginaActual = ref(1);
const porPagina = 3;

const totalPaginas = computed(() =>
  Math.max(1, Math.ceil(librosMostrados.value.length / porPagina))
);

const librosPaginados = computed(() => {
  const start = (paginaActual.value - 1) * porPagina;
  return librosMostrados.value.slice(start, start + porPagina);
});

function irAnterior() {
  if (paginaActual.value > 1) paginaActual.value--;
}

function irSiguiente() {
  if (paginaActual.value < totalPaginas.value) paginaActual.value++;
}

function cargarLibros() {
  libros.value = readStorage("libros", []);
  librosMostrados.value = [...libros.value];
  paginaActual.value = 1;
}

function aplicarFiltros() {
  removerMensajesFiltro();
  const valor = filtroValor.value.toLowerCase();

  if (!valor) {
    mostrarErrorFiltro(filtroValorRef.value, "Ingrese un valor");
    librosMostrados.value = [...libros.value];
    paginaActual.value = 1;
    return;
  }

  const op = filtroOperador.value;

  const match = (text) => {
    const campo = String(text ?? "").toLowerCase();
    return op === "igual" ? campo === valor : campo.includes(valor);
  };

  librosMostrados.value = libros.value.filter((l) => {
    if (filtroCampo.value === "todo") {
      return match(l.titulo) || match(l.autor) || match(l.materia) || match(l.isbn);
    }
    return match(l[filtroCampo.value]);
  });

  paginaActual.value = 1;
}

function limpiarFiltros() {
  filtroValor.value = "";
  filtroCampo.value = "todo";
  filtroOperador.value = "igual";
  librosMostrados.value = [...libros.value];
  paginaActual.value = 1;
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
  const win = window.open();
  if (!win) return;
  win.document.write(`
    <html>
      <body style="margin:0">
        <iframe src="${libro.pdf}" style="width:100%;height:100vh" frameborder="0"></iframe>
      </body>
    </html>
  `);
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

/* ===== PAGINACIÓN (estilo original bonito) ===== */
.paginacion-barra {
  padding: 14px 20px 0;
  display: flex;
  align-items: center;
  gap: 12px;
}

.pag-info {
  font-size: 14px;
  color: #374151;
  font-weight: 600;
}

.btn-pag {
  border: 1px solid #d1d5db;
  background: #ffffff;
  padding: 6px 12px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  color: #111827;
  transition: background 0.2s, border 0.2s;
}

.btn-pag:hover:not(:disabled) {
  background: #f3f4f6;
  border-color: #9ca3af;
}

.btn-pag:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ===== BOTÓN PDF FLOTANTE SOBRE LA IMAGEN ===== */
.libro-imagen {
  position: relative;
}

.btn-pdf-float {
  position: absolute;
  right: 10px;
  bottom: 10px;
  padding: 6px 10px;
  border-radius: 10px;
  border: 1px solid #d1d5db;
  background: rgba(255, 255, 255, 0.95);
  cursor: pointer;
  font-weight: 800;
  font-size: 12px;
  letter-spacing: 0.5px;
}

.btn-pdf-float:hover {
  filter: brightness(0.98);
}
</style>
