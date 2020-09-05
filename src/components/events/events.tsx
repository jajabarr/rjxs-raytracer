import * as React from "react";
import { Observable } from "rxjs";
import { IKeyboardEvent, useKeyboardEvent } from "./keyboard-event-hook";
import { IMouseEvent, useMouseEvents } from "./mouse-event-hook";

export interface IEvents {
  $mouseEvent: Observable<IMouseEvent>;
  $keyboardEvent: Observable<IKeyboardEvent>;
}

interface IEventProvider {
  children: (events: IEvents) => React.ReactChild;
}

export const EventProvider: React.FC<IEventProvider> = ({ children }) => {
  const divRef = React.createRef<HTMLDivElement>();
  const $mouseEvent: Observable<IMouseEvent> = useMouseEvents(divRef);
  const $keyboardEvent: Observable<IKeyboardEvent> = useKeyboardEvent();

  const $events = React.useMemo(
    () => ({
      $mouseEvent,
      $keyboardEvent,
    }),
    [$mouseEvent, $keyboardEvent]
  );

  return (
    <>
      <div
        style={{
          position: "absolute",
          display: "hidden",
          height: "100%",
          width: "100%",
        }}
        ref={divRef}
      />
      {children($events)}
    </>
  );
};
