# Casa Brava — Boutique Hotel

Sitio web editorial para **Casa Brava**, un complejo de villas y suites en Kuta Mandalika, Lombok (Indonesia). El proyecto presenta la propiedad, sus villas, experiencias y servicios con un lenguaje visual propio de una publicación de arquitectura o diseño, más que el de un catálogo de reservas al uso.

Las reservas no se gestionan desde el propio sitio: se derivan a correo electrónico, teléfono y WhatsApp.

---

## Objetivos del proyecto

- Construir un sitio web completo, multipágina, con **HTML5, CSS3 y JavaScript Vanilla**, sin frameworks ni librerías de terceros salvo una excepción justificada (GSAP, ver más abajo).
- Aplicar una arquitectura CSS ordenada y escalable inspirada en **SUIT CSS**, con **Mobile First** como estrategia de desarrollo.
- Cumplir los criterios de **accesibilidad WCAG 2.2 AA**.
- Aplicar buenas prácticas de **SEO técnico** y **rendimiento web** (Core Web Vitals).
- Mantener un código legible, comentado donde aporta valor, y sin redundancias.

---

## Tecnologías utilizadas

| Tecnología | Uso |
|---|---|
| **HTML5** | Marcado semántico de las 5 páginas del sitio |
| **CSS3** | Maquetación, diseño responsive, animaciones, custom properties |
| **JavaScript (Vanilla, ES2023)** | Interactividad: menú, acordeones, lightbox, mapa interactivo, revelado en scroll |
| **GSAP + ScrollTrigger** (CDN, `defer`) | Único recurso externo del proyecto. Se usa exclusivamente para animaciones de scroll en `experiences.html` y `villas-suites.html`. Si el CDN no carga, la página sigue siendo 100% funcional y legible: todo el contenido es visible por defecto en el CSS |
| **Google Fonts** (Manrope, Fraunces, Spectral) | Tipografía del proyecto, cargada vía `<link>` con `preconnect` |

No se ha usado jQuery, ni ningún framework (React, Vue, Angular), ni frameworks de utilidades CSS (Bootstrap, Tailwind), ni TypeScript.

---

## Estructura de carpetas

```
CASABRAVA/
├── index.html                  # Página de inicio
├── html/
│   ├── about.html               # Sobre Casa Brava
│   ├── contact.html             # Contacto
│   ├── experiences.html         # Experiencias
│   └── villas-suites.html       # Villas & Suites
├── css/
│   ├── base.css                 # Reset, tokens, tipografía y utilidades globales
│   ├── home.css
│   ├── about.css
│   ├── contact.css
│   ├── experiences.css
│   └── villas-suites.css
├── js/
│   ├── main.js                  # Menú responsive (compartido por las 5 páginas)
│   ├── home.js
│   ├── about.js
│   ├── experiences.js
│   └── villas-suites.js
└── assets/
    ├── icons/                   # Logotipo e isotipo de marca
    └── images/
        ├── home/
        ├── about/
        ├── experiences/
        └── shared/               # Fotografía reutilizada entre páginas
            └── carousel/         # Fallback JPG de cada imagen (ver picture/avif/webp)
```

Cada página tiene su propia hoja de estilos y, cuando lo necesita, su propio script; `base.css` y `main.js` son compartidos por las cinco páginas (reset, custom properties, header y menú de navegación).

---

## Instalación y uso

El proyecto no requiere build ni dependencias: es HTML/CSS/JS estático.

1. Clona o descarga la carpeta del proyecto.
2. Abre `index.html` directamente en el navegador, o sirve la carpeta con un servidor local (recomendado, para que las rutas relativas y `fetch`/`picture` se comporten igual que en producción):

   ```bash
   # Con Python
   python3 -m http.server 8000

   # Con la extensión Live Server de VS Code
   # clic derecho sobre index.html → "Open with Live Server"
   ```

3. Navega desde `index.html` al resto de páginas usando el menú superior.

No hay variables de entorno ni pasos de configuración adicionales.

---

## Características principales

- **5 páginas**: Inicio, Villas & Suites, Experiencias, Sobre Casa Brava y Contacto, cada una con una composición editorial distinta (nunca se repite el mismo patrón de sección dos veces).
- **Menú responsive** con overlay a pantalla completa en móvil/tablet, cierre con `Escape` y gestión de foco accesible.
- **Acordeones CSS-only** (servicios y detalles de villa) mediante `display: grid; grid-template-rows: 0fr → 1fr`, sin medir alturas por JavaScript.
- **Lightbox accesible** en la galería del Hero (Home): atrapa el foco, cierra con `Escape` o clic en el fondo, y devuelve el foco al elemento que lo abrió.
- **Mapa interactivo** de ubicación (ubicación de la propiedad y puntos de interés) en la página de Inicio.
- **Vídeos con carga diferida** (patrón *facade*): el iframe de YouTube no existe en el DOM hasta que la persona pulsa reproducir.
- **Revelado progresivo en scroll** (`IntersectionObserver` y, en dos páginas, GSAP ScrollTrigger) implementado como mejora progresiva: todo el contenido es visible por defecto aunque JavaScript no se ejecute.
- **Formulario de contacto** accesible, con `label` asociado a cada campo, `autocomplete` y envío vía `mailto:`.

---

## Accesibilidad (WCAG 2.2 AA)

- Jerarquía de encabezados correcta y `<h1>` único por página.
- Contraste de texto verificado analíticamente (ratio ≥ 4.5:1 en texto normal, ≥ 3:1 en elementos gráficos y textos grandes) para cada combinación de color usada, incluidos los acentos por categoría de `villas-suites.html`.
- Foco visible en todos los elementos interactivos, navegación completa por teclado (incluida la trampa de foco del lightbox y del menú móvil).
- Uso correcto de `aria-label`, `aria-expanded`, `aria-controls`, `aria-current` y `aria-hidden` en navegación, botones de acordeón y elementos puramente decorativos.
- `prefers-reduced-motion: reduce` respetado en todo el proyecto: las duraciones de transición y animación se reducen a `0s` globalmente mediante custom properties, sin necesidad de duplicar reglas.
- Todas las imágenes informativas llevan `alt` descriptivo; las puramente decorativas usan `alt=""` y `aria-hidden="true"`.
- Área táctil de botones e enlaces dimensionada para uso en móvil.

---

## Diseño responsive

- Metodología **Mobile First**: cada hoja de estilos parte de la maqueta móvil y añade complejidad con `min-width` en `@media`.
- Breakpoints verificados: móvil pequeño, móvil, tablet, tablet horizontal, laptop, desktop y desktop grande.
- Sin scroll horizontal ni desbordamientos en ningún breakpoint.
- Unidades relativas (`rem`, `em`, `%`, `clamp()`) para tipografía y espaciados; `vh`/`vw`/`svh` únicamente donde el diseño depende del viewport (heroes a pantalla completa).
- Imágenes con `aspect-ratio` y `object-fit` para evitar *layout shift* al cargar.

---

## Optimizaciones de rendimiento

- **Formato de imagen en cascada**: cada fotografía se sirve como `<picture>` con AVIF → WebP → JPG de fallback, eligiendo automáticamente el formato más ligero que soporte el navegador.
- `loading="lazy"` en toda imagen fuera del primer viewport; `fetchpriority="high"` y `decoding="async"` en la imagen LCP de cada página.
- `width`/`height` explícitos en todas las imágenes para reservar espacio y evitar CLS.
- `preconnect` a los orígenes de fuentes externas (Google Fonts) y `defer` en todos los scripts.
- GSAP/ScrollTrigger cargados solo en las dos páginas que los necesitan, y solo se ejecutan si el CDN respondió y la persona no ha pedido menos movimiento.
- Sin CSS ni JavaScript muerto: el proyecto se auditó para eliminar reglas, clases y funciones sin uso.
- Carpeta `assets/` depurada: se eliminaron variantes de marca, archivos de diseño (`.ai`) y fotografías no utilizadas en el sitio final.

---

## SEO básico

- `<title>` y `<meta name="description">` únicos y descriptivos por página.
- `<meta name="robots" content="index,follow">` en todas las páginas.
- Favicon en SVG.
- Comentarios `TODO` preparados con la plantilla completa de `canonical` y Open Graph (`og:title`, `og:description`, `og:image`, `og:url`) lista para activarse en cuanto el proyecto tenga dominio definitivo.
- Estructura semántica (`header`, `nav`, `main`, `section`, `article`, `footer`) que favorece la interpretación del contenido por buscadores y lectores de pantalla.

---

## Autor

**Marta Alarcón Rodríguez**
Proyecto Casa Brava — desarrollo frontend con HTML5, CSS3 y JavaScript Vanilla.

**Fecha:** julio de 2026
