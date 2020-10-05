import { IPosition } from "./interfaces";

export const VERTICAL_CONE = 100.0;
export const HORIZONTAL_CONE = 90.0;
export const VISION_DISTANCE = 250.0;

export const isObject = (data: any): data is object => typeof data === "object";

export const isValueEqual = <T extends object>(a: T, b: T) => {
  const aValues = Object.values(a);
  const bValues = Object.values(b);

  if (aValues.length !== bValues.length) {
    return false;
  }

  for (let i = 0; i < aValues.length; ++i) {
    if (aValues[i] !== bValues[i]) {
      return false;
    }
  }

  return true;
};

export const toRad = (degree: number): number => degree * (Math.PI / 180)

export const getRotationAdjustedPosition = (position: IPosition, rotation: number, distance: number): IPosition => {
  const dst = { ...position };
  dst.x = dst.x + distance * Math.sin(toRad(rotation));
  dst.y = dst.y + distance * Math.cos(toRad(rotation));

  return dst;
}

export const getBoundingVisionLine = (position: IPosition, rotation: number): [IPosition, IPosition] => {
  const begin = getRotationAdjustedPosition(position, rotation - HORIZONTAL_CONE / 2, VISION_DISTANCE);
  const end = getRotationAdjustedPosition(position, rotation + HORIZONTAL_CONE / 2, VISION_DISTANCE);

  return [begin, end];
}

export const updateRectCorner = (src: IPosition, dst: IPosition, operator: '>' | '<') => {
  const ret = { ...src };
  if (operator === '<') {
    ret.x = dst.x < ret.x ? dst.x : ret.x;
    ret.y = dst.y < ret.y ? dst.y : ret.y;
  } else {
    ret.x = dst.x > ret.x ? dst.x : ret.x;
    ret.y = dst.y > ret.y ? dst.y : ret.y;
  }
  return ret;
} 

const triangleSign = (p1: IPosition, p2: IPosition, p3: IPosition) => {
  return (p1.x - p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p1.y - p3.y);
}

export const isPointInView = (point: IPosition, position: IPosition, rotation: number) => {
  const [p1, p2] = getBoundingVisionLine(position, rotation);
  
  // half-plane algorithm
  // https://stackoverflow.com/questions/2049582/how-to-determine-if-a-point-is-in-a-2d-triangle

  const d1 = triangleSign(point, position, p1);
  const d2 = triangleSign(point, p1, p2);
  const d3 = triangleSign(point, p2, position);

  const isNeg = (d1 < 0) || (d2 < 0) || (d3 < 0);
  const isPos = (d1 > 0) || (d2 > 0) || (d3 > 0);

  return !(isNeg && isPos);
}

export const pointInSquare = (point: IPosition, p1: IPosition, height: number, width: number) => {
  if (p1.x <= point.x && point.x <= p1.x + width &&
      p1.y <= point.y && point.y <= p1.y + height) {
    return true;
  }

  return false;
}

export type Beam = {
  x: number,
  y: number,
  length: number,
  id: number
}

export const drawFieldInVision = (
  position: IPosition,
  rotation: number,
  testFn: (position: Beam) => boolean,
  drawFn?: (position: Beam) => void
) => {
  let beam: Beam = { ...position, length: 0, id: 0 };
  let degree = rotation - HORIZONTAL_CONE / 2;
  let degreeEnd = rotation + HORIZONTAL_CONE / 2;
  let id = 0;
  const beams = [];
  while (degree <= degreeEnd) {
    beam = { ...position, length: 0, id: id++ };
    while (beam.length < VISION_DISTANCE && testFn(beam)) {
      const { x, y } = getRotationAdjustedPosition({ x: beam.x, y: beam.y }, degree, 1);
      beam.x = x;
      beam.y = y;
      beam.length++;
      
    }
    if (drawFn) {
      drawFn(beam);
    }
    beams.push(beam);
    ++degree;
  }

  return beams;
};