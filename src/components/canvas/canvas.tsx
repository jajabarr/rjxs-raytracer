import * as React from "react";
import { IPosition } from "../../common";
import { useLayoutContext } from "../../context";

const scaleCanvas = (
  canvas: HTMLCanvasElement,
  context: CanvasRenderingContext2D,
  width: number,
  height: number
) => {
  // assume the device pixel ratio is 1 if the browser doesn't specify it
  const devicePixelRatio = window.devicePixelRatio || 1;

  // determine the 'backing store ratio' of the canvas context
  const backingStoreRatio =
    (context as any).webkitBackingStorePixelRatio ||
    (context as any).mozBackingStorePixelRatio ||
    (context as any).msBackingStorePixelRatio ||
    (context as any).oBackingStorePixelRatio ||
    (context as any).backingStorePixelRatio ||
    1;

  // determine the actual ratio we want to draw at
  const ratio = devicePixelRatio / backingStoreRatio;

  if (devicePixelRatio !== backingStoreRatio) {
    // set the 'real' canvas size to the higher width/height
    canvas.width = width * ratio;
    canvas.height = height * ratio;

    // ...then scale it back down with CSS
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
  } else {
    // this is a normal 1:1 device; just scale it simply
    canvas.width = width;
    canvas.height = height;
    canvas.style.width = "";
    canvas.style.height = "";
  }

  // scale the drawing context so everything will work at the higher ratio
  context.scale(ratio, ratio);
};

export type CanvasDrawFn = (
  drawFn: (
    context: CanvasRenderingContext2D
  ) => [IPosition, IPosition] | undefined,
  id?: string
) => void;

export interface ICanvasRenderProps {
  canvas: HTMLCanvasElement;
  canvasDrawFn: CanvasDrawFn;
}

type CanvasChildRenderFn = (props: ICanvasRenderProps) => React.ReactNode;
type CanvasNode = CanvasChildRenderFn | CanvasChildRenderFn[];
export interface ICanvasProps {
  children: CanvasNode;
  id?: string;
}

export const Canvas: React.FC<ICanvasProps> = ({ children, id }) => {
  const {
    windowProperties: { heightPx, widthPx },
  } = useLayoutContext();
  const [scaled, scale] = React.useState<boolean>(false);
  const canvasRef = React.createRef<HTMLCanvasElement>();
  const prevRect = React.useRef<[IPosition, IPosition] | undefined>();

  React.useEffect(() => {
    const canvas = canvasRef.current;
    const canvasCtx = canvas?.getContext("2d");

    if (!scaled && canvas && canvasCtx) {
      scaleCanvas(canvas, canvasCtx, widthPx, heightPx);
      scale(() => true);
    }
  }, [canvasRef, heightPx, widthPx, scale, scaled]);

  const draw: CanvasDrawFn = React.useCallback(
    (canvasDrawFn, id) => {
      const context = canvasRef?.current?.getContext("2d");

      if (!context) {
        return;
      }

      const prev = prevRect.current;

      if (prev) {
        const [begin, end] = prev;
        const w = Math.ceil(Math.abs(end.x - begin.x)) * 1.1;
        const h = Math.ceil(Math.abs(end.y - begin.y)) * 1.1;

        // console.log(id, prev, w, h);
        context.clearRect(Math.floor(begin.x), Math.floor(begin.y), w, h);
      }

      prevRect.current = canvasDrawFn(context);
    },
    [canvasRef]
  );

  const memoizedChildren = React.useMemo(
    () =>
      scaled
        ? (children as CanvasChildRenderFn)({
            canvas: canvasRef.current as HTMLCanvasElement,
            canvasDrawFn: draw,
          })
        : null,
    [children, draw, scaled, canvasRef]
  );

  return (
    <>
      <canvas
        style={{
          position: "absolute",
          height: "100%",
          width: "100%",
        }}
        ref={canvasRef}
      />

      {memoizedChildren}
    </>
  );
};
