# Backend

El backend expone la API central para operar el motor de IA.

## Responsabilidades

- Operaciones de archivos (leer/escribir).
- Ejecucion controlada de comandos.
- Analisis de estructura de proyectos.
- Ejecucion de agentes con inyeccion opcional de ejemplos open-source.
- Consulta de GitHub publico.
- Sistema de plugins extensible.
- Logging estructurado y consulta de logs recientes.
- Sincronizacion de estado de VS Code.

## Endpoints principales

- `/api/files/*`
- `/api/commands/*`
- `/api/projects/*`
- `/api/agents/*`
- `/api/github/*`
- `/api/plugins/*`
- `/api/workspace/*`

## Extensibilidad

Nuevas funciones se agregan como plugins en `backend/src/services/pluginService.ts`.
