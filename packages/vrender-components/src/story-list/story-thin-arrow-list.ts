import { merge } from '@visactor/vutils';
import type { IStoryArrowListAttrs, ILiItemAttrs } from './type';
import type { ComponentOptions } from '../interface';
import type { IRichText } from '@visactor/vrender-core';
import { loadStoryListComponent } from './register';
import { StoryArrowList } from './story-arrow-list';

loadStoryListComponent();

export class StoryThinArrowList extends StoryArrowList {
  // 重写calculateSegments方法，实现细身体宽三角形的箭头样式
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

    // 细箭头的设计：身体高度为原高度的60%，三角形保持原高度
    const bodyHeight = height * 0.6;
    const bodyOffsetY = (height - bodyHeight) / 2; // 身体在垂直方向的偏移
    const bigTipWidth = tipWidth * 1.5; // 三角形宽度增加50%

    if (segmentCount === 1) {
      // 单个箭头
      if (direction === 'right') {
        const points = [
          { x: startX, y: startY + bodyOffsetY },
          { x: startX + totalWidth - bigTipWidth, y: startY + bodyOffsetY },
          { x: startX + totalWidth - bigTipWidth, y: startY },
          { x: startX + totalWidth, y: startY + height / 2 },
          { x: startX + totalWidth - bigTipWidth, y: startY + height },
          { x: startX + totalWidth - bigTipWidth, y: startY + bodyOffsetY + bodyHeight },
          { x: startX, y: startY + bodyOffsetY + bodyHeight }
        ];
        segments.push({
          points,
          textX: startX + (totalWidth - bigTipWidth) / 2,
          textWidth: Math.max(totalWidth - bigTipWidth - 10, (totalWidth - bigTipWidth) * 0.8, 0)
        });
      } else if (direction === 'left') {
        const points = [
          { x: startX, y: startY + height / 2 },
          { x: startX + bigTipWidth, y: startY },
          { x: startX + bigTipWidth, y: startY + bodyOffsetY },
          { x: startX + totalWidth, y: startY + bodyOffsetY },
          { x: startX + totalWidth, y: startY + bodyOffsetY + bodyHeight },
          { x: startX + bigTipWidth, y: startY + bodyOffsetY + bodyHeight },
          { x: startX + bigTipWidth, y: startY + height }
        ];
        segments.push({
          points,
          textX: startX + (totalWidth + bigTipWidth) / 2,
          textWidth: Math.max(totalWidth - bigTipWidth - 10, (totalWidth - bigTipWidth) * 0.8, 0)
        });
      }
    } else {
      // 多个段的箭头
      const rectWidth = (totalWidth - bigTipWidth) / segmentCount;
      const textWidth = Math.max(rectWidth - 10, rectWidth * 0.8, 0);

      for (let i = 0; i < segmentCount; i++) {
        if (direction === 'right') {
          const rectX = startX + i * rectWidth;
          const isLast = i === segmentCount - 1;

          if (isLast) {
            // 最后一段包含箭头尖端
            const points = [
              { x: rectX, y: startY + bodyOffsetY },
              { x: rectX + rectWidth, y: startY + bodyOffsetY },
              { x: rectX + rectWidth, y: startY },
              { x: startX + totalWidth, y: startY + height / 2 },
              { x: rectX + rectWidth, y: startY + height },
              { x: rectX + rectWidth, y: startY + bodyOffsetY + bodyHeight },
              { x: rectX, y: startY + bodyOffsetY + bodyHeight }
            ];
            segments.push({
              points,
              textX: rectX + rectWidth / 2,
              textWidth
            });
          } else {
            // 普通矩形段（细身体）
            const points = [
              { x: rectX, y: startY + bodyOffsetY },
              { x: rectX + rectWidth, y: startY + bodyOffsetY },
              { x: rectX + rectWidth, y: startY + bodyOffsetY + bodyHeight },
              { x: rectX, y: startY + bodyOffsetY + bodyHeight }
            ];
            segments.push({
              points,
              textX: rectX + rectWidth / 2,
              textWidth
            });
          }
        } else if (direction === 'left') {
          const rectX = startX + bigTipWidth + i * rectWidth;
          const isFirst = i === 0;

          if (isFirst) {
            // 第一段包含箭头尖端
            const points = [
              { x: startX, y: startY + height / 2 },
              { x: startX + bigTipWidth, y: startY },
              { x: startX + bigTipWidth, y: startY + bodyOffsetY },
              { x: rectX + rectWidth, y: startY + bodyOffsetY },
              { x: rectX + rectWidth, y: startY + bodyOffsetY + bodyHeight },
              { x: startX + bigTipWidth, y: startY + bodyOffsetY + bodyHeight },
              { x: startX + bigTipWidth, y: startY + height }
            ];
            segments.push({
              points,
              textX: rectX + rectWidth / 2,
              textWidth
            });
          } else {
            // 普通矩形段（细身体）
            const points = [
              { x: rectX, y: startY + bodyOffsetY },
              { x: rectX + rectWidth, y: startY + bodyOffsetY },
              { x: rectX + rectWidth, y: startY + bodyOffsetY + bodyHeight },
              { x: rectX, y: startY + bodyOffsetY + bodyHeight }
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
}
