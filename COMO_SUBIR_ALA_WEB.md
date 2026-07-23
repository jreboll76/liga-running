# Guía: Cómo subir la Liga Running a Internet (App Móvil)

He guardado esta guía en tu carpeta de proyecto para que siempre sepas cómo actualizar la aplicación.

## 1. Preparar los archivos
Asegúrate de que en tu carpeta `Agraviti` tienes estos archivos listos:
- `index.html` (El archivo principal)
- `sw.js` (El motor de la app/offline)
- `manifest.json` (La configuración de la app móvil)
- Carpeta `aRCHIVOS/` (Contiene el logo y recursos)

## 2. En GitHub (Solo la primera vez)
1. Ve a [github.com](https://github.com/) e inicia sesión.
2. Crea un repositorio nuevo llamado `liga-running` y ponlo como **Público**.
3. Usa la opción **"uploading an existing file"** para subir todos los archivos mencionados arriba.
4. Pulsa **"Commit changes"**.

## 3. Activar el enlace Web
1. Entra en tu repositorio en GitHub.
2. Ve a **Settings > Pages**.
3. En **Branch**, selecciona `main` y dale a **Save**.
4. En 1-2 minutos tendrás tu enlace (ej: `https://tu-usuario.github.io/liga-running/`).

## 4. Cómo actualizar la App en el futuro
Si haces cambios en el código (`index.html`) y quieres que se vean en los móviles de todos:
1. Entra en tu repositorio en GitHub.
2. Pulsa en **Add file > Upload files**.
3. Arrastra el nuevo `index.html` (o lo que hayas cambiado).
4. Pulsa **Commit changes**.
5. ¡Listo! Los móviles detectarán la actualización automáticamente.

---
**¿Cómo instalarla en el móvil?**
- **Android**: Abrir el enlace en Chrome > Menú (3 puntos) > Instalar aplicación.
- **iPhone**: Abrir en Safari > Compartir (cuadrado con flecha) > Añadir a pantalla de inicio.
