import type { IText } from '@visactor/vrender-core';

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

  const textInformation = new Map<IText, { y0: number; y: number; height: number; x1: number; x2: number }>();

  // y0      : 初始位置
  // y       : 最终位置
  // height  : 高度
  // x1, x2  : 左右边界
  const getY0 = (text: IText) => textInformation.get(text).y0;
  const getY = (text: IText) => textInformation.get(text).y;
  const getHeight = (text: IText) => textInformation.get(text).height;
  const getX1 = (text: IText) => textInformation.get(text).x1;
  const getX2 = (text: IText) => textInformation.get(text).x2;
  const setY = (text: IText, y: number) => {
    textInformation.get(text).y = y;
  };

  for (const text of texts) {
    const { y1, y2, x1, x2 } = text.AABBBounds;
    textInformation.set(text, { y0: y1, y: y1, height: y2 - y1, x1, x2 });
  }

  for (let iter = 0; iter < maxIterations; iter++) {
    texts.sort((a, b) => getY(a) - getY(b));
    let error = 0;
    for (let i = 0; i < n - 1; i++) {
      const curText = texts[i];
      let j = i + 1;
      let nextText;
      while (
        (nextText = texts[j]) &&
        !isIntersect([getX1(curText), getX2(curText)], [getX1(nextText), getX2(nextText)])
      ) {
        j += 1;
      }
      if (nextText) {
        const y0 = getY(curText);
        const h0 = getHeight(curText);
        const y1 = getY(nextText);
        const delta = y1 - (y0 + h0);
        if (delta < padding) {
          const newDelta = (padding - delta) / 2;
          error = Math.max(error, newDelta);
          if (y1 + newDelta + getHeight(nextText) > maxY) {
            setY(curText, y0 - (padding - delta));
          } else if (y0 - newDelta < 0) {
            setY(nextText, y1 + (padding - delta));
          } else {
            setY(curText, y0 - newDelta);
            setY(nextText, y1 + newDelta);
          }
        }
      }
    }
    if (error < maxError) {
      break;
    }
  }

  for (const text of texts) {
    const finalY = text.attribute.y + getY(text) - getY0(text);
    text.setAttribute('y', finalY);
  }

  return texts;
}
