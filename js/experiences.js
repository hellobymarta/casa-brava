"use strict";

/* ==========================================================
   EXPERIENCES
   Tres piezas en esta página:
   1) Revelados editoriales (GSAP + ScrollTrigger): la fotografía de
      Piscinas y Sobremesa se descubre con un wipe atado al scroll, los
      titulares se revelan línea a línea y los bloques de texto de las
      bandas de Estampas entran con un fade sutil por elemento — ver el
      bloque REVELADOS más abajo para el porqué de cada decisión técnica.
      La fotografía de portada de Estampas (el paddleboard) y las cinco
      fotografías de los momentos no llevan el atributo data-reveal-media:
      se muestran enteras en cuanto el navegador las carga, sin ningún
      efecto de descubrimiento por scroll ni parallax.
   2) Revelado en cascada (IntersectionObserver) del resto de bloques
      (texto de Piscinas/Sobremesa y toda la Guía): cada uno es visible
      desde el primer fotograma en CSS — las clases --animated solo las
      añade este script, y con prefers-reduced-motion nunca se añaden.
      Estampas no usa este sistema (ver más abajo el porqué): es el
      cover (Album-band--cover, pensado para caber entero en el primer
      viewport sin scroll) más un mosaico de retícula CSS Grid
      (Album-mosaic) debajo, y cada bloque de foto/texto dentro de ambos
      necesita revelarse cuando de verdad entra en pantalla, no todos a
      la vez cuando lo hace la sección entera.
========================================================== */
const poolsSection = document.querySelector(".Pools");
const gatherSection = document.querySelector(".Gather");
const guideSection = document.querySelector(".Guide");
const prefersReducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
const isGsapAvailable = typeof window.gsap !== "undefined";

/* ==========================================================
   REVELADOS EDITORIALES (GSAP + ScrollTrigger)
   Piscinas y Sobremesa comparten una misma gramática: cada fotografía
   marcada [data-reveal-media] se descubre con un wipe de clip-path (de
   arriba abajo) atado al scroll (scrub, nunca un fade), una sola vez, al
   entrar en pantalla.
   La portada de Estampas (el paddleboard) y las cinco fotografías de los
   momentos no llevan el atributo data-reveal-media (ver experiences.html):
   no pasan por este bloque en absoluto, así que se pintan completas en
   cuanto el navegador termina de cargarlas, sin ninguna animación.
   Cada titular marcado [data-reveal-line] se revela línea a línea desde
   detrás de una máscara (overflow:hidden + yPercent), una sola vez, sin
   scrub — el texto se lee mejor con una entrada limpia que siguiendo el
   scroll a medias. Cada bloque de texto de las bandas de Estampas
   marcado [data-reveal-fade] entra con un fade + desplazamiento sutil,
   también una sola vez y con su propio ScrollTrigger: cover y mosaico
   son dos composiciones con varios bloques cada una, así que animar todo
   de golpe (la cascada de sección completa que usan Piscinas/Sobremesa/
   Guía) dejaría los bloques de más abajo ya "revelados" antes de que el
   usuario llegue a verlos — cada uno necesita revelarse cuando de verdad
   entra en pantalla.
   Ninguna clase CSS oculta nada por defecto (ver el comentario en
   experiences.css): aquí, con gsap.set(), se establece el estado inicial
   "oculto" justo antes de animar, y solo si GSAP, ScrollTrigger están
   disponibles y prefers-reduced-motion está apagado. Si cualquiera de
   esas condiciones falla, este bloque no hace nada — el contenido se
   queda tal cual está en el HTML, entero y visible. */
const isScrollTriggerAvailable = isGsapAvailable && typeof window.ScrollTrigger !== "undefined";
const canAnimateRevealsWithScroll = isScrollTriggerAvailable && !prefersReducedMotionQuery.matches;

if (canAnimateRevealsWithScroll) {
  gsap.registerPlugin(ScrollTrigger);

  document.querySelectorAll("[data-reveal-media]").forEach((mediaElement) => {
    const revealDelay = Number(mediaElement.dataset.revealDelay || 0);

    /* Rango start/end amplio (95%→10%) y scrub:1.5 — cuanto mayor el
       número, más "persigue" el wipe a la posición del scroll en vez de
       seguirla al milímetro, dando una sensación de inercia suave en
       lugar de un movimiento pegado al pixel. */
    gsap.set(mediaElement, { clipPath: "inset(0 0 100% 0)" });
    gsap.to(mediaElement, {
      clipPath: "inset(0 0% 0% 0)",
      ease: "none",
      delay: revealDelay,
      scrollTrigger: {
        trigger: mediaElement,
        start: "top 95%",
        end: "top 10%",
        scrub: 1.5,
      },
    });
  });

  document.querySelectorAll("[data-reveal-line]").forEach((lineElement) => {
    const innerLine = lineElement.querySelector(".Reveal-lineInner");
    if (!innerLine) {
      return;
    }

    gsap.set(innerLine, { yPercent: 110 });
    gsap.to(innerLine, {
      yPercent: 0,
      duration: 0.9,
      ease: "power3.out",
      scrollTrigger: {
        trigger: lineElement,
        start: "top 90%",
        toggleActions: "play none none none",
      },
    });
  });

  document.querySelectorAll("[data-reveal-fade]").forEach((fadeElement) => {
    gsap.set(fadeElement, { opacity: 0, y: 20 });
    gsap.to(fadeElement, {
      opacity: 1,
      y: 0,
      duration: 0.7,
      ease: "power2.out",
      scrollTrigger: {
        trigger: fadeElement,
        start: "top 90%",
        toggleActions: "play none none none",
      },
    });
  });

  /* Línea bajo el titular de Estampas: se dibuja de 0 a 100% de ancho una
     sola vez, sin scrub — misma lógica que [data-reveal-line], pero
     animando scaleX (transform-origin: center ya fijado en CSS) en vez
     de width, para no disparar reflow en cada frame. Microinteracción
     deliberadamente discreta: un único ease suave, sin rebote ni
     repetición. */
  document.querySelectorAll("[data-reveal-draw]").forEach((ruleElement) => {
    gsap.set(ruleElement, { scaleX: 0 });
    gsap.to(ruleElement, {
      scaleX: 1,
      duration: 0.8,
      ease: "power2.inOut",
      scrollTrigger: {
        trigger: ruleElement,
        start: "top 90%",
        toggleActions: "play none none none",
      },
    });
  });
}

/* ==========================================================
   REVELADO EN CASCADA AL ENTRAR EN PANTALLA
========================================================== */

/**
 * Observa una sección y, la primera vez que cruza el umbral de pantalla,
 * le añade el modificador --visible (revelado en cascada gobernado por
 * CSS) y deja de observarla.
 */
function revealSectionOnceHandler(entries, observer) {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) {
      return;
    }

    entry.target.classList.add(`${entry.target.dataset.revealName}--visible`);
    observer.unobserve(entry.target);
  });
}

if (!prefersReducedMotionQuery.matches && "IntersectionObserver" in window) {
  /* threshold: 0 + rootMargin (no un porcentaje de área visible) porque la
     revelación debe depender del borde de la sección cruzando la pantalla,
     no de qué proporción de su alto total se ve a la vez: con un threshold
     alto, una sección más alta que varias veces el viewport (caso de
     .Guide, con seis capítulos) podría no llegar nunca a mostrar ese
     porcentaje de su área de una sola vez, y el callback no se dispararía.
     rootMargin negativo en el borde inferior evita que se revele con solo
     un píxel asomando por el borde de la pantalla. */
  const revealObserver = new IntersectionObserver(revealSectionOnceHandler, {
    threshold: 0,
    rootMargin: "0px 0px -10% 0px",
  });
  const revealSections = [
    { element: poolsSection, name: "Pools" },
    { element: gatherSection, name: "Gather" },
    { element: guideSection, name: "Guide" },
  ];

  revealSections.forEach(({ element, name }) => {
    if (!element) {
      return;
    }

    element.dataset.revealName = name;
    element.classList.add(`${name}--animated`);
    revealObserver.observe(element);
  });
}
