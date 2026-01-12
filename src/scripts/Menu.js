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
  errorElement.style.boxShadow = "0 4px 12px rgba(0,0,0,0.3)";
  errorElement.style.whiteSpace = "nowrap";
  errorElement.style.fontFamily = "Poppins, sans-serif";

  const rect = elemento.getBoundingClientRect();
  errorElement.style.top = rect.bottom + 10 + "px";
  errorElement.style.left = rect.left - 50 + "px";

  document.body.appendChild(errorElement);

  setTimeout(() => {
    if (errorElement.parentNode) errorElement.remove();
  }, 3000);
}

export function removerMensajesFiltro() {
  const mensajes = document.querySelectorAll(".mensaje-error-filtro");
  mensajes.forEach((m) => m.remove());
}

export function mostrarErrorClave(elemento, mensaje) {
  if (!elemento) return;

  const errorElement = document.createElement("div");
  errorElement.className = "mensaje-error-clave";
  errorElement.textContent = mensaje;

  errorElement.style.position = "fixed";
  errorElement.style.background = "#e74c3c";
  errorElement.style.color = "white";
  errorElement.style.padding = "10px 15px";
  errorElement.style.borderRadius = "6px";
  errorElement.style.fontSize = "14px";
  errorElement.style.fontWeight = "bold";
  errorElement.style.zIndex = "10000";
  errorElement.style.boxShadow = "0 4px 12px rgba(0,0,0,0.3)";
  errorElement.style.whiteSpace = "nowrap";
  errorElement.style.fontFamily = "Poppins, sans-serif";

  const rect = elemento.getBoundingClientRect();
  errorElement.style.top = rect.bottom + 10 + "px";
  errorElement.style.left = rect.left + "px";

  document.body.appendChild(errorElement);

  setTimeout(() => {
    if (errorElement.parentNode) errorElement.remove();
  }, 3000);
}

export function removerMensajesClave() {
  const mensajes = document.querySelectorAll(".mensaje-error-clave");
  mensajes.forEach((m) => m.remove());
}
