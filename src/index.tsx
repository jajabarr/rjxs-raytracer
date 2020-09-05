import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./app";
import { LayoutContextProvider } from "./components";

import * as serviceWorker from "./serviceWorker";

ReactDOM.render(
  <LayoutContextProvider tiles={121} square>
    <App />
  </LayoutContextProvider>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
