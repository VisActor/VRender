import { merge } from '@visactor/vutils';
import { AbstractComponent } from '../core/base';
import type { IStoryListAttrs } from './type';
import type { ComponentOptions } from '../interface';
import type { IGroup, ISymbol } from '@visactor/vrender-core';
import { loadStoryListComponent } from './register';

loadStoryListComponent();

const path =
  'M 116 -6.564 C 116 -62.1546 73.9994 -107.9355 20 -113.9048 L 20 -132 C 77.9952 -126.5207 124.5468 -81.7319 132.724 -24.564 L 356 -24.564 L 356 -6.564 L 116 -6.564 Z';

export class StoryCircularList extends AbstractComponent<Required<IStoryListAttrs>> {
  static defaultAttributes: Partial<IStoryListAttrs> = {
    colors: ['#8B5CF6', '#8B5CF6', '#8B5CF6', '#8B5CF6'], // 紫色主题
    list: [],
    width: 600,
    height: 600,
    x: 0,
    y: 0
  };

  name: 'story-circular-list' = 'story-circular-list';

  constructor(attributes: IStoryListAttrs, options?: ComponentOptions) {
    super(options?.skipDefault ? attributes : merge({}, StoryCircularList.defaultAttributes, attributes));
  }

  render() {
    this.removeAllChild(true);

    const { list, colors, width, height } = this.attribute;

    if (!list || list.length !== 4) {
      console.warn('StoryCircularList requires exactly 4 list items');
      return;
    }

    const centerX = width / 2;
    const centerY = height / 2;
    const quadrantSize = Math.min(width, height) * 0.35;
    const lineLength = Math.min(width, height) * 0.2;

    // 4个象限的位置配置
    const quadrants = [
      {
        // 右上象限
        angle: -Math.PI / 4,
        textAlign: 'left' as const,
        iconX: centerX + lineLength + 10,
        iconY: centerY - lineLength - 10,
        titleX: centerX + lineLength + 30,
        titleY: centerY - lineLength - 30,
        textX: centerX + lineLength + 30,
        textY: centerY - lineLength - 10,
        lineEndX: centerX + lineLength,
        lineEndY: centerY - lineLength
      },
      {
        // 右下象限
        angle: Math.PI / 4,
        textAlign: 'left' as const,
        iconX: centerX + lineLength + 10,
        iconY: centerY + lineLength + 10,
        titleX: centerX + lineLength + 30,
        titleY: centerY + lineLength - 10,
        textX: centerX + lineLength + 30,
        textY: centerY + lineLength + 10,
        lineEndX: centerX + lineLength,
        lineEndY: centerY + lineLength
      },
      {
        // 左下象限
        angle: (Math.PI * 3) / 4,
        textAlign: 'right' as const,
        iconX: centerX - lineLength - 10,
        iconY: centerY + lineLength + 10,
        titleX: centerX - lineLength - 30,
        titleY: centerY + lineLength - 10,
        textX: centerX - lineLength - 30,
        textY: centerY + lineLength + 10,
        lineEndX: centerX - lineLength,
        lineEndY: centerY + lineLength
      },
      {
        // 左上象限
        angle: (-Math.PI * 3) / 4,
        textAlign: 'right' as const,
        iconX: centerX - lineLength - 10,
        iconY: centerY - lineLength - 10,
        titleX: centerX - lineLength - 30,
        titleY: centerY - lineLength - 30,
        textX: centerX - lineLength - 30,
        textY: centerY - lineLength - 10,
        lineEndX: centerX - lineLength,
        lineEndY: centerY - lineLength
      }
    ];

    for (let i = 0; i < 4; i++) {
      this.createOrUpdateChild(
        `quadrant-${i}-path`,
        {
          x: width / 2,
          y: height / 2,
          size: [width / 2, height / 2],
          angle: (Math.PI / 2) * i,
          symbolType: path,
          fill: colors[i] || '#8B5CF6'
        },
        'symbol'
      ) as ISymbol;
    }

    list.forEach((item, index) => {
      if (index >= 4) {
        return;
      }

      const quadrant = quadrants[index];
      const itemGroup = this.createOrUpdateChild(
        `quadrant-${index}`,
        {
          x: 0,
          y: 0,
          width: width,
          height: height
        },
        'group'
      ) as IGroup;

      // 创建象限背景（可选的装饰矩形）
      const quadrantWidth = quadrantSize;

      // 创建图标
      if (item.icon) {
        itemGroup.createOrUpdateChild(
          `icon-${index}`,
          {
            x: quadrant.iconX,
            y: quadrant.iconY,
            size: 30,
            symbolType: 'circle',
            ...item.icon,
            fill: colors[index]
          },
          'symbol'
        ) as ISymbol;
      } else {
        // 默认图标
        const defaultIcons = ['rect', 'diamond', 'triangle', 'star'];
        itemGroup.createOrUpdateChild(
          `icon-${index}`,
          {
            x: quadrant.iconX,
            y: quadrant.iconY,
            size: 30,
            symbolType: defaultIcons[index] || 'circle',
            fill: '#FFFFFF'
          },
          'symbol'
        );
      }

      // 创建标题
      if (item.title) {
        itemGroup.createOrUpdateChild(
          `title-${index}`,
          {
            x: quadrant.titleX,
            y: quadrant.titleY,
            width: quadrantWidth,
            height: 25,
            textAlign: quadrant.textAlign,
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
            x: quadrant.textX,
            y: quadrant.textY,
            width: quadrantWidth,
            height: 40,
            textAlign: quadrant.textAlign,
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
