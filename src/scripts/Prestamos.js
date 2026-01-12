export function clearLoanToasts() {
  document.querySelectorAll(".mensaje-error-prestamo").forEach((m) => m.remove());
}

export function clearLoanBorders(refs = []) {
  refs.forEach((r) => {
    if (r?.value) r.value.style.borderColor = "";
  });
}

export function showLoanToastNear(el, msg) {
  if (!el) return;

  clearLoanToasts();

  const div = document.createElement("div");
  div.className = "mensaje-error-prestamo";
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

function normalizeText(v) {
  return String(v ?? "").trim();
}

export function validatePrestamo({ form, refs }) {
  const libroEl = refs?.libroRef?.value;
  const estEl = refs?.estudianteRef?.value;
  const cantidadEl = refs?.cantidadRef?.value;
  const fechaPEl = refs?.fechaPrestamoRef?.value;
  const fechaDEl = refs?.fechaDevolucionRef?.value;

  const libro = normalizeText(form.libro);
  const estudiante = normalizeText(form.estudiante);
  const cantidadRaw = form.cantidad;
  const fechaP = normalizeText(form.fechaPrestamo);
  const fechaD = normalizeText(form.fechaDevolucion);

  if (!libro) return { ok: false, target: libroEl, msg: "El libro es obligatorio" };
  if (!estudiante) return { ok: false, target: estEl, msg: "El estudiante es obligatorio" };

  if (cantidadRaw === "" || cantidadRaw === null)
    return { ok: false, target: cantidadEl, msg: "La cantidad es obligatoria" };

  const cantidad = Number(cantidadRaw);
  if (!Number.isFinite(cantidad) || cantidad <= 0)
    return { ok: false, target: cantidadEl, msg: "Debe ser mayor a 0" };

  if (!fechaP) return { ok: false, target: fechaPEl, msg: "La fecha de préstamo es obligatoria" };
  if (!fechaD) return { ok: false, target: fechaDEl, msg: "La fecha de devolución es obligatoria" };

  if (fechaD <= fechaP)
    return { ok: false, target: fechaDEl, msg: "La devolución debe ser posterior al préstamo" };

  return { ok: true };
}
