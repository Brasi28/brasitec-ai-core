import type { Request, Response, NextFunction } from "express";
import { logInfo } from "../services/loggerService";

export function requestLogger(req: Request, _res: Response, next: NextFunction): void {
  logInfo("http-request", {
    method: req.method,
    path: req.path,
    ip: req.ip
  });
  next();
}
