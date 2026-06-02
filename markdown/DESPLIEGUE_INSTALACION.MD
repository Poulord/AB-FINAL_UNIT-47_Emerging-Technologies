# Instalación y despliegue

Este documento describe cómo ejecutar el proyecto localmente y desplegarlo a Vercel.

## Requisitos

- Navegador moderno (Chrome, Edge, Safari, Firefox)
- Git instalado
- Cuenta en Vercel para despliegue
- (Opcional) servidor estático local como `Live Server` de VS Code o `npx serve`

## Instalación local

1. Clonar el repositorio:

```bash
git clone <URL-del-repositorio>
cd "Web Lilly"
```

2. Abrir `index.html` directamente en el navegador.

3. Para un entorno local más realista, usar un servidor estático:

```bash
npx serve .
```

o, si usas VS Code, instalar y ejecutar `Live Server`.

## Verificación del proyecto

- Comprueba que el menú de navegación funciona.
- Verifica el cambio de estilo del header al hacer scroll.
- Prueba el formulario de contacto y confirma que lo envía por correo usando `mailto:`.
- Revisa que las imágenes carguen correctamente desde `img/`.

## Despliegue en Vercel

Este sitio está preparado para desplegarse como aplicación estática en Vercel.

1. Conecta tu repositorio de GitHub a Vercel.
2. Vercel detectará el contenido estático y usará `vercel.json`.
3. Revisar la configuración de `vercel.json`:

```json
{
  "cleanUrls": true,
  "trailingSlash": false,
  "headers": [
    {
      "source": "/img/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

4. Desplegar desde Vercel y confirmar la URL publicada.

### Recomendaciones de despliegue

- Mantener `cleanUrls` habilitado para URLs amigables.
- Eliminar `trailingSlash` para rutas consistentes.
- Usar caché larga en las imágenes para mejorar el rendimiento.
- Si se agrega una API o backend en el futuro, revisar la configuración de `vercel.json`.

## Actualización de contenido

Para actualizar la web, editar los archivos HTML, CSS o JS en el repositorio y hacer commit.

```bash
git add .
git commit -m "Actualización de contenido"
git push origin main
```

Vercel redeplegará automáticamente cuando se detecten cambios en el repositorio conectado.
