import { merge } from '@visactor/vutils';
import { AbstractComponent } from '../core/base';
import type { IStoryListAttrs } from './type';
import type { ComponentOptions } from '../interface';
import type { IGroup } from '@visactor/vrender-core';
import { loadStoryListComponent } from './register';

loadStoryListComponent();

export class StoryRectList extends AbstractComponent<Required<IStoryListAttrs>> {
  static defaultAttributes: Partial<IStoryListAttrs> = {
    colors: ['#4285F4', '#34A853', '#00BCD4', '#8BC34A'], // 蓝、绿、青、黄绿
    list: [],
    width: 600,
    height: 400,
    x: 0,
    y: 0
  };

  name: 'story-rect-list' = 'story-rect-list';

  constructor(attributes: IStoryListAttrs, options?: ComponentOptions) {
    super(options?.skipDefault ? attributes : merge({}, StoryRectList.defaultAttributes, attributes));
  }

  render() {
    this.removeAllChild(true);

    const { list, colors, width, height } = this.attribute;

    if (!list || list.length !== 4) {
      console.warn('StoryRectList requires exactly 4 list items');
      return;
    }

    const centerX = width / 2;
    const centerY = height / 2;
    const axisLength = Math.min(width, height) * 0.25;
    const cornerSize = 80;
    const cornerThickness = 20;
    const iconSize = 40;

    // 创建虚线坐标轴 - 水平线
    this.createOrUpdateChild(
      'axis-horizontal',
      {
        points: [
          { x: centerX - axisLength, y: centerY },
          { x: centerX + axisLength, y: centerY }
        ],
        stroke: '#9CA3AF',
        lineWidth: 2,
        lineDash: [8, 8],
        lineCap: 'round'
      },
      'line'
    );

    // 创建虚线坐标轴 - 垂直线
    this.createOrUpdateChild(
      'axis-vertical',
      {
        points: [
          { x: centerX, y: centerY - axisLength },
          { x: centerX, y: centerY + axisLength }
        ],
        stroke: '#9CA3AF',
        lineWidth: 2,
        lineDash: [8, 8],
        lineCap: 'round'
      },
      'line'
    );

    // 四个角的配置
    const corners = [
      {
        // 右上角
        x: centerX + axisLength - cornerThickness,
        y: centerY - axisLength,
        width: cornerSize,
        height: cornerThickness,
        iconX: centerX + axisLength / 2,
        iconY: centerY - axisLength / 2,
        numberX: centerX + axisLength + cornerSize - 25,
        numberY: centerY - axisLength + cornerThickness / 2,
        titleX: centerX + axisLength + cornerSize + 20,
        titleY: centerY - axisLength - 10,
        textX: centerX + axisLength + cornerSize + 20,
        textY: centerY - axisLength + 15,
        textAlign: 'left' as const,
        number: '2'
      },
      {
        // 右下角
        x: centerX + axisLength - cornerThickness,
        y: centerY + axisLength - cornerThickness,
        width: cornerSize,
        height: cornerThickness,
        iconX: centerX + axisLength / 2,
        iconY: centerY + axisLength / 2,
        numberX: centerX + axisLength + cornerSize - 25,
        numberY: centerY + axisLength - cornerThickness / 2,
        titleX: centerX + axisLength + cornerSize + 20,
        titleY: centerY + axisLength - 25,
        textX: centerX + axisLength + cornerSize + 20,
        textY: centerY + axisLength,
        textAlign: 'left' as const,
        number: '4'
      },
      {
        // 左下角
        x: centerX - axisLength - cornerSize + cornerThickness,
        y: centerY + axisLength - cornerThickness,
        width: cornerSize,
        height: cornerThickness,
        iconX: centerX - axisLength / 2,
        iconY: centerY + axisLength / 2,
        numberX: centerX - axisLength - cornerSize + 25,
        numberY: centerY + axisLength - cornerThickness / 2,
        titleX: centerX - axisLength - cornerSize - 20,
        titleY: centerY + axisLength - 25,
        textX: centerX - axisLength - cornerSize - 20,
        textY: centerY + axisLength,
        textAlign: 'right' as const,
        number: '3'
      },
      {
        // 左上角
        x: centerX - axisLength - cornerSize + cornerThickness,
        y: centerY - axisLength,
        width: cornerSize,
        height: cornerThickness,
        iconX: centerX - axisLength / 2,
        iconY: centerY - axisLength / 2,
        numberX: centerX - axisLength - cornerSize + 25,
        numberY: centerY - axisLength + cornerThickness / 2,
        titleX: centerX - axisLength - cornerSize - 20,
        titleY: centerY - axisLength - 10,
        textX: centerX - axisLength - cornerSize - 20,
        textY: centerY - axisLength + 15,
        textAlign: 'right' as const,
        number: '1'
      }
    ];

    list.forEach((item, index) => {
      if (index >= 4) {
        return;
      }

      const corner = corners[index];
      const itemGroup = this.createOrUpdateChild(
        `corner-${index}`,
        {
          x: 0,
          y: 0,
          width: width,
          height: height
        },
        'group'
      ) as IGroup;

      // 创建彩色矩形角
      itemGroup.createOrUpdateChild(
        `rect-${index}`,
        {
          x: corner.x,
          y: corner.y,
          width: corner.width,
          height: corner.height,
          fill: colors[index] || '#4285F4',
          cornerRadius: 4
        },
        'rect'
      );

      // 创建中心图标
      if (item.icon) {
        itemGroup.createOrUpdateChild(
          `center-icon-${index}`,
          {
            x: corner.iconX,
            y: corner.iconY,
            size: iconSize,
            symbolType: 'circle',
            fill: colors[index] || '#4285F4',
            stroke: colors[index] || '#4285F4',
            lineWidth: 2,
            ...item.icon
          },
          'symbol'
        );
      } else {
        // 默认图标
        const defaultIcons = ['rect', 'diamond', 'triangle', 'star'];
        itemGroup.createOrUpdateChild(
          `center-icon-${index}`,
          {
            x: corner.iconX,
            y: corner.iconY,
            size: iconSize,
            symbolType: defaultIcons[index] || 'circle',
            fill: colors[index] || '#4285F4',
            stroke: colors[index] || '#4285F4',
            lineWidth: 2
          },
          'symbol'
        );
      }

      // 创建数字标识背景圆
      itemGroup.createOrUpdateChild(
        `number-bg-${index}`,
        {
          x: corner.numberX,
          y: corner.numberY,
          outerRadius: 15,
          fill: colors[index] || '#4285F4',
          stroke: '#2D3748',
          lineWidth: 2,
          startAngle: 0,
          endAngle: Math.PI * 2
        },
        'arc'
      );

      // 创建数字文字
      itemGroup.createOrUpdateChild(
        `number-text-${index}`,
        {
          x: corner.numberX,
          y: corner.numberY,
          width: 30,
          height: 30,
          textAlign: 'center',
          textBaseline: 'middle',
          fontSize: 16,
          fontWeight: 'bold',
          fill: '#2D3748',
          textConfig: [{ text: corner.number, fontSize: 16, fontWeight: 'bold', fill: '#2D3748' }]
        },
        'richtext'
      );

      // 创建标题
      if (item.title) {
        itemGroup.createOrUpdateChild(
          `title-${index}`,
          {
            x: corner.titleX,
            y: corner.titleY,
            width: 200,
            height: 25,
            textAlign: corner.textAlign,
            textBaseline: 'top',
            fontSize: 16,
            fontWeight: 'bold',
            fill: '#1f2937',
            textConfig: [{ text: `标题 ${index + 1}`, fontSize: 16, fontWeight: 'bold', fill: '#1f2937' }],
            ...item.title
          },
          'richtext'
        );
      }

      // 创建文本内容
      if (item.text) {
        itemGroup.createOrUpdateChild(
          `text-${index}`,
          {
            x: corner.textX,
            y: corner.textY,
            width: 200,
            height: 40,
            textAlign: corner.textAlign,
            textBaseline: 'top',
            fontSize: 14,
            fill: '#6b7280',
            textConfig: [{ text: `内容 ${index + 1}`, fontSize: 14, fill: '#6b7280' }],
            ...item.text
          },
          'richtext'
        );
      }
    });
  }
}
