import { merge } from '@visactor/vutils';
import type { IStoryArrowListAttrs, ILiItemAttrs } from './type';
import type { ComponentOptions } from '../interface';
import type { IRichText } from '@visactor/vrender-core';
import { loadStoryListComponent } from './register';
import { StoryBaseList } from './story-base-list';

loadStoryListComponent();

export class StoryArrowList extends StoryBaseList<IStoryArrowListAttrs> {
  static defaultAttributes: Partial<IStoryArrowListAttrs> = {
    colors: ['#4285F4', '#34A853', '#00BCD4', '#8BC34A'], // 蓝、绿、青、黄绿
    list: [],
    width: 600,
    height: 400,
    x: 0,
    y: 0,
    direction: 'right',
    themeStyle: 'normal'
  };

  name: 'story-arrow-list' = 'story-arrow-list';

  constructor(attributes: IStoryArrowListAttrs, options?: ComponentOptions) {
    super(options?.skipDefault ? attributes : merge({}, StoryArrowList.defaultAttributes, attributes));
  }

  render() {
    this.removeAllChild(true);

    const { list, colors, width, height, direction, themeStyle } = this.attribute;

    if (!list || list.length === 0) {
      console.warn('StoryArrowList requires at least 1 list item');
      return;
    }

    // 如果只有一个颜色，生成多个变化
    let finalColors = colors;
    if (colors.length === 1 && list.length > 1) {
      finalColors = this.generateColors(colors[0], list.length);
    }

    // 计算箭头区域
    const arrowHeight = 60;
    const arrowWidth = width - 40; // 左右留20px边距
    const arrowStartX = 20;
    const arrowStartY = height - arrowHeight - 20; // 底部留20px边距
    const arrowTipWidth = 30; // 箭头尖端宽度

    // 计算每个段的宽度和位置
    const segments = this.calculateSegments(
      arrowStartX,
      arrowWidth,
      arrowHeight,
      list.length,
      arrowTipWidth,
      direction
    );

    // 绘制箭头段
    segments.forEach((segment, index) => {
      const segmentColor = finalColors[index] || finalColors[index % finalColors.length] || '#4285F4';

      const { fillColor, strokeColor, lineWidth } = this.getThemeStyle(themeStyle, segmentColor, '#fff', 2);

      // 绘制箭头段
      this.createOrUpdateChild(
        `arrow-segment-${index}`,
        {
          points: segment.points,
          fill: fillColor,
          stroke: strokeColor,
          lineWidth: lineWidth
        },
        'polygon'
      );

      // 绘制icon（如果配置了）
      this.renderIconForSegment(list[index], segment, index, arrowStartY, arrowHeight);

      // 绘制对应的文字
      this.renderTextForSegment(list[index], segment, index, arrowStartY, arrowHeight);
    });

    this.alignText(segments.length);
  }

  protected calculateSegments(
    startX: number,
    totalWidth: number,
    height: number,
    segmentCount: number,
    tipWidth: number,
    direction: string
  ) {
    const segments: Array<{ points: Array<{ x: number; y: number }>; textX: number; textWidth: number }> = [];
    const startY = this.attribute.height - height - 20; // 箭头的Y坐标

    if (segmentCount === 1) {
      // 单个箭头
      if (direction === 'right') {
        const points = [
          { x: startX, y: startY },
          { x: startX + totalWidth - tipWidth, y: startY },
          { x: startX + totalWidth, y: startY + height / 2 },
          { x: startX + totalWidth - tipWidth, y: startY + height },
          { x: startX, y: startY + height }
        ];
        segments.push({
          points,
          textX: startX + (totalWidth - tipWidth) / 2,
          textWidth: Math.max(totalWidth - tipWidth - 10, (totalWidth - tipWidth) * 0.8, 0)
        });
      } else if (direction === 'left') {
        const points = [
          { x: startX, y: startY + height / 2 },
          { x: startX + tipWidth, y: startY },
          { x: startX + totalWidth, y: startY },
          { x: startX + totalWidth, y: startY + height },
          { x: startX + tipWidth, y: startY + height }
        ];
        segments.push({
          points,
          textX: startX + (totalWidth + tipWidth) / 2,
          textWidth: Math.max(totalWidth - tipWidth - 10, (totalWidth - tipWidth) * 0.8, 0)
        });
      } else if (direction === 'left-right') {
        // 左右都有箭头的情况
        const points = [
          { x: startX, y: startY + height / 2 },
          { x: startX + tipWidth, y: startY },
          { x: startX + totalWidth - tipWidth, y: startY },
          { x: startX + totalWidth, y: startY + height / 2 },
          { x: startX + totalWidth - tipWidth, y: startY + height },
          { x: startX + tipWidth, y: startY + height }
        ];
        segments.push({
          points,
          textX: startX + totalWidth / 2,
          textWidth: Math.max(totalWidth - tipWidth * 2 - 10, (totalWidth - tipWidth * 2) * 0.8, 0)
        });
      }
    } else {
      // 多个段的箭头 - 统一处理left、right、left-right
      // 计算箭头尖端的总宽度
      const totalTipWidth = direction === 'left-right' ? tipWidth * 2 : tipWidth;
      const rectWidth = (totalWidth - totalTipWidth) / segmentCount;
      const textWidth = Math.max(rectWidth - 10, rectWidth * 0.8, 0);

      for (let i = 0; i < segmentCount; i++) {
        const isFirst = i === 0;
        const isLast = i === segmentCount - 1;

        // 计算每段的起始X坐标
        let rectX: number;
        if (direction === 'left' || direction === 'left-right') {
          rectX = startX + tipWidth + i * rectWidth;
        } else {
          rectX = startX + i * rectWidth;
        }

        // 判断当前段是否需要特殊处理
        const hasLeftTip = (direction === 'left' || direction === 'left-right') && isFirst;
        const hasRightTip = (direction === 'right' || direction === 'left-right') && isLast;

        let points: Array<{ x: number; y: number }>;

        if (hasLeftTip && hasRightTip) {
          // 左右都有箭头尖端（只在left-right且只有一段时发生）
          points = [
            { x: startX, y: startY + height / 2 },
            { x: startX + tipWidth, y: startY },
            { x: rectX + rectWidth, y: startY },
            { x: startX + totalWidth, y: startY + height / 2 },
            { x: rectX + rectWidth, y: startY + height },
            { x: startX + tipWidth, y: startY + height }
          ];
        } else if (hasLeftTip) {
          // 只有左侧箭头尖端
          points = [
            { x: startX, y: startY + height / 2 },
            { x: startX + tipWidth, y: startY },
            { x: rectX + rectWidth, y: startY },
            { x: rectX + rectWidth, y: startY + height },
            { x: startX + tipWidth, y: startY + height }
          ];
        } else if (hasRightTip) {
          // 只有右侧箭头尖端
          points = [
            { x: rectX, y: startY },
            { x: rectX + rectWidth, y: startY },
            { x: startX + totalWidth, y: startY + height / 2 },
            { x: rectX + rectWidth, y: startY + height },
            { x: rectX, y: startY + height }
          ];
        } else {
          // 普通矩形段
          points = [
            { x: rectX, y: startY },
            { x: rectX + rectWidth, y: startY },
            { x: rectX + rectWidth, y: startY + height },
            { x: rectX, y: startY + height }
          ];
        }

        segments.push({
          points,
          textX: rectX + rectWidth / 2,
          textWidth
        });
      }
    }

    return segments;
  }

  protected renderIconForSegment(
    item: ILiItemAttrs,
    segment: { points: Array<{ x: number; y: number }>; textX: number; textWidth: number },
    index: number,
    arrowStartY: number,
    arrowHeight: number
  ) {
    if (!item.icon) {
      return;
    }

    // 计算矩形部分的中心位置（排除三角形部分）
    const iconX = segment.textX; // 使用文本的X坐标作为icon的X坐标
    const iconY = arrowStartY + arrowHeight / 2; // 箭头段的垂直中心
    const iconSize = Math.min(arrowHeight * 0.7, 100); // icon大小，不超过箭头高度的70%，最大100px

    // 创建icon
    this.createOrUpdateChild(
      `icon-${index}`,
      {
        x: iconX,
        y: iconY,
        size: iconSize,
        symbolType: 'square', // 使用圆形作为基础形状
        background: item.icon.background || '', // 使用background显示复杂icon
        stroke: item.icon.stroke || '#fff',
        lineWidth: item.icon.lineWidth || 1,
        ...item.icon
      },
      'symbol'
    );
  }

  private renderTextForSegment(
    item: ILiItemAttrs,
    segment: { textX: number; textWidth: number },
    index: number,
    startY: number,
    arrowHeight: number
  ) {
    const { titleTextOrder = 'top' } = this.attribute;
    const { position = 'top', spaceTitleText = 2, space = 10 } = item; // 获取position属性，默认为top

    startY = position === 'top' ? startY - space : startY + arrowHeight + space;

    const createTitle = (dy: number = 0, textBaseline: string = 'top') => {
      if (item.title) {
        return this.createOrUpdateChild(
          `title-${index}`,
          {
            x: segment.textX,
            y: startY + dy,
            width: segment.textWidth,
            height: 0,
            textAlign: 'center',
            textBaseline: textBaseline as any,
            ...item.title
          },
          'richtext'
        ) as IRichText;
      }
    };

    const createText = (dy: number = 0, textBaseline: string = 'top') => {
      if (item.text) {
        return this.createOrUpdateChild(
          `text-${index}`,
          {
            x: segment.textX,
            y: startY + dy,
            width: segment.textWidth,
            height: 0,
            textAlign: 'center',
            textBaseline: textBaseline as any,
            ...item.text
          },
          'richtext'
        ) as IRichText;
      }
    };

    if (position === 'top') {
      // 文本在箭头上方（现有逻辑）
      if (titleTextOrder === 'top') {
        const title = createTitle(0, 'top');
        if (title) {
          // 因为是顶部对齐，所以需要减去标题的高度
          let height = title.AABBBounds.height();
          title.setAttribute('y', title.attribute.y - height);
          height += spaceTitleText;
          const text = createText(-height, 'top');
          if (text) {
            height = text.AABBBounds.height();
            text.setAttribute('y', text.attribute.y - height);
          }
        }
      } else {
        const text = createText(0, 'top');
        if (text) {
          // 因为是顶部对齐，所以需要减去文本的高度
          let height = text.AABBBounds.height();
          text.setAttribute('y', text.attribute.y - height);
          height += spaceTitleText;
          const title = createTitle(-height, 'top');
          if (title) {
            height = title.AABBBounds.height();
            title.setAttribute('y', title.attribute.y - height);
          }
        }
      }
    } else {
      // 文本在箭头下方
      // 计算箭头下方的起始位置（startY是箭头上方的位置）

      if (titleTextOrder === 'top') {
        const title = createTitle(0, 'top');
        if (title) {
          let height = title.AABBBounds.height();
          height += spaceTitleText;
          createText(height, 'top');
        }
      } else {
        const text = createText(startY, 'top');
        if (text) {
          let height = text.AABBBounds.height();
          height += spaceTitleText;
          createTitle(startY + height, 'top');
        }
      }
    }
  }

  // 有些文字长，有些文字短，需要全局对齐
  private alignText(segmentCount: number) {
    // 分别处理上方和下方的文本对齐
    let topTitleY = Infinity;
    let topTextY = Infinity;
    let bottomTitleY = -Infinity;
    let bottomTextY = -Infinity;

    const { list } = this.attribute;

    // 获取上方和下方文本的边界坐标
    for (let i = 0; i < segmentCount; i++) {
      const title = this.getElementsByName(`title-${i}`)[0] as IRichText;
      const text = this.getElementsByName(`text-${i}`)[0] as IRichText;
      const item = list[i];
      const position = item?.position || 'top';

      if (position === 'top') {
        // 上方文本：找最小Y坐标
        if (title) {
          topTitleY = Math.min(topTitleY, title.attribute.y);
        }
        if (text) {
          topTextY = Math.min(topTextY, text.attribute.y);
        }
      } else {
        // 下方文本：找最大Y坐标（实际上是最小的起始Y，因为向下增长）
        if (title) {
          bottomTitleY = Math.max(bottomTitleY, title.attribute.y);
        }
        if (text) {
          bottomTextY = Math.max(bottomTextY, text.attribute.y);
        }
      }
    }

    // 应用对齐
    for (let i = 0; i < segmentCount; i++) {
      const title = this.getElementsByName(`title-${i}`)[0] as IRichText;
      const text = this.getElementsByName(`text-${i}`)[0] as IRichText;
      const item = list[i];
      const position = item?.position || 'top';

      if (position === 'top') {
        // 上方文本：统一到最小Y坐标
        if (title && topTitleY !== Infinity) {
          title.setAttribute('y', topTitleY);
        }
        if (text && topTextY !== Infinity) {
          text.setAttribute('y', topTextY);
        }
      } else {
        // 下方文本：统一到最小Y坐标
        if (title && bottomTitleY !== -Infinity) {
          title.setAttribute('y', bottomTitleY);
        }
        if (text && bottomTextY !== -Infinity) {
          text.setAttribute('y', bottomTextY);
        }
      }
    }
  }
}
