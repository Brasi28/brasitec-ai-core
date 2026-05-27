export type CodeAgentInput = {
  goal: string;
  files: string[];
};

export function buildCodeAgentPlan(input: CodeAgentInput): string[] {
  return [
    "Consultar knowledge-base.json para patrones aplicables",
    "Inspeccionar archivos objetivo",
    `Priorizar cambios para: ${input.goal}`,
    "Aplicar modificaciones atomicas",
    "Validar compilacion y pruebas"
  ];
}
