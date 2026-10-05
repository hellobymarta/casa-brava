
/* ==========================================================
   HOME
   Parallax sutil del Hero, preview de miniaturas Feature
   y mapa interactivo de Location.
   El menú móvil se gestiona en js/main.js (compartido).
========================================================== */

(() => {
  "use strict";

  const mainElement = document.querySelector("main");

  // --- Parallax sutil del isotipo y el subtítulo del Hero ---
  const heroIsoImg = mainElement.querySelector(".Hero-isoImg");
  const heroSubcontent = mainElement.querySelector(".Hero-subcontent");

  let isHeroParallaxTicking = false;

  function parallaxHeroHandler() {
    isHeroParallaxTicking = false;

    const scrolled = window.scrollY;

    if (heroIsoImg && heroSubcontent) {
      // Factor bajo (0.5) para que el desplazamiento sea sutil
      heroIsoImg.style.transform = `translateY(-${scrolled * 0.5}px)`;
      // Solo translateY: el centrado horizontal de .Hero-subcontent ya lo
      // resuelve el CSS (margin-inline:auto), así que el parallax no debe
      // tocar el eje X.
      heroSubcontent.style.transform = `translateY(-${scrolled * 0.5}px)`;
    }
  }

  /* rAF-throttle: agrupa las escrituras de estilo en un único frame de pintado
     como máximo por evento de scroll, evitando trabajo de layout repetido.
     passive:true porque el handler nunca llama a preventDefault(). */
  function requestHeroParallaxUpdateHandler() {
    if (isHeroParallaxTicking) {
      return;
    }

    isHeroParallaxTicking = true;
    window.requestAnimationFrame(parallaxHeroHandler);
  }

  window.addEventListener("scroll", requestHeroParallaxUpdateHandler, { passive: true });

  // --- Preview de las miniaturas de las secciones Feature (lightbox modal) ---
  const previewLightbox = mainElement.querySelector(".Preview");
  const previewBackdrop = mainElement.querySelector(".Preview-backdrop");
  const previewCloseButton = mainElement.querySelector(".Preview-close");
  const previewImage = mainElement.querySelector(".Preview-image");
  const previewCaption = mainElement.querySelector(".Preview-caption");
  const previewButtons = mainElement.querySelectorAll(".Feature-previewButton");

  let previewTriggerButton = null;
  let scrollPositionBeforePreview = 0;

  function openPreviewHandler(event) {
    previewTriggerButton = event.currentTarget;

    previewImage.src = previewTriggerButton.dataset.image;
    previewImage.alt = previewTriggerButton.dataset.title;
    previewCaption.textContent = previewTriggerButton.dataset.title;

    previewLightbox.classList.add("isActive");
    previewLightbox.setAttribute("aria-hidden", "false");

    // Bloquea el scroll de fondo conservando la posición para restaurarla al cerrar
    scrollPositionBeforePreview = window.scrollY;
    document.body.classList.add("no-scroll");
    document.body.style.top = `-${scrollPositionBeforePreview}px`;

    // Mueve el foco dentro del diálogo (requisito de accesibilidad para modales).
    // preventScroll evita que el propio focus() dispare un scroll nativo del
    // navegador por encima del bloqueo de scroll que ya gestionamos a mano.
    previewCloseButton.focus({ preventScroll: true });
  }

  function closePreviewHandler() {
    const isOpen = previewLightbox.classList.contains("isActive");
    if (!isOpen) return;

    previewLightbox.classList.remove("isActive");
    previewLightbox.setAttribute("aria-hidden", "true");

    document.body.classList.remove("no-scroll");
    document.body.style.top = "";

    // behavior: "instant" es necesario aquí: sin él, esta restauración hereda
    // el scroll-behavior:smooth global (base.css) y la página se desliza de
    // vuelta en vez de recolocarse al instante — es la causa del salto visual
    // al cerrar el Lightbox.
    window.scrollTo({ top: scrollPositionBeforePreview, left: 0, behavior: "instant" });

    // Devuelve el foco al botón que abrió el lightbox. preventScroll evita un
    // segundo scroll nativo del navegador justo encima del que acabamos de
    // restaurar a mano.
    previewTriggerButton?.focus({ preventScroll: true });
  }

  function previewKeydownHandler(event) {
    const isOpen = previewLightbox.classList.contains("isActive");
    if (!isOpen) return;

    if (event.key === "Escape") {
      closePreviewHandler();
      return;
    }

    // Atrapa el foco dentro del diálogo: solo hay un elemento interactivo (el botón de cerrar)
    if (event.key === "Tab") {
      event.preventDefault();
      previewCloseButton.focus({ preventScroll: true });
    }
  }

  if (previewLightbox && previewBackdrop && previewCloseButton && previewImage && previewCaption) {
    previewButtons.forEach((button) => {
      button.addEventListener("click", openPreviewHandler);
    });

    previewBackdrop.addEventListener("click", closePreviewHandler);
    previewCloseButton.addEventListener("click", closePreviewHandler);
    document.addEventListener("keydown", previewKeydownHandler);
  }

  // --- Mapa interactivo de Location ---
  const locationHotspots = mainElement.querySelectorAll(".Location-hotspot");
  const locationPanels = mainElement.querySelectorAll(".Location-panel");
  const locationPreview = mainElement.querySelector(".Location-preview");
  const locationPreviewImg = mainElement.querySelector(".Location-previewImg");
  const locationPreviewLabel = mainElement.querySelector(".Location-previewLabel");
  const locationMapWrapper = mainElement.querySelector(".Location-mapWrapper");

  const locationImages = {
    "casa-brava": { src: "assets/images/home/casa-brava.jpg", title: "Casa Brava" },
    "playas": { src: "assets/images/home/playa.jpg", title: "Playas y surf" },
    "kuta": { src: "assets/images/home/kuta.jpg", title: "Centro de Kuta" },
  };

  function selectLocationHandler(event) {
    const locationHotspot = event.currentTarget;

    // Controla la visibilidad de la tarjeta de preview y el estado activo del hotspot
    const isAlreadyActive = locationHotspot.classList.contains("isActive");
    const isPreviewVisible = locationPreview.classList.contains("isActive");

    // Si se pulsa el mismo punto con la tarjeta ya visible, solo se oculta
    if (isAlreadyActive && isPreviewVisible) {
      locationPreview.classList.remove("isActive");
      return;
    }

    locationHotspots.forEach((hotspot) => hotspot.classList.remove("isActive"));
    locationHotspot.classList.add("isActive");

    locationPanels.forEach((panel) => panel.classList.remove("isActive"));

    const locationId = locationHotspot.getAttribute("data-location");
    const activePanel = mainElement.querySelector(`#info-${locationId}`);
    activePanel?.classList.add("isActive");

    const info = locationImages[locationId];

    if (info) {
      locationPreviewImg.src = info.src;
      locationPreviewImg.alt = info.title;
      locationPreviewLabel.textContent = info.title;
    }

    locationPreview.classList.add("isActive");

    // Mide y posiciona en el siguiente frame: getBoundingClientRect/
    // offsetWidth/offsetHeight fuerzan un reflow síncrono si se leen justo
    // después de mutar clases, texto e imagen (como ocurría antes, todo en
    // el mismo bloque). Aplazar la lectura y la escritura de left/top a
    // requestAnimationFrame deja que el navegador aplique esas mutaciones
    // dentro de su ciclo normal de estilo/layout en vez de forzarlo a mitad
    // del clic; el cálculo y el resultado final no cambian.
    window.requestAnimationFrame(() => {
      // Posiciona la tarjeta flotante junto al punto pulsado (izquierda o derecha)
      const rect = locationHotspot.getBoundingClientRect();
      const wrapperRect = locationMapWrapper.getBoundingClientRect();

      const x = rect.left - wrapperRect.left;
      const y = rect.top - wrapperRect.top;

      const previewWidth = locationPreview.offsetWidth;
      const previewHeight = locationPreview.offsetHeight;
      const offset = 20;

      let left = locationId === "casa-brava"
        ? x - previewWidth - offset
        : x + offset;
      let top = y - previewHeight - offset;

      // Encaja la tarjeta dentro de los límites del mapa: en pantallas
      // estrechas, un hotspot cerca del borde podía dejar la tarjeta
      // (ancho fijo de 16rem) parcial o totalmente fuera del viewport.
      const maxLeft = Math.max(wrapperRect.width - previewWidth, 0);
      const maxTop = Math.max(wrapperRect.height - previewHeight, 0);

      left = Math.min(Math.max(left, 0), maxLeft);
      top = Math.min(Math.max(top, 0), maxTop);

      locationPreview.style.left = `${left}px`;
      locationPreview.style.top = `${top}px`;
    });
  }

  if (locationPreview && locationMapWrapper) {
    locationHotspots.forEach((locationHotspot) => {
      locationHotspot.addEventListener("click", selectLocationHandler);
    });
  }
})();
