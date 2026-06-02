# Flujo de trabajo y agentes

Este documento explica los roles conceptuales del proyecto, el flujo de experiencia del usuario y la secuencia de desarrollo.

## Flujo de experiencia del usuario

1. El visitante abre la página principal `index.html`.
2. La web muestra un hero visual con llamado a acción para explorar la galería.
3. El usuario navega por el menú hacia secciones específicas: `Gallery`, `Weddings`, `Lifestyle`, `Personal Brands`, `Wellness & Retreats`, `Content Creation` y `Contact`.
4. El contenido se presenta como secciones editoriales con imágenes, texto y enlaces a subpáginas.
5. En `contact.html`, el usuario completa el formulario y envía su consulta por correo.
6. El sitio usa `mailto:` para abrir el cliente de correo predeterminado con los datos del formulario.

## Flujo de desarrollo

1. Editar contenido y estructura en los archivos HTML.
2. Ajustar estilos visuales en `styles.css`.
3. Afinar la interacción y accesibilidad en `script.js`.
4. Probar localmente en un navegador o servidor estático.
5. Hacer commit y push al repositorio.
6. Vercel publica automáticamente los cambios.

## Agentes conceptuales

En el contexto de este proyecto se pueden identificar cuatro roles de apoyo:

- **Sagan** — enfoque en la estética visual, la atmósfera de las imágenes y la experiencia editorial.
- **Carver** — responsable de la experiencia responsiva y del diseño adaptativo en móviles y tabletas.
- **Descartes** — gestiona la organización del proyecto, control de versiones y la lógica de navegación.
- **Jason** — dirige el despliegue, configuración de Vercel y entrega final.

## Cómo usar los agentes

Estos agentes son guías conceptuales para:

- diseñar la estructura visual
- mantener la jerarquía de contenido
- garantizar la experiencia móvil
- conservar la coherencia técnica
- preparar el sitio para un despliegue estable

## Extensión del flujo

Si el proyecto evoluciona hacia una solución con backend, el flujo puede ampliarse:

- Integrar API para envío de formularios
- Añadir CMS o almacenamiento de reservas
- Implementar seguimiento analítico
- Añadir pruebas automatizadas y validación de datos

## Buenas prácticas

- Mantener la estructura de carpetas simple y predecible.
- Usar `vercel.json` para reglas de caché y URLs limpias.
- Separar contenido estático, estilos y scripts.
- Priorizar accesibilidad y experiencia de navegación.
