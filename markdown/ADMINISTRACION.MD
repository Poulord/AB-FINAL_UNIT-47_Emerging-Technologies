# Administración de fotografías

Rama de desarrollo: `codex/admin-galerias`. No fusionar hasta completar la revisión funcional del propietario.

## Ejecutar y probar

1. `npm ci`.
2. La configuración pública actual está en `tools/public-supabase.json`. Si se necesita otro proyecto, copiar `.env.example` a `.env` e indicar URL y clave **publishable**. Nunca usar claves secretas o `service_role`.
3. `npm run dev`.
4. Abrir `http://localhost:4173/admin.html` y entrar con una cuenta administradora.

Para probar con un móvil conectado a la misma Wi-Fi, usar `http://IP_DEL_ORDENADOR:4173/admin.html`. El ordenador debe permitir la conexión al puerto 4173. En un despliegue de preview, usar HTTPS. No hace falta instalar una aplicación.

## Uso del panel

- Elegir categoría y grupo de destino antes de seleccionar las fotografías. Se convierten a JPEG, con un lado máximo de 2400 píxeles y calidad 90 %. La conversión elimina los metadatos EXIF del archivo generado. HEIC usa conversión local; si no se puede decodificar, el panel solicita exportar a JPG.
- Las subidas quedan como borradores privados. Revisar la descripción y pulsar Publicar. No hay enlace público al panel: se accede por `/admin` o `/admin.html`.
- Guardar cambios de descripción, orden, categoría, grupo o composición antes de publicar. El orden de las fotos se aplica dentro de su grupo.
- Elegir una portada entre las fotos publicadas: cambia el hero de la categoría y sus tarjetas en Home/Gallery.
- Ocultar una foto retira su acceso público nuevo y su aparición en la galería. Una URL firmada ya emitida puede continuar funcionando hasta una hora; una imagen que ya está cargada puede seguir en el navegador.
- Sustituir una imagen conserva la ficha y su orden. Eliminar requiere confirmación.
- Importar el portfolio inicial conserva 52 imágenes y sus composiciones; se puede reintentar y omite las fichas ya importadas.
- Crear otra cuenta desde «Dar acceso a otra persona». Compartir su contraseña inicial de forma privada. Cada administrador puede cambiar su propia contraseña.

## Grupos y zonas

| Categoría | Organización recomendada |
| --- | --- |
| Weddings | Un grupo por boda, sin mezclar celebraciones. |
| Lifestyle | Una selección conjunta si encaja; separar por sesión cuando cambian la familia, pareja o historia. |
| Personal Brands | Un grupo por cliente o campaña. |
| Wellness & Retreats | Un grupo por retiro o evento; un solo grupo si corresponde al mismo retiro. |
| Content Creation | Un grupo por campaña o colaboración; las parejas nunca se forman entre grupos distintos. |

1. Crear o renombrar el grupo desde su categoría. El nombre identifica el grupo en el panel; no incluir datos confidenciales, ya que los grupos con fotos publicadas se pueden consultar en la API. El título opcional es lo que aparece como encabezado en la página.
2. Elegir la zona principal o secundaria. Conservan los fondos y diseños existentes; puede haber cualquier número de grupos dentro de cada zona. Los grupos se separan con espacio y una línea discreta.
3. Seleccionar ese grupo en «Grupo de destino», elegir las fotos y guardarlas como borradores. Después revisar y publicar cada foto. El panel permite filtrar por grupo.
4. Para mover una foto, elegir categoría y grupo en su ficha y guardar. Para mover todas las fotos de un grupo entre zonas, cambiar la zona del grupo y guardar; la base de datos las traslada juntas.
5. Los grupos vacíos o con solo borradores no aparecen en la web. Para eliminar un grupo primero hay que trasladar sus fotos, incluidos los borradores. La portada sigue perteneciendo a la categoría completa.

La migración conserva las antiguas series como grupos iniciales, con títulos visibles vacíos para mantener la estética. Las 56 fotos existentes al aplicar el cambio mantienen zona, orden, composición y publicación. Los nombres «Boda 1», «Boda 2», etc. se pueden cambiar; las nuevas fotos se asignan explícitamente al grupo elegido, sin intentar deducirlo de la imagen.

## Supabase

Proyecto de desarrollo: **Web-Lilly Dev**, ref `iuoiibhrtcezuqsssjav`, organización **Pablos's Org**, región París. Es independiente de otros proyectos. El código actual está fusionado en main. La configuración pública por defecto utiliza este proyecto.

- Auth administra identidades y contraseñas.
- `site_admins`: lista de administradores. El navegador no tiene permisos para modificarla.
- `categories`: cinco categorías con nombre editable; las rutas permanecen fijas.
- `photo_collections`: grupo, categoría, zona, título opcional y orden. RLS permite gestión solo a administradores y lectura pública solo si contiene fotos publicadas.
- `photos`: archivo, descripción, categoría, grupo, orden dentro del grupo, zona, composición, publicación y portada. Una clave foránea compuesta impide asignaciones entre categorías o zonas incompatibles.
- Bucket privado `portfolio`: las políticas permiten lecturas públicas solo para archivos de fotografías publicadas; las escrituras requieren pertenecer a `site_admins`.
- Función `set_photo_cover`: cambia la portada en una transacción y respeta RLS.
- Edge Function `manage-admin`: valida el usuario y su pertenencia a `site_admins` antes de crear una cuenta. La clave privilegiada permanece en el servidor. No envía correos.

Las migraciones están en `supabase/migrations/`. En un proyecto nuevo hay que aplicarlas por orden, desplegar `manage-admin`, crear la primera identidad desde el dashboard de Auth y añadir su UUID a `site_admins` mediante SQL administrativo. Esta operación inicial no está expuesta al público. El proyecto de desarrollo ya tiene aplicado el esquema de grupos.

## Recuperación de contraseña

En Auth → URL Configuration, configurar la URL del sitio de preview y sus URLs permitidas `/admin.html` (incluido localhost para desarrollo). Configurar un proveedor SMTP para entregar correos a administradores externos; el correo predeterminado de Supabase tiene restricciones. El panel implementa la solicitud y el cambio de contraseña, pero la entrega depende de esa configuración. No se han enviado correos durante el desarrollo.

## Despliegue de preview

Vercel ejecuta `npm run build` y sirve `dist`. La compilación utiliza por defecto la URL y clave publishable versionadas en `tools/public-supabase.json`; ambas son públicas y también están incluidas en el código del navegador. Para otro proyecto, configurar juntas `SUPABASE_URL` y `SUPABASE_PUBLISHABLE_KEY` en el entorno correspondiente de Vercel. `.env` y las credenciales iniciales locales están excluidas de Git. Si se decide aislar los datos de producción, crear otro proyecto, aplicar las migraciones y configurar sus dos variables públicas en Production antes de volver a desplegar.

Los HTML mantienen las imágenes originales cuando Supabase no está configurado. Con Supabase configurado, las galerías muestran un aviso si falla el servicio para evitar recuperar fotografías que se hayan ocultado. Los archivos históricos en `img/` siguen siendo públicos; ocultar o eliminar una copia de Supabase no elimina su original histórico. Las fotos nuevas solo se suben a Supabase.

## Verificación

`npm run check`, `npm test`, `npm run build`. `tools/verify-backend.mjs` verifica RLS y almacenamiento contra un proyecto de pruebas con dos cuentas temporales y `.env.testing`; requiere provisionarlas previamente. Sus credenciales no se guardan en Git. El script limpia la fotografía que crea. No usar datos de producción.

Los grupos se verificaron con 240 combinaciones de categoría, zona y cantidades 0/1/2/3/5/8 a 1280/768/390/320 píxeles: sin solapamientos, sin cruces entre campañas y sin grupos de borradores visibles. Se revisaron también las cinco páginas reales en escritorio y móvil. `tests/collections.sql`, ejecutado como propietario solo en desarrollo, comprueba permisos de administrador/visitante/usuario normal, traslados entre zonas y categorías, compatibilidad de la importación y rechazo de borrado de grupos ocupados; sus datos se revierten con ROLLBACK. La creación, edición y filtro se probaron en el panel real; la subida múltiple, asignación, publicación y cambio de categoría se verificaron en una copia local del panel con API simulada, sin alterar fotografías del propietario.

La revisión responsive recorre las nueve páginas a 1440, 1280, 1100, 1024, 980, 768, 640, 390 y 320 píxeles. Comprueba límites horizontales y colisiones entre elementos hermanos de los bloques, formularios, tarjetas y pie de página. Se corrigió la separación entre títulos y párrafos en Content Creation, Home y Contact, y las filas demasiado bajas de las tarjetas móviles de Gallery. Home/Gallery se volvieron a verificar a 640/390/320 después del ajuste. El menú se probó además a 320×568 y 568×320: cabecera fuera del área desplazable, enlaces accesibles, apertura/cierre, cierre con Escape y recuperación del scroll al pasar al diseño de escritorio. Las capturas y páginas de prueba quedan fuera de Git y del despliegue.

Antes de fusionar: probar con el propietario subida múltiple, publicación, orden, portada, sustitución, ocultación, eliminación, acceso desde un móvil físico y correo de recuperación. La edición libre de textos y nuevas rutas/categorías queda fuera de esta primera versión.

Verificación realizada: compilación y sintaxis, rechazo de archivos no admitidos, políticas de lectura/escritura y escalada de permisos con cuentas temporales, subida/publicación/portada/eliminación en navegador, importación de 52 fotos y acceso de la cuenta del propietario. Una cuenta normal con metadatos falsos de administrador fue rechazada tanto por la API como por el panel.

La revisión de galerías verifica 360 combinaciones (cinco categorías, dos series, seis composiciones y cantidades 0, 1, 2, 3, 5 y 8) a 1280, 768 y 390 píxeles. Content Creation conserva su diseño original de parejas en la primera serie, con encuadre 4:5. Si hay una cantidad impar, la última foto aparece sola y mantiene el tamaño de las fotos emparejadas. La segunda serie y las demás galerías siguen respetando sus composiciones. La restauración se verificó con 0, 1, 2, 3, 5, 8, 9 y 19 fotos a 1440, 1280, 1024, 768, 390 y 320 píxeles. También se comprobaron las cinco páginas reales y Gallery contra los datos públicos de Supabase, incluidas las 53 fotos publicadas que había en la revisión.

Las entradas SQL maliciosas se trataron como texto; los valores inválidos de composición y UUID fueron rechazados. No se construye SQL a partir de entradas del usuario. La pertenencia a `site_admins` es la autoridad para acceder y escribir, y ningún cliente público puede concederse ese permiso.

Se han añadido cabeceras CSP sin `unsafe-inline` ni `unsafe-eval`, protección contra marcos externos y tipos MIME incorrectos. HEIC se convierte usando la variante CSP de `heic-to`, cargada solo cuando se necesita; se probó un archivo HEIC real de libheif con estas restricciones. Referencias: https://github.com/hoppergee/heic-to y https://github.com/strukturag/libheif/blob/master/examples/example.heic . Sigue pendiente la prueba con un móvil físico.

`npm run verify:artifacts` comprueba que no se versionan archivos privados/generados ni se publican rutas ajenas a la lista permitida. Solo `.env.example` se versiona; `.env` contiene la URL del proyecto y una clave publishable pública, y no se copia al despliegue. El build rechaza claves secretas/service_role y despliegues Vercel sin configuración completa. Git también ignora nuevas fotos locales: se gestionan desde el panel. Se retiraron del seguimiento 140 fotos/vídeos que no utiliza la web, sin borrar sus copias locales ni reescribir el historial. El despliegue conserva los 64 recursos de respaldo/importación necesarios (unos 46 MB frente a 152 MB de la carpeta original). Las versiones antiguas del repositorio conservan los archivos ya publicados.

La carpeta `dist` se regenera desde cero para no arrastrar archivos de pruebas o credenciales antiguos. No contiene fuentes de servidor, migraciones, documentación, `.env`, claves privadas ni resultados de pruebas. El código SQL de las migraciones y los scripts de comprobación sí se versionan para poder reproducir el despliegue; no contienen credenciales.

El auditor de seguridad no detectó problemas de las tablas o el almacenamiento. Sí informa de que la protección de Auth contra contraseñas filtradas está desactivada; revisar su disponibilidad y activación antes de producción: https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection . El índice de autor aparece como no utilizado al inicio; se conserva porque soporta la clave foránea y las operaciones sobre usuarios.
