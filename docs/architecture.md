# Arquitectura

`brasitec-ai-core` se organiza como un monorepo TypeScript:

- `backend`: API Express que expone operaciones core para agentes.
- `client`: SDK + CLI para consumo desde cualquier proyecto.
- `agents`: definicion de agentes por carpeta.
- `tools/github-scanner`: modulo reutilizable para consultar codigo open-source.

## Flujo principal

1. Cliente envia solicitud a backend.
2. Backend valida entrada y permisos de ruta.
3. Backend ejecuta accion (`files`, `commands`, `projects`, `agents`, `github`, `plugins`, `workspace`).
4. Cliente recibe salida estructurada.

## Capas de extensibilidad

- Plugins de backend para agregar funciones sin romper API.
- Integracion de ejemplos open-source via GitHub Scanner.
- Agentes desacoplados por carpeta con contrato de comportamiento propio.
