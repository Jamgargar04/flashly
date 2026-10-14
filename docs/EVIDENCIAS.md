# Evidencias del resultado de aprendizaje

**Resultado:** desarrolla una aplicación móvil utilizando un repositorio de código fuente, con base en un caso de estudio, de acuerdo a la metodología ágil, la arquitectura de software, los patrones de diseño, frameworks y esquema de pruebas seleccionados.

| Requisito | Dónde está | Evidencia a entregar |
|---|---|---|
| Repositorio de código fuente | GitHub: `ENLACE_DEL_REPOSITORIO` | Enlace al repositorio con historial de commits y Pull Requests |
| Caso de estudio | Flashly: convivencia en el campus de la UTSV | Este README y la propuesta del proyecto |
| Metodología ágil | Scrum: sprints semanales, tablero en GitHub Projects, plantilla de Pull Request con definición de terminado | Captura del tablero y de los Pull Requests |
| Arquitectura de software | Clean Architecture en 4 capas | [ARQUITECTURA.md](ARQUITECTURA.md) |
| Patrones de diseño | Repository, Strategy, Adapter, Factory, Singleton, Observer, DI, Store | Tabla de patrones en [ARQUITECTURA.md](ARQUITECTURA.md) |
| Frameworks | Expo SDK 57, React Native 0.86, Expo Router, Zustand, Zod, Reanimated | `package.json` |
| Esquema de pruebas | 31 pruebas con Jest, 93 % de cobertura en la lógica crítica, pruebas manuales | [PRUEBAS.md](PRUEBAS.md) y captura de GitHub Actions en verde |
| Mecanismos de seguridad | Correo institucional verificado, reglas de Firestore, HTTPS, secretos fuera del repositorio, TTL de 24 h | `firebase/firestore.rules` y sección de seguridad de la arquitectura |
| API de terceros | Cloudinary (subida de fotos) | `src/infrastructure/cloudinary/cloudinary-photo-storage.ts` y captura del panel de Cloudinary con las fotos |
| Servicios en la nube | Firebase Authentication y Cloud Firestore | Captura de la consola de Firebase con usuarios y la colección `moments` |
| Enlace del repositorio en funcionamiento | Release en GitHub con el APK | Enlace al Release y video corto de la app funcionando |
