import { merge } from '@visactor/vutils';
import { AbstractComponent } from '../core/base';
import type { IStoryListAttrs } from './type';
import type { ComponentOptions } from '../interface';
import type { IGroup } from '@visactor/vrender-core';
import { loadStoryListComponent } from './register';

loadStoryListComponent();

export class StoryNormalList extends AbstractComponent<Required<IStoryListAttrs>> {
  static defaultAttributes: Partial<IStoryListAttrs> = {
    colors: ['#E8F3FF', '#FFE8E8', '#E8FFE8', '#FFF8E8'],
    list: [],
    width: 300,
    height: 200,
    x: 0,
    y: 0
  };

  name: 'story-normal-list' = 'story-normal-list';

  constructor(attributes: IStoryListAttrs, options?: ComponentOptions) {
    super(options?.skipDefault ? attributes : merge({}, StoryNormalList.defaultAttributes, attributes));
  }

  render() {
    this.removeAllChild(true);

    const { list, colors, width, height } = this.attribute;

    if (!list || list.length === 0) {
      return;
    }

    const itemHeight = height / list.length;
    const padding = 12;
    const iconSize = 16;
    const spaceBetweenItems = 8;

    list.forEach((item, index) => {
      const itemGroup = this.createOrUpdateChild(
        `story-item-${index}`,
        {
          x: 0,
          y: index * itemHeight,
          width: width,
          height: itemHeight
        },
        'group'
      ) as IGroup;

      // 背景色（可选）
      const bgColor = colors[index % colors.length];
      if (bgColor) {
        itemGroup.createOrUpdateChild(
          `bg-${index}`,
          {
            x: 0,
            y: 0,
            width: width,
            height: itemHeight,
            fill: bgColor,
            cornerRadius: 4
          },
          'rect'
        );
      }

      // 创建图标
      if (item.icon) {
        itemGroup.createOrUpdateChild(
          `icon-${index}`,
          {
            x: padding,
            y: itemHeight / 2,
            size: iconSize,
            symbolType: 'circle',
            fill: '#6366f1',
            ...item.icon
          },
          'symbol'
        );
      } else {
        // 默认圆点图标
        itemGroup.createOrUpdateChild(
          `icon-${index}`,
          {
            x: padding,
            y: itemHeight / 2,
            size: iconSize,
            symbolType: 'circle',
            fill: '#6366f1'
          },
          'symbol'
        );
      }

      const contentX = padding + iconSize + spaceBetweenItems;
      const contentWidth = width - contentX - padding;

      // 创建标题
      if (item.title) {
        const titleY = itemHeight / 2 - (item.text ? 10 : 0);
        itemGroup.createOrUpdateChild(
          `title-${index}`,
          {
            x: contentX,
            y: titleY,
            width: contentWidth,
            height: 20,
            textAlign: 'left',
            textBaseline: 'middle',
            fontSize: 14,
            fontWeight: 'bold',
            fill: '#1f2937',
            textConfig: [{ text: `标题 ${index + 1}`, fontSize: 14, fontWeight: 'bold', fill: '#1f2937' }],
            ...item.title
          },
          'richtext'
        );
      }

      // 创建文本内容
      if (item.text) {
        const textY = itemHeight / 2 + Math.max(Math.min(item.title ? 10 : 0, height - 40), 0);
        itemGroup.createOrUpdateChild(
          `text-${index}`,
          {
            x: contentX,
            y: textY,
            width: contentWidth,
            height: 20,
            textAlign: 'left',
            textBaseline: 'middle',
            fontSize: 12,
            fill: '#6b7280',
            textConfig: [{ text: `内容 ${index + 1}`, fontSize: 12, fill: '#6b7280' }],
            ...item.text
          },
          'richtext'
        );
      }
    });
  }
}
