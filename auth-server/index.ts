import { basename } from "path";
import { guard, object, string, number } from "decoders";
import { Router } from "express";
import { AuthService, createAuthService } from "./auth-service";
import { UserService, createUserService } from "./user-service";
import { createLogger } from "../common/logger";
import { withDefault, stringToFilePath, stringToInt } from "../common/decoders";
import { createServer } from "../common/server";
import { initRoutes } from "./routes";

const logger = createLogger(basename(__filename));

const envDecoder = object({
  KEYSTORE_FILE: withDefault(stringToFilePath, "./certs/keystore.json"),
  HTTP_PORT: withDefault(stringToInt, 3000),
  DB_HOST: string,
  DB_NAME: withDefault(string, "db"),
  DB_USER: string,
  DB_PASSWORD: string,
  DB_PORT: withDefault(number, 27017),
});

const {
  KEYSTORE_FILE,
  HTTP_PORT,
  DB_USER,
  DB_PASSWORD,
  DB_HOST,
  DB_NAME,
  DB_PORT,
} = guard(envDecoder)(process.env);

type Services = {
  authService: AuthService;
  userService: UserService;
};

const createServices = async (): Promise<Services> => {
  const authService: AuthService = await createAuthService({
    keystorePath: KEYSTORE_FILE,
  });
  const userService: UserService = await createUserService({
    dbHost: DB_HOST,
    dbPort: DB_PORT,
    dbName: DB_NAME,
    dbUser: DB_USER,
    dbPassword: DB_PASSWORD,
  });
  return {
    authService,
    userService,
  };
};

const createRouter = (services: Services): Router => {
  const router = Router();

  initRoutes(router, services);
  return router;
};

const init = async () => {
  const { app, httpServer } = createServer(HTTP_PORT);
  const services = await createServices();

  const router = createRouter(services);

  app.use(router);

  httpServer.listen(HTTP_PORT);
  logger.info(`server running in port ${HTTP_PORT}`);
};

init();
