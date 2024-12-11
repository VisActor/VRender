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
import { DEFAULT_MARK_POINT_TEXT_STYLE_MAP, DEFAULT_MARK_POINT_THEME, FUZZY_EQUAL_DELTA } from './config';
import type { IItemContent, IItemLine, MarkPointAnimationType, MarkPointAttrs, MarkerAnimationState } from './type';
// eslint-disable-next-line no-duplicate-imports
import { IMarkPointItemPosition } from './type';
import type { Point } from '../core/type';
import type { ComponentOptions } from '../interface';
import { loadMarkPointComponent } from './register';
import { computeOffsetForlimit } from '../util/limit-shape';
import { DEFAULT_STATES } from '../constant';
import { DefaultExitMarkerAnimation, DefaultUpdateMarkPointAnimation, markPointAnimate } from './animate/animate';
import {
  deltaXYToAngle,
  fuzzyEqualNumber,
  getTextAlignAttrOfVerticalDir,
  isPostiveXAxis,
  removeRepeatPoint
} from '../util';

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
  private _isArcLine: boolean = false; // 用于区分 arc-segment 和 segment
  private _isStraightLine: boolean = false; // 用于区分绘制 纯直线 和 折线,（type-do/op/po时, 如果偏移量很小, 视觉无法分辨, 也需要绘制成直线）

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
    lineEndAngle: number,
    itemPosition: keyof typeof IMarkPointItemPosition
  ) {
    // 垂直方向例外
    if (
      fuzzyEqualNumber(Math.abs(lineEndAngle), Math.PI / 2, FUZZY_EQUAL_DELTA) ||
      fuzzyEqualNumber(Math.abs(lineEndAngle), (Math.PI * 3) / 2, FUZZY_EQUAL_DELTA)
    ) {
      return getTextAlignAttrOfVerticalDir(autoRotate, lineEndAngle, itemPosition);
    }

    if (isPostiveXAxis(lineEndAngle)) {
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
            lineEndAngle,
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
    // confine之后位置会变化，所以这里需要重新check是否是直线
    const itemOffsetX = newItemPosition.x - newPosition.x;
    const itemOffsetY = newItemPosition.y - newPosition.y;
    this._isStraightLine =
      fuzzyEqualNumber(itemOffsetX, 0, FUZZY_EQUAL_DELTA) || fuzzyEqualNumber(itemOffsetY, 0, FUZZY_EQUAL_DELTA);
    if (this._isArcLine) {
      // 思路:
      // 1. 以数据位置为起点, 标记内容的位置为终点绘制圆弧
      //    - 在起点与终点的垂直平分线上找圆心
      //    - 根据圆心计算半径
      //    - 根据圆心计算起始角度和结束角度
      // 2. 根据数据位置上要绘制的targetSymbol调整起始角度, 保证标记线上的startSymbol紧贴在targetSymbol上
      //    ps: 计算时将targetSymbol看作圆, 如果是其他不规则形状, 无法保证
      //    - 直接计算圆弧与targetSymbol的交点 到 圆心 的角度(也可以先计算交点的准确坐标, 但需解二元二次方程, 可行却没必要)
      //    - 用计算好的起始角度 - 交点到圆心的角度, 得到最终起始角度
      // 3. 根据是否为凹凸圆弧, 进行角度的进一步加工

      const { x: x1, y: y1 } = this.attribute.position;
      const { x: x2, y: y2 } = newItemPosition;
      // 得到中点和斜率
      const x0 = (x1 + x2) / 2;
      const y0 = (y1 + y2) / 2;
      // 得到垂直平分线表达式
      const k = y1 === y2 ? 0 : -(x1 - x2) / (y1 - y2); // 垂直平分线斜率 * 两点连线斜率 = -1
      const line = (x: number) => k * (x - x0) + y0;
      // 在垂直平分线上找圆心
      const direction = y2 > y1 ? -1 : 1;
      const deltaX = arcRatio * direction * x0; // 数值决定曲率, 符号决定法向, 可通过配置自定义
      const centerX = x0 + deltaX;
      const centerY = line(centerX);
      // 计算半径和角度
      startAngle = deltaXYToAngle(y1 - centerY, x1 - centerX);
      endAngle = deltaXYToAngle(y2 - centerY, x2 - centerX);
      center = { x: centerX, y: centerY };

      // 圆弧与symbol交点的角度
      const R = Math.sqrt((centerX - x1) * (centerX - x1) + (centerY - y1) * (centerY - y1));
      const r = this.attribute.targetSymbol.style.size / 2;
      const deltaAngle = Math.acos(Math.sqrt(1 - (r * r) / (4 * R * R))) * 2;
      startAngle = startAngle + deltaAngle;

      if (arcRatio > 0) {
        // 此时绘制凹圆弧, 顺时针绘制
        // 根据arc图元绘制逻辑, 需要保证endAngle > startAngle, 才能顺时针绘制
        if (endAngle < startAngle) {
          endAngle += Math.PI * 2;
        }
      } else {
        // 此时绘制凸圆弧, 顺时针绘制
        // 根据arc图元绘制逻辑, 需要保证endAngle < startAngle, 才能逆时针绘制
        if (startAngle < endAngle) {
          startAngle += Math.PI * 2;
        }
      }

      radius = Math.sqrt((centerX - x1) * (centerX - x1) + (centerY - y1) * (centerY - y1));
    } else if (type === 'type-do' && !this._isStraightLine) {
      points = [
        newPosition,
        {
          x: (newPosition.x + newItemPosition.x) / 2,
          y: newItemPosition.y
        },
        newItemPosition
      ];
    } else if (type === 'type-po' && !this._isStraightLine) {
      points = [
        newPosition,
        {
          x: newItemPosition.x,
          y: newPosition.y
        },
        newItemPosition
      ];
    } else if (type === 'type-op' && !this._isStraightLine) {
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

  protected reDrawLine(itemLine: IItemLine, pointsAttr: any) {
    this._line.release();
    const { startSymbol, endSymbol, lineStyle, type = 'type-s' } = itemLine;
    const { state } = this.attribute as MarkPointAttrs;
    const lineConstructor = this._isArcLine ? ArcSegment : Segment;
    this._container.removeChild(this._line);
    this._line = new lineConstructor({
      ...pointsAttr,
      pickable: false,
      startSymbol,
      endSymbol,
      lineStyle,
      visible: itemLine.visible,
      state: {
        line: merge({}, DEFAULT_STATES, state?.line),
        startSymbol: merge({}, DEFAULT_STATES, state?.lineStartSymbol),
        endSymbol: merge({}, DEFAULT_STATES, state?.lineEndSymbol)
      }
    } as any);
    this._container.add(this._line as unknown as INode);
  }

  protected setItemLineAttr(itemLine: IItemLine, newPosition: Point, newItemPosition: Point) {
    if (this._line) {
      const { startSymbol, endSymbol, lineStyle, type = 'type-s' } = itemLine;
      const { state } = this.attribute as MarkPointAttrs;
      const pointsAttr = this.getItemLineAttr(itemLine, newPosition, newItemPosition);
      if ((this._isArcLine && this._line.key === 'arc-segment') || (!this._isArcLine && this._line.key === 'segment')) {
        this._line.setAttributes({
          ...pointsAttr,
          startSymbol,
          endSymbol,
          lineStyle,
          visible: itemLine.visible,
          state: {
            line: merge({}, DEFAULT_STATES, state?.line),
            startSymbol: merge({}, DEFAULT_STATES, state?.lineStartSymbol),
            endSymbol: merge({}, DEFAULT_STATES, state?.lineEndSymbol)
          }
        });
      } else {
        this.reDrawLine(itemLine, pointsAttr);
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
        size: targetItem.size,
        ...targetItem.style
      });
      this._targetItem.states = merge({}, DEFAULT_STATES, this.attribute.state?.targetItem);
    }
  }

  protected setAllOfItemsAttr(newPosition: Point, newItemPosition: Point) {
    const { position, itemLine = {}, itemContent = {}, limitRect, targetSymbol } = this.attribute as MarkPointAttrs;
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
    this.setTargetItemAttributes(targetSymbol, position);
    this.setItemLineAttr(itemLine, newPosition, newItemPosition);
    this.setItemAttributes(this._item, itemContent, newPosition, newItemPosition, type);
    this.setDecorativeLineAttr(itemLine, newItemPosition, itemLine.decorativeLine?.visible);
  }

  protected computeNewPositionAfterTargetItem(position: Point) {
    const { itemContent = {}, targetSymbol, itemLine } = this.attribute as MarkPointAttrs;
    const { offsetX: itemContentOffsetX = 0, offsetY: itemContentOffsetY = 0 } = itemContent;
    const {
      offset: targetSymbolOffset = 0,
      style: targetSymbolStyle,
      visible: targetItemvisible = false,
      size: targetSymbolSize
    } = targetSymbol;
    const targetSize = targetItemvisible ? targetSymbolStyle.size ?? targetSymbolSize ?? 20 : 0;

    let targetOffsetAngle;
    if (itemLine.type === 'type-do') {
      targetOffsetAngle = deltaXYToAngle(itemContentOffsetY, itemContentOffsetX / 2);
    } else if (itemLine.type === 'type-po') {
      targetOffsetAngle = deltaXYToAngle(0, itemContentOffsetX);
    } else if (itemLine.type === 'type-op') {
      targetOffsetAngle = deltaXYToAngle(itemContentOffsetY, 0);
    } else {
      targetOffsetAngle = deltaXYToAngle(itemContentOffsetY, itemContentOffsetX);
    }

    const newPosition: Point = {
      x: position.x + (targetSize / 2 + targetSymbolOffset) * Math.cos(targetOffsetAngle),
      y: position.y + (targetSize / 2 + targetSymbolOffset) * Math.sin(targetOffsetAngle)
    };
    const newItemPosition: Point = {
      x: position.x + (targetSize / 2 + targetSymbolOffset) * Math.cos(targetOffsetAngle) + itemContentOffsetX, // 偏移量 = targetItem size + targetItem space + 用户配置offset
      y: position.y + (targetSize / 2 + targetSymbolOffset) * Math.sin(targetOffsetAngle) + itemContentOffsetY // 偏移量 = targetItem size + targetItem space + 用户配置offset
    };
    return { newPosition, newItemPosition };
  }

  protected initMarker(container: IGroup) {
    const { position, itemContent = {}, itemLine } = this.attribute as MarkPointAttrs;
    const { type: itemLineType = 'type-s', arcRatio = 0.8 } = itemLine;
    const { offsetX = 0, offsetY = 0 } = itemContent;

    this._isStraightLine =
      fuzzyEqualNumber(offsetX, 0, FUZZY_EQUAL_DELTA) || fuzzyEqualNumber(offsetY, 0, FUZZY_EQUAL_DELTA);
    this._isArcLine = itemLineType === 'type-arc' && arcRatio !== 0 && !this._isStraightLine;

    /** 根据targetItem计算新的弧线起点 */
    const { newPosition, newItemPosition } = this.computeNewPositionAfterTargetItem(position);

    /** itemline - 连接线 */

    const lineConstructor = this._isArcLine ? ArcSegment : Segment;
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
    const { position, itemContent = {}, itemLine } = this.attribute as MarkPointAttrs;
    const { type = 'text' } = itemContent;
    const { type: itemLineType = 'type-s', arcRatio = 0.8 } = itemLine;
    const { offsetX = 0, offsetY = 0 } = itemContent;

    this._isStraightLine =
      fuzzyEqualNumber(offsetX, 0, FUZZY_EQUAL_DELTA) || fuzzyEqualNumber(offsetY, 0, FUZZY_EQUAL_DELTA);
    const isArcLine = itemLineType === 'type-arc' && arcRatio !== 0 && !this._isStraightLine;
    /** 根据targetItem计算新的弧线起点 */
    const { newPosition, newItemPosition } = this.computeNewPositionAfterTargetItem(position);

    if (isArcLine !== this._isArcLine) {
      // 如果曲线和直线相互切换了, 则需要重新绘制line
      this._isArcLine = isArcLine;
      this.reDrawLine(itemLine, {
        points: [{ x: 0, y: 0 }],
        pickable: false,
        center: { x: 0, y: 0 },
        radius: 0,
        startAngle: 0,
        endAngle: 0
      });
    } else {
      this._isArcLine = isArcLine;
    }

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
