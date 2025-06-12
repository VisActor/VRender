import { hexToRgb, rgbToHex, hslToRgb, rgbToHsl } from '@visactor/vutils';
import { AbstractComponent } from '../core/base';
import type { IStoryListAttrs } from './type';
import { loadStoryListComponent } from './register';

loadStoryListComponent();

export abstract class StoryBaseList<T extends IStoryListAttrs> extends AbstractComponent<Required<T>> {
  protected getThemeStyle(themeStyle: string, fillColor: string, strokeColor: string, lineWidth: number) {
    switch (themeStyle) {
      case 'fill-only':
        return {
          fillColor,
          strokeColor: undefined,
          lineWidth: 0
        };
      case 'stroke-only':
        return {
          fillColor: undefined,
          strokeColor,
          lineWidth
        };
      case 'normal':
      default:
        return {
          fillColor,
          strokeColor,
          lineWidth
        };
    }
  }

  // 生成多个颜色变化 - 基于基础颜色的合适渐变范围
  protected generateColors(baseColor: string, count: number): string[] {
    if (count <= 1) {
      return [baseColor];
    }

    const colors: string[] = [];

    try {
      const rgb = hexToRgb(baseColor);
      if (!rgb) {
        return Array(count).fill(baseColor);
      }

      // 获取RGB值 - 兼容不同的返回格式
      const r = (rgb as any).r !== undefined ? (rgb as any).r : (rgb as any)[0];
      const g = (rgb as any).g !== undefined ? (rgb as any).g : (rgb as any)[1];
      const b = (rgb as any).b !== undefined ? (rgb as any).b : (rgb as any)[2];

      // 转换为HSL以便更好地控制亮度范围
      const hsl = rgbToHsl(r, g, b);
      const h = (hsl as any).h !== undefined ? (hsl as any).h : (hsl as any)[0];
      const s = (hsl as any).s !== undefined ? (hsl as any).s : (hsl as any)[1];
      const l = (hsl as any).l !== undefined ? (hsl as any).l : (hsl as any)[2];

      // 根据项目数量动态调整颜色范围
      // 考虑可辨识度：数量少时需要适中区别，数量多时可以用更大范围
      let rangeScale;
      if (count <= 2) {
        // 2个项目：适中的区别，既不太接近也不跨度太大
        rangeScale = 0.5;
      } else if (count <= 3) {
        // 3个项目：稍微扩大范围
        rangeScale = 0.6;
      } else if (count <= 4) {
        // 4个项目：进一步扩大
        rangeScale = 0.8;
      } else {
        // 5+个项目：使用完整范围，因为有足够的对比参照
        rangeScale = 1.0;
      }

      // 根据原始亮度确定合适的亮度范围
      let minLightness;
      let maxLightness;

      if (l > 70) {
        // 原色较亮，生成中亮到深色的范围
        const baseRange = 30;
        const adjustedRange = baseRange * rangeScale;
        minLightness = Math.max(40, l - adjustedRange);
        maxLightness = Math.min(90, l + adjustedRange * 0.3);
      } else if (l < 30) {
        // 原色较暗，生成浅到中深的范围
        const baseRange = 40;
        const adjustedRange = baseRange * rangeScale;
        minLightness = Math.max(20, l - adjustedRange * 0.2);
        maxLightness = Math.min(70, l + adjustedRange);
      } else {
        // 原色中等亮度，生成平衡的亮度范围
        const baseRange = 25; // 稍微增加基础范围
        const adjustedRange = baseRange * rangeScale;
        minLightness = Math.max(30, l - adjustedRange);
        maxLightness = Math.min(80, l + adjustedRange);
      }

      for (let i = 0; i < count; i++) {
        // 计算在亮度范围内的插值因子
        const factor = i / (count - 1);
        const currentLightness = minLightness + (maxLightness - minLightness) * factor;

        // 根据项目数量调整饱和度变化幅度
        const saturationRange = 12 * rangeScale; // 稍微增加饱和度变化
        const saturationAdjustment = (factor - 0.5) * saturationRange;
        const currentSaturation = Math.max(0, Math.min(100, s + saturationAdjustment));

        // 转换回RGB
        const newRgb = hslToRgb(h, currentSaturation, currentLightness);
        const newR = (newRgb as any).r !== undefined ? (newRgb as any).r : (newRgb as any)[0];
        const newG = (newRgb as any).g !== undefined ? (newRgb as any).g : (newRgb as any)[1];
        const newB = (newRgb as any).b !== undefined ? (newRgb as any).b : (newRgb as any)[2];

        const newHex = rgbToHex(Math.round(newR), Math.round(newG), Math.round(newB));
        colors.push(`#${newHex}`);
      }

      return colors;
    } catch (error) {
      // 如果转换失败，返回基础颜色的数组
      return Array(count).fill(baseColor);
    }
  }
}
