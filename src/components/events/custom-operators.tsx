import { Observable } from "rxjs";
import { map, distinctUntilChanged } from "rxjs/operators";

const isObject = (data: any): data is object => typeof data === "object";

const isValueEqual = <T extends object>(a: T, b: T) => {
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

export function distinctUntilChangedUntil<T>(
  timeout: number,
  compare?: (x: T, y: T) => boolean
) {
  return function (source: Observable<T>): Observable<T> {
    return source.pipe(
      map((d) => ({ data: d, time: Date.now() })),
      distinctUntilChanged((a, b) => {
        const { time: _aTime, data: _aData } = a;
        const { time: _bTime, data: _bData } = b;
        const inTime = _aTime > _bTime - timeout;
        let isEqual: boolean = true;

        if (isObject(_aData) && isObject(_bData)) {
          isEqual = isValueEqual(_aData, _bData);
        } else {
          isEqual = _aData === _bData;
        }

        if (compare) {
          isEqual = compare((_aData as unknown) as T, (_bData as unknown) as T);
        }

        return inTime && isEqual;
      }),
      map((d) => {
        const { data } = d;
        return (data as unknown) as T;
      })
    );
  };
}
