import { merge } from '@visactor/vutils';
import type { IStoryShapeListAttrs } from './type';
import type { ComponentOptions } from '../interface';
import { loadStoryListComponent } from './register';
import { StoryBaseList } from './story-base-list';
import { IconLabelComponent } from './icon-label-component';
import type { IGroup } from '@visactor/vrender-core';
import { DollarShapePath } from './constants';

loadStoryListComponent();

export class StoryVerticalShapeClipList extends StoryBaseList<IStoryShapeListAttrs> {
  static defaultAttributes: Partial<IStoryShapeListAttrs> = {
    colors: ['#4285F4', '#34A853', '#00BCD4', '#8BC34A'], // 蓝、绿、青、黄绿
    list: [],
    width: 600,
    height: 400,
    x: 0,
    y: 0,
    themeStyle: 'normal',
    shapeRatio: 0.4,
    spacing: 10,
    // 使用DollarShapePath作为默认形状
    shapePath: DollarShapePath
  };

  name: 'story-shape-list' = 'story-shape-list';

  constructor(attributes: IStoryShapeListAttrs, options?: ComponentOptions) {
    super(options?.skipDefault ? attributes : merge({}, StoryVerticalShapeClipList.defaultAttributes, attributes));
  }

  render() {
    this.removeAllChild(true);

    const { list, colors, width, height, shapePath, shapeRatio, spacing, themeStyle } = this.attribute;

    if (!list || list.length === 0) {
      console.warn('StoryShapeList requires at least 1 list item');
      return;
    }

    // 如果只有一个颜色，生成多个变化
    let finalColors = colors;
    if (colors.length === 1 && list.length > 1) {
      finalColors = this.generateColors(colors[0], list.length);
    }

    // 计算布局
    const shapeWidth = width * shapeRatio;
    const labelWidth = width * (1 - shapeRatio) - 20; // 留20px间距
    const labelStartX = shapeWidth + 20;

    // 计算每个item的实际高度，确保所有内容都能容纳在给定的height内
    const actualItemHeight = (height - (list.length - 1) * spacing) / list.length;
    const startY = 0; // 从顶部开始

    // 渲染左侧形状的每个部分
    this.renderShapeParts(shapeWidth, height, startY, actualItemHeight, spacing, finalColors, shapePath, themeStyle);

    // 渲染右侧标签列表
    this.renderLabelList(labelStartX, labelWidth, startY, actualItemHeight, spacing, finalColors);
  }

  private renderShapeParts(
    shapeWidth: number,
    totalHeight: number,
    startY: number,
    itemHeight: number,
    spacing: number,
    colors: string[],
    shapePath: string,
    themeStyle: string
  ) {
    const { list } = this.attribute;

    list.forEach((item, index) => {
      const segmentColor = colors[index] || colors[index % colors.length] || '#4285F4';

      // 应用主题样式
      const { fillColor, strokeColor, lineWidth } = this.getThemeStyle(themeStyle, segmentColor, '#fff', 2);

      // 计算当前段的Y位置和高度
      const segmentY = startY + index * (itemHeight + spacing);

      let padding = 0;

      if (lineWidth && strokeColor) {
        padding = lineWidth / 2;
      }

      // 创建一个group作为裁剪容器
      const clipGroup = this.createOrUpdateChild(
        `shape-clip-${index}`,
        {
          x: 0,
          y: segmentY,
          width: shapeWidth,
          height: itemHeight,
          clip: true
        },
        'group'
      ) as IGroup;

      // 在裁剪组内创建完整的形状symbol
      // 形状应该在整个容器高度范围内居中显示
      clipGroup.createOrUpdateChild(
        `shape-${index}`,
        {
          x: padding,
          y: -segmentY + padding, // 相对于裁剪组的坐标
          size: totalHeight - padding * 2,
          symbolType: shapePath, // 直接使用path作为symbolType
          fill: fillColor,
          stroke: strokeColor,
          lineWidth: lineWidth
        },
        'symbol'
      );
    });
  }

  private renderLabelList(
    labelStartX: number,
    labelWidth: number,
    startY: number,
    itemHeight: number,
    spacing: number,
    colors: string[]
  ) {
    const { list } = this.attribute;

    list.forEach((item, index) => {
      const segmentColor = colors[index] || colors[index % colors.length] || '#4285F4';
      const labelY = startY + index * (itemHeight + spacing);

      // 为每个标签创建IconLabelComponent
      const labelComponent = new IconLabelComponent({
        x: labelStartX,
        y: labelY,
        width: labelWidth,
        height: itemHeight,
        color: segmentColor,
        item: item
      });

      // 将IconLabelComponent作为子元素添加
      this.appendChild(labelComponent);
    });
  }
}
