# Lily Flores Photography

Landing web estática para Lily Flores Photography, construida como una experiencia visual elegante para presentar servicios de fotografía editorial, bodas, lifestyle, marcas personales, retiros wellness y creación de contenido.

## Qué incluye este proyecto

- Página principal `index.html` con hero visual y navegación a servicios.
- Páginas de servicio separadas para cada categoría:
  - `weddings.html`
  - `lifestyle.html`
  - `personal-brands.html`
  - `wellness-retreats.html`
  - `content-creation.html`
- Galería principal en `gallery.html`.
- Formulario de contacto en `contact.html` con envío vía correo.
- Estilos globales en `styles.css`.
- Interactividad de navegación y formulario en `script.js`.
- Configuración de despliegue en `vercel.json`.
- Contenido visual organizado en `img/`.

## Tecnologías utilizadas

- HTML5
- CSS3
- JavaScript (ES6)
- Vercel
- GitHub

## Documentación adicional

- `ARQUITECTURA.MD` — Arquitectura técnica y diseño del proyecto.
- `ESTRUCTURA_DEL_PROYECTO.MD` — Organización de archivos y recursos.
- `DESPLIEGUE_INSTALACION.MD` — Instrucciones para correr el proyecto localmente y desplegar en Vercel.
- `FLUJO_Y_AGENTES.MD` — Flujo de usuario, flujo de desarrollo y agentes conceptuales.

## Cómo ejecutar localmente

1. Clonar el repositorio:

```bash
git clone <URL-del-repositorio>
cd "Web Lilly"
```

2. La configuración pública actual está en `tools/public-supabase.json`. Para usar otro proyecto, copiar `.env.example` a `.env` e indicar su URL y clave publishable.

3. Para usar un servidor local recomendado:

```bash
npm ci
npm run dev
```

4. Abrir `http://localhost:4173/` para la web y `/admin.html` para el panel. Ver [guía de administración](markdown/ADMINISTRACION.MD).

## Despliegue

El sitio está preparado para un despliegue estático en Vercel.

- `vercel.json` habilita URLs limpias y controla la caché para imágenes.
- Vercel ejecuta `npm run build` y publica `dist/`. La compilación usa `tools/public-supabase.json` como configuración pública por defecto. `SUPABASE_URL` y `SUPABASE_PUBLISHABLE_KEY`, configuradas juntas en Vercel, permiten elegir otro proyecto y tienen prioridad.

## Mejores prácticas

- Mantener `styles.css` y `script.js` como recursos compartidos para toda la web.
- Evitar copiar estilos o scripts entre páginas.
- Mantener la navegación consistente en todas las páginas.
- Optimizar y versionar imágenes dentro de `img/`.
