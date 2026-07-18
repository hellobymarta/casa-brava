"use strict";

/* ==========================================================
   VILLAS & SUITES
   Tres piezas de comportamiento:
   1) Acordeones (Servicios Casa Brava, en dos niveles — la portada de
      cada categoría y, dentro, cada experiencia): un único manejador
      delegado, sin GSAP, ver accordionTriggerHandler.
   2) Revelado en fundido de cada bloque marcado [data-reveal], con
      GSAP + ScrollTrigger.
   3) Parallax muy leve en las fotografías grandes [data-parallax].
   Las piezas 2 y 3 dependen de GSAP/ScrollTrigger (cargado solo en
   esta página) y se desactivan si el usuario pide menos movimiento;
   el acordeón no depende de ninguna librería externa y funciona
   siempre. Si GSAP no carga, todo el contenido ya es visible por
   defecto en el HTML/CSS, sin depender de JS para leerse.
========================================================== */

/* ----------------------------------------------------------
   ACORDEONES — un solo listener delegado en document, reutilizado por
   .ServicesMenu-categoryCover y .ServicesMenu-itemTrigger (cualquier
   botón marcado con [data-accordion-trigger], en cualquier nivel del
   acordeón). Cada botón controla su panel
   vía aria-controls; el panel anima su altura con CSS puro
   (grid-template-rows 0fr → 1fr), así que aquí solo hace falta
   alternar la clase "is-open" y sincronizar aria-expanded. Varios
   paneles pueden estar abiertos a la vez: no es un acordeón exclusivo.
---------------------------------------------------------- */
function accordionTriggerHandler(event) {
  const trigger = event.target.closest("[data-accordion-trigger]");
  if (!trigger) return;

  const panel = document.getElementById(trigger.getAttribute("aria-controls"));
  if (!panel) return;

  const isNowExpanded = trigger.getAttribute("aria-expanded") !== "true";
  trigger.setAttribute("aria-expanded", String(isNowExpanded));
  panel.classList.toggle("is-open", isNowExpanded);
}

document.addEventListener("click", accordionTriggerHandler);
const prefersReducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
const isGsapAvailable = typeof window.gsap !== "undefined";
const isScrollTriggerAvailable = isGsapAvailable && typeof window.ScrollTrigger !== "undefined";
const canAnimateWithScroll = isScrollTriggerAvailable && !prefersReducedMotionQuery.matches;

if (canAnimateWithScroll) {
  gsap.registerPlugin(ScrollTrigger);

  /* Revelado en fundido: cada elemento parte de opacity:0 + un ascenso
     de 1.5rem, y se anima una única vez al entrar en pantalla. Se fija
     con gsap.set() en vez de en el CSS para que, si este bloque nunca
     llega a ejecutarse, el contenido no dependa de JS para ser visible. */
  document.querySelectorAll("[data-reveal]").forEach((revealElement) => {
    gsap.set(revealElement, { opacity: 0, y: 24 });
    gsap.to(revealElement, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: "power2.out",
      scrollTrigger: {
        trigger: revealElement,
        start: "top 88%",
        toggleActions: "play none none none",
      },
    });
  });

  /* Parallax sutil: solo las fotografías grandes se desplazan un poco
     más despacio que el scroll (yPercent de -6 a 6, un recorrido muy
     corto) mientras cruzan el viewport — nunca un movimiento brusco ni
     un escalado. scrub:true liga el avance directamente a la posición
     de scroll, sin inercia añadida. */
  document.querySelectorAll("[data-parallax]").forEach((parallaxImage) => {
    gsap.fromTo(
      parallaxImage,
      { yPercent: -6 },
      {
        yPercent: 6,
        ease: "none",
        scrollTrigger: {
          trigger: parallaxImage,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      }
    );
  });
}
