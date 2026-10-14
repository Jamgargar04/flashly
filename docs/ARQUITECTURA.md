# Arquitectura de Flashly

## Contexto y objetivos

Flashly debe funcionar sin conexión a servicios mientras se desarrolla (modo demostración), conectarse a la nube sin reescribir pantallas, y crecer con nuevos proveedores (por ejemplo, cambiar Cloudinary por Firebase Storage) tocando un solo archivo. Por eso se usa **Clean Architecture**: las reglas del negocio no dependen de Expo, Firebase ni Cloudinary.

## Capas

```
┌──────────────────────────────────────────────────────┐
│  Presentación   src/app, src/components, constants    │  Pantallas y componentes
├──────────────────────────────────────────────────────┤
│  Aplicación     src/application                       │  Casos de uso, estado y hooks
├──────────────────────────────────────────────────────┤
│  Dominio        src/domain                            │  Reglas del negocio y puertos
├──────────────────────────────────────────────────────┤
│  Infraestructura src/infrastructure                   │  Firebase, Cloudinary, Expo,
│                                                       │  modo local y raíz de composición
└──────────────────────────────────────────────────────┘
```

**Regla de dependencia:** el dominio no importa nada de las demás capas. La infraestructura implementa las interfaces (puertos) que el dominio define. Solo `infrastructure/container.ts` conoce las clases concretas.

| Capa | Archivos clave | Responsabilidad |
|---|---|---|
| Dominio | `flash-window.ts`, `moment.ts`, `student.ts`, `ports.ts` | Ventana del flash, reglas para publicar, validación del correo institucional, interfaces |
| Aplicación | `publish-moment.ts`, `session-store.ts`, `use-today-feed.ts` | Orquestar casos de uso y exponer estado a las pantallas |
| Infraestructura | `firebase/*`, `cloudinary/*`, `local/*`, `device/*`, `container.ts` | Hablar con servicios externos y con el teléfono |
| Presentación | `app/*`, `components/*` | Mostrar datos y responder a gestos, sin lógica de negocio |

## Flujo: publicar un momento

```
Pantalla capture.tsx
   └─▶ usePublishMoment()                       (aplicación)
         └─▶ createPublishMoment(deps)(input)
               ├─ assertCanPublish(fase, yaPublicó)   (dominio)
               ├─ PhotoCompressor.compress ×2          (Expo Image Manipulator)
               ├─ PhotoStorage.upload ×2               (Cloudinary · Firebase · local)
               └─ MomentRepository.save                (Firestore · local)
                     └─ Regla de Firestore valida id dia_usuario y URLs https
```

## Patrones de diseño

| Patrón | Dónde | Para qué |
|---|---|---|
| Repository | `MomentRepository` → `FirestoreMomentRepository`, `LocalMomentRepository` | Aislar el acceso a datos |
| Strategy | `PhotoStorage` → Cloudinary, Firebase Storage o local | Cambiar el proveedor de fotos sin tocar el caso de uso |
| Adapter | `FirebaseAuthGateway`, `CloudinaryPhotoStorage`, `ExpoReminderScheduler` | Traducir APIs externas a los puertos del dominio y sus errores a mensajes claros |
| Factory / Composition Root | `createServices()` en `container.ts` | Construir las implementaciones según la configuración |
| Singleton | `getFirebase()` | Inicializar Firebase una sola vez |
| Observer | `observe()`, `observeDay()` (onSnapshot) | Actualizaciones en tiempo real de sesión y feed |
| Dependency Injection | `createPublishMoment({ compressor, photos, moments })` | Probar el caso de uso con dobles, sin servicios reales |
| Store (Flux) | `useSession` con Zustand | Un solo lugar para el estado de la sesión |

## Principios SOLID

| Principio | Cómo se aplica |
|---|---|
| **S** · Responsabilidad única | Cada adaptador hace una cosa: `CloudinaryPhotoStorage` solo sube fotos; `use-today-feed` solo maneja el feed; las pantallas solo muestran. |
| **O** · Abierto/cerrado | Para agregar un proveedor de fotos se crea una clase que implemente `PhotoStorage`; el caso de uso no se modifica. |
| **L** · Sustitución de Liskov | `LocalMomentRepository` y `FirestoreMomentRepository` son intercambiables: las mismas pruebas y pantallas funcionan con ambos. |
| **I** · Segregación de interfaces | Puertos pequeños y específicos (`PhotoCompressor`, `PhotoStorage`, `KeyValueStore`) en lugar de un "servicio" gigante. |
| **D** · Inversión de dependencias | El caso de uso depende de interfaces del dominio, no de Firebase ni de Cloudinary. |

## Decisiones y compromisos

| Decisión | Por qué | Compromiso |
|---|---|---|
| Firestore (NoSQL) | Tiempo real, SDK para React Native, plan gratuito y reglas de seguridad integradas | Consultas más limitadas que SQL |
| Cloudinary para fotos | API de terceros gratuita y sin tarjeta; Firebase Storage en proyectos nuevos requiere el plan Blaze | Las subidas sin firma dependen de las restricciones del preset; las fotos no se borran solas (ver hoja de ruta) |
| Hora sorpresa calculada a partir de la fecha | Todos los teléfonos coinciden sin servidor y el aviso local funciona sin conexión | La hora es predecible para quien lea el código; para producción conviene publicarla desde el servidor |
| Zustand y Zod | Librerías probadas en vez de estado y validación hechos a mano | Dos dependencias más |
| Modo demostración | Desarrollar y presentar sin cuentas en la nube | Hay que mantener dos implementaciones de cada puerto |

## Mecanismos de seguridad

- **Identidad:** solo correos `@alumnos.utsv.edu.mx` verificados (validados en la app con Zod y en el servidor con las reglas).
- **Autorización:** reglas de Firestore (`firebase/firestore.rules`): cada quien escribe solo lo suyo, un momento por día (id `dia_usuario`), de un momento ajeno solo se pueden cambiar las reacciones, y el feed solo se lee si ya publicaste ("si no publicas, no ves" aplicado en el servidor).
- **Datos en tránsito:** HTTPS en Firebase y Cloudinary; la regla exige URLs `https://`.
- **Sesión:** persistida con AsyncStorage mediante la persistencia oficial de Firebase para React Native.
- **Secretos:** ninguna clave privada en la app; `.env` está en `.gitignore`.
- **Retención mínima:** política TTL de Firestore sobre `expiresAt` y filtrado inmediato en la app.
- **Moderación (opcional, plan Blaze):** Cloud Function `moderateMoment` con Cloud Vision SafeSearch.
