import * as React from "react";
import { fromEvent, Observable, merge } from "rxjs";
import { map, filter, tap } from "rxjs/operators";
import { useLayoutContext } from "../context";
import { distinctUntilChangedUntil } from "./custom-operators";

const between = (value: number, lhs: number, rhs: number) => {
  return lhs <= value && value <= rhs;
};

export interface IMouseEvent {
  x: number;
  y: number;
}

export const useMouseEvents = (elementRef: React.RefObject<HTMLDivElement>) => {
  const {
    windowProperties: { unit },
  } = useLayoutContext();

  const isMouseDown = React.useRef<boolean>(false);

  const $mouseDown = React.useMemo(
    () =>
      fromEvent<MouseEvent>(document, "mousedown").pipe(
        tap(() => {
          isMouseDown.current = true;
        })
      ),
    []
  );
  const $mouseUp = React.useMemo(
    () =>
      fromEvent<MouseEvent>(document, "mouseup").pipe(
        tap(() => {
          isMouseDown.current = false;
        })
      ),
    []
  );
  const $mouseMove = React.useMemo(
    () =>
      fromEvent<MouseEvent>(document, "mousemove").pipe(
        filter(() => isMouseDown.current)
      ),
    []
  );

  const $mouseEvents = React.useMemo(
    () => merge($mouseDown, $mouseUp, $mouseMove),
    [$mouseDown, $mouseUp, $mouseMove]
  );

  const $mouseEvent: Observable<IMouseEvent> = React.useMemo(
    () =>
      $mouseEvents.pipe(
        map((event: MouseEvent) => {
          const rect = elementRef.current?.getBoundingClientRect();

          if (!rect) {
            return { x: -1, y: -1 };
          }

          const { x, y, top, bottom, right, left } = rect;

          const [mX, mY] = [event.clientX, event.clientY];

          if (!between(mX, left, right) || !between(mY, top, bottom)) {
            return { x: -1, y: -1 };
          }

          const yCoord = Math.floor(Math.abs(mY - y) / unit);
          const xCoord = Math.floor(Math.abs(mX - x) / unit);

          return { x: xCoord, y: yCoord };
        }),
        filter(({ x, y }) => x >= 0 && y >= 0),
        distinctUntilChangedUntil(16)
      ),

    [unit, elementRef, $mouseEvents]
  );

  return $mouseEvent;
};

export const useMouseEventSubscription = (
  $mouseEvent: Observable<IMouseEvent>,
  callback: (key: IMouseEvent) => void
) => {
  React.useEffect(() => {
    const keyboardEventSub = $mouseEvent.subscribe(callback);

    return () => {
      keyboardEventSub.unsubscribe();
    };
  }, [$mouseEvent, callback]);
};
