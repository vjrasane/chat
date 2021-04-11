import React, { ReactElement } from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import LoginPage from "./LoginPage/LoginPage";
import MainPage from "./MainPage/MainPage";
import { UserProvider } from "./context/UserContext";

import "./index.styl";

const render = (component: ReactElement) =>
  ReactDOM.render(component, document.getElementById("root"));

render(
  <UserProvider>
    <Router>
      <Switch>
        <Route path="/login">
          <LoginPage />
        </Route>
        <Route path="/">
          <MainPage />
        </Route>
      </Switch>
    </Router>
  </UserProvider>
);
