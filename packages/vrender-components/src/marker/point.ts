import type {
  IGroup,
  IImage,
  INode,
  ISymbol,
  IImageGraphicAttribute,
  IRichText,
  IRichTextGraphicAttribute,
  ILine,
  ILineGraphicAttribute
} from '@visactor/vrender-core';
// eslint-disable-next-line no-duplicate-imports
import { graphicCreator } from '@visactor/vrender-core';
import type { IPointLike } from '@visactor/vutils';
// eslint-disable-next-line no-duplicate-imports
import { isValidNumber, merge } from '@visactor/vutils';
import { Segment } from '../segment';
import type { TagAttributes } from '../tag';
// eslint-disable-next-line no-duplicate-imports
import { Tag } from '../tag';
import { Marker } from './base';
import { DEFAULT_MARK_POINT_TEXT_STYLE_MAP, DEFAULT_MARK_POINT_THEME } from './config';
import type { IItemContent, IItemLine, MarkPointAnimationType, MarkPointAttrs, MarkerAnimationState } from './type';
// eslint-disable-next-line no-duplicate-imports
import { IMarkPointItemPosition } from './type';
import type { Point } from '../core/type';
import type { ComponentOptions } from '../interface';
import { loadMarkPointComponent } from './register';
import { computeOffsetForlimit } from '../util/limit-shape';
import { DEFAULT_STATES } from '../constant';
import { DefaultExitMarkerAnimation, DefaultUpdateMarkPointAnimation } from './animate/animate';

loadMarkPointComponent();

export class MarkPoint extends Marker<MarkPointAttrs, MarkPointAnimationType> {
  name = 'markPoint';
  static defaultAttributes = DEFAULT_MARK_POINT_THEME;

  /** animate */
  defaultUpdateAnimation = DefaultUpdateMarkPointAnimation;
  defaultExitAnimation = DefaultExitMarkerAnimation;
  protected markerAnimate(state: MarkerAnimationState): void {
    if (MarkPoint._animate && this._animationConfig) {
      MarkPoint._animate([this._line, this._decorativeLine], this._item, this._animationConfig, state);
    }
  }

  private _item!: ISymbol | Tag | IImage | IRichText;

  private _line?: Segment;

  private _decorativeLine!: ILine;

  constructor(attributes: MarkPointAttrs, options?: ComponentOptions) {
    super(options?.skipDefault ? attributes : merge({}, MarkPoint.defaultAttributes, attributes));
  }

  protected setLabelPos() {
    //do nothing
  }

  protected setItemAttributes(
    item: ISymbol | Tag | IImage | IRichText,
    itemContent: IItemContent,
    itemPosition: Point,
    itemType: 'symbol' | 'text' | 'image' | 'richText' | 'custom'
  ) {
    if (!item) {
      return;
    }
    const {
      autoRotate = true,
      refX = 0,
      refY = 0,
      refAngle = 0,
      textStyle = {},
      richTextStyle = {},
      imageStyle = {},
      position = IMarkPointItemPosition.middle
    } = itemContent;
    const itemAngle = this._line?.getEndAngle() || 0;
    const itemOffsetX = refX * Math.cos(itemAngle) + refY * Math.cos(itemAngle - Math.PI / 2);
    const itemOffsetY = refX * Math.sin(itemAngle) + refY * Math.sin(itemAngle - Math.PI / 2);
    if (itemType === 'text') {
      item.setAttributes({
        ...(textStyle as TagAttributes),
        textStyle: {
          ...DEFAULT_MARK_POINT_TEXT_STYLE_MAP[itemContent?.position || 'end'],
          ...textStyle.textStyle
        }
      } as any);
    } else if (itemType === 'richText') {
      item.setAttributes({
        dx: this.getItemDx(item, position, richTextStyle) + (richTextStyle.dx || 0),
        dy: this.getItemDy(item, position, richTextStyle) + (richTextStyle.dy || 0)
      });
    } else if (itemType === 'image') {
      item.setAttributes({
        dx: this.getItemDx(item, position, imageStyle) + (imageStyle.dx || 0),
        dy: this.getItemDy(item, position, imageStyle) + (imageStyle.dy || 0)
      });
    }
    item.setAttributes({
      x: itemPosition.x + (itemOffsetX || 0),
      y: itemPosition.y + (itemOffsetY || 0),
      angle: autoRotate && itemAngle + refAngle
    });
  }

  protected getItemDx(
    item: ISymbol | Tag | IImage | IRichText,
    position: keyof typeof IMarkPointItemPosition,
    style?: IImageGraphicAttribute | IRichTextGraphicAttribute
  ) {
    const width = (item as IGroup)?.AABBBounds?.width() ?? (style?.width || 0);
    if (position.includes('inside')) {
      return -width;
    }
    if (position === 'insideTop') {
      return 0;
    }
    return 0;
  }

  protected getItemDy(
    item: ISymbol | Tag | IImage | IRichText,
    position: keyof typeof IMarkPointItemPosition,
    style?: IImageGraphicAttribute | IRichTextGraphicAttribute
  ) {
    const height = (item as IGroup)?.AABBBounds?.height() ?? (style?.height || 0);
    if (position.includes('top') || position.includes('Top')) {
      return -height;
    }
    if (position.includes('middle') || position.includes('Middle')) {
      return -height / 2;
    }
    return 0;
  }

  protected initItem(itemContent: IItemContent, itemPosition: Point) {
    const { state } = this.attribute as MarkPointAttrs;
    const { type = 'text', symbolStyle, richTextStyle, imageStyle, renderCustomCallback } = itemContent;
    let item: ISymbol | Tag | IImage | IRichText | IGroup;
    if (type === 'symbol') {
      item = graphicCreator.symbol({
        ...itemPosition,
        ...symbolStyle
      });
      item.states = merge({}, DEFAULT_STATES, state?.symbol);
    } else if (type === 'text') {
      item = new Tag({
        ...itemPosition,
        state: {
          panel: merge({}, DEFAULT_STATES, state?.textBackground),
          text: merge({}, DEFAULT_STATES, state?.text)
        }
      });
    } else if (type === 'richText') {
      item = graphicCreator.richtext({
        ...itemPosition,
        ...richTextStyle
      });
      item.states = merge({}, DEFAULT_STATES, state?.richText);
    } else if (type === 'image') {
      item = graphicCreator.image({
        ...itemPosition,
        ...imageStyle
      });
      item.states = merge({}, DEFAULT_STATES, state?.image);
    } else if (type === 'custom' && renderCustomCallback) {
      item = renderCustomCallback();
      item.states = merge({}, DEFAULT_STATES, state?.customMark);
    }
    item.name = `mark-point-${type}`;
    this.setItemAttributes(item, itemContent, itemPosition, type);
    return item;
  }

  protected getItemLineAttr(itemLine: IItemLine, position: Point, itemPosition: Point) {
    let points: Point[] = [];
    const { type = 'type-s' } = itemLine;
    if (type === 'type-do') {
      points = [
        position,
        {
          x: (position.x + itemPosition.x) / 2,
          y: itemPosition.y
        },
        itemPosition
      ];
    } else if (type === 'type-po') {
      points = [
        position,
        {
          x: itemPosition.x,
          y: position.y
        },
        itemPosition
      ];
    } else if (type === 'type-op') {
      points = [
        position,
        {
          x: position.x,
          y: itemPosition.y
        },
        itemPosition
      ];
    } else {
      points = [position, itemPosition];
    }
    return points;
  }

  protected setItemLineAttr(itemLine: IItemLine, position: Point, itemPosition: Point, visible: boolean) {
    if (this._line) {
      const { startSymbol, endSymbol, lineStyle } = itemLine;
      const points = this.getItemLineAttr(itemLine, position, itemPosition);
      this._line.setAttributes({
        points,
        startSymbol,
        endSymbol,
        lineStyle,
        visible
      });
    }
  }

  protected getDecorativeLineAttr(itemLine: IItemLine, itemPosition: Point) {
    const decorativeLength = itemLine?.decorativeLine?.length || 10;
    const itemAngle = this._line.getEndAngle() || 0;
    const startPointOffsetX = (decorativeLength / 2) * Math.cos(itemAngle - Math.PI / 2);
    const startPointOffsetY = (decorativeLength / 2) * Math.sin(itemAngle - Math.PI / 2);
    const endPointOffsetX = (-decorativeLength / 2) * Math.cos(itemAngle - Math.PI / 2);
    const endPointOffsetY = (-decorativeLength / 2) * Math.sin(itemAngle - Math.PI / 2);
    return {
      startPointOffsetX,
      startPointOffsetY,
      endPointOffsetX,
      endPointOffsetY
    };
  }

  protected setDecorativeLineAttr(itemLine: IItemLine, itemPosition: Point, visible: boolean) {
    if (this._decorativeLine) {
      const { lineStyle } = itemLine;
      const { startPointOffsetX, startPointOffsetY, endPointOffsetX, endPointOffsetY } = this.getDecorativeLineAttr(
        itemLine,
        itemPosition
      );
      this._decorativeLine.setAttributes({
        points: [
          {
            x: itemPosition.x + startPointOffsetX,
            y: itemPosition.y + startPointOffsetY
          },
          {
            x: itemPosition.x + endPointOffsetX,
            y: itemPosition.y + endPointOffsetY
          }
        ] as IPointLike[],
        ...(lineStyle as Partial<ILineGraphicAttribute>),
        visible
      });
    }
  }

  protected setAllOfItemsAttr(itemPosition: Point) {
    const { position, itemLine = {}, itemContent = {}, limitRect } = this.attribute as MarkPointAttrs;
    const { type = 'text', confine } = itemContent;
    if (limitRect && confine) {
      const { x, y, width, height } = limitRect;
      const { dx, dy } = computeOffsetForlimit(this._item, {
        x1: x,
        y1: y,
        x2: x + width,
        y2: y + height
      });
      itemPosition.x = itemPosition.x + dx;
      itemPosition.y = itemPosition.y + dy;
    }
    this.setItemAttributes(this._item, itemContent, itemPosition, type);
    this.setItemLineAttr(itemLine, position, itemPosition, itemLine.visible);
    this.setDecorativeLineAttr(itemLine, itemPosition, itemLine.decorativeLine?.visible);
  }

  protected initMarker(container: IGroup) {
    const { position, itemContent = {}, state } = this.attribute as MarkPointAttrs;
    const itemPosition = {
      x: position.x + (itemContent.offsetX || 0),
      y: position.y + (itemContent.offsetY || 0)
    };

    const line = new Segment({
      points: [],
      pickable: false, // 组件容器本身不参与拾取
      state: {
        line: merge({}, DEFAULT_STATES, state?.line),
        startSymbol: merge({}, DEFAULT_STATES, state?.lineStartSymbol),
        endSymbol: merge({}, DEFAULT_STATES, state?.lineEndSymbol)
      }
    });
    line.name = 'mark-point-line';
    this._line = line;
    container.add(line as unknown as INode);

    const decorativeLine = graphicCreator.line({
      points: []
    });
    decorativeLine.states = merge({}, DEFAULT_STATES, state?.line);
    decorativeLine.name = 'mark-point-decorativeLine';
    this._decorativeLine = decorativeLine;
    container.add(decorativeLine as unknown as INode);

    // 为了强制将itemContent限制在limitRect内, 所以需要先绘制item, 然后根据item bounds 动态调整位置
    const item = this.initItem(itemContent as any, itemPosition);
    this._item = item;

    // 由于itemLine的指向也要变化, 所以需要对所有的内容进行渲染
    this.setAllOfItemsAttr(itemPosition);
    container.add(item as unknown as INode);
  }

  protected updateMarker() {
    const { position, itemContent = {} } = this.attribute as MarkPointAttrs;
    const { type = 'text' } = itemContent;

    const itemPosition = {
      x: position.x + (itemContent.offsetX || 0),
      y: position.y + (itemContent.offsetY || 0)
    };

    // 为了强制将itemContent限制在limitRect内, 所以需要先绘制item, 然后根据item bounds 动态调整位置
    this.setItemAttributes(this._item, itemContent, itemPosition, type);
    // 由于itemLine的指向也要变化, 所以需要对所有的内容进行渲染
    this.setAllOfItemsAttr(itemPosition);
  }

  protected isValidPoints() {
    const { position } = this.attribute as MarkPointAttrs;
    if (isValidNumber(position.x) && isValidNumber(position.y)) {
      return true;
    }
    return false;
  }
}
