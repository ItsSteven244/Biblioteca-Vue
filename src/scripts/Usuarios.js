export function clearUserToasts() {
  document.querySelectorAll(".mensaje-error-usuarios").forEach((m) => m.remove());
}

export function clearUserBorders(refs = []) {
  refs.forEach((r) => {
    if (r?.value) r.value.style.borderColor = "";
    else if (r) r.style.borderColor = "";
  });
}

export function showUserToastNear(el, msg) {
  if (!el) return;

  clearUserToasts();

  const div = document.createElement("div");
  div.className = "mensaje-error-usuarios";
  div.textContent = msg;

  Object.assign(div.style, {
    position: "fixed",
    background: "#e74c3c",
    color: "white",
    padding: "10px 14px",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: "800",
    zIndex: "99999",
    boxShadow: "0 6px 18px rgba(0,0,0,0.25)",
    whiteSpace: "nowrap",
    fontFamily: "Poppins, sans-serif",
  });

  const rect = el.getBoundingClientRect();
  div.style.top = rect.bottom + 10 + "px";
  div.style.left = rect.left + "px";

  document.body.appendChild(div);
  el.style.borderColor = "#e74c3c";

  setTimeout(() => {
    div.remove();
    el.style.borderColor = "";
  }, 2500);
}

export function normalizeText(v) {
  return String(v ?? "").trim();
}

export function validateBusqueda(value) {
  const termino = normalizeText(value);
  const regex = /^[a-zA-Z0-9\sáéíóúÁÉÍÓÚñÑüÜ]*$/;
  return regex.test(termino);
}

export function validateUsuario({ form, usuarios, refs, editIndex = -1 }) {
  const usuarioEl = refs?.usuarioRef?.value;
  const nombreEl = refs?.nombreRef?.value;
  const passEl = refs?.contrasenaRef?.value;
  const confEl = refs?.confirmarRef?.value;
  const rolEl = refs?.rolRef?.value;

  const usuario = normalizeText(form.usuario);
  const nombre = normalizeText(form.nombre);
  const rol = normalizeText(form.rol);

  const pass = normalizeText(form.contrasena);
  const conf = normalizeText(form.confirmarContrasena);

  if (!usuario) return { ok: false, target: usuarioEl, msg: "El usuario es obligatorio" };
  if (!/^e\d{10}@live\.uleam\.edu\.ec$/.test(usuario))
    return { ok: false, target: usuarioEl, msg: "Formato: e0000000000@live.uleam.edu.ec" };

  const repetido = (usuarios || []).some((u, i) => i !== editIndex && normalizeText(u.usuario) === usuario);
  if (repetido) return { ok: false, target: usuarioEl, msg: "Ese correo ya existe" };

  if (!nombre) return { ok: false, target: nombreEl, msg: "El nombre es obligatorio" };
  if (!/^[a-zA-Z\sáéíóúÁÉÍÓÚñÑüÜ]+$/.test(nombre))
    return { ok: false, target: nombreEl, msg: "Solo letras y espacios" };
  if (nombre.length < 2) return { ok: false, target: nombreEl, msg: "Mínimo 2 caracteres" };

  if (!rol) return { ok: false, target: rolEl, msg: "El rol es obligatorio" };

  if (editIndex === -1) {
    if (!pass) return { ok: false, target: passEl, msg: "La contraseña es obligatoria" };
    if (!/^(?=.*[a-zA-Z])(?=.*\d).+$/.test(pass))
      return { ok: false, target: passEl, msg: "Debe tener letras y números" };
    if (pass.length < 6) return { ok: false, target: passEl, msg: "Mínimo 6 caracteres" };

    if (!conf) return { ok: false, target: confEl, msg: "Confirme la contraseña" };
    if (pass !== conf) return { ok: false, target: confEl, msg: "No coinciden" };
  } else {
    if (pass || conf) {
      if (!pass) return { ok: false, target: passEl, msg: "Ingrese la nueva contraseña" };
      if (!/^(?=.*[a-zA-Z])(?=.*\d).+$/.test(pass))
        return { ok: false, target: passEl, msg: "Debe tener letras y números" };
      if (pass.length < 6) return { ok: false, target: passEl, msg: "Mínimo 6 caracteres" };

      if (!conf) return { ok: false, target: confEl, msg: "Confirme la contraseña" };
      if (pass !== conf) return { ok: false, target: confEl, msg: "No coinciden" };
    }
  }

  return { ok: true };
}
