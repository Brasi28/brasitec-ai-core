# Client SDK + CLI

El cliente provee un SDK reutilizable y una CLI para consumir el backend desde cualquier proyecto.

## Capacidades

- Lectura/escritura de archivos remotos.
- Ejecucion de comandos en backend.
- Analisis de proyectos.
- Ejecucion de agentes.
- Consulta de repositorios y ejemplos de GitHub.
- Ejecucion de plugins.
- Sincronizacion de estado con VS Code.
- Envio de archivos abiertos de VS Code al backend.

## Modulos

- `client/src/index.ts`: SDK principal.
- `client/src/vscodeSync.ts`: integracion con estado de VS Code.
- `client/src/cli.ts`: interfaz de linea de comandos.
