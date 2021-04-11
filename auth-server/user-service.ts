import { basename } from "path";
import mongoose, { Schema, Model, Document } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import { createLogger } from "../common/logger";
import { retry } from "../common/utils";
import { hashPassword } from "./utils";

const logger = createLogger(basename(__filename));

type DbConfig = {
  dbHost: string;
  dbName: string;
  dbPort: number;
  dbUser: string;
  dbPassword: string;
};

type User = {
  id: string;
  username: string;
  password: string;
};

type UserService = {
  getUser: (username: string) => Promise<User | null>;
  createUser: (username: string, password: string) => Promise<User>;
};

const createUserService = async (config: DbConfig): Promise<UserService> => {
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

  const UserModel: Model<Document<User>> = mongoose.model(
    "User",
    new Schema({
      id: String,
      username: { type: String, unique: true },
      password: String,
    })
  );

  const createUser = async (
    username: string,
    password: string
  ): Promise<User> => {
    const user: User = {
      id: uuidv4(),
      username,
      password: await hashPassword(password),
    };
    const doc: Document<User> = await new UserModel(user).save();
    return doc.toObject() as User;
  };

  const getUser = async (username: string): Promise<User | null> => {
    const doc: Document<User> | null = await UserModel.findOne({
      username,
    }).exec();
    return (doc?.toObject() as User) || null;
  };

  await connectToDb();

  return {
    createUser,
    getUser,
  };
};

export { createUserService, UserService, User };
