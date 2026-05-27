import "dotenv/config";
import express from "express";
import cors from "cors";
import { healthRouter } from "./routes/health";
import { filesRouter } from "./routes/files";
import { commandsRouter } from "./routes/commands";
import { projectsRouter } from "./routes/projects";
import { agentsRouter } from "./routes/agents";
import { githubRouter } from "./routes/github";
import { pluginsRouter } from "./routes/plugins";
import { workspaceRouter } from "./routes/workspace";
import { requestLogger } from "./middleware/requestLogger";
import { logInfo } from "./services/loggerService";

const app = express();
const port = Number(process.env.PORT || 4000);

app.use(cors());
app.use(express.json({ limit: "2mb" }));
app.use(requestLogger);

app.use("/api/health", healthRouter);
app.use("/api/files", filesRouter);
app.use("/api/commands", commandsRouter);
app.use("/api/projects", projectsRouter);
app.use("/api/agents", agentsRouter);
app.use("/api/github", githubRouter);
app.use("/api/plugins", pluginsRouter);
app.use("/api/workspace", workspaceRouter);

app.listen(port, () => {
  logInfo("backend-start", { port, service: "brasitec-ai-core-backend" });
});
