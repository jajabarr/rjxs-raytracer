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

const _windowProperties = (
  anchor: DOMRect,
  unit?: number,
  square?: boolean,
  tiles?: number
) => {
  // debugger;
  const now = performance.now();
  let _unit = unit || 1;
  let _tiles = tiles || 1;
  let [h, w] = [anchor?.height, anchor?.width];
  let properties = {
    heightPx: 0,
    widthPx: 0,
    height: 0,
    width: 0,
    tiles: 0,
    unit: 0,
    anchor,
  };

  if (!h || !w) {
    return properties;
  }

  let [_heightPx, _widthPx] = [shave(h * 0.9, _unit), shave(w * 0.9, _unit)];

  let [_height, _width] = [_heightPx, _widthPx];

  if (square) {
    _heightPx = _widthPx = Math.min(_heightPx, _widthPx);
  }

  if (tiles && !unit) {
    return Object.assign(
      properties,
      getWindowPropertiesFromTile(_heightPx, _widthPx, tiles)
    );
  }

  if (!tiles && unit) {
    _tiles = (_heightPx * _widthPx) / Math.pow(unit, 2);
    return Object.assign(
      properties,
      getWindowPropertiesFromTileAndUnit(_heightPx, _widthPx, _tiles, unit)
    );
  }

  if (tiles && unit) {
    return Object.assign(
      properties,
      getWindowPropertiesFromTileAndUnit(_heightPx, _widthPx, tiles, unit)
    );
  }

  console.log(
    `WindowProperties performance mark: ${performance.now() - now} ms`
  );

  return Object.assign(properties, {
    heightPx: _heightPx,
    widthPx: _widthPx,
    height: _height,
    width: _width,
    tiles: _tiles,
    unit: _unit,
  });
};

interface IWindowProperties {
  heightPx: number;
  widthPx: number;
  height: number;
  width: number;
  tiles: number;
  unit: number;
  anchor: DOMRect;
}

interface ILayoutContextProps {
  windowProperties: IWindowProperties;
}

interface ILayoutContextProviderProps {
  children: React.ReactChild | React.ReactChild[];
  anchor: DOMRect;
  tiles?: number;
  unit?: number;
  square?: boolean;
}

const LayoutContext = React.createContext<ILayoutContextProps>({
  windowProperties: _windowProperties(new DOMRect()),
});

const useWindowObservable = ({
  anchor,
  tiles,
  square,
  unit,
}: Omit<ILayoutContextProviderProps, "children">) =>
  React.useMemo(() => {
    return fromEvent(window, "resize").pipe(
      throttleTime(250),
      map(() => {
        return _windowProperties(anchor, unit, square, tiles);
      }),
      startWith(_windowProperties(anchor, unit, square, tiles)),
      distinctUntilChanged()
    );
  }, [anchor, tiles, square, unit]);

export const useLayoutContext = () => React.useContext(LayoutContext);

export const LayoutContextProvider: React.FunctionComponent<ILayoutContextProviderProps> = ({
  children,
  ...rest
}) => {
  const { anchor, unit, square, tiles } = rest;

  const $windowDimension: Observable<IWindowProperties> = useWindowObservable(
    rest
  );

  const [windowProperties, updateWindowProperties] = React.useState<
    IWindowProperties
  >(_windowProperties(anchor, unit, square, tiles));

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
