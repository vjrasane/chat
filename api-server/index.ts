import { basename } from "path";
import { guard, object, string, number } from "decoders";
import { Router } from "express";
import { createLogger } from "../common/logger";
import { withDefault, stringToFilePath, stringToInt } from "../common/decoders";
import { createServer } from "../common/server";
import { initRoutes } from "./routes";
import { AuthService, createAuthService } from "./auth-service";
import { createAuthMiddleware } from "./middleware";
import { createMessageService, MessageService } from "./message-service";
import http from "http";
import socketio from "socket.io";

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
  messageService: MessageService;
};

const createServices = async (): Promise<Services> => {
  const authService: AuthService = await createAuthService({
    keystorePath: KEYSTORE_FILE,
  });
  const messageService: MessageService = await createMessageService({
    dbHost: DB_HOST,
    dbPort: DB_PORT,
    dbName: DB_NAME,
    dbUser: DB_USER,
    dbPassword: DB_PASSWORD,
  });
  return {
    authService,
    messageService,
  };
};

const createRouter = (
  services: Services,
  webSocketServer: socketio.Server
): Router => {
  const { authService } = services;
  const authMiddleware = createAuthMiddleware(authService);
  const router = Router();
  router.use(authMiddleware);

  initRoutes(router, services, webSocketServer);

  return router;
};

const createWebSocketServer = (httpServer: http.Server): socketio.Server => {
  const webSocketServer: socketio.Server = new socketio.Server(httpServer);

  webSocketServer.on("connection", (client: socketio.Socket) => {
    logger.info(`client ${client.id} connected`);
    client.on("disconnect", (reason: string) =>
      logger.info(`client ${client.id} disconnected: ${reason}`)
    );
  });

  return webSocketServer;
};

const init = async () => {
  const { app, httpServer } = createServer(HTTP_PORT);
  const webSocketServer: socketio.Server = createWebSocketServer(httpServer);

  const services = await createServices();
  const router = createRouter(services, webSocketServer);

  app.use(router);

  httpServer.listen(HTTP_PORT);
  logger.info(`server running in port ${HTTP_PORT}`);
};

init();
