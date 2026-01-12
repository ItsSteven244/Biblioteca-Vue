<template>
  <div class="menu-page">
    <Menulateral />

    <main class="contenido">
      <h1 class="titulo">Préstamos</h1>

      <section class="card">
        <div class="card-top">
          <button class="btn btn-add" type="button" @click="openModalNuevo">＋</button>

          <div class="right-tools">
            <label>Buscar:</label>
            <input
              v-model.trim="busquedaInput"
              placeholder="Libro o estudiante"
              @keydown.enter.prevent="aplicarBusqueda"
            />
          </div>
        </div>

        <div class="tabla-wrapper">
          <table class="tabla">
            <thead>
              <tr>
                <th>Id</th>
                <th>Libro</th>
                <th>Estudiante</th>
                <th>Fecha Préstamo</th>
                <th>Fecha Devolución</th>
                <th>Cantidad</th>
                <th>Observación</th>
                <th>Estado</th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="p in prestamosPaginados"
                :key="p.id"
                @click="openRowActions($event, p)"
                style="cursor:pointer"
              >
                <td>{{ p.id }}</td>
                <td>{{ p.libro }}</td>
                <td>{{ p.estudiante }}</td>
                <td>{{ p.fechaPrestamo }}</td>
                <td>{{ p.fechaDevolucion }}</td>
                <td>{{ p.cantidad }}</td>
                <td>{{ p.observacion || "-" }}</td>
                <td>
                  <span class="badge" :class="p.estado === 'Entregado' ? 'disponible' : 'prestado'">
                    {{ p.estado }}
                  </span>
                </td>
              </tr>

              <tr v-if="prestamosFiltrados.length === 0">
                <td colspan="8" style="text-align:center">No hay préstamos</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="paginacion">
          <button class="btn small" type="button" @click="prevPage" :disabled="currentPage === 1">
            Anterior
          </button>

          <span class="page-ind">Página {{ currentPage }} de {{ totalPages }}</span>

          <button class="btn small" type="button" @click="nextPage" :disabled="currentPage === totalPages">
            Siguiente
          </button>
        </div>
      </section>
    </main>

    <!-- MENU EDITAR / ELIMINAR -->
    <div
      v-if="actionMenuOpen"
      class="row-actions"
      :style="{ top: actionMenuY + 'px', left: actionMenuX + 'px' }"
      @click.stop
    >
      <button type="button" class="row-actions-btn" @click="editarSeleccionado">Editar</button>
      <button type="button" class="row-actions-btn danger" @click="eliminarSeleccionado">Eliminar</button>
    </div>
    <div v-if="actionMenuOpen" class="row-actions-backdrop" @click="closeRowActions"></div>

    <!-- MODAL -->
    <div v-if="modalOpen" class="modal" @click.self="closeModal">
      <div class="modal-content">
        <h3>{{ isEditMode ? "Editar préstamo" : "Nuevo préstamo" }}</h3>

        <form @submit.prevent="guardarPrestamo">
          <div class="grid-3">
            <label class="field">
              <span class="field-label">Libro</span>

              <div style="position:relative">
                <input
                  ref="libroRef"
                  v-model.trim="form.libro"
                  placeholder="Buscar libro"
                  @input="onLibroInput"
                  @focus="onLibroInput"
                />

                <div
                  v-if="showLibrosDropdown"
                  class="dropdown-simple"
                >
                  <div v-if="librosSugeridos.length === 0" class="dropdown-hint">
                    Escribe 2 o más caracteres
                  </div>

                  <button
                    v-for="it in librosSugeridos"
                    :key="it"
                    type="button"
                    class="dropdown-item"
                    @click="selectLibro(it)"
                  >
                    {{ it }}
                  </button>
                </div>
              </div>
            </label>

            <label class="field">
              <span class="field-label">Estudiante</span>

              <div style="position:relative">
                <input
                  ref="estudianteRef"
                  v-model.trim="form.estudiante"
                  placeholder="Buscar estudiante"
                  @input="onEstudianteInput"
                  @focus="onEstudianteInput"
                />

                <div
                  v-if="showEstDropdown"
                  class="dropdown-simple"
                >
                  <div v-if="estSugeridos.length === 0" class="dropdown-hint">
                    Escribe 2 o más caracteres
                  </div>

                  <button
                    v-for="it in estSugeridos"
                    :key="it"
                    type="button"
                    class="dropdown-item"
                    @click="selectEstudiante(it)"
                  >
                    {{ it }}
                  </button>
                </div>
              </div>
            </label>

            <label class="field">
              <span class="field-label">Cant</span>
              <input ref="cantidadRef" type="number" min="1" v-model.number="form.cantidad" @input="clearUI" />
            </label>
          </div>

          <div class="grid-2">
            <label class="field">
              <span class="field-label">Fecha Préstamo</span>
              <input ref="fechaPrestamoRef" type="date" v-model="form.fechaPrestamo" @input="clearUI" />
            </label>

            <label class="field">
              <span class="field-label">Fecha Devolución</span>
              <input ref="fechaDevolucionRef" type="date" v-model="form.fechaDevolucion" @input="clearUI" />
            </label>
          </div>

          <label class="field">
            <span class="field-label">Observación</span>
            <textarea ref="obsRef" rows="3" v-model.trim="form.observacion" placeholder="Escriba una observación..." @input="clearUI"></textarea>
          </label>

          <div class="grid-2">
            <label class="field">
              <span class="field-label">Estado</span>
              <select v-model="form.estado" @change="clearUI">
                <option value="Pendiente">Pendiente</option>
                <option value="Entregado">Entregado</option>
              </select>
            </label>
            <div></div>
          </div>

          <div class="modal-actions">
            <button type="button" class="btn outline" @click="closeModal">Atrás</button>
            <button type="submit" class="btn">{{ isEditMode ? "Guardar cambios" : "Registrar" }}</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, onBeforeUnmount } from "vue";
import Menulateral from "../components/MenuLateral.vue";
import "../styles/Menu.css";

import { readStorage, writeStorage } from "../scripts/storage";
import { clearLoanToasts, clearLoanBorders, showLoanToastNear, validatePrestamo } from "../scripts/Prestamos";

const prestamos = ref([]);
const libros = ref([]);
const usuarios = ref([]);

const busquedaInput = ref("");
const busqueda = ref("");
function aplicarBusqueda() {
  busqueda.value = busquedaInput.value.trim();
}

const pageSize = ref(6);
const currentPage = ref(1);

const prestamosFiltrados = computed(() => {
  const q = busqueda.value.toLowerCase();
  if (!q) return prestamos.value;

  return prestamos.value.filter((p) => {
    const libro = String(p.libro ?? "").toLowerCase();
    const est = String(p.estudiante ?? "").toLowerCase();
    return libro.includes(q) || est.includes(q);
  });
});

const totalPages = computed(() => Math.max(1, Math.ceil(prestamosFiltrados.value.length / pageSize.value)));

const prestamosPaginados = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return prestamosFiltrados.value.slice(start, start + pageSize.value);
});

function nextPage() {
  if (currentPage.value < totalPages.value) currentPage.value++;
}
function prevPage() {
  if (currentPage.value > 1) currentPage.value--;
}

watch([busqueda, prestamos], () => {
  currentPage.value = 1;
});

const modalOpen = ref(false);
const isEditMode = ref(false);
const editIndex = ref(-1);

const libroRef = ref(null);
const estudianteRef = ref(null);
const cantidadRef = ref(null);
const fechaPrestamoRef = ref(null);
const fechaDevolucionRef = ref(null);
const obsRef = ref(null);

const form = ref({
  id: "",
  libro: "",
  estudiante: "",
  fechaPrestamo: "",
  fechaDevolucion: "",
  cantidad: 1,
  observacion: "",
  estado: "Pendiente",
});

function clearUI() {
  clearLoanToasts();
  clearLoanBorders([libroRef, estudianteRef, cantidadRef, fechaPrestamoRef, fechaDevolucionRef, obsRef]);
}

function isoHoy() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function isoMasDias(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function resetForm() {
  form.value = {
    id: "",
    libro: "",
    estudiante: "",
    fechaPrestamo: isoHoy(),
    fechaDevolucion: isoMasDias(7),
    cantidad: 1,
    observacion: "",
    estado: "Pendiente",
  };
}

function openModalNuevo() {
  isEditMode.value = false;
  editIndex.value = -1;
  resetForm();
  modalOpen.value = true;
  clearUI();
  closeRowActions();
}

function closeModal() {
  modalOpen.value = false;
  isEditMode.value = false;
  editIndex.value = -1;
  resetForm();
  clearUI();
  showLibrosDropdown.value = false;
  showEstDropdown.value = false;
}

function guardarPrestamo() {
  clearUI();

  const result = validatePrestamo({
    form: form.value,
    refs: { libroRef, estudianteRef, cantidadRef, fechaPrestamoRef, fechaDevolucionRef },
  });

  if (!result.ok) {
    showLoanToastNear(result.target, result.msg);
    return;
  }

  if (isEditMode.value && editIndex.value >= 0) {
    prestamos.value[editIndex.value] = { ...form.value };
  } else {
    const nextId = getNextId();
    prestamos.value.push({ ...form.value, id: nextId });
  }

  writeStorage("prestamos", prestamos.value);
  closeModal();
}

function getNextId() {
  const ids = prestamos.value.map((p) => Number(p.id)).filter((n) => Number.isFinite(n));
  const max = ids.length ? Math.max(...ids) : 0;
  return String(max + 1);
}

/* ===== Row actions ===== */
const actionMenuOpen = ref(false);
const actionMenuX = ref(0);
const actionMenuY = ref(0);
const selectedIndex = ref(-1);

function openRowActions(e, prestamo) {
  selectedIndex.value = prestamos.value.findIndex((p) => String(p.id) === String(prestamo.id));
  actionMenuX.value = e.clientX;
  actionMenuY.value = e.clientY;
  actionMenuOpen.value = true;
}

function closeRowActions() {
  actionMenuOpen.value = false;
  selectedIndex.value = -1;
}

function eliminarSeleccionado() {
  if (selectedIndex.value < 0) return;
  prestamos.value.splice(selectedIndex.value, 1);
  writeStorage("prestamos", prestamos.value);
  closeRowActions();
}

function editarSeleccionado() {
  if (selectedIndex.value < 0) return;

  const p = prestamos.value[selectedIndex.value];
  isEditMode.value = true;
  editIndex.value = selectedIndex.value;

  form.value = {
    id: p.id,
    libro: p.libro,
    estudiante: p.estudiante,
    fechaPrestamo: p.fechaPrestamo,
    fechaDevolucion: p.fechaDevolucion,
    cantidad: Number(p.cantidad),
    observacion: p.observacion || "",
    estado: p.estado || "Pendiente",
  };

  modalOpen.value = true;
  clearUI();
  closeRowActions();
}

/* ===== Combos (sugerencias simples) ===== */
const showLibrosDropdown = ref(false);
const librosSugeridos = ref([]);

function onLibroInput() {
  clearUI();
  const q = String(form.value.libro || "").toLowerCase().trim();

  if (q.length < 2) {
    librosSugeridos.value = [];
    showLibrosDropdown.value = true;
    return;
  }

  const pool = (libros.value || []).map((l) => {
    const t = String(l.titulo ?? "").trim();
    const i = String(l.isbn ?? "").trim();
    return i && t ? `${t} (${i})` : t || i;
  });

  librosSugeridos.value = pool
    .filter((x) => String(x).toLowerCase().includes(q))
    .slice(0, 8);

  showLibrosDropdown.value = true;
}

function selectLibro(txt) {
  form.value.libro = txt;
  showLibrosDropdown.value = false;
  clearUI();
}

const showEstDropdown = ref(false);
const estSugeridos = ref([]);

function onEstudianteInput() {
  clearUI();
  const q = String(form.value.estudiante || "").toLowerCase().trim();

  if (q.length < 2) {
    estSugeridos.value = [];
    showEstDropdown.value = true;
    return;
  }

  const pool = (usuarios.value || [])
    .filter((u) => String(u.rol || "").toLowerCase() !== "admin")
    .map((u) => {
      const n = String(u.nombre ?? "").trim();
      const e = String(u.email ?? "").trim();
      return n && e ? `${n} (${e})` : n || e;
    });

  estSugeridos.value = pool
    .filter((x) => String(x).toLowerCase().includes(q))
    .slice(0, 8);

  showEstDropdown.value = true;
}

function selectEstudiante(txt) {
  form.value.estudiante = txt;
  showEstDropdown.value = false;
  clearUI();
}

function handleOutsideClick(e) {
  const target = e.target;
  if (!target) return;

  const libroEl = libroRef.value;
  const estEl = estudianteRef.value;

  if (libroEl && target !== libroEl) showLibrosDropdown.value = false;
  if (estEl && target !== estEl) showEstDropdown.value = false;
}

onMounted(() => {
  prestamos.value = readStorage("prestamos", []);
  libros.value = readStorage("libros", []);
  usuarios.value = readStorage("usuarios", []);

  if (!form.value.fechaPrestamo) form.value.fechaPrestamo = isoHoy();
  if (!form.value.fechaDevolucion) form.value.fechaDevolucion = isoMasDias(7);

  document.addEventListener("click", handleOutsideClick);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", handleOutsideClick);
  clearLoanToasts();
});
</script>

<style>
@import "../styles/Global.css";

@import "../styles/Global.css";


.grid-3{
  display:grid;
  grid-template-columns: 2fr 2fr 1fr;
  gap:24px;
  align-items:start;
}


.grid-3 .field{
  display:flex;
  flex-direction:column;
  gap:8px;
}


.grid-3 input{
  width:100%;
  height:52px;
  padding:10px 12px;
  border:1px solid #e5e7eb;
  border-radius:12px;
  outline:none;
  font-size:14px;
  background:#fff;
}

.grid-3 input:focus{
  border-color:#0f8c8c;
  box-shadow:0 0 0 3px rgba(15,140,140,.15);
}


.dropdown-simple{
  position:absolute;
  left:0;
  right:0;
  top:calc(100% + 6px);
  background:#fff;
  border:1px solid #e5e7eb;
  border-radius:12px;
  box-shadow:0 14px 40px rgba(0,0,0,.12);
  padding:8px;
  z-index:2000;
  max-height:220px;
  overflow:auto;
}

.dropdown-hint{
  padding:10px 12px;
  font-weight:700;
  font-size:12px;
  color:#6b7280;
}

.dropdown-item{
  width:100%;
  border:none;
  text-align:left;
  background:#f3f4f6;
  padding:10px 12px;
  border-radius:10px;
  cursor:pointer;
  font-weight:800;
  margin-bottom:6px;
}

.dropdown-item:last-child{ margin-bottom:0; }
.dropdown-item:hover{ filter:brightness(.97); }


textarea{
  width:100%;
  padding:10px 12px;
  border:1px solid #e5e7eb;
  border-radius:12px;
  outline:none;
  font-size:14px;
  background:#fff;
  resize:vertical;
}
textarea:focus{
  border-color:#0f8c8c;
  box-shadow:0 0 0 3px rgba(15,140,140,.15);
}


.dropdown-simple{
  position:absolute;
  left:0;
  right:0;
  top:calc(100% + 6px);
  background:#fff;
  border:1px solid #e5e7eb;
  border-radius:12px;
  box-shadow:0 14px 40px rgba(0,0,0,.12);
  padding:8px;
  z-index:2000;
  max-height:220px;
  overflow:auto;
}

.dropdown-hint{
  padding:10px 12px;
  font-weight:700;
  font-size:12px;
  color:#6b7280;
}

.dropdown-item{
  width:100%;
  border:none;
  text-align:left;
  background:#f3f4f6;
  padding:10px 12px;
  border-radius:10px;
  cursor:pointer;
  font-weight:800;
  margin-bottom:6px;
}

.dropdown-item:last-child{ margin-bottom:0; }
.dropdown-item:hover{ filter:brightness(.97); }

textarea{
  width:100%;
  padding:10px 12px;
  border:1px solid #e5e7eb;
  border-radius:12px;
  outline:none;
  font-size:14px;
  background:#fff;
  resize:vertical;
}
</style>
