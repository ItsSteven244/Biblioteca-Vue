<template>
  <div class="login-page">
    <video class="EstiloVideo" autoplay muted loop playsinline>
      <source src="/Videos/B4K.webm" type="video/webm" />
    </video>

    <div>
      <h1 class="Titulo">Sistema de Gestión Bibliotecaria</h1>
      <p class="Parrafo">
        Sistema de Gestión Bibliotecaria de la Universidad Laica Eloy Alfaro de "Manabí"
        <br />
        que facilita el acceso y la administración eficiente de los recursos bibliográficos.
      </p>
    </div>

    <div class="cuadro">
      <img src="/Imágenes/UleamLogo.png" class="logo" alt="ULEAM" />

      <input
        type="email"
        name="email"
        placeholder="CORREO"
        class="campo"
        v-model.trim="form.email"
        :class="{ campoError: errors.email }"
        ref="emailRef"
        @input="clearError('email')"
      />

      <input
        type="password"
        name="password"
        placeholder="CONTRASEÑA"
        class="campo"
        v-model="form.password"
        :class="{ campoError: errors.password }"
        ref="passwordRef"
        @input="clearError('password')"
      />

      <button type="button" class="botonIS" @click="onLogin">
        <strong>Iniciar Sesión</strong>
      </button>

      <p class="Parrafo2">
        Cualquier problema de autenticación por favor enviar <br />
        un correo a biblioteca@uleam.edu.ec.
      </p>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import { validarEmailUleam, mostrarToast, removerTodosLosToasts } from "../scripts/Iniciose";

const router = useRouter();

const form = reactive({
  email: "",
  password: "",
});

const errors = reactive({
  email: "",
  password: "",
});

const emailRef = ref(null);
const passwordRef = ref(null);

function readUsuarios() {
  try {
    const raw = localStorage.getItem("usuarios");
    const data = raw ? JSON.parse(raw) : [];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function inicializarUsuarios() {
  const usuarios = readUsuarios();

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
          estado: "Activo",
        },
      ])
    );
  }
}

function clearError(campo) {
  errors[campo] = "";
  removerTodosLosToasts();
}

function onLogin() {
  removerTodosLosToasts();
  errors.email = "";
  errors.password = "";

  const email = String(form.email || "").trim();
  const password = String(form.password || "").trim();

  let valido = true;

  if (!email) {
    errors.email = "El correo electrónico es obligatorio";
    mostrarToast(emailRef.value, errors.email, "error");
    valido = false;
  } else if (!validarEmailUleam(email)) {
    errors.email = "Formato: e0123456789@live.uleam.edu.ec";
    mostrarToast(emailRef.value, errors.email, "error");
    valido = false;
  }

  if (!password) {
    errors.password = "La contraseña es obligatoria";
    mostrarToast(passwordRef.value, errors.password, "error");
    valido = false;
  }

  if (!valido) return;

  const usuarios = readUsuarios();

  const usuario = usuarios.find(
    (u) => String(u.usuario || "").toLowerCase() === email.toLowerCase()
  );

  if (!usuario) {
    mostrarToast(passwordRef.value, "Ese usuario no existe", "error");
    return;
  }

  if (String(usuario.password || "") !== password) {
    mostrarToast(passwordRef.value, "Credenciales incorrectas", "error");
    return;
  }

  if (String(usuario.estado || "Activo").toLowerCase() === "inactivo") {
    mostrarToast(passwordRef.value, "Usuario inactivo", "error");
    return;
  }

  // Sesión
  localStorage.setItem("auth", "1");
  localStorage.setItem("userName", usuario.nombre || "Usuario");
  localStorage.setItem("userRole", usuario.rol || "Usuario"); 
  localStorage.setItem("userEmail", usuario.usuario || "");   // CLAVE para CambioClave

  router.push("/menu");
}

onMounted(() => {
  inicializarUsuarios();
});

onBeforeUnmount(() => {
  removerTodosLosToasts();
});
</script>

<style>
@import "../styles/Iniciose.css";
</style>
