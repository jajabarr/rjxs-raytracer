import * as React from "react";
import {
  useLayoutContext,
  IPlayerMovementEvent,
  useMapContext,
} from "../../context";
import {
  HORIZONTAL_CONE,
  IBaseMapProps,
  VISION_DISTANCE,
  drawFieldInVision,
  Beam,
} from "../../common";
import { IPosition, toRad } from "../../common";
import { usePlayerContext } from "../../context";
import { CanvasDrawFn, ICanvasRenderProps } from "../canvas/canvas";

const getPlayerEyeCenter = (position: IPosition, size: number) => {
  const eyeCenter = { ...position };
  eyeCenter.x = eyeCenter.x + size / 2;
  eyeCenter.y = eyeCenter.y + size / 2;

  return eyeCenter;
};

export const WorldMap: React.FC<
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
  const mapCenter = React.useRef<number>(heightPx / 2);

  const getWallBeginEnd = React.useCallback(
    (beam: Beam): [IPosition, IPosition] => {
      const begin = { ...beam };
      const end = { ...beam };

      begin.x = end.x = (1 - beam.id / HORIZONTAL_CONE) * widthPx;
      const wallHeight = (heightPx / beam.length) * 20;

      begin.y = mapCenter.current - wallHeight / 2;
      end.y = begin.y + wallHeight;

      return [begin, end];
    },
    [widthPx, heightPx]
  );

  const wallLength = React.useMemo(() => {
    return Math.ceil(widthPx / HORIZONTAL_CONE);
  }, [widthPx]);

  const drawMap = React.useCallback(
    (playerMovementEvent: IPlayerMovementEvent) => {
      const _begin = { x: 0, y: heightPx };
      const _end = { x: widthPx, y: 0 };
      canvasDrawFn((context) => {
        const { position, rotation } = playerMovementEvent;
        // context.clearRect(0, 0, widthPx, heightPx);
        drawFieldInVision(
          getPlayerEyeCenter(position, playerSize),
          rotation,
          (b) => unitInMap(b, 1),
          (b) => {
            const [begin, end] = getWallBeginEnd(b);
            context.beginPath();
            context.lineWidth = wallLength;
            context.moveTo(Math.round(begin.x), Math.round(begin.y));
            context.lineTo(Math.round(end.x), Math.round(end.y));
            context.strokeStyle = `rgba(0,0,255,${
              1 - b.length / VISION_DISTANCE
            })`;
            context.stroke();

            _begin.y = begin.y < _begin.y ? begin.y : _begin.y;
            _end.y = end.y > _end.y ? end.y : _end.y;
          }
        );

        return [_begin, _end];
      }, "3d-map");
    },
    [
      canvasDrawFn,
      heightPx,
      widthPx,
      playerSize,
      unitInMap,
      getWallBeginEnd,
      wallLength,
    ]
  );

  React.useEffect(() => {
    const playerEventSubscription = $playerMovementEvent.subscribe(drawMap);

    return () => {
      playerEventSubscription.unsubscribe();
    };
  }, [$playerMovementEvent, drawMap]);

  return null;
});

export const useMemoizedWorldMapRenderFn = () =>
  React.useCallback((props: ICanvasRenderProps) => <WorldMap {...props} />, []);
