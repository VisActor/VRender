import type { IBoundsLike } from '@visactor/vutils';
import { application } from '../../application';
import { createColor } from '../../common/canvas-utils';
import type { IContext2d, ITextStyleParams, IRichTextParagraphCharacter } from '../../interface';
import { DEFAULT_TEXT_FONT_FAMILY } from '../../constants';

export const DIRECTION_KEY = {
  horizontal: {
    width: 'width',
    height: 'height',
    left: 'left',
    top: 'top',
    x: 'x',
    y: 'y',
    bottom: 'bottom'
  },
  vertical: {
    width: 'height',
    height: 'width',
    left: 'top',
    top: 'left',
    x: 'y',
    y: 'x',
    bottom: 'right'
  }
};

const defaultFormatting = {
  fontSize: 16,
  fontFamily: DEFAULT_TEXT_FONT_FAMILY,
  fill: true,
  stroke: false,
  fontWeight: 'normal',
  lineHeight: 'normal',
  fontStyle: 'normal', // normal, italic, oblique
  textDecoration: 'none', // none, underline, line-through
  textAlign: 'left', // left, right, center
  script: 'normal' // normal, sub, super
};
const nbsp = String.fromCharCode(160);

export const regLetter = /\w|\(|\)|-/;
const regPunctuation = /[.?!,;:/，。？！、；：]/;
export const regFirstSpace = /\S/;

const setTextStyle = (ctx: IContext2d, character: IRichTextParagraphCharacter) => {
  let fontSize = character.fontSize || 16;
  switch (character.script) {
    case 'super':
    case 'sub':
      fontSize *= 0.8;
      break;
  }

  ctx.setTextStyle({
    textAlign: 'left',
    textBaseline: character.textBaseline || 'alphabetic',
    fontStyle: character.fontStyle || '',
    fontWeight: character.fontWeight || '',
    fontSize,
    fontFamily: character.fontFamily
  } as ITextStyleParams);
};

// Applies the style of a run to the canvas context
export function applyFillStyle(ctx: IContext2d, character: IRichTextParagraphCharacter, b?: IBoundsLike) {
  const fillStyle = (character && (character.fill as string)) || defaultFormatting.fill;
  if (!fillStyle) {
    ctx.globalAlpha = 0;
    return;
  }

  const { fillOpacity = 1, opacity = 1 } = character;

  ctx.globalAlpha = fillOpacity * opacity;
  ctx.fillStyle = b ? createColor(ctx, fillStyle, { AABBBounds: b }) : (fillStyle as string);

  setTextStyle(ctx, character);
}

export function applyStrokeStyle(ctx: IContext2d, character: IRichTextParagraphCharacter) {
  const strokeStyle = (character && (character.stroke as string)) || (defaultFormatting.stroke as any);
  if (!strokeStyle) {
    ctx.globalAlpha = 0;
    return;
  }

  const { strokeOpacity = 1, opacity = 1 } = character;

  ctx.globalAlpha = strokeOpacity * opacity;
  ctx.lineWidth = character && typeof character.lineWidth === 'number' ? character.lineWidth : 1;
  ctx.strokeStyle = strokeStyle as string;

  setTextStyle(ctx, character);
}

export function prepareContext(ctx: IContext2d) {
  ctx.setTextStyle({
    textAlign: 'left',
    textBaseline: 'bottom'
  });
}

// 确认达到availableWidth的字符串截取index
export function getStrByWithDom(
  desc: string,
  width: number,
  style: string,
  guessIndex: number,
  needTestLetter?: boolean
): number {
  desc = desc.replace(/\s/g, nbsp);

  // 测量用DOM
  const span = document.createElement('span');
  span.setAttribute('style', style);
  span.style.visibility = 'hidden';
  span.style.whiteSpace = 'nowrap';
  document.body.appendChild(span);

  // 测量从头到当前位置宽度以及从头到下一个字符位置宽度
  let index = guessIndex;
  let temp = desc.slice(0, index);
  span.innerText = temp;
  let tempWidth = span.offsetWidth;

  let tempNext = desc.slice(0, index + 1);
  span.innerText = tempNext;
  let tempWidthNext = span.offsetWidth;

  // 到当前位置宽度 < width && 到下一个字符位置宽度 > width时，认为找到准确阶段位置
  while (tempWidth > width || tempWidthNext <= width) {
    if (tempWidth > width) {
      index--;
    } else {
      index++;
    }

    temp = desc.slice(0, index);
    span.innerText = temp;
    tempWidth = span.offsetWidth;

    tempNext = desc.slice(0, index + 1);
    span.innerText = tempNext;
    tempWidthNext = span.offsetWidth;
  }

  // 处理特殊情况
  if (needTestLetter) {
    index = testLetter(desc, index);
  }

  document.body.removeChild(span);
  return index;
}
export function getStrByWithCanvas(
  desc: string,
  width: number,
  character: IRichTextParagraphCharacter,
  // ctx: IContext2d,
  guessIndex: number,
  needTestLetter?: boolean
): number {
  if (!width || width <= 0) {
    return 0;
  }
  const textMeasure = application.graphicUtil.textMeasure;
  // const measurement = textMeasure.measureText(text, character);

  // 测量从头到当前位置宽度以及从头到下一个字符位置宽度
  let index = guessIndex;
  let temp = desc.slice(0, index);
  let tempWidth = Math.floor(textMeasure.measureText(temp, character as any).width);

  let tempNext = desc.slice(0, index + 1);
  let tempWidthNext = Math.floor(textMeasure.measureText(tempNext, character as any).width);

  // 到当前位置宽度 < width && 到下一个字符位置宽度 > width时，认为找到准确阶段位置
  while (tempWidth > width || tempWidthNext <= width) {
    if (tempWidth > width) {
      index--;
    } else {
      index++;
    }

    if (index > desc.length) {
      index = desc.length;
      break;
    } else if (index < 0) {
      index = 0;
      break;
    }

    temp = desc.slice(0, index);
    tempWidth = Math.floor(textMeasure.measureText(temp, character as any).width);

    tempNext = desc.slice(0, index + 1);
    tempWidthNext = Math.floor(textMeasure.measureText(tempNext, character as any).width);
  }

  // 处理特殊情况
  if (needTestLetter) {
    index = testLetter(desc, index);
  }

  return index;
}

/**
 * 向前找到单词结尾处换行
 * @param string
 * @param index
 * @param negativeWrongMatch 如果为true，那么如果无法匹配就会向后找到单词的结尾，否则就直接返回index
 * @returns
 */
export function testLetter(string: string, index: number, negativeWrongMatch: boolean = false): number {
  let i = index;
  // 切分前后都是英文字母数字下划线，向前找到非英文字母处换行
  while (
    (regLetter.test(string[i - 1]) && regLetter.test(string[i])) ||
    // 行首标点符号处理
    regPunctuation.test(string[i])
  ) {
    i--;
    // 无法满足所有条件，放弃匹配，直接截断，避免陷入死循环
    if (i <= 0) {
      return negativeWrongMatch ? testLetter2(string, index) : index;
    }
  }
  return i;
}

/**
 * 向后找到单词结尾处换行
 * @param string
 * @param index
 * @returns
 */
export function testLetter2(string: string, index: number) {
  let i = index;
  // 切分前后都是英文字母数字下划线，向前找到非英文字母处换行
  while (
    (regLetter.test(string[i - 1]) && regLetter.test(string[i])) ||
    // 行首标点符号处理
    regPunctuation.test(string[i])
  ) {
    i++;
    // 无法满足所有条件，放弃匹配，直接截断，避免陷入死循环
    if (i >= string.length) {
      return i;
    }
  }
  return i;
}

// 测量文字详细信息
export function measureTextDom(
  text: string,
  style: string
): { ascent?: number; height?: number; descent?: number; width?: number } {
  let div;

  const span = document.createElement('span');
  const block = document.createElement('div');
  div = document.createElement('div');

  block.style.display = 'inline-block';
  block.style.width = '1px';
  block.style.height = '0';

  div.style.visibility = 'hidden';
  div.style.position = 'absolute';
  div.style.top = '0';
  div.style.left = '0';
  div.style.width = '500px';
  div.style.height = '200px';
  div.style.whiteSpace = 'nowrap';

  div.appendChild(span);
  div.appendChild(block);
  document.body.appendChild(div);

  const result: { ascent?: number; height?: number; descent?: number; width?: number } = {};
  try {
    span.setAttribute('style', style);
    span.style.whiteSpace = 'nowrap';
    span.style.display = 'inline-block';

    span.innerHTML = '';
    span.appendChild(document.createTextNode(text.replace(/\s/g, nbsp)));

    block.style.verticalAlign = 'baseline';
    result.ascent = block.offsetTop - span.offsetTop;
    block.style.verticalAlign = 'bottom';
    result.height = block.offsetTop - span.offsetTop;
    result.descent = result.height - result.ascent;
    result.width = span.offsetWidth;
  } finally {
    div.parentNode?.removeChild(div);
    div = null;
  }
  return result;
}

// 测量文字详细信息
export function measureTextCanvas(
  text: string,
  character: IRichTextParagraphCharacter
): { ascent: number; height: number; descent: number; width: number } {
  const textMeasure = application.graphicUtil.textMeasure;
  const measurement = textMeasure.measureText(text, character as any) as TextMetrics;
  const result: { ascent: number; height: number; descent: number; width: number } = {
    ascent: 0,
    height: 0,
    descent: 0,
    width: 0
  };
  if (
    typeof measurement.actualBoundingBoxAscent !== 'number' ||
    typeof measurement.actualBoundingBoxDescent !== 'number'
  ) {
    result.width = Math.floor(measurement.width);
    result.height = character.fontSize || 0;
    result.ascent = result.height;
    result.descent = 0;
  } else {
    result.width = Math.floor(measurement.width);
    result.height = Math.floor(measurement.actualBoundingBoxAscent + measurement.actualBoundingBoxDescent);
    result.ascent = Math.floor(measurement.actualBoundingBoxAscent);
    result.descent = result.height - result.ascent;
  }
  return result;
}

export function getFontString(character: IRichTextParagraphCharacter, ctx: IContext2d | null) {
  let fontSize = (character && character.fontSize) || defaultFormatting.fontSize;

  if (character) {
    switch (character.script) {
      case 'super':
      case 'sub':
        fontSize *= 0.8;
        break;
    }
  }

  return (
    ((character && character.fontStyle) || '') +
    ' ' +
    ((character && character.fontWeight) || '') +
    ' ' +
    (fontSize || 12) +
    'px ' +
    ((character && character.fontFamily) || defaultFormatting.fontFamily)
  );
}
