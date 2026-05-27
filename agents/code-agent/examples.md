# Ejemplos de Uso - Code Agent

## Corregir bug

Entrada:
- goal: "Corregir null pointer en servicio X"
- context: "Falla al procesar payload vacio"

Salida esperada:
- Plan de cambios con validacion de pruebas.

## Refactor controlado

Entrada:
- goal: "Extraer helper para validaciones repetidas"

Salida esperada:
- Cambios atomicos y sin romper API publica.
