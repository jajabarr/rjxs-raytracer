import React from "react";
import {
  Canvas,
  useMemoizedBaseMapRenderFn,
  useMemoizedBackgroundMapRenderFn,
  useMemoizedPlayerMapRenderFn,
  useMemoizedWorldMapRenderFn,
} from "./components";
import { PlayerContextProvider, useLayoutContext } from "./context";
import { EventContextProvider } from "./events";
import {
  AssetContextProvider,
  useMemoizedAssetMapRenderFn,
} from "./interactable";
const App = () => {
  const {
    windowProperties: { heightPx, widthPx },
  } = useLayoutContext();

  const BaseMapRenderFn = useMemoizedBaseMapRenderFn();
  const PlayerMapRenderFn = useMemoizedPlayerMapRenderFn();
  const WorldMapRenderFn = useMemoizedWorldMapRenderFn();
  const BackgroundMapRenderFn = useMemoizedBackgroundMapRenderFn();
  const AssetMapRenderFn = useMemoizedAssetMapRenderFn();

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
        <EventContextProvider>
          <PlayerContextProvider>
            <AssetContextProvider>
              {/* <Canvas id="baseMap">{BaseMapRenderFn}</Canvas> */}
              <Canvas id="floorMap">{BackgroundMapRenderFn}</Canvas>
              <Canvas id="playerMap">{PlayerMapRenderFn}</Canvas>
              <Canvas id="worldMap">{WorldMapRenderFn}</Canvas>
              <Canvas id="assetMap">{AssetMapRenderFn}</Canvas>
            </AssetContextProvider>
          </PlayerContextProvider>
        </EventContextProvider>
      </div>
    </div>
  );
};

export default App;
