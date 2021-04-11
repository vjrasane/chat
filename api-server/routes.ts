import { Request, Response, Router } from "express";
import { object, string, guard } from "decoders";
import { Message, MessageService } from "./message-service";
import socketio from "socket.io";

type Services = {
  messageService: MessageService;
};

const initRoutes = (
  router: Router,
  services: Services,
  webSocketServer: socketio.Server
) => {
  const { messageService } = services;

  const getMessagesHandler = async (req: Request, res: Response) => {
    try {
      const messages: Message[] = await messageService.getMessages();
      res.status(200).send(messages);
    } catch (err) {
      res.status(500).send(err.message);
    }
  };

  const createMessageHandler = async (req: Request, res: Response) => {
    let text: string;
    const { username, id } = req.token || {};
    if (!username || !id) {
      return res.status(401).send();
    }
    try {
      ({ text } = guard(object({ text: string }))(req.body));
    } catch (err) {
      return res.status(400).send(err.message);
    }

    try {
      const message: Message = await messageService.createMessage(
        id,
        username,
        text
      );
      webSocketServer.emit("post-message", message);
      res.status(200).send(message);
    } catch (err) {
      res.status(500).send(err.message);
    }
  };

  router.post("/api/message", createMessageHandler);
  router.get("/api/message", getMessagesHandler);
};

export { initRoutes };
