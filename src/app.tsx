import React from "react";
import {
  BaseMap,
  Canvas,
  PlayerMap,
  useMemoizedBaseMapRenderFn,
  useMemoizedPlayerMapRenderFn,
} from "./components";
import { useLayoutContext } from "./context";
import { EventProvider } from "./events/events";
const App = () => {
  const {
    windowProperties: { heightPx, widthPx },
  } = useLayoutContext();

  const BaseMapRenderFn = useMemoizedBaseMapRenderFn();
  const PlayerMapRenderFn = useMemoizedPlayerMapRenderFn();

  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "relative",
          height: heightPx,
          width: widthPx,
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          border: "1px solid red",
        }}
      >
        <EventProvider>
          <Canvas>{BaseMapRenderFn}</Canvas>
          <Canvas>{PlayerMapRenderFn}</Canvas>
        </EventProvider>
      </div>
    </div>
  );
};

export default App;
