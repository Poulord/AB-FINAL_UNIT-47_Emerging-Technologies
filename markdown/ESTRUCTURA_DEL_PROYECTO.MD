# Estructura del proyecto

Este proyecto es una landing web estática para Lily Flores Photography, diseñada para presentar servicios y portafolio de manera visual y directa.

## Vista general de archivos

- `index.html` — Página principal con hero visual, presentación de servicios, secciones destacadas y enlaces a otras páginas.
- `gallery.html` — Página de galería con selección de imágenes y navegación a secciones específicas.
- `weddings.html` — Página dedicada a servicios de fotografía de bodas.
- `lifestyle.html` — Página de lifestyle y retratos personales.
- `personal-brands.html` — Página de servicios para marcas personales.
- `wellness-retreats.html` — Página de retiros de bienestar y retratos de lifestyle.
- `content-creation.html` — Página de creación de contenido y assets sociales.
- `contact.html` — Página de contacto con formulario que envía correo mediante `mailto:`.
- `styles.css` — Estilos globales, tipografía, diseño responsivo y componentes visuales.
- `script.js` — Interactividad del menú, animaciones de scroll, activación de enlaces y lógica del formulario de contacto.
- `vercel.json` — Configuración de despliegue para Vercel y directivas de caché para imágenes.
- `img/` — Carpeta de recursos visuales organizados por categorías de sesión.
- `.gitignore` — Archivos ignorados por Git.
- `.vercel/` — Archivos de configuración local de Vercel.

## Organización de contenido

- Las páginas se apoyan en una navegación común ubicada en `header.site-header`.
- `styles.css` controla el estilo global, la tipografía y las clases reutilizables como `section`, `photo-card`, `service-item` y `contact-form`.
- `script.js` agrega comportamiento accesible, incluyendo:
  - cambio de estilo de header al hacer scroll
  - apertura/cierre de menú en mobile
  - marcado de enlace activo en navegación
  - animaciones `reveal` con `IntersectionObserver`
  - envío del formulario de contacto con `mailto:`

## Organización de imágenes

La carpeta `img/` agrupa los recursos por tema:
- `About me/`
- `Brands/`
- `Content creator/`
- `Lifestyle/`
- `wedding/`
- `Wellnes & retreats/`

Cada categoría contiene imágenes de ejemplo usadas en las páginas correspondientes.

## Notes de carpetas adicionales

- `qa/` contiene artefactos de presentación, bocetos y contenido de trabajo adicional que no forma parte del sitio de producción.
