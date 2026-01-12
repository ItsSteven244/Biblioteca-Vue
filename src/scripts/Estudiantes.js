function removeAll(selector) {
  document.querySelectorAll(selector).forEach((n) => n.remove());
}

export function clearStudentToasts() {
  removeAll(".toast-estudiantes");
}

export function clearStudentBorders(refs) {
  (refs || []).forEach((r) => {
    const el = r?.value;
    if (el) el.style.borderColor = "";
  });
}

export function showStudentToastNear(targetEl, msg) {
  if (!targetEl) return;

  clearStudentToasts();

  const div = document.createElement("div");
  div.className = "toast-estudiantes";
  div.textContent = msg;

  Object.assign(div.style, {
    position: "fixed",
    background: "#e74c3c",
    color: "white",
    padding: "10px 15px",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "800",
    zIndex: "99999",
    boxShadow: "0 10px 26px rgba(0,0,0,0.25)",
    whiteSpace: "nowrap",
    fontFamily: "Poppins, sans-serif",
  });

  const rect = targetEl.getBoundingClientRect();
  div.style.top = rect.bottom + 10 + "px";
  div.style.left = rect.left + "px";

  document.body.appendChild(div);
  targetEl.style.borderColor = "#e74c3c";

  setTimeout(() => {
    div.remove();
    targetEl.style.borderColor = "";
  }, 2500);
}

export function validateEstudiante({ form, estudiantes, refs, editIndex }) {
  const codigo = String(form.codigo || "").trim();
  const dni = String(form.dni || "").trim();
  const nombre = String(form.nombre || "").trim();
  const carrera = String(form.carrera || "").trim();
  const direccion = String(form.direccion || "").trim();
  const telefono = String(form.telefono || "").trim();

  // Código
  if (!codigo) return { ok: false, target: refs.codigoRef?.value, msg: "El código es obligatorio" };
  if (!/^\d{2}-\d{2}$/.test(codigo))
    return { ok: false, target: refs.codigoRef?.value, msg: "Formato: 00-00" };

  // DNI
  if (!dni) return { ok: false, target: refs.dniRef?.value, msg: "El DNI es obligatorio" };
  if (!/^\d{10}$/.test(dni)) return { ok: false, target: refs.dniRef?.value, msg: "El DNI debe tener 10 dígitos" };

  // Nombre
  if (!nombre) return { ok: false, target: refs.nombreRef?.value, msg: "El nombre es obligatorio" };
  if (!/^[a-zA-Z\sáéíóúÁÉÍÓÚñÑüÜ]+$/.test(nombre))
    return { ok: false, target: refs.nombreRef?.value, msg: "Nombre: solo letras y espacios" };

  // Carrera
  if (!carrera) return { ok: false, target: refs.carreraRef?.value, msg: "La carrera es obligatoria" };

  // Dirección 
  if (!direccion) return { ok: false, target: refs.direccionRef?.value, msg: "La dirección es obligatoria" };

  // Teléfono
  if (!telefono) return { ok: false, target: refs.telefonoRef?.value, msg: "El teléfono es obligatorio" };
  if (!/^\d{10}$/.test(telefono))
    return { ok: false, target: refs.telefonoRef?.value, msg: "El teléfono debe tener 10 dígitos" };

  // Duplicado por código 
  const idx = (estudiantes || []).findIndex((x) => String(x.codigo) === codigo);
  if (idx >= 0 && idx !== Number(editIndex)) {
    return { ok: false, target: refs.codigoRef?.value, msg: "Ese código ya existe" };
  }

  return { ok: true };
}
