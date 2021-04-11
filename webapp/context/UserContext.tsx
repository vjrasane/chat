import axios from "axios";
import React, {
  createContext,
  FunctionComponent,
  useCallback,
  useEffect,
  useState,
} from "react";
import Cookies from "js-cookie";

type User = {
  username: string;
  token: string;
};

type UserContext = {
  user?: User;
  login: (username: string, password: string) => Promise<void>;
  signup: (username: string, password: string) => Promise<void>;
};

const UserContext = createContext<UserContext>({
  login: Promise.resolve,
  signup: Promise.resolve,
});

const UserProvider: FunctionComponent = ({ children }) => {
  const [user, setUser] = useState<User | undefined>();

  useEffect(() => {
    if (user) return;
    const username = Cookies.get("username");
    const token = Cookies.get("token");
    if (!username || !token) return;
    setUser({ username, token });
  }, []);

  const login = useCallback(
    async (username: string, password: string): Promise<void> => {
      try {
        const result = await axios.post("/auth/login", { username, password });
        setUser({ username, token: result.data });
        Cookies.set("username", username, { expires: 7 });
        Cookies.set("token", result.data, { expires: 7 });
      } catch (err) {
        console.log("login failed: " + err.message);
      }
    },
    [setUser]
  );

  const signup = useCallback(
    async (username: string, password: string): Promise<void> => {
      try {
        await axios.post("/auth/signup", { username, password });
      } catch (err) {
        console.log("signup failed: " + err.message);
      }
    },
    []
  );

  return (
    <UserContext.Provider value={{ user, login, signup }}>
      {children}
    </UserContext.Provider>
  );
};

export { UserContext, UserProvider, User };
