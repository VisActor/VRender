import { merge } from '@visactor/vutils';
import type { IStoryArrowListAttrs, ILiItemAttrs } from './type';
import type { ComponentOptions } from '../interface';
import type { IRichText } from '@visactor/vrender-core';
import { loadStoryListComponent } from './register';
import { StoryBaseList } from './story-base-list';

loadStoryListComponent();

export class StoryArrowList extends StoryBaseList {
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
      this.renderTextForSegment(list[index], segment, index, arrowStartY - 20);
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
      }
    } else {
      // 多个段的箭头
      const rectWidth = (totalWidth - tipWidth) / segmentCount;
      const textWidth = Math.max(rectWidth - 10, rectWidth * 0.8, 0);

      for (let i = 0; i < segmentCount; i++) {
        if (direction === 'right') {
          const rectX = startX + i * rectWidth;
          const isLast = i === segmentCount - 1;

          if (isLast) {
            // 最后一段包含箭头尖端
            const points = [
              { x: rectX, y: startY },
              { x: rectX + rectWidth, y: startY },
              { x: startX + totalWidth, y: startY + height / 2 },
              { x: rectX + rectWidth, y: startY + height },
              { x: rectX, y: startY + height }
            ];
            segments.push({
              points,
              textX: rectX + rectWidth / 2,
              textWidth
            });
          } else {
            // 普通矩形段
            const points = [
              { x: rectX, y: startY },
              { x: rectX + rectWidth, y: startY },
              { x: rectX + rectWidth, y: startY + height },
              { x: rectX, y: startY + height }
            ];
            segments.push({
              points,
              textX: rectX + rectWidth / 2,
              textWidth
            });
          }
        } else if (direction === 'left') {
          const rectX = startX + tipWidth + i * rectWidth;
          const isFirst = i === 0;

          if (isFirst) {
            // 第一段包含箭头尖端
            const points = [
              { x: startX, y: startY + height / 2 },
              { x: startX + tipWidth, y: startY },
              { x: rectX + rectWidth, y: startY },
              { x: rectX + rectWidth, y: startY + height },
              { x: startX + tipWidth, y: startY + height }
            ];
            segments.push({
              points,
              textX: rectX + rectWidth / 2,
              textWidth
            });
          } else {
            // 普通矩形段
            const points = [
              { x: rectX, y: startY },
              { x: rectX + rectWidth, y: startY },
              { x: rectX + rectWidth, y: startY + height },
              { x: rectX, y: startY + height }
            ];
            segments.push({
              points,
              textX: rectX + rectWidth / 2,
              textWidth
            });
          }
        }
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
    startY: number
  ) {
    const { titleTextOrder = 'top' } = this.attribute;

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

    // 标题和文本的顺序，默认是标题在上，文本在下
    if (titleTextOrder === 'top') {
      const title = createTitle(10, 'top');
      if (title) {
        // 因为是顶部对齐，所以需要减去标题的高度
        let height = title.AABBBounds.height();
        title.setAttribute('y', title.attribute.y - height);
        const text = createText(-height, 'top');
        if (text) {
          height = text.AABBBounds.height();
          text.setAttribute('y', text.attribute.y - height);
        }
      }
    } else {
      const text = createText(10, 'top');
      if (text) {
        // 因为是顶部对齐，所以需要减去文本的高度
        let height = text.AABBBounds.height();
        text.setAttribute('y', text.attribute.y - height);
        const title = createTitle(-height, 'top');
        if (title) {
          height = title.AABBBounds.height();
          title.setAttribute('y', title.attribute.y - height);
        }
      }
    }
  }

  // 有些文字长，有些文字短，需要全局对齐
  private alignText(segmentCount: number) {
    let titleY = Infinity;
    let textY = Infinity;

    // 获取最小的y坐标，然后统一应用
    for (let i = 0; i < segmentCount; i++) {
      const title = this.getElementsByName(`title-${i}`)[0] as IRichText;
      const text = this.getElementsByName(`text-${i}`)[0] as IRichText;
      if (title) {
        titleY = Math.min(titleY, title.attribute.y);
      }
      if (text) {
        textY = Math.min(textY, text.attribute.y);
      }
    }
    for (let i = 0; i < segmentCount; i++) {
      const title = this.getElementsByName(`title-${i}`)[0] as IRichText;
      const text = this.getElementsByName(`text-${i}`)[0] as IRichText;
      if (title) {
        title.setAttribute('y', titleY);
      }
      if (text) {
        text.setAttribute('y', textY);
      }
    }
  }
}
