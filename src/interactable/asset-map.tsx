import * as React from "react";
import { IAsset, ASSETS, useAssetContext } from ".";
import {
  drawFieldInVision,
  getBoundingVisionLine,
  IBaseMapProps,
  isPointInView,
  pointInSquare,
} from "../common";
import { ICanvasRenderProps } from "../components";
import {
  IPlayerMovementEvent,
  useMapContext,
  usePlayerContext,
} from "../context";

export const AssetMap: React.FC<IBaseMapProps> = ({ canvas, canvasDrawFn }) => {
  const { renderAsset } = useAssetContext();
  const { unitInMap } = useMapContext();
  const { $playerMovementEvent } = usePlayerContext();

  const draw = React.useCallback(
    ({ position, rotation }: IPlayerMovementEvent) => {
      for (const [, asset] of Object.entries(ASSETS)) {
        if (isPointInView(asset.position, position, rotation)) {
          console.log("hasAsset");
          drawFieldInVision(position, rotation, unitInMap, (beam) => {
            if (pointInSquare(beam, asset.position, asset.h, asset.w)) {
              console.log("foundAssetCopyPosition");
              canvasDrawFn((context) => {
                renderAsset(context, asset?.asset, asset?.position);
                return undefined;
              });
            }
          });
          break;
        }
      }
    },
    [renderAsset, unitInMap, canvasDrawFn]
  );

  React.useEffect(() => {
    const playerMovementEventSub = $playerMovementEvent.subscribe(draw);

    return () => {
      playerMovementEventSub.unsubscribe();
    };
  });

  return null;
};

export const useMemoizedAssetMapRenderFn = () =>
  React.useCallback((props: ICanvasRenderProps) => <AssetMap {...props} />, []);
