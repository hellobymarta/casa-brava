"use strict";

/* ==========================================================
   ABOUT
   Vídeos con carga diferida (patrón facade): ningún iframe de YouTube
   existe en el DOM hasta que se pulsa reproducir, para no penalizar el
   rendimiento desde el primer segundo. Hasta entonces cada facade es una
   miniatura estática (la portada del vídeo, vía CSS background-image
   asignado aquí desde data-video-id) dibujada con un único manejador
   compartido para los dos vídeos de la página.
========================================================== */

const videoFacadeButtons = document.querySelectorAll(".VideoFeature-facade");

/**
 * Sustituye la miniatura de un vídeo por su iframe real de YouTube (modo
 * sin cookies, con autoplay) y mueve el foco al reproductor.
 */
function loadVideoHandler(event) {
  const facadeButton = event.currentTarget;
  const videoId = facadeButton.dataset.videoId;
  const videoTitle = facadeButton.dataset.videoTitle;
  const videoIframe = document.createElement("iframe");

  videoIframe.className = "VideoFeature-iframe";
  videoIframe.src = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`;
  videoIframe.title = videoTitle;
  videoIframe.loading = "lazy";
  videoIframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
  videoIframe.allowFullscreen = true;

  facadeButton.replaceWith(videoIframe);

  videoIframe.focus();
}

videoFacadeButtons.forEach((facadeButton) => {
  const videoId = facadeButton.dataset.videoId;

  facadeButton.style.backgroundImage = `url("https://i.ytimg.com/vi/${videoId}/hqdefault.jpg")`;
  facadeButton.addEventListener("click", loadVideoHandler);
});

/* ==========================================================
   HERO + ORIGEN
   Reveal en cascada del contenido de Origen la primera vez que entra en pantalla.
========================================================== */
const heroTransitionSection = document.querySelector(".HeroTransition");
const originSection = document.querySelector(".Origin");
const prefersReducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

/* Esta página revela cuatro bloques distintos (Origen, mosaico de
   Materiales, "El proceso" y el Footer) con el mismo patrón: visibles
   por defecto en el CSS, una clase "--animated" activa su estado oculto
   inicial (añadida aquí, nunca en el HTML/CSS de partida) y, solo si el
   navegador soporta IntersectionObserver y la persona no pidió menos
   movimiento, se revelan una única vez al entrar en pantalla. Así, si
   JS no llega a ejecutarse, el contenido nunca depende de él para
   leerse. canRevealWithMotion agrupa esa condición compartida;
   revealOnceHandler evita repetir la construcción del observer cuatro veces. */
const canRevealWithMotion = !prefersReducedMotionQuery.matches && "IntersectionObserver" in window;

/**
 * Observa observedElement y, la primera vez que entra en pantalla,
 * añade revealClass a cada elemento de revealTargets y deja de observar.
 */
function revealOnceHandler(observedElement, revealTargets, revealClass, threshold) {
  const observer = new IntersectionObserver(
    (entries, currentObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        revealTargets.forEach((target) => target.classList.add(revealClass));
        currentObserver.disconnect();
      });
    },
    { threshold }
  );

  observer.observe(observedElement);
}

// --- Origen: revelado en cascada (eyebrow, título, texto) ---
if (heroTransitionSection && originSection && canRevealWithMotion) {
  heroTransitionSection.classList.add("HeroTransition--animated");
  revealOnceHandler(originSection, [originSection], "Origin--visible", 0.35);
}

// --- Mosaico de Materiales: las seis piezas se revelan como un único conjunto ---
const craftMosaic = document.querySelector(".Craft-mosaic");
const craftMosaicTiles = document.querySelectorAll(".Craft-mosaicTile");

if (craftMosaic && craftMosaicTiles.length && canRevealWithMotion) {
  craftMosaic.classList.add("Craft-mosaic--animated");
  revealOnceHandler(craftMosaic, craftMosaicTiles, "Craft-mosaicTile--visible", 0.2);
}

// --- "El proceso" (Vídeo 1): localizado por el id del título (único),
// no por una clase compartida con "La decisión", para no depender del
// orden en el DOM ---
const videoProcessTitle = document.getElementById("video-title");
const videoProcessSection = videoProcessTitle ? videoProcessTitle.closest(".VideoFeature") : null;

if (videoProcessSection && canRevealWithMotion) {
  videoProcessSection.classList.add("VideoFeature--animated");
  revealOnceHandler(videoProcessSection, [videoProcessSection], "VideoFeature--visible", 0.25);
}

/* ==========================================================
   PARALLAX DEL SIGNO DE CITA (Filosofía)
   Único elemento de la página con desplazamiento continuo ligado al scroll. 
   Actualiza una custom property (--philosophy-parallax-offset), nunca transform
   directamente: así el breakpoint móvil puede seguir centrando el signo con su
   propio translateX sin que este script se lo pise.
========================================================== */
const philosophyMark = document.querySelector(".Philosophy-mark");

let isPhilosophyParallaxTicking = false;

/**
 * Desplazamiento del signo de cita a una fracción mínima (8%) de lo 
 * que el propio elemento ha recorrido respecto al centro del viewport.
 */
function updatePhilosophyParallaxHandler() {
  isPhilosophyParallaxTicking = false;

  const markTop = philosophyMark.getBoundingClientRect().top;
  const viewportCenter = window.innerHeight / 2;
  const parallaxOffset = (markTop - viewportCenter) * -0.08;

  philosophyMark.style.setProperty("--philosophy-parallax-offset", `${parallaxOffset}px`);
}

function requestPhilosophyParallaxUpdateHandler() {
  if (isPhilosophyParallaxTicking) {
    return;
  }

  isPhilosophyParallaxTicking = true;
  window.requestAnimationFrame(updatePhilosophyParallaxHandler);
}

if (philosophyMark && !prefersReducedMotionQuery.matches) {
  window.addEventListener("scroll", requestPhilosophyParallaxUpdateHandler, { passive: true });
  requestPhilosophyParallaxUpdateHandler();
}

// --- Panel de contacto (Footer): solo si el Footer de esta página lleva
// el modificador --corner (about.html es la única que lo añade), así
// que nunca afecta al Footer compartido de las demás páginas ---
const footerCorner = document.querySelector(".Footer--corner");
const footerWrapper = footerCorner ? footerCorner.querySelector(".Footer-wrapper") : null;

if (footerCorner && footerWrapper && canRevealWithMotion) {
  footerCorner.classList.add("Footer--animated");
  revealOnceHandler(footerWrapper, [footerWrapper], "Footer-wrapper--visible", 0.2);
}
