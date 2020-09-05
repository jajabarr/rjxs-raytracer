import * as React from "react";
import { Key, useLayoutContext } from "..";
import {
  IKeyboardEvent,
  useKeyboardEventSubscription,
} from "../events/keyboard-event-hook";
import {
  IMouseEvent,
  useMouseEventSubscription,
} from "../events/mouse-event-hook";
import { IBaseMapProps } from "./interfaces";

export const BaseMap: React.FC<IBaseMapProps> = React.memo(
  ({ $events, canvas }) => {
    const { $mouseEvent, $keyboardEvent } = $events;
    const {
      windowProperties: { unit },
    } = useLayoutContext();

    const color = React.useRef<string>("black");

    const setColor = React.useCallback((keyboardEvent: IKeyboardEvent) => {
      if (keyboardEvent.key === Key.One) {
        color.current = "black";
      } else if (keyboardEvent.key === Key.Two) {
        color.current = "clear";
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
        console.log("fill", x * unit, y * unit, unit, unit);
        if (color.current === "clear") {
          context.clearRect(x * unit, y * unit, unit, unit);
        } else {
          context.fillRect(x * unit, y * unit, unit, unit);
        }
      },
      [unit, canvas]
    );

    useKeyboardEventSubscription($keyboardEvent, setColor);
    useMouseEventSubscription($mouseEvent, writeColor);

    return null;
  }
);
