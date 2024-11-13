/**
 * TODO:
 * align 为 'top' 时，操作区域同标题的间距有问题
 */
import { isValid, normalizePadding } from '@visactor/vutils';
import type { IGroup, INode } from '@visactor/vrender-core';
import { graphicCreator } from '@visactor/vrender-core';
import { AbstractComponent } from '../core/base';
import type { TagAttributes } from '../tag';
import { Tag } from '../tag';
import type { LegendBaseAttributes, LegendTitle } from './type';
import { LEGEND_ELEMENT_NAME } from './constant';

export abstract class LegendBase<T extends LegendBaseAttributes> extends AbstractComponent<Required<T>> {
  name = 'legend';
  protected _innerView!: IGroup;
  protected _title: Tag | null = null;
  protected _parsedPadding: number[];

  render() {
    this.removeAllChild(true);

    const { interactive = true, title, padding = 0 } = this.attribute;
    this._parsedPadding = normalizePadding(padding);

    // 创建一个内部的 container 用于存储所有的元素
    const innerView = graphicCreator.group({
      x: this._parsedPadding[3],
      y: this._parsedPadding[0],
      pickable: interactive,
      childrenPickable: interactive
    });
    innerView.name = LEGEND_ELEMENT_NAME.innerView;
    this.add(innerView);
    this._innerView = innerView;
    if (title?.visible) {
      // 渲染标题
      this._renderTitle(title);
    }

    this._renderContent();

    this._adjustLayout();

    if (interactive) {
      this._bindEvents();
    }

    const viewBounds = this._innerView.AABBBounds;
    this.attribute.width = viewBounds.width() + this._parsedPadding[1] + this._parsedPadding[3];
    this.attribute.height = viewBounds.height() + this._parsedPadding[0] + this._parsedPadding[2];
  }
  /**
   * 图例主体内容渲染
   */
  protected abstract _renderContent(): void;
  /**
   * 事件绑定逻辑
   */
  protected abstract _bindEvents(): void;

  private _renderTitle(title: LegendTitle) {
    const { text = '', textStyle, padding = 0, background, minWidth, maxWidth, shape } = title;

    const tagAttrs: TagAttributes = {
      x: 0,
      y: 0,
      text,
      textStyle,
      padding: normalizePadding(padding),
      minWidth,
      maxWidth
    } as TagAttributes;

    if (shape && shape.visible) {
      tagAttrs.shape = {
        visible: true,
        ...shape.style
      };
      if (isValid(shape.space)) {
        tagAttrs.space = shape.space;
      }
    }

    if (background && background.visible) {
      tagAttrs.panel = {
        visible: true,
        ...background.style
      };
    }

    const titleTag = new Tag(tagAttrs);
    titleTag.name = LEGEND_ELEMENT_NAME.title;
    this._title = titleTag;

    this._innerView.add(titleTag as unknown as INode);
  }

  private _adjustLayout() {
    // 调整 title
    if (this._title) {
      const innerViewWidth = this._innerView.AABBBounds.width();
      const titleWidth = this._title.AABBBounds.width();

      const align = this.attribute.title?.align;
      if (align === 'center') {
        this._title.setAttribute('x', (innerViewWidth - titleWidth) / 2);
      } else if (align === 'end') {
        this._title.setAttribute('x', innerViewWidth - titleWidth);
      }
    }
  }
}
