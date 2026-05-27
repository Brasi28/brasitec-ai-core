# Publicacion en GitHub

1. Crear repositorio vacio en GitHub.
2. Ejecutar:

```bash
git init
git add .
git commit -m "feat: bootstrap brasitec-ai-core"
git branch -M main
git remote add origin <URL_DEL_REPO>
git push -u origin main
```

Si usas HTTPS, autentica con token personal.

## Recomendacion de release inicial

1. Crear etiqueta semantica inicial:

```bash
git tag v0.1.0
git push origin v0.1.0
```

2. Activar proteccion de rama `main` y revisiones por PR en GitHub.
