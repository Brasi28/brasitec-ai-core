export type ArtifactsAgentInput = {
  artifactType: "doc" | "config" | "template";
  objective: string;
};

export function buildArtifactsAgentPlan(input: ArtifactsAgentInput): string[] {
  return [
    "Consultar patrones y ejemplos en knowledge-base.json",
    `Definir artefacto tipo ${input.artifactType}`,
    `Alinear con objetivo: ${input.objective}`,
    "Emitir salida versionable"
  ];
}
