import { basename } from "path";
import { isObject } from "lodash/fp";
import { Request, Response } from "express";
import { AuthService } from "./auth-service";
import { createLogger } from "../common/logger";

const logger = createLogger(basename(__filename));

const createAuthMiddleware = (authService: AuthService) => {
  const authMiddleware = (req: Request, res: Response, next: Function) => {
    try {
      const token = authService.verifyRequestToken(req);
      if (!isObject(token)) {
        return res.status(401).send();
      }
      req.token = token;
      next();
    } catch (err) {
      logger.warn(`request token verification failed: ${err.message}`);
      res.status(401).send();
    }
  };

  return authMiddleware;
};

export { createAuthMiddleware };
