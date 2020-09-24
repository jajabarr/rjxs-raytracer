import * as React from "react";
import { Observable } from "rxjs";
import { distinctUntilChanged, map } from "rxjs/operators";
import { IPosition } from "../../common/interfaces";
import { useLayoutContext, useMapContext } from "..";
import { Key, useEventContext } from "../../events";
import { isValueEqual } from "../../common";

const getPlayerEyeCenter = (position: IPosition, size: number) => {
  const eyeCenter = { ...position };
  eyeCenter.x = eyeCenter.x + Math.floor(size / 2);
  eyeCenter.y = eyeCenter.y + Math.floor(size / 2);

  return eyeCenter;
};

const updatePosition = (
  position: IPosition,
  key: React.Key,
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
  speed: number,
  directions: React.Key[],
  size: number,
  testFn: (position: IPosition, speed: number) => boolean
): IPosition => {
  let dst = { ...src };

  directions.forEach((dir) => {
    dst = updatePosition(dst, dir, speed);
  });

  if (!testFn(dst, size)) {
    dst = { ...src };
    directions.forEach((dir) => {
      dst = updatePosition(dst, dir, 1 /* speed */);
    });

    if (!testFn(dst, size)) {
      dst = { ...src };
    }
  }

  return dst;
};

const updateViewRotation = (
  srcRotation: number,
  directions: Key[],
  rotationSpeed: number
) => {
  let rotation = 0;

  directions.forEach((key) => {
    switch (key) {
      case Key.ArrowRight:
        rotation -= rotationSpeed;
        break;
      case Key.ArrowLeft:
        rotation += rotationSpeed;
        break;
    }
  });

  return (srcRotation += rotation);
};

export type PlayerMovementState = "active" | "idle";
export interface IPlayerMovementEvent {
  position: IPosition;
  rotation: number;
  state: PlayerMovementState;
}

export interface PlayerAttributes {
  playerSize: number;
}
interface IPlayerContext {
  $playerMovementEvent: Observable<IPlayerMovementEvent>;
  playerAttributes: PlayerAttributes;
}

const PlayerContext = React.createContext<IPlayerContext>({
  $playerMovementEvent: new Observable<IPlayerMovementEvent>(),
  playerAttributes: { playerSize: 0 },
});

export const usePlayerContext = () => React.useContext(PlayerContext);

interface IPlayerContextProvider {
  children: React.ReactChild | React.ReactChild[];
}

export const PlayerContextProvider: React.FC<IPlayerContextProvider> = ({
  children,
}) => {
  const { $keyboardEvent } = useEventContext();
  const {
    windowProperties: { unit, heightPx, widthPx },
  } = useLayoutContext();
  const { unitInMap } = useMapContext();
  const playerSize = React.useRef<number>(Math.floor(Math.sqrt(unit)));
  const moveSpeed = React.useRef<number>(0.5);
  const rotationSpeed = React.useRef<number>(5);
  const playerPosition = React.useRef<IPosition>({
    x: Math.floor(widthPx / 2),
    y: Math.floor(heightPx / 2),
  });
  const playerRotation = React.useRef<number>(180);
  const playerMovementState = React.useRef<PlayerMovementState>("idle");

  const updatePlayerPosition = React.useCallback(
    (directions: Key[]) =>
      nextValidPosition(
        playerPosition.current,
        moveSpeed.current,
        directions,
        playerSize.current,
        unitInMap
      ),
    [unitInMap]
  );

  const updatePlayerRotation = React.useCallback(
    (directions: Key[]) =>
      updateViewRotation(
        playerRotation.current,
        directions,
        rotationSpeed.current
      ),
    []
  );

  const $playerMovementEvent: Observable<IPlayerMovementEvent> = React.useMemo(
    () =>
      $keyboardEvent.pipe(
        map(({ keys }) => {
          playerPosition.current = updatePlayerPosition(keys);
          playerRotation.current = updatePlayerRotation(keys);
          playerMovementState.current = keys.length > 0 ? "active" : "idle";

          return {
            position: playerPosition.current,
            rotation: playerRotation.current,
            state: playerMovementState.current,
          };
        }),
        distinctUntilChanged(isValueEqual)
      ),
    [$keyboardEvent, updatePlayerPosition, updatePlayerRotation]
  );

  return (
    <PlayerContext.Provider
      value={{
        $playerMovementEvent,
        playerAttributes: {
          playerSize: playerSize.current,
        },
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};
