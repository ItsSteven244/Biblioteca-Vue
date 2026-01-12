export function mostrarErrorFiltro(elemento, mensaje) {
  if (!elemento) return;

  const errorElement = document.createElement("div");
  errorElement.className = "mensaje-error-filtro";
  errorElement.textContent = mensaje;

  errorElement.style.position = "fixed";
  errorElement.style.background = "#e74c3c";
  errorElement.style.color = "white";
  errorElement.style.padding = "10px 15px";
  errorElement.style.borderRadius = "6px";
  errorElement.style.fontSize = "14px";
  errorElement.style.fontWeight = "bold";
  errorElement.style.zIndex = "10000";

  const rect = elemento.getBoundingClientRect();
  errorElement.style.top = rect.bottom + 10 + "px";
  errorElement.style.left = rect.left + "px";

  document.body.appendChild(errorElement);

  setTimeout(() => errorElement.remove(), 3000);
}

export function removerMensajesFiltro() {
  document.querySelectorAll(".mensaje-error-filtro").forEach(e => e.remove());
}
