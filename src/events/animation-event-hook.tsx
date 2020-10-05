import * as React from "react";
import { animationFrameScheduler, interval, Observable, scheduled } from "rxjs";
import { repeat, map, throttle } from "rxjs/operators";

export const useAnimationEvent = () => {
  const $animationEvent: Observable<number> = React.useMemo(
    () =>
      scheduled([animationFrameScheduler.now()], animationFrameScheduler).pipe(
        repeat(),
        map((start) => animationFrameScheduler.now() - start),
        throttle(() => interval(16 /* 60fps */))
      ),
    []
  );

  return $animationEvent;
};

export const useAnimationEventSubscription = (
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
