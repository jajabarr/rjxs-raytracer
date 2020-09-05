import { IEvents } from "..";

export interface IBaseMapProps {
  $events: IEvents;
  canvas: React.RefObject<HTMLCanvasElement>;
}

export interface IPosition {
  x: number;
  y: number;
}
