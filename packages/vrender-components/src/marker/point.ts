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
import { ArcSegment, Segment } from '../segment';
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
import { DefaultExitMarkerAnimation, DefaultUpdateMarkPointAnimation, markPointAnimate } from './animate/animate';
import { deltaXYToAngle, isPostiveXAxis, removeRepeatPoint } from '../util';

loadMarkPointComponent();

export function registerMarkPointAnimate() {
  MarkPoint._animate = markPointAnimate;
}

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
  private _targetItem!: ISymbol;

  private _line?: Segment;

  private _decorativeLine!: ILine;

  constructor(attributes: MarkPointAttrs, options?: ComponentOptions) {
    super(options?.skipDefault ? attributes : merge({}, MarkPoint.defaultAttributes, attributes));
  }

  protected setLabelPos() {
    //do nothing
  }

  protected getTextAlignAttr(
    autoRotate: boolean,
    offsetX: number,
    offsetY: number,
    itemPosition: keyof typeof IMarkPointItemPosition
  ) {
    // 垂直方向例外
    if (offsetX === 0) {
      if (autoRotate) {
        return {
          textAlign: 'right',
          textBaseline: 'middle'
        };
      }
      return {
        textAlign: 'center',
        textBaseline:
          (offsetY > 0 && itemPosition.includes('inside')) || (offsetY < 0 && !itemPosition.includes('inside'))
            ? 'bottom'
            : 'top'
      };
    }

    if (offsetX > 0) {
      return DEFAULT_MARK_POINT_TEXT_STYLE_MAP.postiveXAxis[itemPosition];
    }
    return DEFAULT_MARK_POINT_TEXT_STYLE_MAP.negativeXAxis[itemPosition];
  }

  protected setItemAttributes(
    item: ISymbol | Tag | IImage | IRichText,
    itemContent: IItemContent,
    newPosition: Point,
    newItemPosition: Point,
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
      position: positionType = IMarkPointItemPosition.middle
    } = itemContent;
    const { state } = this.attribute as MarkPointAttrs;
    const lineEndAngle = this._line?.getEndAngle() || 0;
    const itemRefOffsetX = refX * Math.cos(lineEndAngle) + refY * Math.cos(lineEndAngle - Math.PI / 2);
    const itemRefOffsetY = refX * Math.sin(lineEndAngle) + refY * Math.sin(lineEndAngle - Math.PI / 2);
    if (itemType === 'text') {
      const offsetX = newItemPosition.x - newPosition.x;
      const offsetY = newItemPosition.y - newPosition.y;
      item.setAttributes({
        ...(textStyle as TagAttributes),
        textStyle: {
          ...this.getTextAlignAttr(
            autoRotate,
            offsetX,
            offsetY,
            itemContent.position ?? ('end' as keyof typeof IMarkPointItemPosition)
          ),
          ...textStyle.textStyle
        },
        state: {
          panel: merge({}, DEFAULT_STATES, state?.textBackground),
          text: merge({}, DEFAULT_STATES, state?.text)
        }
      } as any);
    } else if (itemType === 'richText') {
      item.setAttributes({
        dx: this.getItemDx(item, positionType, richTextStyle) + (richTextStyle.dx || 0),
        dy: this.getItemDy(item, positionType, richTextStyle) + (richTextStyle.dy || 0)
      });
      item.states = merge({}, DEFAULT_STATES, state?.richText);
    } else if (itemType === 'image') {
      item.setAttributes({
        dx: this.getItemDx(item, positionType, imageStyle) + (imageStyle.dx || 0),
        dy: this.getItemDy(item, positionType, imageStyle) + (imageStyle.dy || 0)
      });
      item.states = merge({}, DEFAULT_STATES, state?.image);
    }

    const itemAngle = isPostiveXAxis(lineEndAngle) ? lineEndAngle : lineEndAngle - Math.PI;

    item.setAttributes({
      x: newItemPosition.x + (itemRefOffsetX || 0),
      y: newItemPosition.y + (itemRefOffsetY || 0),
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

  protected initItem(itemContent: IItemContent, newPosition: Point, newItemPosition: Point) {
    const { state } = this.attribute as MarkPointAttrs;
    const { type = 'text', symbolStyle, richTextStyle, imageStyle, renderCustomCallback } = itemContent;
    let item: ISymbol | Tag | IImage | IRichText | IGroup;
    if (type === 'symbol') {
      item = graphicCreator.symbol({
        ...newItemPosition,
        ...symbolStyle
      });
      item.states = merge({}, DEFAULT_STATES, state?.symbol);
    } else if (type === 'text') {
      item = new Tag({
        ...newItemPosition,
        state: {
          panel: merge({}, DEFAULT_STATES, state?.textBackground),
          text: merge({}, DEFAULT_STATES, state?.text)
        }
      });
    } else if (type === 'richText') {
      item = graphicCreator.richtext({
        ...newItemPosition,
        ...richTextStyle
      });
      item.states = merge({}, DEFAULT_STATES, state?.richText);
    } else if (type === 'image') {
      item = graphicCreator.image({
        ...newItemPosition,
        ...imageStyle
      });
      item.states = merge({}, DEFAULT_STATES, state?.image);
    } else if (type === 'custom' && renderCustomCallback) {
      item = renderCustomCallback();
      item.states = merge({}, DEFAULT_STATES, state?.customMark);
    }
    item.name = `mark-point-${type}`;
    this.setItemAttributes(item, itemContent, newPosition, newItemPosition, type);
    return item;
  }

  protected getItemLineAttr(itemLine: IItemLine, newPosition: Point, newItemPosition: Point) {
    let points: Point[] = [];
    let center = { x: 0, y: 0 };
    let radius = 0;
    let startAngle = 0;
    let endAngle = 0;
    const { type = 'type-s', arcRatio = 0.8 } = itemLine;
    if (type === 'type-arc') {
      const { x: x1, y: y1 } = newPosition;
      const { x: x2, y: y2 } = newItemPosition;
      // 得到中点和斜率
      const x0 = (x1 + x2) / 2;
      const y0 = (y1 + y2) / 2;
      // 得到垂直平分线表达式
      const k = y1 === y2 ? 0 : -(x1 - x2) / (y1 - y2); // 垂直平分线斜率 * 两点连线斜率 = -1
      const line = (x: number) => k * (x - x0) + y0;
      // 在垂直平分线上找圆心
      const deltaX = arcRatio * x0; // 数值决定曲率, 符号决定法向, 可通过配置自定义
      const centerX = x0 + deltaX;
      const centerY = line(centerX);
      center = { x: centerX, y: centerY };
      startAngle = deltaXYToAngle(y1 - centerY, x1 - centerX);
      endAngle = deltaXYToAngle(y2 - centerY, x2 - centerX);
      radius = Math.sqrt((centerX - x1) * (centerX - x1) + (centerY - y1) * (centerY - y1));
    } else if (type === 'type-do') {
      points = [
        newPosition,
        {
          x: (newPosition.x + newItemPosition.x) / 2,
          y: newItemPosition.y
        },
        newItemPosition
      ];
    } else if (type === 'type-po') {
      points = [
        newPosition,
        {
          x: newItemPosition.x,
          y: newPosition.y
        },
        newItemPosition
      ];
    } else if (type === 'type-op') {
      points = [
        newPosition,
        {
          x: newPosition.x,
          y: newItemPosition.y
        },
        newItemPosition
      ];
    } else {
      points = [newPosition, newItemPosition];
    }
    // 插值的过程中可能会产生重复的点, 在此去除
    points = removeRepeatPoint(points);
    return {
      points,
      center,
      radius,
      startAngle,
      endAngle
    };
  }

  protected setItemLineAttr(itemLine: IItemLine, newPosition: Point, newItemPosition: Point, visible: boolean) {
    if (this._line) {
      const { startSymbol, endSymbol, lineStyle, type = 'type-s' } = itemLine;
      const { state } = this.attribute as MarkPointAttrs;
      const pointsAttr = this.getItemLineAttr(itemLine, newPosition, newItemPosition);
      if (
        (type === 'type-arc' && this._line.key === 'arc-segment') ||
        (type !== 'type-arc' && this._line.key === 'segment')
      ) {
        this._line.setAttributes({
          ...pointsAttr,
          startSymbol,
          endSymbol,
          lineStyle,
          visible,
          state: {
            line: merge({}, DEFAULT_STATES, state?.line),
            startSymbol: merge({}, DEFAULT_STATES, state?.lineStartSymbol),
            endSymbol: merge({}, DEFAULT_STATES, state?.lineEndSymbol)
          }
        });
      } else {
        this._line.release();
        const lineConstructor = type === 'type-arc' ? ArcSegment : Segment;
        this._container.removeChild(this._line);
        this._line = new lineConstructor({
          ...pointsAttr,
          pickable: false,
          startSymbol,
          endSymbol,
          lineStyle,
          visible,
          state: {
            line: merge({}, DEFAULT_STATES, state?.line),
            startSymbol: merge({}, DEFAULT_STATES, state?.lineStartSymbol),
            endSymbol: merge({}, DEFAULT_STATES, state?.lineEndSymbol)
          }
        } as any);
        this._container.add(this._line as unknown as INode);
      }
    }
  }

  protected getDecorativeLineAttr(itemLine: IItemLine) {
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

  protected setDecorativeLineAttr(itemLine: IItemLine, newItemPosition: Point, visible: boolean) {
    if (this._decorativeLine) {
      const { lineStyle } = itemLine;
      const { startPointOffsetX, startPointOffsetY, endPointOffsetX, endPointOffsetY } =
        this.getDecorativeLineAttr(itemLine);
      this._decorativeLine.setAttributes({
        points: [
          {
            x: newItemPosition.x + startPointOffsetX,
            y: newItemPosition.y + startPointOffsetY
          },
          {
            x: newItemPosition.x + endPointOffsetX,
            y: newItemPosition.y + endPointOffsetY
          }
        ] as IPointLike[],
        ...(lineStyle as Partial<ILineGraphicAttribute>),
        visible
      });
      this._decorativeLine.states = merge({}, DEFAULT_STATES, this.attribute.state?.line);
    }
  }

  protected setTargetItemAttributes(targetItem: any, position: IPointLike) {
    if (this._targetItem) {
      this._targetItem.setAttributes({
        x: position.x,
        y: position.y,
        visible: targetItem.visible ?? false,
        ...targetItem.style
      });
      this._targetItem.states = merge({}, DEFAULT_STATES, this.attribute.state?.targetItem);
    }
  }

  protected setAllOfItemsAttr(newPosition: Point, newItemPosition: Point) {
    const {
      position,
      itemLine = {},
      itemContent = {},
      limitRect,
      targetItemContent
    } = this.attribute as MarkPointAttrs;
    const { type = 'text', confine } = itemContent;
    if (limitRect && confine) {
      const { x, y, width, height } = limitRect;
      const { dx, dy } = computeOffsetForlimit(this._item, {
        x1: x,
        y1: y,
        x2: x + width,
        y2: y + height
      });
      newItemPosition.x = newItemPosition.x + dx;
      newItemPosition.y = newItemPosition.y + dy;
    }
    this.setTargetItemAttributes(targetItemContent, position);
    this.setItemLineAttr(itemLine, newPosition, newItemPosition, itemLine.visible);
    this.setItemAttributes(this._item, itemContent, newPosition, newItemPosition, type);
    this.setDecorativeLineAttr(itemLine, newItemPosition, itemLine.decorativeLine?.visible);
  }

  protected computeNewPositionAfterTargetItem(position: Point) {
    const { itemContent = {}, targetItemContent } = this.attribute as MarkPointAttrs;
    const { offsetX: itemContentOffsetX = 0, offsetY: itemContentOffsetY = 0 } = itemContent;
    const {
      margin: targetItemContentMargin = 0,
      style: targetItemContentStyle,
      visible: targetItemvisible = false,
      size: targetItemContentSize
    } = targetItemContent;
    const targetSize = targetItemvisible ? targetItemContentSize || (targetItemContentStyle.size ?? 10) : 0;
    const targetOffsetAngle = deltaXYToAngle(itemContentOffsetY, itemContentOffsetX);
    const newPosition: Point = {
      x: position.x + (targetSize + targetItemContentMargin) * Math.cos(targetOffsetAngle),
      y: position.y + (targetSize + targetItemContentMargin) * Math.sin(targetOffsetAngle)
    };
    const newItemPosition: Point = {
      x: position.x + (targetSize + targetItemContentMargin) * Math.cos(targetOffsetAngle) + itemContentOffsetX, // 偏移量 = targetItem size + targetItem space + 用户配置offset
      y: position.y + (targetSize + targetItemContentMargin) * Math.sin(targetOffsetAngle) + itemContentOffsetY // 偏移量 = targetItem size + targetItem space + 用户配置offset
    };

    return { newPosition, newItemPosition };
  }

  protected initMarker(container: IGroup) {
    const { position, itemContent = {}, itemLine } = this.attribute as MarkPointAttrs;
    const { type: itemLineType = 'type-s' } = itemLine;

    /** 根据targetItem计算新的弧线起点 */
    const { newPosition, newItemPosition } = this.computeNewPositionAfterTargetItem(position);

    /** itemline - 连接线 */
    const lineConstructor = itemLineType === 'type-arc' ? ArcSegment : Segment;
    const line = new lineConstructor({
      points: [],
      pickable: false, // 组件容器本身不参与拾取
      center: { x: 0, y: 0 },
      radius: 0,
      startAngle: 0,
      endAngle: 0
    });

    line.name = 'mark-point-line';
    this._line = line;
    container.add(line as unknown as INode);

    /** decorativeLine - 装饰线 */
    const decorativeLine = graphicCreator.line({
      points: []
    });
    decorativeLine.name = 'mark-point-decorativeLine';
    this._decorativeLine = decorativeLine;
    container.add(decorativeLine as unknown as INode);

    /** targetItem - 被标注的点上需要放置的内容 */
    const targetItem = graphicCreator.symbol({});
    targetItem.name = 'mark-point-targetItem';
    this._targetItem = targetItem;
    container.add(this._targetItem);

    /** item - 标注的内容 */
    // 为了强制将itemContent限制在limitRect内, 所以需要先绘制item, 然后根据item bounds 动态调整位置
    const item = this.initItem(itemContent as any, newPosition, newItemPosition);
    this._item = item;
    container.add(item as unknown as INode);

    /** 全部属性确定后, 给每个元素 set attr */
    // 由于itemLine的指向也要变化, 所以需要对所有的内容进行渲染
    this.setAllOfItemsAttr(newPosition, newItemPosition);
  }

  protected updateMarker() {
    const { position, itemContent = {} } = this.attribute as MarkPointAttrs;
    const { type = 'text' } = itemContent;

    /** 根据targetItem计算新的弧线起点 */
    const { newPosition, newItemPosition } = this.computeNewPositionAfterTargetItem(position);

    // 为了强制将itemContent限制在limitRect内, 所以需要先绘制item, 然后根据item bounds 动态调整位置
    this.setItemAttributes(this._item, itemContent, newPosition, newItemPosition, type);
    // 由于itemLine的指向也要变化, 所以需要对所有的内容进行渲染
    this.setAllOfItemsAttr(newPosition, newItemPosition);
  }

  protected isValidPoints() {
    const { position } = this.attribute as MarkPointAttrs;
    if (isValidNumber(position.x) && isValidNumber(position.y)) {
      return true;
    }
    return false;
  }
}
