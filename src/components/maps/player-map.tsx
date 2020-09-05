import * as React from "react";
import { animationFrameScheduler } from "rxjs";
import { Key, useLayoutContext } from "..";
import {
  IKeyboardEvent,
  useKeyboardEventSubscription,
} from "../events/keyboard-event-hook";
import { IBaseMapProps, IPosition } from "./interfaces";

const getNextPosition = (src: IPosition, dst: IPosition) => {
  const xD = Math.sign(dst.x - src.x) * 1;
  const yD = Math.sign(dst.y - src.y) * 1;

  const _xD = Math.abs(dst.x - src.x);
  const _yD = Math.abs(dst.y - src.y);
  const innerAngle = Math.asin(_yD / _xD);
  const yS = Math.sin(innerAngle) * yD;
  const xS = Math.cos(innerAngle) * xD;

  const x = src.x + (xS ? xS : xD);
  const y = src.y + (yS ? yS : yD);

  // console.log(_xD, _yD, xS, yS, innerAngle);

  return { x, y };
};

export const PlayerMap: React.FC<IBaseMapProps> = React.memo(
  ({ $events, canvas }) => {
    const { $keyboardEvent } = $events;
    const {
      windowProperties: { unit, height, width },
    } = useLayoutContext();

    const playerSize = React.useRef<number>(Math.ceil(Math.sqrt(unit)));
    const playerOffset = React.useRef<number>(
      Math.floor(playerSize.current / 2)
    );
    const currentPosition = React.useRef<IPosition>({
      x: Math.floor((width * unit) / 2) + playerOffset.current,
      y: Math.floor((height * unit) / 2) + playerOffset.current,
    });
    const nextPosition = React.useRef<IPosition>(currentPosition.current);
    const isAnimating = React.useRef<boolean>(false);
    const moveSpeed = React.useRef<number>(5);

    const updatePosition = React.useCallback(
      (position: IPosition, key: Key, animated?: boolean) => {
        const { x, y } = position;
        const distance =
          (animated ? playerSize.current * 0.1 : playerSize.current) *
          moveSpeed.current;
        switch (key) {
          case Key.W:
          case Key.ArrowUp:
            return { x, y: y - distance };
          case Key.A:
          case Key.ArrowLeft:
            return { x: x - distance, y };
          case Key.D:
          case Key.ArrowRight:
            return { x: x + distance, y: y };
          case Key.S:
          case Key.ArrowDown:
            return { x, y: y + distance };
        }

        return currentPosition.current;
      },
      []
    );

    const drawPlayer = React.useCallback(() => {
      const context = canvas.current?.getContext("2d");
      const until = nextPosition.current;

      if (!context) {
        return;
      }

      if (!isAnimating.current) {
        isAnimating.current = true;
      }

      const { x, y } = currentPosition.current;
      const { x: xPos, y: yPos } = getNextPosition(
        currentPosition.current,
        nextPosition.current
      );

      // console.log(x, xPos, y, yPos);
      if (x === until.x && y === until.y) {
        context.fillStyle = "red";
        context.fillRect(x, y, playerSize.current, playerSize.current);
        isAnimating.current = false;
        return;
      }
      context.clearRect(x, y, playerSize.current, playerSize.current);
      currentPosition.current = { x: xPos, y: yPos };
      context.fillStyle = "red";
      context.fillRect(xPos, yPos, playerSize.current, playerSize.current);

      animationFrameScheduler.schedule(drawPlayer);
    }, [canvas]);

    const movePlayerTo = React.useCallback(
      (event: IKeyboardEvent) => {
        console.log(event.keys);
        event.keys.forEach((key) => {
          nextPosition.current = updatePosition(nextPosition.current, key);
        });

        if (!isAnimating.current) {
          drawPlayer();
        }
      },
      [updatePosition, drawPlayer]
    );

    React.useEffect(() => {
      // console.log(
      //   "mount",
      //   playerSize.current,
      //   playerOffset.current,
      //   currentPosition.current
      // );

      animationFrameScheduler.schedule(() =>
        movePlayerTo({ key: Key.Noop, keys: [] })
      );
    }, [movePlayerTo, width, height, unit]);

    useKeyboardEventSubscription($keyboardEvent, movePlayerTo);

    return null;
  }
);
