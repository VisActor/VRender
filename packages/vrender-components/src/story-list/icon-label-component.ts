import { merge } from '@visactor/vutils';
import type { ILiItemAttrs } from './type';
import type { ComponentOptions } from '../interface';
import type { IGroupGraphicAttribute, IRichText, ISymbol, ILine } from '@visactor/vrender-core';
import { AbstractComponent } from '../core/base';

export interface IIconLabelComponentAttrs extends IGroupGraphicAttribute {
  item: ILiItemAttrs; // 单个列表项数据
  width: number; // 组件宽度
  height: number; // 组件高度
  color?: string; // 主题颜色，会应用到所有元素
  divideWidth?: number; // 分隔线宽度
  iconRatio?: number; // icon大小相对于height的比例
}

export class IconLabelComponent extends AbstractComponent<Required<IIconLabelComponentAttrs>> {
  static defaultAttributes: Partial<IIconLabelComponentAttrs> = {
    width: 300,
    height: 60,
    color: '#4285F4',
    divideWidth: 2,
    iconRatio: 0.8,
    item: {}
  };

  name: 'icon-label-component' = 'icon-label-component';

  constructor(attributes: IIconLabelComponentAttrs, options?: ComponentOptions) {
    super(options?.skipDefault ? attributes : merge({}, IconLabelComponent.defaultAttributes, attributes));
  }

  render() {
    this.removeAllChild(true);

    const { item, width, height, color, divideWidth, iconRatio } = this.attribute;

    if (!item) {
      return;
    }

    // 计算布局参数
    const iconSize = height * iconRatio;
    const iconX = iconSize / 2;
    const iconY = height / 2;

    // 分隔线位置（在icon右侧，留一些间距）
    const divideX = iconSize + 10;
    const divideStartY = 5;
    const divideEndY = height - 5;

    // 文本区域起始位置（在分隔线右侧，留一些间距）
    const textStartX = divideX + 15;
    const textWidth = width - textStartX;

    // 生成颜色变体
    const { iconColor, divideColor, titleColor, textColor } = this.generateColors(color);

    // 渲染icon
    this.renderIcon(item, iconX, iconY, iconSize, iconColor);

    // 渲染分隔线
    this.renderDivide(divideX, divideStartY, divideEndY, divideColor, divideWidth);

    // 渲染title和text
    this.renderTexts(item, textStartX, textWidth, height, titleColor, textColor);
  }

  private generateColors(baseColor: string) {
    // 将基础颜色转换为HSL，生成不同亮度的变体
    const hsl = this.hexToHsl(baseColor);

    return {
      iconColor: baseColor, // icon使用原色
      divideColor: baseColor, // 分隔线使用原色
      titleColor: baseColor, // title使用原色
      textColor: this.hslToHex(hsl.h, hsl.s, Math.min(hsl.l + 0.3, 0.9)) // text使用较浅的颜色
    };
  }

  private hexToHsl(hex: string): { h: number; s: number; l: number } {
    // 移除#号
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) {
      return { h: 0, s: 0, l: 0.5 };
    }

    const r = parseInt(result[1], 16) / 255;
    const g = parseInt(result[2], 16) / 255;
    const b = parseInt(result[3], 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h: number;
    let s: number;
    const l = (max + min) / 2;

    if (max === min) {
      h = s = 0; // 无色
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
        default:
          h = 0;
      }
      h /= 6;
    }

    return { h, s, l };
  }

  private hslToHex(h: number, s: number, l: number): string {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) {
        t += 1;
      }
      if (t > 1) {
        t -= 1;
      }
      if (t < 1 / 6) {
        return p + (q - p) * 6 * t;
      }
      if (t < 1 / 2) {
        return q;
      }
      if (t < 2 / 3) {
        return p + (q - p) * (2 / 3 - t) * 6;
      }
      return p;
    };

    let r: number;
    let g: number;
    let b: number;

    if (s === 0) {
      r = g = b = l; // 无色
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }

    const toHex = (c: number) => {
      const hex = Math.round(c * 255).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }

  private renderIcon(item: ILiItemAttrs, iconX: number, iconY: number, iconSize: number, iconColor: string) {
    if (!item.icon) {
      return;
    }

    // 创建icon
    this.createOrUpdateChild(
      'icon',
      {
        x: iconX,
        y: iconY,
        size: iconSize,
        symbolType: 'circle', // 默认圆形
        fill: iconColor,
        stroke: iconColor,
        lineWidth: 1,
        ...item.icon,
        // 如果有background，不要覆盖fill
        ...(item.icon.background ? {} : { fill: iconColor, stroke: iconColor })
      },
      'symbol'
    );
  }

  private renderDivide(divideX: number, startY: number, endY: number, divideColor: string, divideWidth: number) {
    this.createOrUpdateChild(
      'divide',
      {
        points: [
          { x: divideX, y: startY },
          { x: divideX, y: endY }
        ],
        stroke: divideColor,
        lineWidth: divideWidth
      },
      'line'
    );
  }

  private renderTexts(
    item: ILiItemAttrs,
    textStartX: number,
    textWidth: number,
    height: number,
    titleColor: string,
    textColor: string
  ) {
    const padding = 5;
    const hasTitle = !!item.title;
    const hasText = !!item.text;

    // 如果只有标题，垂直居中显示
    if (hasTitle && !hasText) {
      this.createOrUpdateChild(
        'title',
        {
          x: textStartX,
          y: height / 2,
          width: textWidth,
          height: 0,
          textAlign: 'left',
          textBaseline: 'middle',
          fill: titleColor,
          fontSize: 16,
          fontWeight: 'bold',
          ...item.title
        },
        'richtext'
      );
      return;
    }

    // 如果只有文本，垂直居中显示
    if (!hasTitle && hasText) {
      this.createOrUpdateChild(
        'text',
        {
          x: textStartX,
          y: height / 2,
          width: textWidth,
          height: 0,
          textAlign: 'left',
          textBaseline: 'middle',
          fill: textColor,
          fontSize: 14,
          ...item.text
        },
        'richtext'
      );
      return;
    }

    // 如果同时有标题和文本，保持原有的上下布局
    if (hasTitle && hasText) {
      // 渲染title（顶部对齐）
      this.createOrUpdateChild(
        'title',
        {
          x: textStartX,
          y: padding,
          width: textWidth,
          height: 0,
          textAlign: 'left',
          textBaseline: 'top',
          fill: titleColor,
          fontSize: 16,
          fontWeight: 'bold',
          ...item.title
        },
        'richtext'
      );

      // 渲染text（底部对齐）
      this.createOrUpdateChild(
        'text',
        {
          x: textStartX,
          y: height - padding,
          width: textWidth,
          height: 0,
          textAlign: 'left',
          textBaseline: 'bottom',
          fill: textColor,
          fontSize: 14,
          ...item.text
        },
        'richtext'
      );
    }
  }
}
