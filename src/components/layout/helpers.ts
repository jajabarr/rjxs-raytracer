const minMax = (v1: number, v2: number): number[] => {
  return [Math.min(v1, v2), Math.max(v1, v2)];
};

export const partialFactors = (value: number) => {
  if (Math.floor(value) !== value) {
    throw new Error("Only Ints can be factored");
  }
  const _factors: number[] = [];

  for (let i = Math.floor(Math.sqrt(value)); i >= 1; --i) {
    if (value % i === 0) {
      _factors.push(i);
    }
  }
  return _factors;
};

export const getWindowPropertiesFromTile = (
  height: number,
  width: number,
  tiles: number
) => {
  let unit = 1;
  if ((height * width) / unit < tiles) {
    throw new Error("Not enough space for tiles");
  }

  // debugger;

  // height = height - (height % tiles);
  // width = width - (width % tiles);
  let [_height, _width] = [height, width];

  const maxPxTotal = height * width;
  const majorAspect = Math.max(height, width);
  let divisor = tiles;
  let minDivisor = divisor;
  let maxGridPxTotal = Math.floor(Math.pow(majorAspect / divisor, 2) * tiles);

  const _factors = partialFactors(tiles);

  // console.log("#### FIND BEST ####");

  for (let i = 0; i < _factors.length; ++i) {
    const _try = Math.floor(Math.pow(majorAspect / _factors[i], 2) * tiles);
    // console.log(_factors[i], tiles / _factors[i], _try, maxPxTotal);
    if (_try > maxGridPxTotal && _try <= maxPxTotal) {
      maxGridPxTotal = _try;
      minDivisor = _factors[i];
    }
  }

  // console.log("#### CHOSEN FACTORS ####");
  // console.log(
  //   minDivisor,
  //   tiles / minDivisor,
  //   Math.floor(Math.pow(majorAspect / minDivisor, 2) * tiles),
  //   maxGridPxTotal
  // );

  if (width > height) {
    _width = minDivisor;
    _height = tiles / _width;
    unit = (width - (width % _width)) / _width;
    height = _height * unit;
    width = _width * unit;
  } else {
    _height = minDivisor;
    _width = tiles / _height;
    unit = (height - (height % _height)) / _height;
    height = _height * unit;
    width = _width * unit;
  }

  return {
    heightPx: height,
    widthPx: width,
    height: _height,
    width: _width,
    unit,
    tiles,
  };
};

export const getWindowPropertiesFromTileAndUnit = (
  height: number,
  width: number,
  tiles: number,
  unit: number
) => {
  if ((height * width) / Math.pow(unit, 2) < tiles) {
    throw new Error("Not enough space for tiles");
  }

  // console.log(height, width, tiles, unit);

  const _factors = partialFactors(tiles);
  const [minorAspect, majorAspect] = minMax(height, width);
  let _dMin = 0;
  let _dMax = 0;

  for (let i = 0; i < _factors.length; ++i) {
    [_dMin, _dMax] = minMax(_factors[i], tiles / _factors[i]);

    const _tryMinor = unit * _dMin;
    const _tryMajor = unit * _dMax;

    if (_tryMajor <= majorAspect && _tryMinor <= minorAspect) {
      break;
    }
  }

  let heightPx = 0;
  let widthPx = 0;

  if (height > width) {
    height = _dMax;
    heightPx = unit * _dMax;

    width = _dMin;
    widthPx = unit * _dMin;
  } else {
    height = _dMin;
    heightPx = unit * _dMin;

    width = _dMax;
    widthPx = unit * _dMax;
  }

  return {
    heightPx,
    widthPx,
    height,
    width,
    unit,
    tiles,
  };
};
