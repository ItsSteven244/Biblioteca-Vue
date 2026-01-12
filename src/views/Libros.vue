<template>
  <div class="menu-page">
    <MenuLateral />

    <main class="contenido">
      <h1 class="titulo">Libros</h1>

      <section class="card">
        <div class="card-top">
          <button class="btn btn-add" type="button" @click="openLibroModal">＋</button>

          <div class="right-tools">
            <label>Buscar:</label>
            <input
              v-model.trim="busquedaInput"
              placeholder="Título, ISBN o autor"
              @keydown.enter.prevent="aplicarBusqueda"
            />
          </div>
        </div>

        <div class="tabla-wrapper">
          <table class="tabla">
            <thead>
              <tr>
                <th>ISBN</th>
                <th>Título</th>
                <th>Cantidad</th>
                <th>Autor</th>
                <th>Editorial</th>
                <th>Materia</th>
                <th>Estado</th>
                <th>Logo</th>
                <th>PDF</th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="libro in librosPaginados"
                :key="libro.isbn"
                @click="openRowActions($event, libro)"
                style="cursor:pointer"
              >
                <td>{{ libro.isbn }}</td>
                <td>{{ libro.titulo }}</td>
                <td>{{ libro.cantidad }}</td>
                <td>{{ libro.autor }}</td>
                <td>{{ libro.editorial }}</td>
                <td>{{ libro.materia }}</td>
                <td>
                  <span class="badge" :class="libro.estado === 'Disponible' ? 'disponible' : 'prestado'">
                    {{ libro.estado }}
                  </span>
                </td>
                <td>
                  <img
                    v-if="libro.logo"
                    :src="libro.logo"
                    style="width:40px;height:40px;object-fit:cover;border-radius:8px;"
                  />
                  <span v-else>-</span>
                </td>
                <td>
                  <button
                    v-if="libro.pdf"
                    class="btn small btn-pdf"
                    @click.stop="openPdf(libro.pdf)"
                  >
                    Ver PDF
                  </button>
                  <span v-else>-</span>
                </td>
              </tr>

              <tr v-if="librosFiltrados.length === 0">
                <td colspan="9" style="text-align:center">No hay libros</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="paginacion">
          <button class="btn small" @click="prevPage" :disabled="currentPage === 1">Anterior</button>
          <span class="page-ind">Página {{ currentPage }} de {{ totalPages }}</span>
          <button class="btn small" @click="nextPage" :disabled="currentPage === totalPages">Siguiente</button>
        </div>
      </section>
    </main>

    <!-- Acciones -->
    <div
      v-if="actionMenuOpen"
      class="row-actions"
      :style="{ top: actionMenuY + 'px', left: actionMenuX + 'px' }"
      @click.stop
    >
      <button class="row-actions-btn" @click="editarSeleccionado">Editar</button>
      <button class="row-actions-btn danger" @click="eliminarSeleccionado">Eliminar</button>
    </div>
    <div v-if="actionMenuOpen" class="row-actions-backdrop" @click="closeRowActions"></div>

    <!-- Modal -->
    <div v-if="modalLibro" class="modal" @click.self="closeLibroModal">
      <div class="modal-content">
        <h3>{{ isEditMode ? "Editar libro" : "Nuevo libro" }}</h3>

        <form @submit.prevent="registrarLibro">
          <div class="grid-2">
            <label class="field">
              <span class="field-label">ISBN</span>
              <input ref="isbnRef" v-model.trim="form.isbn" />
            </label>

            <label class="field">
              <span class="field-label">Título</span>
              <input ref="tituloRef" v-model.trim="form.titulo" />
            </label>
          </div>

          <div class="grid-2">
            <label class="field">
              <span class="field-label">Cantidad</span>
              <input ref="cantidadRef" type="number" v-model.number="form.cantidad" />
            </label>

            <label class="field">
              <span class="field-label">Autor</span>
              <input ref="autorRef" v-model.trim="form.autor" />
            </label>
          </div>

          <div class="grid-2">
            <label class="field">
              <span class="field-label">Editorial</span>
              <input ref="editorialRef" v-model.trim="form.editorial" />
            </label>

            <label class="field">
              <span class="field-label">Materia</span>
              <input ref="materiaRef" v-model.trim="form.materia" />
            </label>
          </div>

          <div class="grid-2">
            <label class="field">
              <span class="field-label">Estado</span>
              <select v-model="form.estado">
                <option value="Disponible">Disponible</option>
                <option value="Prestado">Prestado</option>
              </select>
            </label>

            <!-- Logo -->
            <div class="logo-upload-section">
              <label class="logo-label">Logo</label>
              <div class="logo-preview" :class="{ active: !!logoPreview }" @click="openLogoPicker">
                <div v-if="!logoPreview" class="logo-placeholder">Haz clic para subir un logo</div>
                <img v-else :src="logoPreview" />
              </div>
              <input ref="logoInputRef" type="file" class="file-input" accept="image/*" @change="onLogoChange" />
            </div>
          </div>

          <!-- PDF -->
          <div class="logo-upload-section">
            <label class="logo-label">Libro en PDF</label>
            <button type="button" class="btn btn-pdf" @click="openPdfPicker">
              {{ pdfName || "Subir PDF" }}
            </button>
            <input ref="pdfInputRef" type="file" class="file-input" accept="application/pdf" @change="onPdfChange" />
          </div>

          <div class="modal-actions">
            <button type="button" class="btn outline" @click="closeLibroModal">Atrás</button>
            <button type="submit" class="btn">{{ isEditMode ? "Guardar cambios" : "Registrar" }}</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import MenuLateral from "../components/MenuLateral.vue";
import { readStorage, writeStorage } from "../scripts/storage";
import { clearBookToasts, clearBookBorders, showBookToastNear, validateLibro } from "../scripts/Libros";

const libros = ref([]);
const busquedaInput = ref("");
const busqueda = ref("");
const pageSize = ref(6);
const currentPage = ref(1);

const librosFiltrados = computed(() => {
  const q = busqueda.value.toLowerCase();
  if (!q) return libros.value;
  return libros.value.filter(l =>
    [l.titulo, l.autor, l.isbn].some(v => String(v).toLowerCase().includes(q))
  );
});

const totalPages = computed(() => Math.max(1, Math.ceil(librosFiltrados.value.length / pageSize.value)));
const librosPaginados = computed(() =>
  librosFiltrados.value.slice((currentPage.value - 1) * pageSize.value, currentPage.value * pageSize.value)
);

watch([busqueda, libros], () => (currentPage.value = 1));

function aplicarBusqueda() {
  busqueda.value = busquedaInput.value.trim();
}

function nextPage() {
  if (currentPage.value < totalPages.value) currentPage.value++;
}
function prevPage() {
  if (currentPage.value > 1) currentPage.value--;
}

/* ---------- PDF FIX ---------- */
function openPdf(pdfBase64) {
  const byteChars = atob(pdfBase64.split(",")[1]);
  const bytes = new Uint8Array(byteChars.length);
  for (let i = 0; i < byteChars.length; i++) bytes[i] = byteChars.charCodeAt(i);
  const blob = new Blob([bytes], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank");
}
/* ------------------------------ */

const modalLibro = ref(false);
const isEditMode = ref(false);
const editIndex = ref(-1);

const isbnRef = ref(null);
const tituloRef = ref(null);
const cantidadRef = ref(null);
const autorRef = ref(null);
const editorialRef = ref(null);
const materiaRef = ref(null);

function clearUI() {
  clearBookToasts();
  clearBookBorders([isbnRef, tituloRef, cantidadRef, autorRef, editorialRef, materiaRef]);
}

const actionMenuOpen = ref(false);
const actionMenuX = ref(0);
const actionMenuY = ref(0);
const selectedIndex = ref(-1);

function openRowActions(e, libro) {
  selectedIndex.value = libros.value.findIndex(l => l.isbn === libro.isbn);
  actionMenuX.value = e.clientX;
  actionMenuY.value = e.clientY;
  actionMenuOpen.value = true;
}
function closeRowActions() {
  actionMenuOpen.value = false;
}

function eliminarSeleccionado() {
  libros.value.splice(selectedIndex.value, 1);
  writeStorage("libros", libros.value);
  closeRowActions();
}

function editarSeleccionado() {
  const libro = libros.value[selectedIndex.value];
  isEditMode.value = true;
  editIndex.value = selectedIndex.value;
  form.value = { ...libro };
  logoPreview.value = libro.logo || "";
  pdfName.value = libro.pdfName || "";
  modalLibro.value = true;
  closeRowActions();
}

const logoInputRef = ref(null);
const logoPreview = ref("");
function openLogoPicker() {
  logoInputRef.value.click();
}
function onLogoChange(e) {
  const reader = new FileReader();
  reader.onload = () => {
    logoPreview.value = reader.result;
    form.value.logo = reader.result;
  };
  reader.readAsDataURL(e.target.files[0]);
}

const pdfInputRef = ref(null);
const pdfName = ref("");
function openPdfPicker() {
  pdfInputRef.value.click();
}
function onPdfChange(e) {
  const file = e.target.files[0];
  if (!file || file.type !== "application/pdf") return;
  pdfName.value = file.name;
  const reader = new FileReader();
  reader.onload = () => {
    form.value.pdf = reader.result;
    form.value.pdfName = file.name;
  };
  reader.readAsDataURL(file);
}

const form = ref({
  isbn: "",
  titulo: "",
  cantidad: "",
  autor: "",
  editorial: "",
  materia: "",
  estado: "Disponible",
  logo: "",
  pdf: "",
  pdfName: "",
});

function openLibroModal() {
  modalLibro.value = true;
  isEditMode.value = false;
  form.value = { ...form.value, logo: "", pdf: "", pdfName: "" };
}

function closeLibroModal() {
  modalLibro.value = false;
}

function registrarLibro() {
  const result = validateLibro({
    form: form.value,
    libros: libros.value,
    refs: { isbnRef, tituloRef, cantidadRef, autorRef, editorialRef, materiaRef },
    editIndex: isEditMode.value ? editIndex.value : -1,
  });

  if (!result.ok) {
    showBookToastNear(result.target, result.msg);
    return;
  }

  if (isEditMode.value) libros.value[editIndex.value] = { ...form.value };
  else libros.value.push({ ...form.value });

  writeStorage("libros", libros.value);
  closeLibroModal();
}

onMounted(() => {
  libros.value = readStorage("libros", []);
});
</script>

<style scoped>
.btn-pdf {
  background: #0f8c8c;
  color: #fff;
}
.btn-pdf:hover {
  filter: brightness(0.95);
}
</style>
