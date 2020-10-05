import * as React from "react";
import {
  useLayoutContext,
  IPlayerMovementEvent,
  useMapContext,
} from "../../context";
import { IBaseMapProps, drawFieldInVision } from "../../common";
import { IPosition, updateRectCorner } from "../../common";
import { usePlayerContext } from "../../context";
import { ICanvasRenderProps } from "../canvas/canvas";

const getPlayerEyeCenter = (position: IPosition, size: number) => {
  const eyeCenter = { ...position };
  eyeCenter.x = eyeCenter.x + Math.floor(size / 2);
  eyeCenter.y = eyeCenter.y + Math.floor(size / 2);

  return eyeCenter;
};

export const PlayerMap: React.FC<
  IBaseMapProps & { minimap?: boolean }
> = React.memo(({ canvasDrawFn }) => {
  const {
    $playerMovementEvent,
    playerAttributes: { playerSize },
  } = usePlayerContext();
  const {
    windowProperties: { widthPx, heightPx },
  } = useLayoutContext();
  const { unitInMap } = useMapContext();

  const drawPlayer = React.useCallback(
    (playerMovementEvent: IPlayerMovementEvent) => {
      let begin = { x: widthPx, y: heightPx };
      let end = { x: 0, y: 0 };
      canvasDrawFn((context) => {
        const { position, rotation } = playerMovementEvent;
        context.lineWidth = 1;
        context.strokeStyle = "rgba(55, 55, 55, 0.5)";
        // context.clearRect(0, 0, widthPx, heightPx);
        const beams = drawFieldInVision(
          getPlayerEyeCenter(position, playerSize),
          rotation,
          (p) => unitInMap(p, 1),
          (beam) => {
            begin = updateRectCorner(begin, beam, "<");
            end = updateRectCorner(end, beam, ">");
            context.beginPath();
            context.moveTo(
              Math.round(position.x + playerSize / 2),
              Math.round(position.y + playerSize / 2)
            );
            context.lineTo(Math.round(beam.x), Math.round(beam.y));
            context.stroke();
          }
        );
        context.fillStyle = "red";
        context.fillRect(
          Math.round(position.x),
          Math.round(position.y),
          Math.round(playerSize),
          Math.round(playerSize)
        );
        begin = updateRectCorner(begin, position, "<");
        end = updateRectCorner(end, position, ">");
        begin.x -= playerSize;
        begin.y -= playerSize;
        end.x += playerSize;
        end.y += playerSize;

        return [begin, end];
      }, "player-map");
    },
    [canvasDrawFn, heightPx, widthPx, playerSize, unitInMap]
  );

  React.useEffect(() => {
    const playerEventSubscription = $playerMovementEvent.subscribe(drawPlayer);

    return () => {
      playerEventSubscription.unsubscribe();
    };
  }, [$playerMovementEvent, drawPlayer]);

  return null;
});

export const useMemoizedPlayerMapRenderFn = () =>
  React.useCallback(
    (props: ICanvasRenderProps) => <PlayerMap {...props} />,
    []
  );
