# Flashly

App móvil para la UTSV. Una vez al día, a una hora sorpresa, todos reciben la misma alerta y tienen 2 minutos para compartir lo que están haciendo con la cámara trasera y la frontal. Para ver los momentos de los demás, primero hay que publicar el tuyo. Todo deja de mostrarse a las 24 horas.

Proyecto de Desarrollo Móvil Integral · Ingeniería en Desarrollo y Gestión de Software · UTSV.

## Inicio rápido (modo demostración, 5 minutos)

```bash
npm install
npx expo start
```

Sin configurar nada, la app arranca en **modo demostración**: las cuentas y los momentos se guardan solo en el teléfono y el feed muestra compañeros de ejemplo. Para probar sin esperar la hora sorpresa: **Perfil → Abrir la ventana ahora**.

## Configuración en la nube

| Servicio | Para qué | Plan |
|---|---|---|
| Firebase Authentication | Registro con correo institucional y verificación | Gratuito |
| Cloud Firestore | Momentos, perfiles y reacciones en tiempo real | Gratuito |
| Cloudinary (API de terceros) | Almacenamiento de las fotos | Gratuito |

1. **Firebase:** crea un proyecto en https://console.firebase.google.com, agrega una app Web y activa Authentication (correo y contraseña) y Firestore.
2. **Cloudinary:** crea una cuenta en https://cloudinary.com. En *Settings → Upload* agrega un *upload preset* en modo **Unsigned**, con carpeta `flashly` y formatos permitidos `jpg`.
3. Copia los valores en el bloque `env` del perfil `preview` de `eas.json` (para el APK) y en un archivo `.env` (para desarrollo, a partir de `.env.example`).
4. Despliega las reglas de seguridad, los índices y el borrado a las 24 h:
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase use --add
   firebase deploy --only firestore
   ```

La configuración de Firebase y el nombre del preset no son secretos: la seguridad la dan las reglas de Firestore y las restricciones del preset.

## Generar el APK

```bash
npx eas-cli@latest login
npx eas-cli@latest build -p android --profile preview
```

La primera vez acepta crear el proyecto en Expo y la llave de firma. Al terminar obtienes un enlace para descargar el APK.

## Scripts

| Comando | Qué hace |
|---|---|
| `npm start` | Servidor de desarrollo |
| `npm run typecheck` | Revisión de tipos con TypeScript |
| `npm test` | Pruebas automáticas con Jest |
| `npm run test:coverage` | Pruebas con reporte de cobertura |
| `npm run check` | Tipos y pruebas, lo mismo que corre la integración continua |

## Documentación

- [Arquitectura, patrones y SOLID](docs/ARQUITECTURA.md)
- [Plan y esquema de pruebas](docs/PRUEBAS.md)
- [Evidencias del resultado de aprendizaje](docs/EVIDENCIAS.md)
- [Hoja de ruta para producción](docs/HOJA-DE-RUTA.md)

## Cómo contribuir

- Ramas: `main` (estable), `develop` (integración), `feature/<nombre>` y `fix/<nombre>`.
- Commits con [Conventional Commits](https://www.conventionalcommits.org/es/): `feat:`, `fix:`, `test:`, `docs:`, `refactor:`.
- Todo cambio entra por Pull Request revisado por otro integrante. GitHub Actions corre tipos y pruebas en cada uno.

## Tecnologías

Expo SDK 57 · React Native 0.86 · TypeScript · Expo Router · Zustand · Zod · Firebase JS SDK 12 · Cloudinary · Reanimated · Jest.
