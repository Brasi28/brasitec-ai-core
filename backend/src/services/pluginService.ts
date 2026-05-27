export type PluginContext = {
  payload: Record<string, unknown>;
};

export type PluginResult = {
  pluginId: string;
  result: unknown;
};

type PluginDefinition = {
  id: string;
  description: string;
  execute: (context: PluginContext) => Promise<unknown> | unknown;
};

const plugins = new Map<string, PluginDefinition>();

plugins.set("echo", {
  id: "echo",
  description: "Devuelve el payload recibido para pruebas de integracion.",
  execute: ({ payload }) => ({ payload })
});

plugins.set("stats-basic", {
  id: "stats-basic",
  description: "Calcula estadisticas basicas de un arreglo numerico.",
  execute: ({ payload }) => {
    const values = Array.isArray(payload.values)
      ? payload.values.filter((value): value is number => typeof value === "number")
      : [];

    const total = values.reduce((acc, current) => acc + current, 0);
    const avg = values.length ? total / values.length : 0;

    return { count: values.length, total, avg };
  }
});

export function listPlugins(): Array<{ id: string; description: string }> {
  return Array.from(plugins.values()).map((plugin) => ({ id: plugin.id, description: plugin.description }));
}

export async function executePlugin(pluginId: string, payload: Record<string, unknown>): Promise<PluginResult> {
  const plugin = plugins.get(pluginId);
  if (!plugin) {
    throw new Error(`Plugin no encontrado: ${pluginId}`);
  }

  const result = await plugin.execute({ payload });
  return { pluginId, result };
}

export function registerPlugin(definition: PluginDefinition): void {
  if (!definition.id.trim()) {
    throw new Error("Plugin invalido: id requerido");
  }
  plugins.set(definition.id, definition);
}
