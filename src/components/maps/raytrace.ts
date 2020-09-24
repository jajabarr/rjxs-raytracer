import { IPosition } from "../../common/interfaces";

const VERTICAL_CONE = 100.0;
const HORIZONTAL_CONE = 120.0;
const VISION_DISTANCE = 150;

export const drawFieldInVision = (
  position: IPosition,
  rotation: number,
  testFn: (position: IPosition) => boolean,
  drawFn: (position: IPosition, color: string) => void
) => {
  let beam = { ...position };
  // let degrees = [150, 210];
  let degree = rotation - 30;
  let degreeEnd = rotation + 30;

  let drawDistance = 0;
  let distances: number[] = [];
  while (degree <= degreeEnd) {
    beam = { ...position };
    drawDistance = 0;
    while (drawDistance < VISION_DISTANCE && testFn(beam)) {
      beam.x = beam.x + Math.sin((degree * Math.PI) / 180);
      beam.y = beam.y + Math.cos((degree * Math.PI) / 180);

      // console.log("draw", beam.x);

      drawDistance++;
    }
    drawFn(beam, "rgba(55, 55, 55, 0.5");
    distances.push(drawDistance - 1);
    ++degree;
    // console.log("degree", degree);
  }
};

/**
 *
 * Constraints:
 *  1. User perspective is 5'6"
 *  2. Wall is 9'0"
 *  3. One step is 2'6"
 */
export const raytrace = (
  position: IPosition,
  height: number,
  width: number
) => {
  const then = performance.now();
  const horizontalIndexRatio = HORIZONTAL_CONE / width;
  const verticalIndexRatio = VERTICAL_CONE / height;

  console.log("vdeg", VERTICAL_CONE, verticalIndexRatio);
  console.log("hdeg", HORIZONTAL_CONE, horizontalIndexRatio);
  for (let i = 0; i < height; ++i) {
    for (let j = 0; j < width; ++j) {
      const hDeg = Math.abs(HORIZONTAL_CONE / 2 - i * horizontalIndexRatio);
      const vDeg = Math.abs(VERTICAL_CONE / 2 - j * verticalIndexRatio);
    }
  }
  console.log(performance.now() - then);
};
