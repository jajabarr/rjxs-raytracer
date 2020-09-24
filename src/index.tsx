import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./app";
import { Anchor } from "./components";

import * as serviceWorker from "./serviceWorker";
import {
  LayoutContextProvider,
  MapContextProvider,
  PlayerContextProvider,
} from "./context";

ReactDOM.render(
  <Anchor style={{ height: "100vh", width: "100vw" }}>
    {(ref) => (
      <LayoutContextProvider anchor={ref} tiles={121} square>
        <MapContextProvider>
          <PlayerContextProvider>
            <App />
          </PlayerContextProvider>
        </MapContextProvider>
      </LayoutContextProvider>
    )}
  </Anchor>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
