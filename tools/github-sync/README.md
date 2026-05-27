# github-sync

Sincronizacion segura de conocimiento optimizado con GitHub.

## Reglas

- Solo sincroniza `knowledge-base.json` optimizado.
- Bloquea sync de archivos gigantes.
- Requiere flag `--allow` para evitar pushes accidentales.

## Uso

```bash
npm --workspace tools/github-sync run run -- --allow
```
