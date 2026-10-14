# Hoja de ruta hacia producción

Lo que falta para que Flashly sea 100 % funcional y escale, en orden de prioridad.

## Necesario para producción

1. **Probar las reglas de Firestore con el emulador**, en especial la consulta del feed ("si no publicas, no ves").
2. **Subidas firmadas a Cloudinary**: una Cloud Function que genere la firma, para que nadie pueda usar el preset fuera de la app.
3. **Borrar las fotos a las 24 horas** en Cloudinary con una tarea programada que use la Admin API.
4. **Notificaciones push desde el servidor** (Firebase Cloud Messaging), registrando el token de cada teléfono.
5. **Firebase App Check** con Play Integrity para bloquear clientes que no sean la app original.
6. **Reportar y bloquear usuarios**, con la colección `reports` que ya contemplan las reglas.

## Para escalar

- Feed paginado (más de 60 momentos por día).
- Amigos reales en Firestore en lugar de la lista local, y feed filtrado por amigos o grupo.
- Varias universidades: un campo `campusId` en estudiantes y momentos, y reglas por campus.
- Monitoreo de errores (por ejemplo, Sentry) y analítica de uso.
- Actualizaciones sin reinstalar con EAS Update.
- Pruebas de componentes y de extremo a extremo (React Native Testing Library y Maestro).
