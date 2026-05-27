# local-learning-engine

Motor de aprendizaje local intensivo.

## Funciones

- Descarga repositorios publicos de alta calidad (+500 estrellas, activos en 3 meses).
- Evita repos gigantes y aplica pausas aleatorias para seguridad operativa.
- Analiza hasta 150 archivos por repo en turbo y 80 en estable.
- Guarda conocimiento bruto en `knowledge-raw.json`.
- Actualiza `repo-history.json` para evitar repeticion.

## Uso

```bash
npm --workspace tools/local-learning-engine run run -- --mode turbo --maxRepos 6 --maxFiles 150
```
