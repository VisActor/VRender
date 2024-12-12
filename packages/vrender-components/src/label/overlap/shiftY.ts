import type { IText } from '@visactor/vrender-core';
import { isNumberClose } from '@visactor/vutils';

export interface IShiftYOption {
  labelling: (...args: any[]) => any;

  maxY?: number;
  globalShiftY?: {
    /**
     * 是否开启全局调整，开启后，所有文字会整体调整，否则只会按照 x 分组调整 top/bottom
     * @default true
     */
    enable?: boolean;
    /**
     * 最大迭代次数
     * @default 10
     */
    maxIterations?: number;
    /**
     * 最大误差
     * @default 0.1
     */
    maxError?: number;
    /**
     * 调整后 text 之间的 padding
     * @default 1
     */
    padding?: number;
    /**
     * 每个 text 最大被调整的次数
     * @default 1000
     */
    maxAttempts?: number;
    /**
     * 每个 text 调整的 y 坐标差值限制
     */
    deltaYTolerance?: number;
  };
}

const isIntersect = (top: number, bottom: number) => {
  return Math.ceil(top) > Math.floor(bottom);
};

const isXIntersect = ([a, b]: [number, number], [c, d]: [number, number]) => {
  return d > a && b > c;
};

function getIntersectionLength(range1: number[], range2: number[]) {
  const [start1, end1] = range1;
  const [start2, end2] = range2;

  const start = Math.max(start1, start2);
  const end = Math.min(end1, end2);

  return Math.max(0, end - start);
}

export function shiftY(texts: IText[], option: IShiftYOption) {
  const {
    maxY = Number.MAX_VALUE,
    labelling,
    globalShiftY = { enable: true, maxIterations: 10, maxError: 0.1, padding: 1 }
  } = option;

  const n = texts.length;
  if (n <= 1) {
    return texts;
  }

  // 根据 x 坐标给 text 分组，存放信息到 map 中
  const xMap = new Map<{ start: number; end: number }, IText[]>();
  const textInformation = new Map<
    IText,
    {
      y1Initial: number;
      y1: number;
      y: number;
      y2: number;
      height: number;
      x1: number;
      x2: number;
      x: number;
      attempts: number;
    }
  >();

  const getY1Initial = (text: IText) => textInformation.get(text).y1Initial;
  const getHeight = (text: IText) => textInformation.get(text).height;
  const getY1 = (text: IText) => textInformation.get(text).y1;
  const getY = (text: IText) => textInformation.get(text).y;
  const getX = (text: IText) => textInformation.get(text).x;
  const getX1 = (text: IText) => textInformation.get(text).x1;
  const getX2 = (text: IText) => textInformation.get(text).x2;
  const getAdjustAttempts = (text: IText) => textInformation.get(text).attempts;

  const setY1 = (text: IText, y: number) => {
    textInformation.get(text).y1 = y;
  };

  const setAdjustAttempts = (text: IText, attempts: number) => {
    textInformation.get(text).attempts = attempts;
  };

  function adjustPositionInOneGroup(texts: IText[]) {
    // 从最后一个 text 向前遍历，如果与前一个 text 相交，则尝试放到下方（需要判断和前一个 text 是否相交，若相交则不能放到下方）
    for (let i = texts.length - 1; i >= 0; i--) {
      const curText = texts[i];
      const upperText = texts[i - 1];
      const lowerText = texts[i + 1];
      // 当前 text 和上面一个 text 相交
      if (
        (upperText && isIntersect(getY1(upperText) + getHeight(upperText), getY1(curText))) ||
        // 如果是最顶上被 clamp 进来的 text，也尝试向下摆放
        (getY1(curText) === 0 && curText._isClamped)
      ) {
        const { y } = labelling(curText);
        // 挪动当前 text 后， 和下面一个 text 不相交
        if (!lowerText || !isIntersect(y + getHeight(curText) / 2, getY1(lowerText))) {
          if (y + getHeight(curText) / 2 <= maxY) {
            setY1(curText, getY1(curText) + y - getY(curText));
          }
        }
      }
    }
  }

  // 根据 x 坐标进行分组
  texts.sort((a, b) => a.attribute.x - b.attribute.x);
  for (const text of texts) {
    const { y1, y2, x1, x2 } = text.AABBBounds;
    const { x, y } = text.attribute;
    textInformation.set(text, { y1Initial: y1, y1, y2, y, height: y2 - y1, x1, x2, x, attempts: 0 });
    let hasRange = false;

    for (const [range, xGroupTexts] of xMap) {
      const { start, end } = range;
      // 1. x1,x2 在 start 和 end 范围内
      if (x1 >= start && x2 <= end) {
        xGroupTexts.push(text);
        hasRange = true;
      }
      // 2. x 坐标接近，相差在 5px 以内
      else if (isNumberClose(x, getX(xGroupTexts[0]), undefined, 5)) {
        // x 坐标相等，也纳入到一个分组中，并且要扩大分组 range
        const newRange = { start: Math.min(start, x1), end: Math.max(end, x2) };
        xGroupTexts.push(text);
        xMap.set(newRange, xGroupTexts);
        xMap.delete(range);
        hasRange = true;
      }
      // 3. 与区间相交范围 > 50%
      else if (getIntersectionLength([start, end], [x1, x2]) / (end - start) > 0.5) {
        const newRange = { start: Math.min(start, x1), end: Math.max(end, x2) };
        xGroupTexts.push(text);
        xMap.set(newRange, xGroupTexts);
        xMap.delete(range);
        hasRange = true;
      }

      if (hasRange) {
        break;
      }
    }

    if (!hasRange) {
      xMap.set({ start: x1, end: x2 }, [text]);
    }
  }

  // 对每个 x 坐标的 text 数组进行排序
  for (const xTexts of xMap.values()) {
    // 从上到下排序
    xTexts.sort((a, b) => getY1Initial(a) - getY1Initial(b));
    adjustPositionInOneGroup(xTexts);
  }

  // 整体调整一次 Y 坐标，进行散开
  if (globalShiftY.enable !== false) {
    const {
      maxIterations = 10,
      maxError = 0.1,
      padding = 1,
      maxAttempts = 1000,
      deltaYTolerance = Number.MAX_VALUE
    } = globalShiftY;
    for (let iter = 0; iter < maxIterations; iter++) {
      texts.sort((a, b) => getY1Initial(a) - getY1Initial(b));
      let error = 0;
      for (let i = 0; i < n - 1; i++) {
        const curText = texts[i];
        if (getAdjustAttempts(curText) >= maxAttempts) {
          continue;
        }
        let j = i + 1;
        let nextText;
        while (
          (nextText = texts[j]) &&
          !isXIntersect([getX1(curText), getX2(curText)], [getX1(nextText), getX2(nextText)])
        ) {
          j += 1;
        }
        if (nextText) {
          const y1 = getY1(curText);
          const h0 = getHeight(curText);
          const nextY1 = getY1(nextText);
          const delta = nextY1 - (y1 + h0);
          if (delta < padding) {
            const newDelta = (padding - delta) / 2;
            error = Math.max(error, newDelta);
            if (y1 + newDelta + getHeight(nextText) > maxY) {
              const newY1 = y1 - (padding - delta);
              const curTextDelta = getY1Initial(curText) - newY1;
              if (Math.abs(curTextDelta) <= deltaYTolerance) {
                setY1(curText, newY1);
                setAdjustAttempts(curText, getAdjustAttempts(curText) + 1);
              }
            } else if (y1 - newDelta < 0) {
              const newY1 = nextY1 + (padding - delta);
              const nextTextDelta = getY1Initial(nextText) - newY1;
              if (Math.abs(nextTextDelta) <= deltaYTolerance) {
                setY1(nextText, newY1);
                setAdjustAttempts(nextText, getAdjustAttempts(nextText) + 1);
              }
            } else {
              const newCurY1 = y1 - newDelta;
              const curTextDelta = getY1Initial(curText) - newCurY1;
              const newNextY1 = nextY1 + newDelta;
              const nextTextDelta = getY1Initial(nextText) - newNextY1;
              if (Math.abs(curTextDelta) <= deltaYTolerance && Math.abs(nextTextDelta) <= deltaYTolerance) {
                setY1(curText, newCurY1);
                setY1(nextText, newNextY1);
                setAdjustAttempts(curText, getAdjustAttempts(curText) + 1);
                setAdjustAttempts(nextText, getAdjustAttempts(nextText) + 1);
              }
            }
          }
        }
      }
      if (error < maxError) {
        break;
      }
    }
  }

  for (const text of texts) {
    const finalY = text.attribute.y + getY1(text) - getY1Initial(text);
    text.setAttribute('y', finalY);
  }

  const result = [];
  // 调整文字顺序，越靠前的越优先占据空间
  // texts 按照 x 进行排序，然后左右交替，保证首尾标签优先展示
  texts.sort((a, b) => a.attribute.x - b.attribute.x);
  let start = 0;
  let end = texts.length - 1;

  while (start <= end) {
    if (start === end) {
      result.push(texts[start]);
    } else {
      result.push(texts[start]);
      result.push(texts[end]);
    }
    start++;
    end--;
  }
  return result;
}
