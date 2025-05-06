export const groupBy = <T, K extends string | number | boolean | symbol, R = T>(
  array: T[],
  keySelector: (item: T) => K,
  elementSelector?: (item: T) => R,
): Map<K, R[]> => {
  if (!array.length) return new Map();
  return array.reduce((acc, item) => {
    const key = keySelector(item);

    const element = elementSelector
      ? elementSelector(item)
      : (item as unknown as R);
    let arr = acc.get(key);
    acc.set(key, [...(arr || []), element]);
    return acc;
  }, new Map<K, R[]>());
};
