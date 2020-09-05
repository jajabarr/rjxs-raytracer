import React from "react";
import { BaseMap, Canvas, PlayerMap, useLayoutContext } from "./components";
import { EventProvider } from "./components/events/events";
const App = () => {
  const {
    windowProperties: { heightPx, widthPx },
  } = useLayoutContext();

  // const tiles = React.useMemo(
  //   () =>
  //     new Array(windowProperties.width).fill(1).map((_, idx) => (
  //       <div
  //         key={`w${idx}`}
  //         style={{
  //           display: "flex",
  //           flexDirection: "column",
  //           justifyContent: "space-around",
  //         }}
  //       >
  //         {new Array(windowProperties.height).fill(1).map((_, idx) => (
  //           <div
  //             key={`h${idx}`}
  //             style={{
  //               height: windowProperties.unit - 2,
  //               width: windowProperties.unit - 2,
  //               backgroundColor: "blue",
  //               // border: "0.15px solid white",
  //             }}
  //           />
  //         ))}
  //       </div>
  //     )),
  //   [windowProperties]
  // );

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
          {($events) => (
            <>
              <Canvas>
                {(canvas) => <BaseMap $events={$events} canvas={canvas} />}
              </Canvas>
              <Canvas>
                {(canvas) => <PlayerMap $events={$events} canvas={canvas} />}
              </Canvas>
            </>
          )}
        </EventProvider>
        {/* <p
          style={{
            position: "absolute",
            color: "white",
            fontWeight: "bold",
            wordWrap: "normal",
            fontSize: "25px",
            userSelect: "none",
            textShadow:
              "-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000",
          }}
        >
          {`height: ${windowProperties.heightPx}, width: ${windowProperties.widthPx}, tiles: ${windowProperties.tiles}, unit: ${windowProperties.unit}`}
        </p> */}
      </div>
    </div>
  );
};

export default App;
