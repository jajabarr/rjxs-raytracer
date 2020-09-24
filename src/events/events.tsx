import * as React from "react";
import { Observable } from "rxjs";
import { useAnimationEvent } from "./animation-event-hook";
import { IKeyboardEvent, useKeyboardEvent } from "./keyboard-event-hook";
import { IMouseEvent, useMouseEvents } from "./mouse-event-hook";

export interface IEventContext {
  $mouseEvent: Observable<IMouseEvent>;
  $keyboardEvent: Observable<IKeyboardEvent>;
  $animationEvent: Observable<number>;
}

interface IEventProvider {
  children: React.ReactChild | React.ReactChild[];
}

const EventContext = React.createContext<IEventContext>({
  $mouseEvent: new Observable<IMouseEvent>(),
  $keyboardEvent: new Observable<IKeyboardEvent>(),
  $animationEvent: new Observable<number>(),
});

export const useEventContext = (): IEventContext =>
  React.useContext(EventContext);

export const EventProvider: React.FC<IEventProvider> = React.memo(
  ({ children }) => {
    const divRef = React.createRef<HTMLDivElement>();
    const $mouseEvent: Observable<IMouseEvent> = useMouseEvents(divRef);
    const $keyboardEvent: Observable<IKeyboardEvent> = useKeyboardEvent();
    const $animationEvent: Observable<number> = useAnimationEvent();

    return (
      <EventContext.Provider
        value={{ $mouseEvent, $keyboardEvent, $animationEvent }}
      >
        <div
          style={{
            position: "absolute",
            display: "hidden",
            height: "100%",
            width: "100%",
          }}
          ref={divRef}
        />
        {children}
      </EventContext.Provider>
    );
  }
);
