import * as React from "react";
import { Subscription } from "rxjs";
import {
  useLayoutContext,
  LayoutContextProvider,
  IPlayerMovementEvent,
  useMapContext,
} from "../../context";
import { IBaseMapProps } from "./interfaces";
import { Canvas } from "../canvas";
import { useMemoizedBaseMapRenderFn } from "./base-map";
import { Key, useEventContext } from "../../events";
import { drawFieldInVision } from "./raytrace";
import { IPosition } from "../../common";
import { usePlayerContext } from "../../context";

const updateViewRotation = (src: number, keys: Key[], speed: number) => {
  let rotation = 0;

  keys.forEach((key) => {
    switch (key) {
      case Key.ArrowRight:
        rotation -= speed;
        break;
      case Key.ArrowLeft:
        rotation += speed;
        break;
    }
  });

  return (src += rotation);
};

const getPlayerEyeCenter = (position: IPosition, size: number) => {
  const eyeCenter = { ...position };
  eyeCenter.x = eyeCenter.x + Math.floor(size / 2);
  eyeCenter.y = eyeCenter.y + Math.floor(size / 2);

  return eyeCenter;
};

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
      return { x, y: y - speed };
    case Key.A:
      return { x: x - speed, y };
    case Key.D:
      return { x: x + speed, y: y };
    case Key.S:
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
  const {
    $playerMovementEvent,
    playerAttributes: { playerSize },
  } = usePlayerContext();
  const { $animationEvent } = useEventContext();
  const {
    windowProperties: { widthPx, heightPx },
  } = useLayoutContext();
  const { unitInMap } = useMapContext();
  const playerPositionAttributes = React.useRef<IPlayerMovementEvent>({
    position: { x: 0, y: 0 },
    rotation: 0,
    state: "idle",
  });
  const [isAnimating, setAnimating] = React.useState<boolean>(false);
  const updatePlayerPosition = React.useCallback(
    (event: IPlayerMovementEvent) => {
      playerPositionAttributes.current = event;
      setAnimating(event.state === "active");
    },
    []
  );

  // const { $keyboardEvent, $animationEvent } = useEventContext();
  // const {
  //   windowProperties: { unit, heightPx, widthPx, tiles },
  // } = useLayoutContext();
  // const keysRef = React.useRef<Key[]>([]);

  const animationSubscription = React.useRef<Subscription | null>(null);
  // const playerSize = React.useRef<number>(Math.floor(Math.sqrt(unit)));

  // const playerPosition = React.useRef<IPosition>({
  //   x: Math.floor(widthPx / 2),
  //   y: Math.floor(heightPx / 2),
  // });
  // const playerRotation = React.useRef<number>(180);
  // const moveSpeed = React.useRef<number>(0.5);
  // const rotationSpeed = React.useRef<number>(5);
  // const tilesRef = React.useRef<Set<string>>(new Set(map));

  // const movePlayer = React.useCallback(() => {
  // const context = canvas.current?.getContext("2d");

  // if (!context) {
  //   return;
  // }

  //   const nextPosition = nextValidPosition(
  //     playerPosition.current,
  //     keysRef.current,
  //     tilesRef.current,
  //     playerSize.current * moveSpeed.current,
  //     playerSize.current,
  //     unit
  //   );

  //   const rotation = (playerRotation.current = updateViewRotation(
  //     playerRotation.current,
  //     keysRef.current,
  //     rotationSpeed.current
  //   ));

  //   const { x, y } = (playerPosition.current = nextPosition);
  // }, [canvas, unit, widthPx, heightPx]);

  const drawPlayer = React.useCallback(() => {
    const context = canvas.current?.getContext("2d");
    console.log(playerPositionAttributes);

    if (!context) {
      return;
    }

    const { position, rotation } = playerPositionAttributes.current;

    context.clearRect(0, 0, widthPx, heightPx);
    drawFieldInVision(
      getPlayerEyeCenter(position, playerSize),
      rotation,
      (p) => unitInMap(p, 1),
      (p, c) => {
        context.beginPath();
        context.moveTo(
          position.x + playerSize / 2,
          position.y + playerSize / 2
        );
        context.lineTo(p.x, p.y);
        context.strokeStyle = c;
        context.lineWidth = 1;
        context.stroke();
      }
    );
    context.fillStyle = "red";
    context.fillRect(position.x, position.y, playerSize, playerSize);
  }, []);

  // React.useEffect(() => {
  //   animationFrameScheduler.schedule(movePlayer);
  // }, [movePlayer]);

  // React.useEffect(() => {
  //   const keyboardSubscription = $keyboardEvent.subscribe(({ keys }) => {
  //     setAnimating(keys.length > 0);
  //     keysRef.current = keys;
  //   });

  //   return () => {
  //     keyboardSubscription.unsubscribe();
  //   };
  // }, [$keyboardEvent]);

  React.useEffect(() => {
    if (isAnimating) {
      animationSubscription.current = $animationEvent.subscribe(drawPlayer);
    }

    return () => {
      animationSubscription.current?.unsubscribe();
      animationSubscription.current = null;
    };
  }, [$animationEvent, drawPlayer, isAnimating]);

  React.useEffect(() => {
    const playerEventSubscription = $playerMovementEvent.subscribe(
      updatePlayerPosition
    );

    return () => playerEventSubscription.unsubscribe();
  }, [$playerMovementEvent, updatePlayerPosition]);

  // const baseRenderFn = useMemoizedBaseMapRenderFn();
  // const playerMapRenderFn = useMemoizedPlayerMapRenderFn(true);

  // const renderFn = React.useCallback(
  //   (ref: DOMRect) => (
  //     <LayoutContextProvider anchor={ref} tiles={tiles}>
  //       <Canvas>{playerMapRenderFn}</Canvas>
  //       <Canvas>{baseRenderFn}</Canvas>
  //     </LayoutContextProvider>
  //   ),
  //   [tiles, baseRenderFn, playerMapRenderFn]
  // );

  // return !minimap ? (
  //   <Anchor
  //     style={{
  //       backgroundColor: "rgba(255, 255, 255, 0.3)",
  //       height: `${heightPx * 0.3}px`,
  //       width: `${widthPx * 0.3}px`,
  //       bottom: 0,
  //       right: 0,
  //     }}
  //   >
  //     {renderFn}
  //   </Anchor>
  // ) : null;

  return null;
});

export const useMemoizedPlayerMapRenderFn = (minimap?: boolean) =>
  React.useCallback(
    (canvas: React.RefObject<HTMLCanvasElement>) => (
      <PlayerMap canvas={canvas} minimap={minimap} />
    ),
    [minimap]
  );
