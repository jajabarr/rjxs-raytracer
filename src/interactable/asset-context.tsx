import * as React from "react";
import { IPosition } from "../common";
import { Canvas } from "../components";
import { CanvasDrawFn, ICanvasRenderProps } from "../components/canvas/canvas";

type Asset = "portal";

export interface IAsset {
  asset: Asset;
  position: IPosition;
  w: number;
  h: number;
}

interface IAssetContext {
  renderAsset: (
    context: CanvasRenderingContext2D,
    asset: Asset,
    dst: IPosition
  ) => void;
}

const AssetContext = React.createContext<IAssetContext>({
  renderAsset: (context, asset) => {},
});

export const useAssetContext = () =>
  React.useContext<IAssetContext>(AssetContext);

interface IAssetContextProvider {
  children: React.ReactNode;
}

interface IAssetCanvas {
  children: React.ReactNode;
  canvasDrawFn: CanvasDrawFn;
  canvas: HTMLCanvasElement;
}

// TODO, change this to list of svg files with dynamic size based on unit size
export const ASSETS: {
  [key: string]: IAsset;
} = {
  portal: {
    asset: "portal",
    position: { x: 10, y: 10 },
    w: 50,
    h: 50,
  },
};

const AssetCanvas: React.FC<IAssetCanvas> = ({ canvasDrawFn, children }) => {
  React.useEffect(() => {
    canvasDrawFn((context) => {
      context.fillStyle = "red";
      context.fillRect(0, 0, 100, 100);

      return undefined;
    });
  });
  return <>{children}</>;
};

const AssetContextProviderInner: React.FC<IAssetCanvas> = ({
  children,
  canvasDrawFn,
  canvas,
}) => {
  const renderAsset = React.useCallback<IAssetContext["renderAsset"]>(
    (context, asset, position) => {
      canvasDrawFn((ctx) => {
        const assetData: IAsset = ASSETS[asset];

        context.drawImage(
          canvas,
          assetData.position.x,
          assetData.position.y,
          assetData.w,
          assetData.h,
          position.x,
          position.y,
          assetData.w,
          assetData.h
        );
        return undefined;
      });
    },
    [canvas, canvasDrawFn]
  );

  return (
    <AssetContext.Provider value={{ renderAsset }}>
      <AssetCanvas canvas={canvas} canvasDrawFn={canvasDrawFn}>
        {children}
      </AssetCanvas>
    </AssetContext.Provider>
  );
};

export const AssetContextProvider: React.FC<IAssetContextProvider> = ({
  children,
}) => {
  const MemoizedAssetCanvasProvider = React.useCallback(
    (canvasRenderProps: ICanvasRenderProps) => (
      <AssetContextProviderInner {...canvasRenderProps}>
        {children}
      </AssetContextProviderInner>
    ),
    [children]
  );

  return <Canvas>{MemoizedAssetCanvasProvider}</Canvas>;
};
