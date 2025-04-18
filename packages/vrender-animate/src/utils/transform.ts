export const transformKeys = [
  'x',
  'y',
  'dx',
  'dy',
  'scaleX',
  'scaleY',
  'angle',
  'anchor',
  'postMatrix',
  'scrollX',
  'scrollY'
];
export const isTransformKey = (key: string) => {
  return transformKeys.includes(key);
};
