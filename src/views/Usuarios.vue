<template>
  <div class="menu-page">
    <MenuLateral />

    <main class="contenido">
      <h1 class="titulo">Usuarios</h1>

      <section class="card">
        <div class="card-top">
          <button class="btn btn-add" type="button" title="Agregar usuario" @click="openUsuarioModal">
            ＋
          </button>

          <div class="right-tools">
            <label>Buscar:</label>
            <input
              ref="searchRef"
              v-model.trim="searchInput"
              type="text"
              placeholder="Correo, Nombre"
              @input="onSearchInput"
            />
          </div>
        </div>

        <div class="tabla-wrapper">
          <table class="tabla">
            <thead>
              <tr>
                <th>Id</th>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Estado</th>
                <th>Tipo de usuario</th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="u in usuariosPaginados"
                :key="u.id"
                @click="openRowActions($event, u)"
                style="cursor:pointer"
              >
                <td>{{ u.id }}</td>
                <td>{{ u.nombre }}</td>
                <td>{{ u.usuario }}</td>
                <td>
                  <span class="badge" :class="u.estado === 'Activo' ? 'activo' : 'inactivo'">
                    {{ u.estado }}
                  </span>
                </td>
                <td>{{ u.rol }}</td>
              </tr>

              <tr v-if="usuariosFiltrados.length === 0">
                <td colspan="5" style="text-align:center">No hay usuarios</td>
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

    <!-- MODAL USUARIO -->
    <div v-if="modalUsuario" class="modal" @click.self="closeUsuarioModal">
      <div class="modal-content">
        <h3>{{ isEditMode ? "Editar Usuario" : "Nuevo Usuario" }}</h3>

        <form @submit.prevent="guardarUsuario">
          <div class="grid-2">
            <label class="field">
              <span class="field-label">Usuario (correo)</span>
              <input
                ref="usuarioRef"
                v-model.trim="form.usuario"
                autocomplete="off"
                placeholder="e0000000000@live.uleam.edu.ec"
                @input="clearUI"
              />
            </label>

            <label class="field">
              <span class="field-label">Nombre</span>
              <input ref="nombreRef" v-model.trim="form.nombre" autocomplete="off" @input="clearUI" />
            </label>
          </div>

          <div class="grid-2">
            <label class="field">
              <span class="field-label">Contraseña</span>
              <input
                ref="contrasenaRef"
                v-model.trim="form.contrasena"
                type="password"
                autocomplete="off"
                :placeholder="isEditMode ? '(dejar vacío para no cambiar)' : ''"
                @input="clearUI"
              />
            </label>

            <label class="field">
              <span class="field-label">Confirmar contraseña</span>
              <input
                ref="confirmarRef"
                v-model.trim="form.confirmarContrasena"
                type="password"
                autocomplete="off"
                @input="clearUI"
              />
            </label>
          </div>

          <div class="grid-2">
            <label class="field">
              <span class="field-label">Rol</span>
              <select ref="rolRef" v-model="form.rol" @change="clearUI">
                <option value="Usuario">Usuario</option>
                <option value="Admin">Admin</option>
              </select>
            </label>

            <label class="field">
              <span class="field-label">Estado</span>
              <select v-model="form.estado" @change="clearUI">
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
              </select>
            </label>
          </div>

          <div class="modal-actions">
            <button type="button" class="btn outline" @click="closeUsuarioModal">Cancelar</button>
            <button type="submit" class="btn">{{ isEditMode ? "Guardar" : "Registrar" }}</button>
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
import { clearUserToasts, clearUserBorders, showUserToastNear, validateBusqueda, validateUsuario } from "../scripts/Usuarios";

const usuarios = ref([]);

const searchInput = ref("");
const searchRef = ref(null);

function onSearchInput() {
  const ok = validateBusqueda(searchInput.value);
  if (!ok) {
    showUserToastNear(searchRef.value, "Solo letras, números y espacios");
    searchInput.value = searchInput.value.replace(/[^a-zA-Z0-9\sáéíóúÁÉÍÓÚñÑüÜ]/g, "");
  }
}

const pageSize = ref(6);
const currentPage = ref(1);

const usuariosFiltrados = computed(() => {
  const q = searchInput.value.toLowerCase().trim();
  if (!q) return usuarios.value;

  return usuarios.value.filter((u) => {
    const t = `${u.id} ${u.nombre} ${u.usuario} ${u.rol} ${u.estado}`.toLowerCase();
    return t.includes(q);
  });
});

const totalPages = computed(() => Math.max(1, Math.ceil(usuariosFiltrados.value.length / pageSize.value)));

const usuariosPaginados = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return usuariosFiltrados.value.slice(start, start + pageSize.value);
});

function nextPage() {
  if (currentPage.value < totalPages.value) currentPage.value++;
}
function prevPage() {
  if (currentPage.value > 1) currentPage.value--;
}

watch([searchInput, usuarios], () => {
  currentPage.value = 1;
});

const modalUsuario = ref(false);
const isEditMode = ref(false);
const editIndex = ref(-1);

const usuarioRef = ref(null);
const nombreRef = ref(null);
const contrasenaRef = ref(null);
const confirmarRef = ref(null);
const rolRef = ref(null);

function clearUI() {
  clearUserToasts();
  clearUserBorders([usuarioRef, nombreRef, contrasenaRef, confirmarRef, rolRef, searchRef]);
}

const form = ref({
  usuario: "",
  nombre: "",
  contrasena: "",
  confirmarContrasena: "",
  rol: "Usuario",
  estado: "Activo",
});

function resetForm() {
  form.value = {
    usuario: "",
    nombre: "",
    contrasena: "",
    confirmarContrasena: "",
    rol: "Usuario",
    estado: "Activo",
  };
}

function nextId() {
  const ids = usuarios.value.map((u) => Number(u.id)).filter((n) => Number.isFinite(n));
  return ids.length ? Math.max(...ids) + 1 : 1;
}

function openUsuarioModal() {
  isEditMode.value = false;
  editIndex.value = -1;
  modalUsuario.value = true;
  resetForm();
  clearUI();
}

function closeUsuarioModal() {
  modalUsuario.value = false;
  isEditMode.value = false;
  editIndex.value = -1;
  resetForm();
  clearUI();
}

function guardarUsuario() {
  clearUI();

  const result = validateUsuario({
    form: form.value,
    usuarios: usuarios.value,
    refs: { usuarioRef, nombreRef, contrasenaRef, confirmarRef, rolRef },
    editIndex: isEditMode.value ? editIndex.value : -1,
  });

  if (!result.ok) {
    showUserToastNear(result.target, result.msg);
    return;
  }

  if (isEditMode.value && editIndex.value >= 0) {
    const actual = usuarios.value[editIndex.value];
    const passFinal = form.value.contrasena ? form.value.contrasena : (actual.password || "");

    usuarios.value[editIndex.value] = {
      ...actual,
      usuario: form.value.usuario,
      nombre: form.value.nombre,
      rol: form.value.rol,
      estado: form.value.estado,
      password: passFinal,
    };
  } else {
    usuarios.value.push({
      id: nextId(),
      usuario: form.value.usuario,
      nombre: form.value.nombre,
      rol: form.value.rol,
      estado: form.value.estado,
      password: form.value.contrasena,
    });
  }

  writeStorage("usuarios", usuarios.value);
  closeUsuarioModal();
}

const actionMenuOpen = ref(false);
const actionMenuX = ref(0);
const actionMenuY = ref(0);
const selectedIndex = ref(-1);

function openRowActions(e, u) {
  selectedIndex.value = usuarios.value.findIndex((x) => String(x.id) === String(u.id));
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
  usuarios.value.splice(selectedIndex.value, 1);
  writeStorage("usuarios", usuarios.value);
  closeRowActions();
}

function editarSeleccionado() {
  if (selectedIndex.value < 0) return;

  const u = usuarios.value[selectedIndex.value];

  isEditMode.value = true;
  editIndex.value = selectedIndex.value;

  form.value = {
    usuario: u.usuario,
    nombre: u.nombre,
    contrasena: "",
    confirmarContrasena: "",
    rol: u.rol,
    estado: u.estado || "Activo",
  };

  modalUsuario.value = true;
  clearUI();
  closeRowActions();
}

onMounted(() => {
  usuarios.value = readStorage("usuarios", []);
});
</script>
