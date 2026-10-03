# Administración de fotografías

Rama de desarrollo: `codex/admin-galerias`. No fusionar hasta completar la revisión funcional del propietario.

## Ejecutar y probar

1. `npm ci`.
2. Copiar `.env.example` a `.env` e indicar URL y clave **publishable** del proyecto de pruebas. Nunca usar claves secretas o `service_role`.
3. `npm run dev`.
4. Abrir `http://localhost:4173/admin.html` y entrar con una cuenta administradora.

Para probar con un móvil conectado a la misma Wi-Fi, usar `http://IP_DEL_ORDENADOR:4173/admin.html`. El ordenador debe permitir la conexión al puerto 4173. En un despliegue de preview, usar HTTPS. No hace falta instalar una aplicación.

## Uso del panel

- Elegir categoría y fotografías. Se convierten a JPEG, con un lado máximo de 2400 píxeles y calidad 90 %. La conversión elimina los metadatos EXIF del archivo generado. HEIC usa conversión local; si no se puede decodificar, el panel solicita exportar a JPG.
- Las subidas quedan como borradores privados. Revisar la descripción y pulsar Publicar.
- Guardar cambios de descripción, orden, categoría, serie o composición antes de publicar. Las dos series corresponden a los bloques de imágenes de cada página.
- Elegir una portada entre las fotos publicadas: cambia el hero de la categoría y sus tarjetas en Home/Gallery.
- Ocultar una foto retira su acceso público nuevo y su aparición en la galería. Una URL firmada ya emitida puede continuar funcionando hasta una hora; una imagen que ya está cargada puede seguir en el navegador.
- Sustituir una imagen conserva la ficha y su orden. Eliminar requiere confirmación.
- Importar el portfolio inicial conserva 52 imágenes y sus composiciones; se puede reintentar y omite las fichas ya importadas.
- Crear otra cuenta desde «Dar acceso a otra persona». Compartir su contraseña inicial de forma privada. Cada administrador puede cambiar su propia contraseña.

## Supabase

Proyecto de desarrollo: **Web-Lilly Dev**, ref `iuoiibhrtcezuqsssjav`, organización **Pablos's Org**, región París. Es independiente de otros proyectos. La web de producción en main conserva su comportamiento anterior.

- Auth administra identidades y contraseñas.
- `site_admins`: lista de administradores. El navegador no tiene permisos para modificarla.
- `categories`: cinco categorías con nombre editable; las rutas permanecen fijas.
- `photos`: archivo, descripción, categoría, orden, serie, composición, publicación y portada.
- Bucket privado `portfolio`: las políticas permiten lecturas públicas solo para archivos de fotografías publicadas; las escrituras requieren pertenecer a `site_admins`.
- Función `set_photo_cover`: cambia la portada en una transacción y respeta RLS.
- Edge Function `manage-admin`: valida el usuario y su pertenencia a `site_admins` antes de crear una cuenta. La clave privilegiada permanece en el servidor. No envía correos.

La migración está en `supabase/migrations/`. En un proyecto nuevo hay que aplicar la migración, desplegar `manage-admin`, crear la primera identidad desde el dashboard de Auth y añadir su UUID a `site_admins` mediante SQL administrativo. Esta operación inicial no está expuesta al público.

## Recuperación de contraseña

En Auth → URL Configuration, configurar la URL del sitio de preview y sus URLs permitidas `/admin.html` (incluido localhost para desarrollo). Configurar un proveedor SMTP para entregar correos a administradores externos; el correo predeterminado de Supabase tiene restricciones. El panel implementa la solicitud y el cambio de contraseña, pero la entrega depende de esa configuración. No se han enviado correos durante el desarrollo.

## Despliegue de preview

Vercel ejecuta `npm run build` y sirve `dist`. Configurar `SUPABASE_URL` y `SUPABASE_PUBLISHABLE_KEY` **solo en Preview** con el proyecto de desarrollo. `.env` y las credenciales iniciales locales están excluidas de Git. Para producción, decidir si se crea otro proyecto antes de fusionar; no conectar automáticamente main al entorno de pruebas.

Los HTML mantienen las imágenes originales cuando Supabase no está configurado. Con Supabase configurado, las galerías muestran un aviso si falla el servicio para evitar recuperar fotografías que se hayan ocultado. Los archivos históricos en `img/` siguen siendo públicos; ocultar o eliminar una copia de Supabase no elimina su original histórico. Las fotos nuevas solo se suben a Supabase.

## Verificación

`npm run check`, `npm test`, `npm run build`. `tools/verify-backend.mjs` verifica RLS y almacenamiento contra un proyecto de pruebas con dos cuentas temporales y `.env.testing`; requiere provisionarlas previamente. Sus credenciales no se guardan en Git. El script limpia la fotografía que crea. No usar datos de producción.

Antes de fusionar: probar con el propietario subida múltiple, publicación, orden, portada, sustitución, ocultación, eliminación, acceso desde un móvil físico y correo de recuperación. La edición libre de textos y nuevas rutas/categorías queda fuera de esta primera versión.

Verificación realizada: compilación y sintaxis, rechazo de archivos no admitidos, políticas de lectura/escritura y escalada de permisos con cuentas temporales, subida/publicación/portada/eliminación en navegador, importación de 52 fotos, acceso de la cuenta del propietario y ausencia de desbordamiento horizontal a 390 píxeles. No se ha probado aún con un móvil físico ni con un archivo HEIC real.

El auditor de seguridad no detectó problemas de las tablas o el almacenamiento. Sí informa de que la protección de Auth contra contraseñas filtradas está desactivada; revisar su disponibilidad y activación antes de producción: https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection . El índice de autor aparece como no utilizado al inicio; se conserva porque soporta la clave foránea y las operaciones sobre usuarios.
