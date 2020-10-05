/* eslint-disable no-fallthrough */
import * as React from "react";
import { EMPTY, Observable } from "rxjs";
import { map, startWith, switchMap, tap } from "rxjs/operators";
import { IPosition } from "../../common/interfaces";
import { useLayoutContext, useMapContext } from "..";
import { Key, useEventContext } from "../../events";
import { getRotationAdjustedPosition } from "../../common";

const updatePosition = (
  position: IPosition,
  key: Key,
  rotation: number,
  speed: number
): IPosition => {
  let adjustedRotation = rotation;

  switch (key) {
    case Key.W:
      break;
    case Key.A:
      adjustedRotation += 90;
      break;
    case Key.S:
      adjustedRotation += 180;
      break;
    case Key.D:
      adjustedRotation += 270;
      break;
    default:
      return position;
  }

  return getRotationAdjustedPosition(position, adjustedRotation, speed);
};

const nextValidPosition = (
  src: IPosition,
  speed: number,
  directions: Key[],
  rotation: number,
  size: number,
  testFn: (
    position: IPosition,
    size: number,
    __debug_owner__?: string
  ) => boolean
): IPosition => {
  let dst = { ...src };

  directions.forEach((dir) => {
    dst = updatePosition(dst, dir, rotation, speed);
  });

  if (!testFn(dst, size, "playerContext")) {
    dst = { ...src };
    directions.forEach((dir) => {
      dst = updatePosition(dst, dir, rotation, 1 /* speed */);
    });

    if (!testFn(dst, size, "playerContext")) {
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

export interface IPlayerMovementEvent {
  position: IPosition;
  rotation: number;
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
  const { $keyboardEvent, $animationEvent } = useEventContext();
  const {
    windowProperties: { unit, heightPx, widthPx },
  } = useLayoutContext();
  const { unitInMap } = useMapContext();
  const playerSize = React.useRef<number>(Math.floor(Math.sqrt(unit)));
  const moveSpeed = React.useRef<number>(0.3);
  const rotationSpeed = React.useRef<number>(3);
  const playerPosition = React.useRef<IPosition>({
    x: Math.floor(widthPx / 2),
    y: Math.floor(heightPx / 2),
  });
  const playerRotation = React.useRef<number>(180);
  const keysRef = React.useRef<Key[]>([]);

  const updatePlayerPosition = React.useCallback(
    (directions: Key[]) =>
      nextValidPosition(
        playerPosition.current,
        moveSpeed.current * playerSize.current,
        directions,
        playerRotation.current,
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
        tap(({ keys }) => (keysRef.current = keys)),
        switchMap(() => {
          if (keysRef.current.length > 0) {
            return $animationEvent;
          } else {
            return EMPTY;
          }
        }),
        map(() => {
          if (keysRef.current.length > 0) {
            playerRotation.current = updatePlayerRotation(keysRef.current);
            playerPosition.current = updatePlayerPosition(keysRef.current);
          }

          return {
            position: playerPosition.current,
            rotation: playerRotation.current,
          };
        }),

        startWith({
          position: playerPosition.current,
          rotation: playerRotation.current,
        })
      ),
    [
      $keyboardEvent,
      $animationEvent,
      updatePlayerPosition,
      updatePlayerRotation,
    ]
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
