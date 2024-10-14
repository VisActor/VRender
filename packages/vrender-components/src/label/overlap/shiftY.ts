import type { IText } from '@visactor/vrender-core';

function useMap<K, V>() {
  const map = new Map<K, V>();
  const get = (key: K) => map.get(key) as V;
  const set = (key: K, value: V) => map.set(key, value);
  return [get, set] as const;
}

export interface IShiftYOption {
  maxIterations?: number;
  maxError?: number;
  padding?: number;
  maxY?: number;
}

export function shiftY(texts: IText[], option: IShiftYOption = {}) {
  const { maxIterations = 10, maxError = 0.1, padding = 1, maxY = Number.MAX_VALUE } = option;

  const n = texts.length;
  if (n <= 1) {
    return texts;
  }

  const isIntersect = ([a, b]: [number, number], [c, d]: [number, number]) => {
    return d > a && b > c;
  };

  const [y0, setY0] = useMap<IText, number>();
  const [y, setY] = useMap<IText, number>();
  const [h, setH] = useMap<IText, number>();
  const [xx, setXX] = useMap<IText, [number, number]>();
  for (const text of texts) {
    const { y1, y2, x1, x2 } = text.AABBBounds;
    setY0(text, y1);
    setY(text, y1);
    setH(text, y2 - y1);
    setXX(text, [x1, x2]);
  }
  for (let iter = 0; iter < maxIterations; iter++) {
    texts.sort((a, b) => (y(a) as number) - (y(b) as number));
    let error = 0;
    for (let i = 0; i < n - 1; i++) {
      const l0 = texts[i];
      let j = i + 1;
      let l1;
      while ((l1 = texts[j]) && !isIntersect(xx(l0) as any, xx(l1) as any)) {
        j += 1;
      }
      if (l1) {
        const y0 = y(l0);
        const h0 = h(l0);
        const y1 = y(l1);
        const delta = y1 - (y0 + h0);
        if (delta < padding) {
          const newDelta = (padding - delta) / 2;
          error = Math.max(error, newDelta);
          if (y1 + newDelta + h(l1) > maxY) {
            setY(l0, y0 - (padding - delta));
          } else if (y0 - newDelta < 0) {
            setY(l1, y1 + (padding - delta));
          } else {
            setY(l0, y0 - newDelta);
            setY(l1, y1 + newDelta);
          }
        }
      }
    }
    if (error < maxError) {
      break;
    }
  }

  for (const text of texts) {
    const finalY = (text.attribute.y as number) + y(text) - y0(text);
    text.setAttribute('y', finalY);
  }

  return texts;
}
