import { Injectable, NestMiddleware } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import type { Request, Response, NextFunction } from "express";

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const requestId =
      (req.headers["x-request-id"] as string) ?? randomUUID();
    res.setHeader("x-request-id", requestId);
    (req as any).requestId = requestId;
    next();
  }
}
