"use strict";

/* ========================================================
   Proyecto Casa Brava
   Este archivo ha sido desarrollado por la autora
   (Marta Alarcón Rodríguez).
   Durante el desarrollo se utilizaron herramientas de
   Inteligencia Artificial (ChatGPT y Claude) como apoyo para:
   - optimización del código
   - revisión de lógica JavaScript
   - mejoras de rendimiento
   - animaciones GSAP
   - depuración
   Todo el código fue revisado, probado y adaptado por
   la autora antes de su integración. Ver detalle completo
   en la Memoria del proyecto, apartado "Uso de Inteligencia
   Artificial".
======================================================== */

/* ==========================================================
   MAIN
   Lógica compartida por todas las páginas: menú móvil
   (hamburguesa + overlay + cierre con Escape).
========================================================== */

const hamburgerButton = document.querySelector(".Header-hamburger");
const headerNav = document.querySelector(".Header-nav");
const menuOverlay = document.querySelector(".MenuOverlay");

/**
 * Abre/cierra el menú móvil y sincroniza aria-expanded,
 * el overlay y el bloqueo de scroll del body.
 */
function toggleMenuHandler() {
  const isMenuOpen = headerNav.classList.toggle("is-open");

  menuOverlay.classList.toggle("is-active", isMenuOpen);
  hamburgerButton.setAttribute("aria-expanded", String(isMenuOpen));
  document.body.classList.toggle("no-scroll", isMenuOpen);
}

/**
 * Cierra el menú con la tecla Escape y devuelve el foco
 * al botón de hamburguesa (accesibilidad de teclado).
 */
function closeMenuOnEscapeHandler(event) {
  const isMenuOpen = headerNav.classList.contains("is-open");

  if (event.key === "Escape" && isMenuOpen) {
    toggleMenuHandler();
    hamburgerButton.focus();
  }
}

if (hamburgerButton && headerNav && menuOverlay) {
  hamburgerButton.addEventListener("click", toggleMenuHandler);
  menuOverlay.addEventListener("click", toggleMenuHandler);
  document.addEventListener("keydown", closeMenuOnEscapeHandler);
}
