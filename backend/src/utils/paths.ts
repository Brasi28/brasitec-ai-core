import path from "node:path";

const workspaceRoot = path.resolve(
  process.env.WORKSPACE_ROOT || path.resolve(process.cwd(), "..")
);

export function getWorkspaceRoot(): string {
  return workspaceRoot;
}

export function resolveWorkspacePath(inputPath: string): string {
  const resolved = path.isAbsolute(inputPath)
    ? path.resolve(inputPath)
    : path.resolve(workspaceRoot, inputPath);

  const relative = path.relative(workspaceRoot, resolved);

  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error("Path fuera del workspace permitido");
  }

  return resolved;
}
