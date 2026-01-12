export function validarEmailUleam(email) {
  const regexUleam = /^e\d{10}@live\.uleam\.edu\.ec$/;
  return regexUleam.test(email);
}

export function mostrarToast(elemento, mensaje, tipo) {
  if (!elemento) return;

  const mensajeDiv = document.createElement("div");
  mensajeDiv.className = "mensaje-error-toast";
  mensajeDiv.textContent = mensaje;

  mensajeDiv.style.position = "fixed";
  mensajeDiv.style.background = tipo === "error" ? "#e74c3c" : "#2ecc71";
  mensajeDiv.style.color = "white";
  mensajeDiv.style.padding = "10px 15px";
  mensajeDiv.style.borderRadius = "5px";
  mensajeDiv.style.fontSize = "14px";
  mensajeDiv.style.fontWeight = "bold";
  mensajeDiv.style.zIndex = "1000";
  mensajeDiv.style.boxShadow = "0 2px 10px rgba(0,0,0,0.3)";
  mensajeDiv.style.whiteSpace = "nowrap";

  const rect = elemento.getBoundingClientRect();
  mensajeDiv.style.top = rect.bottom + 5 + "px";
  mensajeDiv.style.left = rect.left + "px";

  document.body.appendChild(mensajeDiv);

  setTimeout(() => {
    if (mensajeDiv.parentNode) mensajeDiv.remove();
  }, 3000);
}

export function removerTodosLosToasts() {
  const mensajes = document.querySelectorAll(".mensaje-error-toast");
  mensajes.forEach((m) => m.remove());
}
