import type { IColor } from '@visactor/vrender';
import { ColorUtil } from '@visactor/vutils';

const defaultAlternativeColors: string[] = ['#ffffff', '#000000'];

/**
 * 标签智能反色
 * @param foregroundColorOrigin
 * @param backgroundColorOrogin
 * @returns
 */
export function labelSmartInvert(
  foregroundColorOrigin: IColor | undefined,
  backgroundColorOrogin: IColor | undefined,
  textType?: string | undefined,
  contrastRatiosThreshold?: number,
  alternativeColors?: string | string[]
): IColor | undefined {
  const foregroundColor = formatColorToHex(foregroundColorOrigin);
  const backgroundColor = formatColorToHex(backgroundColorOrogin);
  if (!contrastAccessibilityChecker(foregroundColor, backgroundColor, textType, contrastRatiosThreshold)) {
    return improveContrastReverse(
      foregroundColor,
      backgroundColor,
      textType,
      contrastRatiosThreshold,
      alternativeColors
    );
  }
  return foregroundColor;
}

/**
 * 提升对比度
 * 对于对比度不足阈值的情况，推荐备选颜色色板中的颜色提升对比
 * @param foregroundColor
 * @param backgroundColor
 * @returns
 */
function improveContrastReverse(
  foregroundColor: IColor | undefined,
  backgroundColor: IColor | undefined,
  textType?: IColor | undefined,
  contrastRatiosThreshold?: number,
  alternativeColors?: string | string[]
) {
  const alternativeColorPalletes: string[] = [];
  if (alternativeColors) {
    if (alternativeColors instanceof Array) {
      alternativeColorPalletes.push(...alternativeColors);
    } else {
      alternativeColorPalletes.push(alternativeColors);
    }
  }
  alternativeColorPalletes.push(...defaultAlternativeColors);
  for (const alternativeColor of alternativeColorPalletes) {
    if (foregroundColor === alternativeColor) {
      continue;
    }
    if (contrastAccessibilityChecker(alternativeColor, backgroundColor, textType, contrastRatiosThreshold)) {
      return alternativeColor;
    }
  }
  return undefined;
}

/**
 * 颜色对比度可行性检查 https://webaim.org/articles/contrast/
 * - WCAG 2.0 AA 级要求普通文本的对比度至少为 4.5:1，大文本的对比度至少为 3:1。（目前按照此标准）
 * - WCAG 2.1 要求图形和用户界面组件（例如表单输入边框）的对比度至少为 3:1。
 * - WCAG AAA 级要求普通文本的对比度至少为 7:1，大文本的对比度至少为 4.5:1。
 * @param foregroundColor
 * @param backgroundColor
 * @returns
 */
export function contrastAccessibilityChecker(
  foregroundColor: IColor | undefined,
  backgroundColor: IColor | undefined,
  textType?: IColor | undefined,
  contrastRatiosThreshold?: number
): boolean {
  //Contrast ratios can range from 1 to 21
  if (contrastRatiosThreshold) {
    if (contrastRatios(foregroundColor, backgroundColor) > contrastRatiosThreshold) {
      return true;
    }
    return false;
  } else if (textType === 'largeText') {
    if (contrastRatios(foregroundColor, backgroundColor) > 3) {
      return true;
    }
    return false;
  }
  if (contrastRatios(foregroundColor, backgroundColor) > 4.5) {
    return true;
  }
  return false;
}

/**
 * 计算颜色对比度 https://webaim.org/articles/contrast/
 * Contrast ratios can range from 1 to 21 (commonly written 1:1 to 21:1).
 * (L1 + 0.05) / (L2 + 0.05), whereby:
 * L1 is the relative luminance of the lighter of the colors, and
 * L2 is the relative luminance of the darker of the colors.
 * @param foregroundColor
 * @param backgroundColor
 * @returns
 */
function contrastRatios(foregroundColor: IColor | undefined, backgroundColor: IColor | undefined): number {
  const foregroundColorLuminance = getColorLuminance(foregroundColor as string);
  const backgroundColorLuminance = getColorLuminance(backgroundColor as string);
  const L1 = foregroundColorLuminance > backgroundColorLuminance ? foregroundColorLuminance : backgroundColorLuminance;
  const L2 = foregroundColorLuminance > backgroundColorLuminance ? backgroundColorLuminance : foregroundColorLuminance;
  const contrastRatios = (L1 + 0.05) / (L2 + 0.05);
  return contrastRatios;
}

/**
 *  计算相对亮度 https://webaim.org/articles/contrast/
 * the relative brightness of any point in a colorspace, normalized to 0 for darkest black and 1 for lightest white
 * Note 1: For the sRGB colorspace, the relative luminance of a color is defined as
 * L = 0.2126 * R + 0.7152 * G + 0.0722 * B where R, G and B are defined as:
 * if RsRGB <= 0.03928 then R = RsRGB/12.92 else R = ((RsRGB+0.055)/1.055) ^ 2.4
 * if GsRGB <= 0.03928 then G = GsRGB/12.92 else G = ((GsRGB+0.055)/1.055) ^ 2.4
 * if BsRGB <= 0.03928 then B = BsRGB/12.92 else B = ((BsRGB+0.055)/1.055) ^ 2.4
 * and RsRGB, GsRGB, and BsRGB are defined as:
 * RsRGB = R8bit/255
 * GsRGB = G8bit/255
 * BsRGB = B8bit/255
 * @param color
 * @returns
 */
function getColorLuminance(color: string): number {
  const rgb8bit = ColorUtil.hexToRgb(color);
  const RsRGB = rgb8bit[0] / 255;
  const GsRGB = rgb8bit[1] / 255;
  const BsRGB = rgb8bit[2] / 255;
  let R;
  let G;
  let B;
  if (RsRGB <= 0.03928) {
    R = RsRGB / 12.92;
  } else {
    R = Math.pow((RsRGB + 0.055) / 1.055, 2.4);
  }
  if (GsRGB <= 0.03928) {
    G = GsRGB / 12.92;
  } else {
    G = Math.pow((GsRGB + 0.055) / 1.055, 2.4);
  }
  if (BsRGB <= 0.03928) {
    B = BsRGB / 12.92;
  } else {
    B = Math.pow((BsRGB + 0.055) / 1.055, 2.4);
  }
  const L = 0.2126 * R + 0.7152 * G + 0.0722 * B;
  return L;
}

/**
 * 规范化color格式为hex
 * 当color为颜色名称或rgb时，对其进行规范化处理
 * @param originColor
 * @returns
 */
function formatColorToHex(originColor: IColor | undefined) {
  if ((originColor as string)?.includes('#')) {
    return originColor;
  }
  const c = new ColorUtil.Color(originColor as string);
  const { r, g, b } = c.color;
  return '#' + ColorUtil.rgbToHex(r, g, b);
}

export function smartInvertStrategy(
  fillStrategy: string,
  baseColor: IColor,
  invertColor: IColor,
  similarColor: IColor
) {
  let result;
  switch (fillStrategy) {
    case 'base':
      result = baseColor;
      break;
    case 'invertBase':
      result = invertColor;
      break;
    case 'similarBase':
      result = similarColor;
    default:
      break;
  }
  return result;
}
