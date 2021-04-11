import React, {
  FunctionComponent,
  useContext,
  useEffect,
  useState,
} from "react";
import { useHistory } from "react-router";
import { UserContext } from "../context/UserContext";
import { flow } from "lodash/fp";
import { Box, Button, Paper, TextField, Typography } from "@material-ui/core";
import { Message, MessageContext, MessageProvider } from "../context/MessageContext";
import { defaultResult } from "../../common/request-result";

import "./MainPage.styl";

const MainPage: FunctionComponent = () => {
  const history = useHistory();

  const [message, setMessage] = useState("");

  const { user } = useContext(UserContext);
  const { messages, post } = useContext(MessageContext);

  useEffect(() => {
    if (!user) {
      history.push("/login");
    }
  }, [user]);

  return (
    <div id="main-page">
      <Typography component="h2">Messages</Typography>
      <Paper id="message-container" elevation={3}>
        {defaultResult([], messages).map(
          (msg: Message) => (
            <div key={msg.id} className="message">
              <Typography >{msg.text}</Typography>
            </div>
          )
        )}
      </Paper>
      <Box
        display="flex"
        flexDirection="row"
        alignItems="baseline"
        justifyContent="space-between"
        marginBottom="15px"
      >
        <TextField
          id="message-field"
          label="Message"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
        />
        <Button id="post-button"
        color="primary" variant="contained"
        onClick={() => post(message)}>
          Post
        </Button>
      </Box>
    </div>
  );
};

export default () => (
  <MessageProvider>
    <MainPage />;
  </MessageProvider>
);
