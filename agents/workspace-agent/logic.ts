export type WorkspaceAgentInput = {
  rootPath: string;
};

export function buildWorkspaceAgentPlan(input: WorkspaceAgentInput): string[] {
  return [
    "Consultar arquitecturas aprendidas en knowledge-base.json",
    `Mapear estructura de ${input.rootPath}`,
    "Detectar stacks y puntos de entrada",
    "Sugerir mejoras de organizacion"
  ];
}
