<template>
  <div v-if="open" class="cc-overlay" @click.self="close">
    <div class="cc-card">
      <div class="cc-title">Cambio de Clave</div>

      <form class="cc-form" @submit.prevent="submit">
        <label class="cc-label">Contraseña actual</label>
        <input
          ref="currentRef"
          class="cc-input"
          type="password"
          v-model.trim="form.current"
          placeholder="Ingresa tu contraseña actual"
          @input="clearUI"
        />

        <label class="cc-label">Nueva contraseña</label>
        <input
          ref="newRef"
          class="cc-input"
          type="password"
          v-model.trim="form.newPass"
          placeholder="Ingresa la nueva contraseña"
          @input="clearUI"
        />

        <label class="cc-label">Confirmar nueva contraseña</label>
        <input
          ref="confirmRef"
          class="cc-input"
          type="password"
          v-model.trim="form.confirm"
          placeholder="Confirma la nueva contraseña"
          @input="clearUI"
        />

        <div class="cc-actions">
          <button type="submit" class="cc-btn cc-ok">Aceptar</button>
          <button type="button" class="cc-btn cc-cancel" @click="close">Regresar</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount } from "vue";

const open = ref(false);

const form = reactive({
  current: "",
  newPass: "",
  confirm: "",
});

const currentRef = ref(null);
const newRef = ref(null);
const confirmRef = ref(null);

/* ===== storage ===== */
function readUsuarios() {
  try {
    const raw = localStorage.getItem("usuarios");
    const data = raw ? JSON.parse(raw) : [];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function writeUsuarios(arr) {
  localStorage.setItem("usuarios", JSON.stringify(arr));
}

/* ===== UI error simple ===== */
let toastEl = null;

function clearUI() {
  if (toastEl) toastEl.remove();
  toastEl = null;
  [currentRef, newRef, confirmRef].forEach((r) => {
    if (r.value) r.value.style.borderColor = "#cfcfcf";
  });
}

function showToastNear(targetEl, msg) {
  clearUI();
  if (!targetEl) return;

  const div = document.createElement("div");
  div.textContent = msg;

  Object.assign(div.style, {
    position: "fixed",
    background: "#e74c3c",
    color: "white",
    padding: "10px 14px",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: "700",
    zIndex: "99999",
    boxShadow: "0 10px 25px rgba(0,0,0,.25)",
    whiteSpace: "nowrap",
    fontFamily: "Poppins, sans-serif",
  });

  const rect = targetEl.getBoundingClientRect();
  div.style.top = rect.bottom + 10 + "px";
  div.style.left = rect.left + "px";

  document.body.appendChild(div);
  toastEl = div;

  targetEl.style.borderColor = "#e74c3c";

  setTimeout(() => {
    if (toastEl) toastEl.remove();
    toastEl = null;
    targetEl.style.borderColor = "#cfcfcf";
  }, 2600);
}

/* ===== abrir/cerrar ===== */
function openModal() {
  open.value = true;
  clearUI();
  form.current = "";
  form.newPass = "";
  form.confirm = "";
  setTimeout(() => currentRef.value?.focus(), 0);
}

function close() {
  open.value = false;
  clearUI();
  form.current = "";
  form.newPass = "";
  form.confirm = "";
}

/* ===== lógica ===== */
function submit() {
  clearUI();

  const current = String(form.current || "").trim();
  const np = String(form.newPass || "").trim();
  const conf = String(form.confirm || "").trim();

  if (!current) return showToastNear(currentRef.value, "La contraseña actual es obligatoria");

  if (!np) return showToastNear(newRef.value, "La nueva contraseña es obligatoria");
  if (np.length < 6) return showToastNear(newRef.value, "Mínimo 6 caracteres");
  if (!/^(?=.*[a-zA-Z])(?=.*\d).+$/.test(np)) return showToastNear(newRef.value, "Debe tener letras y números");

  if (!conf) return showToastNear(confirmRef.value, "Confirme la nueva contraseña");
  if (np !== conf) return showToastNear(confirmRef.value, "Las contraseñas no coinciden");

  const userEmail = localStorage.getItem("userEmail");
  if (!userEmail) return showToastNear(currentRef.value, "No se identificó el usuario actual");

  const usuarios = readUsuarios();
  const idx = usuarios.findIndex(
    (u) => String(u.usuario || "").toLowerCase() === String(userEmail).toLowerCase()
  );

  if (idx < 0) return showToastNear(currentRef.value, "Usuario actual no encontrado");

  if (String(usuarios[idx].password || "") !== current) {
    return showToastNear(currentRef.value, "La contraseña actual no es correcta");
  }

  usuarios[idx] = { ...usuarios[idx], password: np };
  writeUsuarios(usuarios);

  close();
  alert("Contraseña cambiada correctamente");
}

/* ===== listener global ===== */
function onOpenEvent() {
  openModal();
}

onMounted(() => {
  window.addEventListener("open-cambio-clave", onOpenEvent);
});

onBeforeUnmount(() => {
  window.removeEventListener("open-cambio-clave", onOpenEvent);
  clearUI();
});
</script>

<style scoped>
.cc-overlay{
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,.35);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 28px;
  z-index: 99999;
}

.cc-card{
  width: 640px;
  max-width: 92vw;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 16px 45px rgba(0,0,0,.25);
}

.cc-title{
  background: #0f8c8c;
  color: #fff;
  font-weight: 800;
  font-size: 24px;
  text-align: center;
  padding: 18px 16px;
  border-radius: 12px;
  margin: 18px;
  font-family: 'Poppins', sans-serif; 
}

.cc-form{
  padding: 0 18px 22px;
}

.cc-label{
  display: block;
  font-size: 18px;              
  font-weight: 600;
  margin: 14px 0 10px;
  color: #111;
  font-family: 'Poppins', sans-serif;
}

.cc-input{
  width: 100%;
  box-sizing: border-box;
  padding: 14px 14px;
  font-size: 16px;
  border: 1px solid #cfcfcf;
  border-radius: 4px;
  outline: none;
  font-family: 'Poppins', sans-serif; /* ✅ */
}

.cc-input:focus{
  border-color: #0f8c8c;
  box-shadow: 0 0 0 3px rgba(15,140,140,.12);
}

.cc-actions{
  display: flex;
  gap: 18px;
  margin-top: 18px;
  justify-content: flex-start;
}

.cc-btn{
  border: none;
  border-radius: 4px;
  padding: 12px 26px;
  font-size: 16px;
  cursor: pointer;
  color: #fff;
  font-weight: 700;
  font-family: 'Poppins', sans-serif;
}
.cc-ok{ background: #4CAF50; }
.cc-cancel{ background: #F44336; }
</style>
