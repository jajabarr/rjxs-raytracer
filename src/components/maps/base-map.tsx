import * as React from "react";
import { useLayoutContext } from "../../context";
import {
  IKeyboardEvent,
  useKeyboardEventSubscription,
  Key,
  useEventContext,
  IMouseEvent,
  useMouseEventSubscription,
} from "../../events";
import map from "./map.json";
import { IBaseMapProps } from "./interfaces";
import { animationFrameScheduler } from "rxjs";
import { IPosition } from "../../common";

const downloadJson = (value: string) => {
  const data = new Blob([value], { type: "text/json" });
  const csvURL = window.URL.createObjectURL(data);
  const tempLink = document.createElement("a");
  tempLink.href = csvURL;
  tempLink.setAttribute("download", "map.json");
  tempLink.click();
};

const getTileKey = (position: IPosition): string =>
  `${position.x},${position.y}`;

const getTilePosition = (position: string): IPosition => {
  const [x, y] = position.split(",");
  return { x: +x, y: +y };
};

export const BaseMap: React.FC<IBaseMapProps> = React.memo(({ canvas }) => {
  const { $mouseEvent, $keyboardEvent } = useEventContext();
  const {
    windowProperties: { unit },
  } = useLayoutContext();

  const color = React.useRef<string>("black");
  const tileRef = React.useRef<{ [key: string]: boolean }>({});
  const setColor = React.useCallback((keyboardEvent: IKeyboardEvent) => {
    if (keyboardEvent.key === Key.One) {
      color.current = "black";
    } else if (keyboardEvent.key === Key.Two) {
      color.current = "clear";
    } else if (keyboardEvent.key === Key.BracketLeft) {
      const tiles: string[] = [];
      for (const [k, v] of Object.entries(tileRef.current)) {
        if (v) {
          tiles.push(k);
        }
      }
      downloadJson(JSON.stringify(tiles));
    }
  }, []);

  const writeColor = React.useCallback(
    (event: IMouseEvent) => {
      const { x, y } = event;
      const context = canvas.current?.getContext("2d");

      if (!context) {
        return;
      }

      context.fillStyle = color.current;
      // console.log("fill", x * unit, y * unit, unit, unit);
      if (color.current === "clear") {
        context.clearRect(x * unit, y * unit, unit, unit);
        tileRef.current[getTileKey({ x, y })] = false;
      } else {
        tileRef.current[getTileKey({ x, y })] = true;
        context.fillRect(x * unit, y * unit, unit, unit);
      }
    },
    [unit, canvas]
  );

  React.useEffect(() => {
    console.log("map", map);
    animationFrameScheduler.schedule(() => {
      map.forEach((v) => writeColor(getTilePosition(v)));
    });
  }, [writeColor]);

  useKeyboardEventSubscription($keyboardEvent, setColor);
  useMouseEventSubscription($mouseEvent, writeColor);

  return null;
});

export const useMemoizedBaseMapRenderFn = () =>
  React.useCallback(
    (canvas: React.RefObject<HTMLCanvasElement>) => <BaseMap canvas={canvas} />,
    []
  );
