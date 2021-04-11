import { basename } from "path";
import mongoose, { Schema, Model, Document } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import { createLogger } from "../common/logger";
import { retry } from "../common/utils";

const logger = createLogger(basename(__filename));

type DbConfig = {
  dbHost: string;
  dbName: string;
  dbPort: number;
  dbUser: string;
  dbPassword: string;
};

type Message = {
  id: string;
  date: Date;
  userid: string;
  username: string;
  text: string;
};

type MessageService = {
  getMessages: () => Promise<Message[]>;
  createMessage: (
    userid: string,
    username: string,
    text: string
  ) => Promise<Message>;
};

const createMessageService = async (
  config: DbConfig
): Promise<MessageService> => {
  const { dbHost, dbName, dbUser, dbPassword, dbPort } = config;

  const connectToDb = async () => {
    const connectionStr = `mongodb://${dbUser}:${dbPassword}@${dbHost}:${dbPort}/${dbName}`;
    logger.info(`connecting to ${connectionStr}`);

    await retry(() => {
      try {
        mongoose.connect(connectionStr, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
          useCreateIndex: true,
        });
        logger.info("connected to db");
      } catch (err) {
        logger.error(`failed to connect to db: ${err.toString()}`);
      }
    }, 1000);
  };

  const MessageModel: Model<Document<Message>> = mongoose.model(
    "Message",
    new Schema({
      id: String,
      userid: String,
      username: String,
      date: Date,
      text: String,
    })
  );

  const getMessages = async (): Promise<Message[]> => {
    const docs: Document<Message>[] = await MessageModel.find({}).exec();
    return docs.map(
      (doc: Document<Message>): Message => doc.toObject() as Message
    );
  };

  const createMessage = async (
    userid: string,
    username: string,
    text: string
  ): Promise<Message> => {
    const message: Message = {
      id: uuidv4(),
      date: new Date(),
      userid,
      username,
      text,
    };
    const doc: Document<Message> = await new MessageModel(message).save();
    return doc.toObject() as Message;
  };

  await connectToDb();

  return {
    getMessages,
    createMessage,
  };
};

export { createMessageService, MessageService, Message };
