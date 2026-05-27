# Evolucion Continua: Plan Hibrido

Este documento define el sistema de evolucion acelerada, segura y sostenible del motor de IA.

## Ruta de conocimiento

Todo el aprendizaje se guarda en:

- `H:\aprendizado ia`

Archivos clave:

- `knowledge-raw.json`
- `knowledge-base.json`
- `knowledge-base.json.gz`
- `repo-history.json`
- `long-term-memory.json`
- `/archive/*`
- `/workspace/patterns/*`

## Fase 1: primeros 5 dias (turbo 24h)

- Motor: `tools/local-learning-engine`
- Frecuencia: cada hora (24h)
- Reglas:
  - repos publicos +500 estrellas
  - actualizados en ultimos 3 meses
  - evita repos gigantes
  - maximo 150 archivos por repo
- Salida:
  - `knowledge-raw.json`
- Limpieza nocturna:
  - `tools/knowledge-cleaner`
  - `tools/knowledge-compressor`
- Sync GitHub: deshabilitado en esta fase.

## Fase 2: dia 6 a mes 6 (estable, 3 ciclos al dia)

- Frecuencia: cada 8 horas.
- En cada ciclo:
  - maximo 3 repos
  - maximo 80 archivos por repo
  - actualizacion incremental de `knowledge-base.json`
- Historial de repos:
  - `repo-history.json` evita repetidos
- Limpieza semanal:
  - `knowledge-rotator`
- Limites de operacion:
  - `knowledge-base.json`: objetivo 200MB a 1GB
  - `/workspace/patterns`: objetivo 500MB a 2GB
- Archivado semanal:
  - copia de `knowledge-raw.json` en `/archive`

## Fase 3: mes 6+ (evolucion infinita)

- Se mantiene aprendizaje 3 veces al dia.
- Limpieza semanal y optimizacion mensual.
- Archivado automatico semanal.
- Memoria historica:
  - `tools/long-term-memory`
- Auto-mejora:
  - `tools/evolution-engine` coordina mejoras de reglas y prompts basadas en patrones.

## Seguridad y estabilidad

- Rate limiting pasivo con pausas aleatorias.
- Evita scraping agresivo.
- Evita repos exageradamente grandes.
- Sync a GitHub solo bajo confirmacion (`--allow`) y con limites de tamaño.
- Rotacion de patrones para prevenir crecimiento infinito.

## Comandos operativos

```bash
npm run build
npm run learn:cycle
npm run knowledge:clean
npm run knowledge:compress
npm run knowledge:rotate
npm run memory:update
npm run github:sync
```

## Programacion automatica

### Opcion A: daemon (recomendada)

```bash
npm run learn:daemon
```

El daemon consulta cada 30 minutos y ejecuta ciclo solo cuando corresponde:

- turbo: 1 vez por hora
- estable/infinito: 1 vez cada 8 horas

Para modo 24/7 continuo (sin saltar ciclos), define:

- `ALWAYS_ON_LEARNING=true`
- `HIGH_LOAD_MODE=true`
- `EVOLUTION_POLL_MS=300000`

### Arranque automatico en login

```powershell
powershell -ExecutionPolicy Bypass -File tools/install-autostart.ps1 -ProjectRoot "E:\agentes\brasitec-ai-core" -KnowledgeRoot "H:\aprendizado ia"
```

Esto crea `BrasitecAICoreDaemon.cmd` en la carpeta Startup del usuario.

### Opcion B: Windows Task Scheduler

```powershell
powershell -ExecutionPolicy Bypass -File tools/setup-evolution-tasks.ps1 -ProjectRoot "E:\agentes\brasitec-ai-core" -KnowledgeRoot "H:\aprendizado ia"
```

Notas:

- Puede requerir permisos administrativos.
- Si el entorno bloquea `schtasks`, usa opcion A (daemon).

## Extension del sistema

Para extender durante anos:

- Agrega nuevos extractores en `local-learning-engine`.
- Agrega nuevas reglas de limpieza en `knowledge-cleaner`.
- Ajusta politicas de rotacion en `knowledge-rotator`.
- Ajusta politicas de memoria estable en `long-term-memory`.
- Integra nuevos plugins backend para consumir conocimiento en tiempo real.
