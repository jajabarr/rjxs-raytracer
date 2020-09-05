import * as React from "react";
import { useLayoutContext } from "../";

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

export interface ICanvasProps {
  children: (
    canvas: React.RefObject<HTMLCanvasElement>
  ) => React.ReactChild | React.ReactChild[];
}

export const Canvas: React.FC<ICanvasProps> = ({ children }) => {
  const {
    windowProperties: { heightPx, widthPx },
  } = useLayoutContext();

  const canvasRef = React.createRef<HTMLCanvasElement>();

  React.useEffect(() => {
    const canvas = canvasRef.current;
    const canvasCtx = canvas?.getContext("2d");

    if (canvas && canvasCtx) {
      scaleCanvas(canvas, canvasCtx, widthPx, heightPx);
    }
  }, [canvasRef, heightPx, widthPx]);

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
      {children(canvasRef)}
    </>
  );
};
