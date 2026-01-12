<template>
  <div class="menu-page">
    <Menulateral />

    <main class="contenido">
      <h1 class="titulo">Estudiantes</h1>

      <section class="card">
        <div class="card-top">
          <button class="btn btn-add" type="button" @click="openModalNuevo">＋</button>

          <div class="right-tools">
            <label>Buscar:</label>
            <input
              v-model.trim="busquedaInput"
              placeholder="DNI, código o nombre"
              @keydown.enter.prevent="aplicarBusqueda"
            />
          </div>
        </div>

        <div class="tabla-wrapper">
          <table class="tabla">
            <thead>
              <tr>
                <th>Código</th>
                <th>DNI</th>
                <th>Nombre</th>
                <th>Carrera</th>
                <th>Dirección</th>
                <th>Teléfono</th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="e in estudiantesPaginados"
                :key="e.codigo"
                @click="openRowActions($event, e)"
                style="cursor:pointer"
              >
                <td>{{ e.codigo }}</td>
                <td>{{ e.dni }}</td>
                <td>{{ e.nombre }}</td>
                <td>{{ e.carrera }}</td>
                <td>{{ e.direccion }}</td>
                <td>{{ e.telefono }}</td>
              </tr>

              <tr v-if="estudiantesFiltrados.length === 0">
                <td colspan="6" style="text-align:center">No hay estudiantes</td>
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
        <h3>{{ isEditMode ? "Editar estudiante" : "Nuevo estudiante" }}</h3>

        <form @submit.prevent="guardarEstudiante">
          <div class="grid-2">
            <label class="field">
              <span class="field-label">Código</span>
              <input
                ref="codigoRef"
                v-model.trim="form.codigo"
                placeholder="Ej: 12-34"
                @input="clearUI"
              />
            </label>

            <label class="field">
              <span class="field-label">DNI</span>
              <input
                ref="dniRef"
                v-model.trim="form.dni"
                inputmode="numeric"
                placeholder="10 dígitos"
                @input="clearUI"
              />
            </label>
          </div>

          <div class="grid-2">
            <label class="field">
              <span class="field-label">Nombre</span>
              <input ref="nombreRef" v-model.trim="form.nombre" @input="clearUI" />
            </label>

            <label class="field">
              <span class="field-label">Carrera</span>
              <input ref="carreraRef" v-model.trim="form.carrera" @input="clearUI" />
            </label>
          </div>

          <div class="grid-2">
            <label class="field">
              <span class="field-label">Dirección</span>
              <input ref="direccionRef" v-model.trim="form.direccion" @input="clearUI" />
            </label>

            <label class="field">
              <span class="field-label">Teléfono</span>
              <input
                ref="telefonoRef"
                v-model.trim="form.telefono"
                inputmode="tel"
                placeholder="10 dígitos"
                @input="clearUI"
              />
            </label>
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
import {
  clearStudentToasts,
  clearStudentBorders,
  showStudentToastNear,
  validateEstudiante,
} from "../scripts/Estudiantes";

const estudiantes = ref([]);

const busquedaInput = ref("");
const busqueda = ref("");
function aplicarBusqueda() {
  busqueda.value = busquedaInput.value.trim();
}

const pageSize = ref(6);
const currentPage = ref(1);

const estudiantesFiltrados = computed(() => {
  const q = busqueda.value.toLowerCase();
  if (!q) return estudiantes.value;

  return estudiantes.value.filter((e) => {
    const codigo = String(e.codigo ?? "").toLowerCase();
    const dni = String(e.dni ?? "").toLowerCase();
    const nombre = String(e.nombre ?? "").toLowerCase();
    return codigo.includes(q) || dni.includes(q) || nombre.includes(q);
  });
});

const totalPages = computed(() => Math.max(1, Math.ceil(estudiantesFiltrados.value.length / pageSize.value)));

const estudiantesPaginados = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return estudiantesFiltrados.value.slice(start, start + pageSize.value);
});

function nextPage() {
  if (currentPage.value < totalPages.value) currentPage.value++;
}
function prevPage() {
  if (currentPage.value > 1) currentPage.value--;
}

watch([busqueda, estudiantes], () => {
  currentPage.value = 1;
});

/* ===== Modal ===== */
const modalOpen = ref(false);
const isEditMode = ref(false);
const editIndex = ref(-1);

const codigoRef = ref(null);
const dniRef = ref(null);
const nombreRef = ref(null);
const carreraRef = ref(null);
const direccionRef = ref(null);
const telefonoRef = ref(null);

const form = ref({
  codigo: "",
  dni: "",
  nombre: "",
  carrera: "",
  direccion: "",
  telefono: "",
});

function resetForm() {
  form.value = {
    codigo: "",
    dni: "",
    nombre: "",
    carrera: "",
    direccion: "",
    telefono: "",
  };
}

function clearUI() {
  clearStudentToasts();
  clearStudentBorders([codigoRef, dniRef, nombreRef, carreraRef, direccionRef, telefonoRef]);
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
}

function guardarEstudiante() {
  clearUI();

  const result = validateEstudiante({
    form: form.value,
    estudiantes: estudiantes.value,
    refs: { codigoRef, dniRef, nombreRef, carreraRef, direccionRef, telefonoRef },
    editIndex: isEditMode.value ? editIndex.value : -1,
  });

  if (!result.ok) {
    showStudentToastNear(result.target, result.msg);
    return;
  }

  if (isEditMode.value && editIndex.value >= 0) {
    estudiantes.value[editIndex.value] = { ...form.value };
  } else {
    estudiantes.value.push({ ...form.value });
  }

  writeStorage("estudiantes", estudiantes.value);
  closeModal();
}

/* ===== Row actions ===== */
const actionMenuOpen = ref(false);
const actionMenuX = ref(0);
const actionMenuY = ref(0);
const selectedIndex = ref(-1);

function openRowActions(e, est) {
  selectedIndex.value = estudiantes.value.findIndex((x) => String(x.codigo) === String(est.codigo));
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
  estudiantes.value.splice(selectedIndex.value, 1);
  writeStorage("estudiantes", estudiantes.value);
  closeRowActions();
}

function editarSeleccionado() {
  if (selectedIndex.value < 0) return;

  const e = estudiantes.value[selectedIndex.value];
  isEditMode.value = true;
  editIndex.value = selectedIndex.value;

  form.value = {
    codigo: e.codigo,
    dni: e.dni,
    nombre: e.nombre,
    carrera: e.carrera,
    direccion: e.direccion,
    telefono: e.telefono,
  };

  modalOpen.value = true;
  clearUI();
  closeRowActions();
}

onMounted(() => {
  estudiantes.value = readStorage("estudiantes", []);
});

onBeforeUnmount(() => {
  clearStudentToasts();
});
</script>

<style>
@import "../styles/Global.css";
</style>
