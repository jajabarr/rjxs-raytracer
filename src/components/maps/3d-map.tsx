import * as React from "react";
import { animationFrameScheduler, Subscription } from "rxjs";
import map from "./map.json";
import { IBaseMapProps } from "./interfaces";
import { Anchor } from "..";
import { LayoutContextProvider, useLayoutContext } from "../../context";
import { Canvas } from "../canvas";
import { useMemoizedBaseMapRenderFn } from "./base-map";
import { useEventContext, Key } from "../../events";
import { IPosition } from "../../common/interfaces";

const getTileKey = (position: IPosition): string =>
  `${position.x},${position.y}`;

const squareInMap = (
  dst: IPosition,
  map: Set<string>,
  unit: number,
  size: number
) => {
  const { x, y } = dst;
  const p1 = { x: Math.floor(x / unit), y: Math.floor(y / unit) };
  const p2 = {
    x: Math.floor((x + size - 1) / unit),
    y: Math.floor(y / unit),
  };
  const p3 = {
    x: Math.floor(x / unit),
    y: Math.floor((y + size - 1) / unit),
  };
  const p4 = {
    x: Math.floor((x + size - 1) / unit),
    y: Math.floor((y + size - 1) / unit),
  };

  // console.log("##### EDGES #####");
  // console.log("P", dst);
  // console.log("T", p1, map.has(getTileKey(p1)));
  // console.log("TR", p2, map.has(getTileKey(p2)));
  // console.log("B", p3, map.has(getTileKey(p3)));
  // console.log("BR", p4, map.has(getTileKey(p4)));
  // console.log("\n\n");

  if ([p1, p2, p3, p4].filter((p) => !map.has(getTileKey(p))).length > 0) {
    return false;
  }

  return true;
};

const updatePosition = (
  position: IPosition,
  key: Key,
  speed: number
): IPosition => {
  const { x, y } = position;

  speed = Math.floor(speed);

  switch (key) {
    case Key.W:
    case Key.ArrowUp:
      return { x, y: y - speed };
    case Key.A:
    case Key.ArrowLeft:
      return { x: x - speed, y };
    case Key.D:
    case Key.ArrowRight:
      return { x: x + speed, y: y };
    case Key.S:
    case Key.ArrowDown:
      return { x, y: y + speed };
  }

  return position;
};

const nextValidPosition = (
  src: IPosition,
  directions: Key[],
  map: Set<string>,
  speed: number,
  size: number,
  unit: number
): IPosition => {
  let dst = { ...src };

  directions.forEach((dir) => {
    dst = updatePosition(dst, dir, speed);
  });

  if (!squareInMap(dst, map, unit, size)) {
    dst = src;
    directions.forEach((dir) => {
      dst = updatePosition(dst, dir, 1 /* speed */);
    });

    if (!squareInMap(dst, map, unit, size)) {
      dst = src;
    }
  }

  return dst;
};

export const PlayerMap: React.FC<
  IBaseMapProps & { minimap?: boolean }
> = React.memo(({ canvas, minimap }) => {
  const { $keyboardEvent, $animationEvent } = useEventContext();
  const {
    windowProperties: { unit, heightPx, widthPx, tiles },
  } = useLayoutContext();
  const keysRef = React.useRef<Key[]>([]);
  const [isAnimating, setAnimating] = React.useState<boolean>(false);
  const animationSubscription = React.useRef<Subscription | null>(null);
  const playerSize = React.useRef<number>(Math.floor(Math.sqrt(unit)));

  const playerPosition = React.useRef<IPosition>({
    x: Math.floor(widthPx / 2),
    y: Math.floor(heightPx / 2),
  });
  const moveSpeed = React.useRef<number>(0.8);
  const tilesRef = React.useRef<Set<string>>(new Set(map));

  const movePlayer = React.useCallback(() => {
    const context = canvas.current?.getContext("2d");

    if (!context) {
      return;
    }

    const { x: xOld, y: yOld } = playerPosition.current;

    const nextPosition = nextValidPosition(
      playerPosition.current,
      keysRef.current,
      tilesRef.current,
      playerSize.current * moveSpeed.current,
      playerSize.current,
      unit
    );

    const { x, y } = (playerPosition.current = nextPosition);
  }, [canvas, unit]);

  React.useEffect(() => {
    animationFrameScheduler.schedule(movePlayer);
  }, [movePlayer]);

  React.useEffect(() => {
    if (isAnimating) {
      animationSubscription.current = $animationEvent.subscribe(movePlayer);
    }

    return () => {
      animationSubscription.current?.unsubscribe();
      animationSubscription.current = null;
    };
  }, [$animationEvent, movePlayer, isAnimating]);

  React.useEffect(() => {
    const keyboardSubscription = $keyboardEvent.subscribe(({ keys }) => {
      setAnimating(keys.length > 0);
      keysRef.current = keys;
    });

    return () => {
      keyboardSubscription.unsubscribe();
    };
  }, [$keyboardEvent]);

  const baseRenderFn = useMemoizedBaseMapRenderFn();
  const playerMapRenderFn = useMemoizedPlayerMapRenderFn(true);

  const renderFn = React.useCallback(
    (ref: DOMRect) => (
      <LayoutContextProvider anchor={ref} tiles={tiles}>
        <Canvas>{baseRenderFn}</Canvas>
        <Canvas>{playerMapRenderFn}</Canvas>
      </LayoutContextProvider>
    ),
    [tiles, baseRenderFn, playerMapRenderFn]
  );

  return !minimap ? (
    <Anchor
      style={{
        backgroundColor: "rgba(255, 255, 255, 0.3)",
        height: `${heightPx * 0.3}px`,
        width: `${widthPx * 0.3}px`,
        bottom: 0,
        right: 0,
      }}
    >
      {renderFn}
    </Anchor>
  ) : null;
});

export const useMemoizedPlayerMapRenderFn = (minimap?: boolean) =>
  React.useCallback(
    (canvas: React.RefObject<HTMLCanvasElement>) => (
      <PlayerMap canvas={canvas} minimap={minimap} />
    ),
    [minimap]
  );
