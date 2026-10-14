# Plan y esquema de pruebas

## Pirámide

```
          /  Manual en teléfono  \      Pocas: flujo completo en debug y release
         /   Integración (reglas)  \    Pendiente: emulador de Firestore
        /   Unitarias con Jest       \  31 pruebas automáticas
```

## Qué se prueba y cómo

| Área | Tipo | Archivo | Casos |
|---|---|---|---|
| Ventana del flash | Unitaria | `__tests__/domain/flash-window.test.ts` | Misma hora para todos el mismo día, rango 9:00–20:00, cambia entre días, dura 2 min, modo prueba solo el mismo día, fases en los límites exactos |
| Validación del estudiante | Unitaria | `__tests__/domain/student.test.ts` | Correo institucional aceptado y normalizado, otros dominios rechazados, contraseña mínima, nombre obligatorio |
| Reglas del momento | Unitaria | `__tests__/domain/moment.test.ts` | Un momento por día, comentario limpio y limitado, no publicar antes de la ventana, marca de tarde, reacciones sin mutar |
| Caso de uso "publicar" | Unitaria con dobles | `__tests__/application/publish-moment.test.ts` | Comprime, sube y guarda; marca tarde; no sube si ya publicaste; no guarda si falla la subida |
| API de Cloudinary | Unitaria con `fetch` simulado | `__tests__/infrastructure/cloudinary-photo-storage.test.ts` | Envía preset y carpeta, devuelve la URL segura, errores de red, rechazo del servicio y respuesta sin URL |
| Modo demostración | Unitaria con almacenamiento en memoria | `__tests__/infrastructure/local-adapters.test.ts` | Publicar y consultar, reacciones, registro, cierre y regreso de sesión |

Cobertura actual de la lógica crítica: **93 % de sentencias y 93 % de líneas**. Meta: mantener más de 80 % en `domain` y `application`.

Ejecutar:

```bash
npm test
npm run test:coverage
```

GitHub Actions las corre en cada push a `main` o `develop` y en cada Pull Request.

## Pruebas manuales (debug y release)

| # | Caso | Resultado esperado |
|---|---|---|
| 1 | Registrarse con un correo que no es institucional | Mensaje: "Usa tu correo institucional" |
| 2 | Registrarse con correo institucional | Llega el correo de verificación (modo Firebase) |
| 3 | Abrir la pestaña Hoy antes de la ventana | Anillo girando y feed bloqueado |
| 4 | Perfil → Abrir la ventana ahora | En 5 s llega la notificación y el anillo cuenta 2:00 |
| 5 | Tomar la foto | Se toma la trasera y luego la frontal automáticamente |
| 6 | Publicar | El feed se desbloquea y aparece tu momento primero |
| 7 | Intentar publicar otra vez | Mensaje: "Ya publicaste tu momento de hoy" |
| 8 | Publicar después de los 2 minutos | El momento aparece marcado como "Tarde" |
| 9 | Reaccionar a un momento | El corazón cambia al instante y se conserva al recargar |
| 10 | Probar sin internet | Mensajes claros, sin cierres inesperados |

Repetir la tabla con el APK de release y guardar capturas como evidencia.

## Huecos conocidos

- Pruebas de las reglas de Firestore con el emulador (`@firebase/rules-unit-testing`).
- Pruebas de componentes con React Native Testing Library.
- Pruebas de extremo a extremo con Maestro.
