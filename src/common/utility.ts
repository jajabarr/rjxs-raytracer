export const isObject = (data: any): data is object => typeof data === "object";

export const isValueEqual = <T extends object>(a: T, b: T) => {
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
