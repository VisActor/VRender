import type { IColor } from '@visactor/vrender-core';
import { Color, RGB, isValidNumber } from '@visactor/vutils';
import type { SmartInvertAttrs } from '../label';

const defaultAlternativeColors: string[] = ['#ffffff', '#000000'];

type SmartInvertParams = Pick<
  SmartInvertAttrs,
  'textType' | 'contrastRatiosThreshold' | 'alternativeColors' | 'mode' | 'lumCalculate' | 'underlyingColor'
>;

/**
 * 标签智能反色
 * @param foregroundColorOrigin
 * @param backgroundColorOrigin
 * @returns
 */
export function labelSmartInvert(
  foregroundColorOrigin: IColor | undefined,
  backgroundColorOrigin: IColor | undefined,
  foregroundOpacity: number,
  backgroundOpacity: number,
  params: SmartInvertParams = {}
): IColor | undefined {
  if (typeof foregroundColorOrigin !== 'string' || typeof backgroundColorOrigin !== 'string') {
    return foregroundColorOrigin;
  }
  const { textType, contrastRatiosThreshold, alternativeColors, mode, underlyingColor = 'white' } = params;
  let foregroundColor = new Color(foregroundColorOrigin as string).setOpacity(foregroundOpacity);
  let backgroundColor = new Color(backgroundColorOrigin as string).setOpacity(backgroundOpacity);
  if (foregroundOpacity < 1) {
    foregroundColor = blendColor(foregroundColor, backgroundColor);
  }
  if (backgroundOpacity < 1) {
    backgroundColor = blendColor(backgroundColor, new Color(underlyingColor));
  }
  const foregroundHex = foregroundColor.toHex();
  const backgroundHex = backgroundColor.toHex();
  if (!contrastAccessibilityChecker(foregroundHex, backgroundHex, { textType, contrastRatiosThreshold, mode })) {
    return improveContrastReverse(foregroundHex, backgroundHex, params);
  }
  return foregroundHex;
}

/**
 * Target.R = ((1 - Source.A) * BGColor.R) + (Source.A * Source.R)
 * Target.G = ((1 - Source.A) * BGColor.G) + (Source.A * Source.G)
 * Target.B = ((1 - Source.A) * BGColor.B) + (Source.A * Source.B)
 * @param source
 * @param background
 */
function blendColor(source: Color, background?: Color) {
  if (!background) {
    background = new Color(new RGB(255, 255, 255).toString());
  }
  const alpha = source.color.opacity;
  const r = ~~((1 - alpha) * background.color.r + alpha * source.color.r);
  const g = ~~((1 - alpha) * background.color.g + alpha * source.color.g);
  const b = ~~((1 - alpha) * background.color.b + alpha * source.color.b);
  return new Color(new RGB(r, g, b).toString());
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
  params: SmartInvertParams = {}
) {
  const alternativeColorPalletes: string[] = [];
  const { alternativeColors } = params;
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
    if (contrastAccessibilityChecker(alternativeColor, backgroundColor, params)) {
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
  params: SmartInvertParams = {}
): boolean {
  const { mode, textType, contrastRatiosThreshold } = params;
  const isLightnessMode = mode === 'lightness';
  const lumCalculate = (params.lumCalculate as SmartInvertAttrs['lumCalculate']) ?? isLightnessMode ? 'hsl' : 'wcag';

  const backgroundColorLightness = Color.getColorBrightness(new Color(backgroundColor as string), lumCalculate as any);
  const foregroundColorLightness = Color.getColorBrightness(new Color(foregroundColor as string), lumCalculate as any);
  if (mode === 'lightness') {
    if (foregroundColorLightness < 0.5) {
      // 文字颜色为'#ffffff'
      if (backgroundColorLightness >= 0.5) {
        return true;
      }
      return false;
    }
    // 文字颜色为‘#000000'
    if (backgroundColorLightness < 0.5) {
      return true;
    }
    return false;
  }
  //Contrast ratios can range from 1 to 21
  let threshold = contrastRatiosThreshold;
  if (!isValidNumber(threshold)) {
    if (textType === 'largeText') {
      threshold = 3;
    } else {
      threshold = 4.5;
    }
  }
  return contrastRatios(foregroundColorLightness, backgroundColorLightness) > threshold;
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
function contrastRatios(foregroundColorLuminance: number, backgroundColorLuminance: number): number {
  const L1 = foregroundColorLuminance > backgroundColorLuminance ? foregroundColorLuminance : backgroundColorLuminance;
  const L2 = foregroundColorLuminance > backgroundColorLuminance ? backgroundColorLuminance : foregroundColorLuminance;
  const contrastRatios = (L1 + 0.05) / (L2 + 0.05);
  return contrastRatios;
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
