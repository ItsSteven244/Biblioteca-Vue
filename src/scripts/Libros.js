export function clearBookToasts() {
  document.querySelectorAll(".mensaje-error-libro").forEach((m) => m.remove());
}

export function clearBookBorders(refs = []) {
  refs.forEach((r) => {
    if (r?.value) {
      r.value.style.borderColor = "";
      r.value.style.boxShadow = "";
    }
  });
}

export function showBookToastNear(el, msg) {
  if (!el) return;

  clearBookToasts();

  const div = document.createElement("div");
  div.className = "mensaje-error-libro";
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

export function validateLibro({ form, libros, refs, editIndex = -1 }) {
  const isbnEl = refs?.isbnRef?.value;
  const tituloEl = refs?.tituloRef?.value;
  const cantidadEl = refs?.cantidadRef?.value;
  const autorEl = refs?.autorRef?.value;
  const editorialEl = refs?.editorialRef?.value;
  const materiaEl = refs?.materiaRef?.value;

  const isbn = normalizeText(form.isbn);
  const titulo = normalizeText(form.titulo);
  const autor = normalizeText(form.autor);
  const editorial = normalizeText(form.editorial);
  const materia = normalizeText(form.materia);
  const cantidadRaw = form.cantidad;

  if (!isbn) return { ok: false, target: isbnEl, msg: "El ISBN es obligatorio" };
  if (!/^\d{3}-\d{4}$/.test(isbn)) return { ok: false, target: isbnEl, msg: "Formato: 000-0000" };

  const repetido = (libros || []).some((l, i) => i !== editIndex && normalizeText(l.isbn) === isbn);
  if (repetido) return { ok: false, target: isbnEl, msg: "Ese ISBN ya existe" };

  if (!titulo) return { ok: false, target: tituloEl, msg: "El título es obligatorio" };
  if (!/^[a-zA-Z\sáéíóúÁÉÍÓÚñÑüÜ]+$/.test(titulo))
    return { ok: false, target: tituloEl, msg: "Solo letras y espacios" };

  if (cantidadRaw === "" || cantidadRaw === null || cantidadRaw === undefined)
    return { ok: false, target: cantidadEl, msg: "La cantidad es obligatoria" };

  const cantidad = Number(cantidadRaw);
  if (!Number.isFinite(cantidad) || cantidad <= 0)
    return { ok: false, target: cantidadEl, msg: "Debe ser mayor a 0" };

  if (!autor) return { ok: false, target: autorEl, msg: "El autor es obligatorio" };
  if (!/^[a-zA-Z\sáéíóúÁÉÍÓÚñÑüÜ]+$/.test(autor))
    return { ok: false, target: autorEl, msg: "Solo letras y espacios" };

  if (!editorial) return { ok: false, target: editorialEl, msg: "La editorial es obligatoria" };
  if (!/^[a-zA-Z\sáéíóúÁÉÍÓÚñÑüÜ]+$/.test(editorial))
    return { ok: false, target: editorialEl, msg: "Solo letras y espacios" };

  if (!materia) return { ok: false, target: materiaEl, msg: "La materia es obligatoria" };
  if (!/^[a-zA-Z\sáéíóúÁÉÍÓÚñÑüÜ]+$/.test(materia))
    return { ok: false, target: materiaEl, msg: "Solo letras y espacios" };

  return { ok: true };
}
