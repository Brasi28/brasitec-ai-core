export type AutonomousAgentInput = {
  mission: string;
};

export function buildAutonomousPlan(input: AutonomousAgentInput): string[] {
  return [
    `Descomponer mision: ${input.mission}`,
    "Comparar reglas actuales contra patrones aprendidos",
    "Asignar tareas por especialidad",
    "Reescribir reglas internas si detecta inconsistencias",
    "Validar hitos y cerrar ejecucion"
  ];
}
