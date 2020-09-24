import * as React from "react";
import { useLayoutContext } from "..";
import { IPosition } from "../../common/interfaces";
import GameMap from "./map.json";

const getTileKey = (position: IPosition): string =>
  `${position.x},${position.y}`;

interface IMapContext {
  unitInMap: (position: IPosition, size: number) => boolean;
}

const MapContext = React.createContext<IMapContext>({
  unitInMap: (...args: any[]) => false,
});

export const useMapContext = () => React.useContext(MapContext);

interface IMapContextProviderProps {
  children: React.ReactChild | React.ReactChild[];
}

export const MapContextProvider: React.FC<IMapContextProviderProps> = ({
  children,
}) => {
  const {
    windowProperties: { unit },
  } = useLayoutContext();
  const mapTileRef = React.useRef<Set<string>>(new Set(GameMap));
  const unitInMap = React.useCallback(
    (position: IPosition, size: number) => {
      const { x, y } = position;
      const p1 = { x: Math.floor(x / unit), y: Math.floor(y / unit) };
      const p2 = {
        x: Math.floor((x + size - 1) / unit),
        y: Math.floor(y / unit),
      };
      const p3 = {
        x: Math.floor(x / unit),
        y: Math.floor((y + size - 1) / unit),
      };
      const p4 = {
        x: Math.floor((x + size - 1) / unit),
        y: Math.floor((y + size - 1) / unit),
      };

      // console.log("##### EDGES #####");
      // console.log("P", dst);
      // console.log("T", p1, map.has(getTileKey(p1)));
      // console.log("TR", p2, map.has(getTileKey(p2)));
      // console.log("B", p3, map.has(getTileKey(p3)));
      // console.log("BR", p4, map.has(getTileKey(p4)));
      // console.log("\n\n");

      if (
        [p1, p2, p3, p4].filter((p) => !mapTileRef.current.has(getTileKey(p)))
          .length > 0
      ) {
        return false;
      }

      return true;
    },
    [unit]
  );
  return (
    <MapContext.Provider value={{ unitInMap }}>{children}</MapContext.Provider>
  );
};
