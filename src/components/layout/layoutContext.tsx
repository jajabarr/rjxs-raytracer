import * as React from "react";
import { fromEvent, Observable } from "rxjs";
import {
  map,
  throttleTime,
  distinctUntilChanged,
  startWith,
} from "rxjs/operators";
import {
  getWindowPropertiesFromTile,
  getWindowPropertiesFromTileAndUnit,
} from "./helpers";

const shave = (value: number, unit: number) =>
  Math.floor(value) - (Math.floor(value) % unit);

const _windowProperties = (unit?: number, square?: boolean, tiles?: number) => {
  const now = performance.now();
  let _unit = unit || 1;
  let _tiles = tiles || 1;

  let [_heightPx, _widthPx] = [
    shave(window.innerHeight * 0.9, _unit),
    shave(window.innerWidth * 0.9, _unit),
  ];

  let [_height, _width] = [_heightPx, _widthPx];

  if (square) {
    _heightPx = _widthPx = Math.min(_heightPx, _widthPx);
  }

  if (tiles && !unit) {
    return getWindowPropertiesFromTile(_heightPx, _widthPx, tiles);
  }

  if (!tiles && unit) {
    _tiles = (_heightPx * _widthPx) / Math.pow(unit, 2);
    return getWindowPropertiesFromTileAndUnit(
      _heightPx,
      _widthPx,
      _tiles,
      unit
    );
  }

  if (tiles && unit) {
    return getWindowPropertiesFromTileAndUnit(_heightPx, _widthPx, tiles, unit);
  }

  console.log(
    `WindowProperties performance mark: ${performance.now() - now} ms`
  );

  return {
    heightPx: _heightPx,
    widthPx: _widthPx,
    height: _height,
    width: _width,
    tiles: _tiles,
    unit: _unit,
  };
};

interface IWindowProperties {
  heightPx: number;
  widthPx: number;
  height: number;
  width: number;
  tiles: number;
  unit: number;
}

interface ILayoutContextProps {
  windowProperties: IWindowProperties;
}

interface ILayoutContextProviderProps {
  children: React.ReactChild | React.ReactChild[];
  tiles?: number;
  unit?: number;
  square?: boolean;
}

const LayoutContext = React.createContext<ILayoutContextProps>({
  windowProperties: _windowProperties(),
});

const useWindowObservable = ({
  tiles,
  square,
  unit,
}: Omit<ILayoutContextProviderProps, "children">) =>
  React.useMemo(() => {
    return fromEvent(window, "resize").pipe(
      throttleTime(250),
      map(() => {
        return _windowProperties(unit, square, tiles);
      }),
      startWith(_windowProperties(unit, square, tiles)),
      distinctUntilChanged()
    );
  }, [tiles, square, unit]);

export const useLayoutContext = () => React.useContext(LayoutContext);

export const LayoutContextProvider: React.FunctionComponent<ILayoutContextProviderProps> = ({
  children,
  ...rest
}) => {
  const { unit, square, tiles } = rest;

  const $windowDimension: Observable<IWindowProperties> = useWindowObservable(
    rest
  );

  const [windowProperties, updateWindowProperties] = React.useState<
    IWindowProperties
  >(_windowProperties(unit, square, tiles));

  React.useLayoutEffect(() => {
    const _subscription = $windowDimension.subscribe(updateWindowProperties);

    return () => {
      _subscription.unsubscribe();
    };
  }, [$windowDimension]);

  return (
    <LayoutContext.Provider value={{ windowProperties }}>
      {children}
    </LayoutContext.Provider>
  );
};
