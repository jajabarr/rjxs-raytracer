import * as React from "react";
import { fromEvent, Observable, merge } from "rxjs";
import { map, filter, tap, distinctUntilChanged } from "rxjs/operators";
import { distinctUntilChangedUntil } from "./custom-operators";

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
  const $keyUpEvent: Observable<{
    key: Key;
    keyStroke: KeyStroke;
  }> = React.useMemo(
    () =>
      fromEvent<KeyboardEvent>(document, "keyup").pipe(
        filter((event: KeyboardEvent) => {
          return !!Object.values(Key).find((v) => v === event.key);
        }),
        map((event: KeyboardEvent) => ({
          key: Object.values(Key).find((v) => v === event.key) as Key,
          keyStroke: KeyStroke.Up,
        })),
        tap(({ key }) => {
          downKeys.current = downKeys.current.filter((_key) => _key !== key);
        })
      ),
    []
  );
  const $keyDownEvent: Observable<{
    key: Key;
    keyStroke: KeyStroke;
  }> = React.useMemo(
    () =>
      fromEvent<KeyboardEvent>(document, "keydown").pipe(
        filter((event: KeyboardEvent) => {
          return !!Object.values(Key).find((v) => v === event.key);
        }),
        map((event: KeyboardEvent) => ({
          key: Object.values(Key).find((v) => v === event.key) as Key,
          keyStroke: KeyStroke.Down,
        })),
        tap(({ key }) => {
          if (downKeys.current.indexOf(key) === -1) {
            downKeys.current.push(key);
          }
        })
      ),
    []
  );
  const $keyboardEvent: Observable<IKeyboardEvent> = React.useMemo(
    () =>
      merge($keyUpEvent, $keyDownEvent).pipe(
        distinctUntilChangedUntil(0),
        map(({ key, keyStroke }) => ({
          key,
          keys: downKeys.current,
          keyStroke,
        }))
      ),
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
