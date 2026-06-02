# Arquitectura del proyecto

## Visión general

Este proyecto es una web estática de presentación para Lily Flores Photography. Su arquitectura se basa en HTML, CSS y JavaScript sin backend propio, lo que facilita el despliegue rápido y la carga eficiente de contenido visual.

## Pilares arquitectónicos

- **Estático y ligero**: todas las páginas son HTML estático y se sirven directamente desde Vercel.
- **Responsive**: diseño adaptable a pantallas grandes y móviles.
- **Modular**: estilos y scripts compartidos en `styles.css` y `script.js`.
- **Accesible**: navegación clara, estados de menú y botones con `aria`.
- **Optimizado para imágenes**: caché a largo plazo para activos en `img/`.

## Componentes clave

- `index.html` — página principal con hero, secciones de servicio y enlaces directos.
- `gallery.html` — edición visual del portafolio.
- `weddings.html` — sección dedicada a fotografía de bodas.
- `lifestyle.html` — página de lifestyle y retratos.
- `personal-brands.html` — imagen de marca personal y sesiones corporativas.
- `wellness-retreats.html` — fotografía para retiros de wellness y experiencias.
- `content-creation.html` — contenido para redes, campañas y edición social.
- `contact.html` — formulario de contacto con envío por correo.
- `styles.css` — estilos globales, tipografía, layout, grillas y componentes.
- `script.js` — comportamiento del header, animaciones de entrada, navegación y formulario.
- `vercel.json` — configuración de despliegue para URLs limpias y caché de imágenes.
- `img/` — recursos organizados por tipo de sesión.

## Arquitectura front-end

- **Navegación global**: reutilizada en todas las páginas para mantener consistencia.
- **Hero visual**: cada página usa un bloque `hero` con imagen de impacto y mensaje claro.
- **Secciones con `reveal`**: animaciones de aparición controladas por `IntersectionObserver`.
- **Menu mobile**: botón `nav-toggle` que alterna la clase `menu-open` en `body`.
- **Contacto por correo**: el `contact-form` se procesa en el cliente y construye un enlace `mailto:`.

## Flujo de datos

### Contacto

1. El usuario llena el formulario en `contact.html`.
2. `script.js` intercepta el envío y previene el comportamiento predeterminado.
3. Se construye un `mailto:` con el nombre, email, tipo de sesión y mensaje.
4. Se abre el cliente de correo del usuario para enviar el mensaje.

### Navegación activa

- `script.js` detecta la página actual y resalta el enlace correspondiente en el menú.
- El estado del menú se restablece al navegar para mejorar la experiencia en mobile.

## Despliegue y hosting

- La web se despliega en Vercel como sitio estático.
- `vercel.json` habilita `cleanUrls` y deshabilita `trailingSlash`.
- También configura `Cache-Control` para la carpeta `/img/`.

## Mejora futura

- Integrar backend con formulario real o API de contacto.
- Añadir generación de assets optimizados y carga diferida de imágenes.
- Incorporar un CMS ligero para edición de contenido.
- Agregar analítica y metadatos SEO más detallados.

## Notas sobre el proyecto

- El foco actual es una experiencia editorial y visual clara.
- La arquitectura favorece cambios rápidos sin complejidad de servidor.
- El sitio está listo para escalar con un backend sin cambiar su base estática.
