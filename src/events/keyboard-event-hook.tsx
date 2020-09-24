import * as React from "react";
import { fromEvent, Observable, merge } from "rxjs";
import { map, filter, distinctUntilChanged } from "rxjs/operators";
import { isEqual } from "lodash";

export enum Key {
  ArrowUp = "ArrowUp",
  ArrowDown = "ArrowDown",
  ArrowLeft = "ArrowLeft",
  ArrowRight = "ArrowRight",
  W = "w",
  A = "a",
  S = "s",
  D = "d",
  One = "1",
  Two = "2",
  Noop = "",
  BracketLeft = "[",
}

export enum KeyStroke {
  Down = "Down",
  Up = "Up",
}

export interface IKeyboardEvent {
  key: Key;
  keys: Key[];
  keyStroke: KeyStroke;
}

export const useKeyboardEvent = () => {
  const downKeys = React.useRef<Key[]>([]);
  const $keyUpEvent: Observable<IKeyboardEvent> = React.useMemo(
    () =>
      fromEvent<KeyboardEvent>(document, "keyup").pipe(
        filter((event: KeyboardEvent) => {
          return !!Object.values(Key).find((v) => v === event.key);
        }),
        map((event: KeyboardEvent) => {
          event.preventDefault();
          event.stopPropagation();
          const key = Object.values(Key).find((v) => v === event.key) as Key;
          const keys = (downKeys.current = downKeys.current.filter(
            (_key) => _key !== key
          ));
          return {
            key,
            keys,
            keyStroke: KeyStroke.Up,
          };
        })
      ),
    []
  );
  const $keyDownEvent: Observable<IKeyboardEvent> = React.useMemo(
    () =>
      fromEvent<KeyboardEvent>(document, "keydown").pipe(
        filter((event: KeyboardEvent) => {
          return !!Object.values(Key).find((v) => v === event.key);
        }),
        map((event: KeyboardEvent) => {
          event.preventDefault();
          event.stopPropagation();
          const key = Object.values(Key).find((v) => v === event.key) as Key;
          if (downKeys.current.indexOf(key) === -1) {
            downKeys.current.push(key);
          }
          return {
            key,
            keys: downKeys.current,
            keyStroke: KeyStroke.Down,
          };
        })
      ),
    []
  );
  const $keyboardEvent: Observable<IKeyboardEvent> = React.useMemo(
    () => merge($keyUpEvent, $keyDownEvent).pipe(distinctUntilChanged(isEqual)),
    [$keyUpEvent, $keyDownEvent]
  );

  return $keyboardEvent;
};

export const useKeyboardEventSubscription = (
  $keyboardEvent: Observable<IKeyboardEvent>,
  callback: (keyboardEvent: IKeyboardEvent) => void
) => {
  React.useEffect(() => {
    const keyboardEventSub = $keyboardEvent.subscribe(callback);

    return () => {
      keyboardEventSub.unsubscribe();
    };
  }, [$keyboardEvent, callback]);
};
