import http from 'http';
import morgan from 'morgan';
import express, { Application } from 'express';

const createApp = (port: number): Application => {
  const app = express();
  app.use(express.json());
  app.use(morgan(
    ':date[iso] :method :url :status :response-time ms - :res[content-length]'
  ));
  app.set('port', port);
  return app;
};

const createServer = (port: number) => {
  const app = createApp(port);
  const httpServer: http.Server = http.createServer(app);
  return { app, httpServer };
};

export { createServer };
