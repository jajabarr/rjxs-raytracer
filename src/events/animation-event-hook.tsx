import * as React from "react";
import { animationFrameScheduler, Observable, scheduled } from "rxjs";
import { repeat, map } from "rxjs/operators";

export const useAnimationEvent = () => {
  const $animationEvent: Observable<number> = React.useMemo(
    () =>
      scheduled([animationFrameScheduler.now()], animationFrameScheduler).pipe(
        repeat(),
        map((start) => animationFrameScheduler.now() - start)
      ),
    []
  );

  return $animationEvent;
};

export const useKeyboardEventSubscription = (
  $animationEvent: Observable<number>,
  callback: (animationEvent: number) => void
) => {
  React.useEffect(() => {
    const animationSub = $animationEvent.subscribe(callback);

    return () => {
      animationSub.unsubscribe();
    };
  }, [$animationEvent, callback]);
};
