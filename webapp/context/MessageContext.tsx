import axios from "axios";
import { array, Decoder, guard, object, string } from "decoders";
import React, {
  createContext,
  FunctionComponent,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { mapResult, RequestResult } from "../../common/request-result";
import { getAuthorizationHeaders } from "../utils";
import { User, UserContext } from "./UserContext";
import { uniqBy } from "lodash/fp";
import socketio, { Socket } from "socket.io-client";

type Message = {
  id: string;
  userid: string;
  username: string;
  text: string;
};

const messageDecoder: Decoder<Message> = object({
  id: string,
  userid: string,
  username: string,
  text: string,
});

type MessageContext = {
  messages: RequestResult<Message[]>;
  post: (text: string) => Promise<void>;
};

const MessageContext = createContext<MessageContext>({
  messages: { status: "not asked" },
  post: Promise.resolve,
});

const MessageProvider: FunctionComponent = ({ children }) => {
  const { user } = useContext(UserContext);
  const [messages, setMessages] = useState<RequestResult<Message[]>>({
    status: "not asked",
  });

  const fetchMessages = async (user: User) => {
    try {
      setMessages({ status: "loading" });
      const headers = getAuthorizationHeaders(user.token);
      const result = await axios.get("/api/message", { headers });
      const messages: Message[] = guard(array(messageDecoder))(result.data);
      setMessages({ status: "success", data: messages });
    } catch (error) {
      console.error(`failed to fetch messages: ${error.message}`);
      setMessages({ status: "failed", error });
    }
  };

  useEffect(() => {
    if (!user) return;
    fetchMessages(user);
  }, [user]);

  useEffect(() => {
    const socket: Socket = socketio();
    socket.on("post-message", (data: any) => {
      const message: Message = guard(messageDecoder)(data);
      setMessages(
        mapResult((messages: Message[]) => uniqBy("id", [...messages, message]))
      );
    });
    return () => {
      socket.close();
    };
  });

  const post = useCallback(
    async (text: string): Promise<void> => {
      try {
        if (!user) return;
        const headers = getAuthorizationHeaders(user.token);
        const result = await axios.post("/api/message", { text }, { headers });
        const message: Message = guard(messageDecoder)(result.data);
        setMessages((prev) =>
          mapResult((messages: Message[]) => [...messages, message], prev)
        );
      } catch (error) {
        console.error(`failed to post message: ${error.message}`);
      }
    },
    [user, setMessages]
  );

  return (
    <MessageContext.Provider value={{ messages, post }}>
      {children}
    </MessageContext.Provider>
  );
};

export { MessageContext, MessageProvider, Message };
