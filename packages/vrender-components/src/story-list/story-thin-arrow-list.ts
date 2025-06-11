import type { ILiItemAttrs } from './type';
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
      } else if (direction === 'left-right') {
        // 左右都有箭头的情况（细箭头）
        const points = [
          { x: startX, y: startY + height / 2 },
          { x: startX + bigTipWidth, y: startY },
          { x: startX + bigTipWidth, y: startY + bodyOffsetY },
          { x: startX + totalWidth - bigTipWidth, y: startY + bodyOffsetY },
          { x: startX + totalWidth - bigTipWidth, y: startY },
          { x: startX + totalWidth, y: startY + height / 2 },
          { x: startX + totalWidth - bigTipWidth, y: startY + height },
          { x: startX + totalWidth - bigTipWidth, y: startY + bodyOffsetY + bodyHeight },
          { x: startX + bigTipWidth, y: startY + bodyOffsetY + bodyHeight },
          { x: startX + bigTipWidth, y: startY + height }
        ];
        segments.push({
          points,
          textX: startX + totalWidth / 2,
          textWidth: Math.max(totalWidth - bigTipWidth * 2 - 10, (totalWidth - bigTipWidth * 2) * 0.8, 0)
        });
      }
    } else {
      // 多个段的箭头 - 统一处理left、right、left-right
      // 计算箭头尖端的总宽度
      const totalTipWidth = direction === 'left-right' ? bigTipWidth * 2 : bigTipWidth;
      const rectWidth = (totalWidth - totalTipWidth) / segmentCount;
      const textWidth = Math.max(rectWidth - 10, rectWidth * 0.8, 0);

      for (let i = 0; i < segmentCount; i++) {
        const isFirst = i === 0;
        const isLast = i === segmentCount - 1;

        // 计算每段的起始X坐标
        let rectX: number;
        if (direction === 'left' || direction === 'left-right') {
          rectX = startX + bigTipWidth + i * rectWidth;
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
            { x: startX + bigTipWidth, y: startY },
            { x: startX + bigTipWidth, y: startY + bodyOffsetY },
            { x: rectX + rectWidth, y: startY + bodyOffsetY },
            { x: rectX + rectWidth, y: startY },
            { x: startX + totalWidth, y: startY + height / 2 },
            { x: rectX + rectWidth, y: startY + height },
            { x: rectX + rectWidth, y: startY + bodyOffsetY + bodyHeight },
            { x: startX + bigTipWidth, y: startY + bodyOffsetY + bodyHeight },
            { x: startX + bigTipWidth, y: startY + height }
          ];
        } else if (hasLeftTip) {
          // 只有左侧箭头尖端
          points = [
            { x: startX, y: startY + height / 2 },
            { x: startX + bigTipWidth, y: startY },
            { x: startX + bigTipWidth, y: startY + bodyOffsetY },
            { x: rectX + rectWidth, y: startY + bodyOffsetY },
            { x: rectX + rectWidth, y: startY + bodyOffsetY + bodyHeight },
            { x: startX + bigTipWidth, y: startY + bodyOffsetY + bodyHeight },
            { x: startX + bigTipWidth, y: startY + height }
          ];
        } else if (hasRightTip) {
          // 只有右侧箭头尖端
          points = [
            { x: rectX, y: startY + bodyOffsetY },
            { x: rectX + rectWidth, y: startY + bodyOffsetY },
            { x: rectX + rectWidth, y: startY },
            { x: startX + totalWidth, y: startY + height / 2 },
            { x: rectX + rectWidth, y: startY + height },
            { x: rectX + rectWidth, y: startY + bodyOffsetY + bodyHeight },
            { x: rectX, y: startY + bodyOffsetY + bodyHeight }
          ];
        } else {
          // 普通矩形段（细身体）
          points = [
            { x: rectX, y: startY + bodyOffsetY },
            { x: rectX + rectWidth, y: startY + bodyOffsetY },
            { x: rectX + rectWidth, y: startY + bodyOffsetY + bodyHeight },
            { x: rectX, y: startY + bodyOffsetY + bodyHeight }
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

  // 重写icon渲染方法以适配细箭头的尺寸
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

    // 细箭头的身体高度为原高度的60%
    const bodyHeight = arrowHeight * 0.6;
    const bodyOffsetY = (arrowHeight - bodyHeight) / 2;

    // 计算矩形部分的中心位置（排除三角形部分）
    const iconX = segment.textX; // 使用文本的X坐标作为icon的X坐标
    const iconY = arrowStartY + bodyOffsetY + bodyHeight / 2; // 细箭头身体的垂直中心
    const iconSize = Math.min(bodyHeight * 0.7, 100); // icon大小，适配细箭头的身体高度

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
}
