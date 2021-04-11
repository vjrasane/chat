import { Box, Button, Paper, TextField } from "@material-ui/core";
import React, {
  FunctionComponent,
  useContext,
  useEffect,
  useState,
} from "react";
import { useHistory } from "react-router";
import { UserContext } from "../context/UserContext";

import "./LoginPage.styl";

const LoginPage: FunctionComponent = () => {
  const history = useHistory();

  const { user, login, signup } = useContext(UserContext);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (user) {
      history.push("/");
    }
  }, [user]);

  return (
    <div id="login-page">
      <Paper elevation={3}>
        <Box display="flex" flexDirection="column" padding="15px">
          <TextField
            id="username-field"
            label="Username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
          />
          <TextField
            id="password-field"
            label="Password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <Box
            paddingTop="15px"
            display="flex"
            flexDirection="row"
            justifyContent="space-between"
          >
            <Button
              color="primary"
              variant="contained"
              onClick={() => login(username, password)}
            >
              Login
            </Button>
            <Button
              color="primary"
              variant="outlined"
              onClick={() => signup(username, password)}
            >
              Sign Up
            </Button>
          </Box>
        </Box>
      </Paper>
    </div>
  );
};

export default LoginPage;
