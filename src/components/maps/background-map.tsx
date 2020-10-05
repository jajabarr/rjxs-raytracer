import * as React from "react";
import { useLayoutContext } from "../../context";
import { ICanvasRenderProps } from "../canvas/canvas";
import { IBaseMapProps } from "../../common";

export const BackgroundMap: React.FC<
  IBaseMapProps & { minimap?: boolean }
> = React.memo(({ canvasDrawFn }) => {
  const {
    windowProperties: { widthPx, heightPx },
  } = useLayoutContext();
  const mapCenter = React.useRef<number>(heightPx / 2);

  const drawFloor = React.useCallback(() => {
    canvasDrawFn((context) => {
      context.fillStyle = "black";
      context.fillRect(0, mapCenter.current, widthPx, heightPx);
      context.fillStyle = "black";
      context.fillRect(0, 0, widthPx, mapCenter.current);

      return [
        { x: 0, y: 0 },
        { x: widthPx, y: heightPx },
      ];
    });
  }, [canvasDrawFn, widthPx, heightPx]);

  React.useEffect(() => {
    drawFloor();
  }, [drawFloor]);

  return null;
});

export const useMemoizedBackgroundMapRenderFn = () =>
  React.useCallback(
    (props: ICanvasRenderProps) => <BackgroundMap {...props} />,
    []
  );
