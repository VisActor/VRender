/**
 * @description Label 基类
 */
import type {
  IGroup,
  Text,
  IGraphic,
  IText,
  FederatedPointerEvent,
  IColor,
  ILine,
  IArea,
  IRichText,
  ILineGraphicAttribute,
  ILinearGradient
} from '@visactor/vrender-core';
// eslint-disable-next-line no-duplicate-imports
import { graphicCreator, AttributeUpdateType, IContainPointMode, CustomPath2D } from '@visactor/vrender-core';
import type { IAABBBounds, IBoundsLike, IPointLike } from '@visactor/vutils';
// eslint-disable-next-line no-duplicate-imports
import {
  isFunction,
  isEmpty,
  isValid,
  isString,
  merge,
  isRectIntersect,
  isNil,
  isArray,
  isObject
} from '@visactor/vutils';
import { AbstractComponent } from '../core/base';
import type { PointLocationCfg } from '../core/type';
import { labelSmartInvert, contrastAccessibilityChecker, smartInvertStrategy } from '../util/label-smartInvert';
import { createTextGraphicByType, getMarksByName, getNoneGroupMarksByName, traverseGroup } from '../util';
import { StateValue } from '../constant';
import type { Bitmap, BitmapTool } from './overlap';
// eslint-disable-next-line no-duplicate-imports
import { bitmapTool, boundToRange, canPlace, clampText, place } from './overlap';
import type {
  BaseLabelAttrs,
  OverlapAttrs,
  ILabelAnimation,
  LabelItem,
  SmartInvertAttrs,
  ILabelEnterAnimation,
  ILabelExitAnimation,
  ILabelUpdateAnimation,
  LabelContent,
  ShiftYStrategy,
  Strategy
} from './type';
import { DefaultLabelAnimation, getAnimationAttributes, updateAnimation } from './animate/animate';
import { connectLineBetweenBounds, getPointsOfLineArea } from './util';
import type { ComponentOptions } from '../interface';
import { loadLabelComponent } from './register';
import { shiftY } from './overlap/shiftY';

loadLabelComponent();
export class LabelBase<T extends BaseLabelAttrs> extends AbstractComponent<T> {
  name = 'label';

  protected _baseMarks?: IGraphic[];

  protected _isCollectionBase: boolean;

  protected _bitmap?: Bitmap;

  // parsed animation config
  protected _animationConfig?: {
    enter: ILabelEnterAnimation | false;
    exit: ILabelExitAnimation | false;
    update: ILabelUpdateAnimation | false;
  };

  static defaultAttributes: Partial<BaseLabelAttrs> = {
    textStyle: {
      fontSize: 12,
      // FIXME: we need a default color. Yet in current logic, textStyle will override fill from baseMark.
      // This need a new config option like `colorFull`
      // fill: '#000',
      textAlign: 'center',
      textBaseline: 'middle',
      boundsPadding: [-2, -1, -2, -1] // to ignore the textBound buf
    },
    offset: 0,
    pickable: false
  };

  setBitmap(bitmap: Bitmap) {
    this._bitmap = bitmap;
  }

  protected _bmpTool?: ReturnType<typeof bitmapTool>;
  setBitmapTool(bmpTool: ReturnType<typeof bitmapTool>) {
    this._bmpTool = bmpTool;
  }

  protected _graphicToText: Map<IGraphic, LabelContent>;

  protected _idToGraphic: Map<string, IGraphic>;

  protected _idToPoint: Map<string, IPointLike>;

  private _lastHover: IGraphic;
  private _lastSelect: IGraphic;

  private _enableAnimation: boolean;

  constructor(attributes: BaseLabelAttrs, options?: ComponentOptions) {
    const { data, ...restAttributes } = attributes;
    super(options?.skipDefault ? attributes : { data, ...merge({}, LabelBase.defaultAttributes, restAttributes) });
  }

  /**
   * 计算 text 的最终位置属性x, y
   * @param textBounds
   * @param graphicBounds
   * @param position
   * @param offset
   * @returns
   */
  protected labeling(
    textBounds: IBoundsLike,
    graphicBounds: IBoundsLike,
    position?: BaseLabelAttrs['position'],
    offset?: number
  ): { x: number; y: number } | undefined {
    // 基类没有指定的图元类型，需要在 data 中指定位置，故无需进行 labeling
    return;
  }

  protected _getLabelLinePoints(text: IText | IRichText, baseMark?: IGraphic) {
    return connectLineBetweenBounds(text.AABBBounds, baseMark?.AABBBounds);
  }

  protected _createLabelLine(text: IText | IRichText, baseMark?: IGraphic): ILine | undefined {
    const points = this._getLabelLinePoints(text, baseMark);
    if (points) {
      const lineGraphic = graphicCreator.line({
        points
      });

      const { line = {} } = text.attribute as any;

      if (line.customShape) {
        const customShape = line.customShape;
        lineGraphic.pathProxy = (attrs: Partial<ILineGraphicAttribute>) => {
          return customShape(
            {
              text,
              baseMark: baseMark
            },
            attrs,
            new CustomPath2D()
          );
        };
      }

      if (baseMark && baseMark.attribute.fill) {
        lineGraphic.setAttribute('stroke', baseMark.attribute.fill);
      }

      if (this.attribute.line && !isEmpty(this.attribute.line.style)) {
        lineGraphic.setAttributes(this.attribute.line.style);
      }
      this._setStatesOfLabelLine(lineGraphic);
      return lineGraphic;
    }
  }

  protected render() {
    this._prepare();
    if (isNil(this._idToGraphic) || (this._isCollectionBase && isNil(this._idToPoint))) {
      return;
    }

    const { overlap, smartInvert, dataFilter, customLayoutFunc, customOverlapFunc } = this.attribute;
    let data = this.attribute.data;

    if (isFunction(dataFilter)) {
      data = dataFilter(data);
    }

    if (data && data.length) {
      // 数据保护，防止重复 id 造成不可预知的问题
      const seenIds = new Set();
      data = data.filter(d => !seenIds.has(d.id) && seenIds.add(d.id));
    }

    let labels: (IText | IRichText)[] = this._initText(data);

    if (isFunction(customLayoutFunc)) {
      labels = customLayoutFunc(
        data,
        labels,
        this.getRelatedGraphic.bind(this),
        this._isCollectionBase ? (d: LabelItem) => this._idToPoint.get(d.id) : null
      );
    } else {
      // 根据关联图元和配置的position计算标签坐标
      labels = this._layout(labels);
    }

    if (isFunction(customOverlapFunc)) {
      labels = customOverlapFunc(
        labels as Text[],
        this.getRelatedGraphic.bind(this),
        this._isCollectionBase ? (d: LabelItem) => this._idToPoint.get(d.id) : null
      );
    } else {
      // 防重叠逻辑
      if (overlap !== false) {
        labels = this._overlapping(labels);
      }
    }

    if (isFunction(this.attribute.onAfterOverlapping)) {
      this.attribute.onAfterOverlapping(
        labels as Text[],
        this.getRelatedGraphic.bind(this),
        this._isCollectionBase ? (d: LabelItem) => this._idToPoint.get(d.id) : null
      );
    }

    if (labels && labels.length) {
      labels.forEach(label => {
        this._bindEvent(label);
        this._setStatesOfText(label);
      });
    }

    if (smartInvert !== false) {
      this._smartInvert(labels);
    }

    this._renderLabels(labels);
  }

  private _bindEvent(target: IGraphic) {
    if (this.attribute.disableTriggerEvent) {
      return;
    }
    if (!target) {
      return;
    }

    const { hover, select } = this.attribute;

    if (hover) {
      target.addEventListener('pointermove', this._onHover as EventListenerOrEventListenerObject);
      target.addEventListener('pointerout', this._onUnHover as EventListenerOrEventListenerObject);
    }

    if (select) {
      target.addEventListener('pointerdown', this._onClick as EventListenerOrEventListenerObject);
    }
  }

  private _setStatesOfText(target: IGraphic) {
    if (!target) {
      return;
    }
    const state = this.attribute.state;

    if (!state || isEmpty(state)) {
      return;
    }

    target.states = state;
  }

  protected _setStatesOfLabelLine(target: IGraphic) {
    if (!target) {
      return;
    }
    const state = this.attribute.labelLineState;

    if (!state || isEmpty(state)) {
      return;
    }

    target.states = state;
  }

  private _onHover = (e: FederatedPointerEvent) => {
    const target = e.target as unknown as IGraphic;
    if (target !== this._lastHover && !isEmpty(target.states)) {
      target.addState(StateValue.hover, true);
      traverseGroup(this as unknown as IGraphic, (node: IGraphic) => {
        if (node !== target && !isEmpty(node.states)) {
          node.addState(StateValue.hoverReverse, true);
        }
      });
      this._lastHover = target;
    }
  };

  private _onUnHover = (e: FederatedPointerEvent) => {
    if (this._lastHover) {
      traverseGroup(this as unknown as IGraphic, (node: IGraphic) => {
        if (!isEmpty(node.states)) {
          node.removeState(StateValue.hoverReverse);
          node.removeState(StateValue.hover);
        }
      });
      this._lastHover = null;
    }
  };

  private _onClick = (e: FederatedPointerEvent) => {
    const target = e.target as unknown as IGraphic;
    if (this._lastSelect === target && target.hasState('selected')) {
      // 取消选中
      this._lastSelect = null;
      traverseGroup(this as unknown as IGraphic, (node: IGraphic) => {
        if (!isEmpty(node.states)) {
          node.removeState(StateValue.selectedReverse);
          node.removeState(StateValue.selected);
        }
      });
      return;
    }

    if (!isEmpty(target.states)) {
      target.addState(StateValue.selected, true);
      traverseGroup(this as unknown as IGraphic, (node: IGraphic) => {
        if (node !== target && !isEmpty(node.states)) {
          node.addState(StateValue.selectedReverse, true);
        }
      });
      this._lastSelect = target;
    }
  };

  protected _createLabelText(attributes: LabelItem) {
    const textAttrs = {
      ...this.stage?.getTheme()?.text,
      ...attributes
    };
    return createTextGraphicByType(textAttrs, 'textType');
  }

  private _prepare() {
    const currentBaseMarks: IGraphic[] = [];
    let baseMarks;
    if (isFunction(this.attribute.getBaseMarks)) {
      baseMarks = this.attribute.getBaseMarks();
    } else {
      baseMarks = getMarksByName(this.getRootNode() as IGroup, this.attribute.baseMarkGroupName);
    }

    baseMarks.forEach(mark => {
      if ((mark as any).releaseStatus !== 'willRelease') {
        currentBaseMarks.push(mark);
      }
    });

    this._idToGraphic?.clear();
    this._idToPoint?.clear();
    this._baseMarks = currentBaseMarks;
    this._isCollectionBase = this.attribute.type === 'line-data';

    if (!currentBaseMarks || currentBaseMarks.length === 0) {
      return;
    }

    const { data } = this.attribute;

    if (!data || data.length === 0) {
      return;
    }
    if (!this._idToGraphic) {
      this._idToGraphic = new Map();
    }

    // generate id mapping before data filter
    if (this._isCollectionBase) {
      if (!this._idToPoint) {
        this._idToPoint = new Map();
      }
      let cur = 0;
      for (let i = 0; i < currentBaseMarks.length; i++) {
        const baseMark = currentBaseMarks[i];
        const points = getPointsOfLineArea(baseMark as ILine | IArea);

        if (points && points.length) {
          for (let j = 0; j < points.length; j++) {
            const textData = data[cur];
            if (textData && points[j]) {
              if (!isValid(textData.id)) {
                textData.id = `vrender-component-${this.name}-${cur}`;
              }
              this._idToPoint.set(textData.id, points[j]);
              this._idToGraphic.set(textData.id, baseMark);
            }

            cur++;
          }
        }
      }
    } else {
      for (let i = 0; i < currentBaseMarks.length; i++) {
        const textData = data[i];
        const baseMark = currentBaseMarks[i] as IGraphic;
        if (textData && baseMark) {
          if (!isValid(textData.id)) {
            textData.id = `vrender-component-${this.name}-${i}`;
          }
          this._idToGraphic.set(textData.id, baseMark);
        }
      }
    }

    if (this.attribute.animation !== false) {
      const { animation, animationEnter, animationExit, animationUpdate } = this.attribute;
      const animationCfg = isObject(animation) ? animation : {};
      this._animationConfig = {
        enter: animationEnter !== false ? merge({}, DefaultLabelAnimation, animationCfg, animationEnter ?? {}) : false,
        exit: animationExit !== false ? merge({}, DefaultLabelAnimation, animationCfg, animationExit ?? {}) : false,
        update:
          animationUpdate !== false
            ? isArray(animationUpdate)
              ? animationUpdate
              : merge({}, DefaultLabelAnimation, animationCfg, animationUpdate ?? {})
            : false
      };
    } else {
      this._animationConfig = {
        enter: false,
        exit: false,
        update: false
      };
    }
  }

  protected getRelatedGraphic(item: LabelItem) {
    return this._idToGraphic.get(item.id);
  }

  protected _initText(data: LabelItem[] = []): (IText | IRichText)[] {
    const { textStyle = {} } = this.attribute;
    const labels = [];
    for (let i = 0; i < data.length; i++) {
      const textData = data[i];
      const baseMark = this.getRelatedGraphic(textData);
      if (!baseMark) {
        continue;
      }

      const labelAttribute = {
        fill: this._isCollectionBase
          ? isArray(baseMark.attribute.stroke)
            ? baseMark.attribute.stroke.find(entry => !!entry && entry !== true)
            : baseMark.attribute.stroke
          : baseMark.attribute.fill,
        ...textStyle,
        ...textData
      };
      const text = this._createLabelText(labelAttribute);
      labels.push(text);
    }

    return labels;
  }

  protected _layout(texts: (IText | IRichText)[]): (IText | IRichText)[] {
    const { position, offset } = this.attribute;
    for (let i = 0; i < texts.length; i++) {
      const text = texts[i];
      if (!text) {
        return;
      }
      const textData = text.attribute as LabelItem;
      const baseMark = this.getRelatedGraphic(textData);
      if (!baseMark) {
        continue;
      }

      text.attachedThemeGraphic = this as any;
      const textBounds = this.getGraphicBounds(text);
      text.attachedThemeGraphic = null;
      const actualPosition = isFunction(position) ? position(textData) : (position as string);

      const graphicBounds = this._isCollectionBase
        ? this.getGraphicBounds(null, this._idToPoint.get(textData.id), actualPosition)
        : this.getGraphicBounds(baseMark, { x: textData.x as number, y: textData.y as number }, actualPosition);

      const textLocation = this.labeling(textBounds, graphicBounds, actualPosition, offset);

      if (textLocation) {
        text.setAttributes(textLocation);
      }
    }

    return texts;
  }

  protected _overlapping(labels: (IText | IRichText)[]) {
    if (labels.length === 0) {
      return [];
    }
    const option = (isObject(this.attribute.overlap) ? this.attribute.overlap : {}) as OverlapAttrs;
    const baseMarkGroup = this.getBaseMarkGroup();

    const size = option.size ?? {
      width: baseMarkGroup?.AABBBounds.width() ?? 0,
      height: baseMarkGroup?.AABBBounds.height() ?? 0
    };

    if (size.width === 0 || size.height === 0) {
      return labels;
    }

    const { strategy, priority } = option;

    const bmpTool = this._bmpTool || bitmapTool(size.width, size.height);
    const bitmap = this._bitmap || bmpTool.bitmap();

    if (priority) {
      labels = labels.sort((a, b) => priority((b.attribute as any).data) - priority((a.attribute as any).data));
    }

    if ((strategy as ShiftYStrategy)?.type === 'shiftY') {
      return this._overlapGlobal(labels, option, bmpTool, bitmap);
    }
    return this._overlapByStrategy(labels, option, bmpTool, bitmap);
  }

  protected _overlapGlobal(labels: (IText | IRichText)[], option: OverlapAttrs, bmpTool: BitmapTool, bitmap: Bitmap) {
    let result = labels.filter(label => label.attribute.visible && label.attribute.opacity !== 0);
    const { clampForce = true, hideOnHit = true, overlapPadding, strategy } = option;
    if (clampForce) {
      for (let i = 0; i < result.length; i++) {
        const text = labels[i];
        const { dx = 0, dy = 0 } = clampText(text as IText, bmpTool.width, bmpTool.height, bmpTool.padding);
        if (dx !== 0 || dy !== 0) {
          text.setAttributes({ x: text.attribute.x + dx, y: text.attribute.y + dy });
          text._isClamped = true;
        }
      }
    }
    result = shiftY(result as any, {
      maxY: bmpTool.height,
      ...(strategy as ShiftYStrategy),
      labelling: (text: IText) => {
        const baseMark = this.getRelatedGraphic(text.attribute);
        const graphicBound = this._isCollectionBase
          ? this.getGraphicBounds(null, this._idToPoint.get((text.attribute as any).id))
          : this.getGraphicBounds(baseMark, text);
        return this.labeling(text.AABBBounds, graphicBound, 'bottom', this.attribute.offset);
      }
    });

    for (let i = 0; i < result.length; i++) {
      const text = result[i];
      const bounds = text.AABBBounds;
      const range = boundToRange(bmpTool, bounds, true);
      if (canPlace(bmpTool, bitmap, bounds, clampForce, overlapPadding)) {
        bitmap.setRange(range);
      } else {
        if (clampForce) {
          const placedAfterClampForce = this._processClampForce(text as IText, bmpTool, bitmap, overlapPadding);
          if (placedAfterClampForce) {
            continue;
          }
        }
        if (hideOnHit) {
          text.setAttributes({ visible: false });
        } else {
          bitmap.setRange(range);
        }
      }
    }
    return result;
  }

  protected _processClampForce(text: IText, bmpTool: BitmapTool, bitmap: Bitmap, overlapPadding = 0) {
    const { dy = 0, dx = 0 } = clampText(text as IText, bmpTool.width, bmpTool.height, bmpTool.padding);
    if (dx === 0 && dy === 0) {
      // 再次检查，若不考虑边界，仍然可以放得下，代表当前 text 没有与其他 text 重叠
      if (canPlace(bmpTool, bitmap, text.AABBBounds, false, overlapPadding)) {
        bitmap.setRange(boundToRange(bmpTool, text.AABBBounds, true));
        return true;
      }
    } else if (
      canPlace(
        bmpTool,
        bitmap,
        {
          x1: text.AABBBounds.x1 + dx,
          x2: text.AABBBounds.x2 + dx,
          y1: text.AABBBounds.y1 + dy,
          y2: text.AABBBounds.y2 + dy
        }
        // 向内 clamp 只处理超出的位移量，不叠加 overlapPadding
      )
    ) {
      text.setAttributes({ x: text.attribute.x + dx, y: text.attribute.y + dy });
      bitmap.setRange(boundToRange(bmpTool, text.AABBBounds, true));
      return true;
    }
    return false;
  }

  protected _overlapByStrategy(
    labels: (IText | IRichText)[],
    option: OverlapAttrs,
    bmpTool: BitmapTool,
    bitmap: Bitmap
  ) {
    const {
      avoidBaseMark,
      strategy = [],
      hideOnHit = true,
      clampForce = true,
      avoidMarks = [],
      overlapPadding
    } = option;
    const result: (IText | IRichText)[] = [];

    const checkBounds = (strategy as Strategy[]).some(s => s.type === 'bound');
    // 躲避关联的基础图元
    if (avoidBaseMark) {
      this._baseMarks?.forEach(mark => {
        mark.AABBBounds && bitmap.setRange(boundToRange(bmpTool, mark.AABBBounds, true));
      });
    }

    // 躲避指定图元
    if (avoidMarks.length > 0) {
      avoidMarks.forEach(avoid => {
        if (isString(avoid)) {
          getNoneGroupMarksByName(this.getRootNode() as IGroup, avoid).forEach(avoidMark => {
            avoidMark.AABBBounds && bitmap.setRange(boundToRange(bmpTool, avoidMark.AABBBounds, true));
          });
        } else if (avoid.AABBBounds) {
          bitmap.setRange(boundToRange(bmpTool, avoid.AABBBounds, true));
        }
      });
    }

    for (let i = 0; i < labels.length; i++) {
      if (labels[i].attribute.visible === false) {
        continue;
      }

      const text = labels[i] as IText | IRichText;
      const baseMark = this.getRelatedGraphic(text.attribute);
      text.update();
      if (!isRectIntersect(baseMark.AABBBounds, { x1: 0, x2: bmpTool.width, y1: 0, y2: bmpTool.height }, true)) {
        continue;
      }
      // 默认位置可以放置
      if (canPlace(bmpTool, bitmap, text.AABBBounds, clampForce, overlapPadding)) {
        // 如果配置了限制在图形内部，需要提前判断；
        if (!checkBounds) {
          bitmap.setRange(boundToRange(bmpTool, text.AABBBounds, true));
          result.push(text);
          continue;
        }

        if (
          checkBounds &&
          baseMark &&
          baseMark.AABBBounds &&
          this._canPlaceInside(text.AABBBounds, baseMark.AABBBounds)
        ) {
          bitmap.setRange(boundToRange(bmpTool, text.AABBBounds, true));
          result.push(text);
          continue;
        }
      }

      let hasPlace: ReturnType<typeof place> = false;
      // 发生碰撞，根据策略寻找可放置的位置
      for (let j = 0; j < (strategy as Strategy[]).length; j++) {
        hasPlace = place(
          bmpTool,
          bitmap,
          strategy[j],
          <BaseLabelAttrs>this.attribute,
          text as Text,
          this._isCollectionBase
            ? this.getGraphicBounds(null, this._idToPoint.get((labels[i].attribute as any).id))
            : this.getGraphicBounds(baseMark, labels[i].attribute),
          this.labeling
        );
        if (hasPlace !== false) {
          text.setAttributes({ x: hasPlace.x, y: hasPlace.y });
          result.push(text);
          break;
        }
      }

      // 尝试向内挤压
      if (!hasPlace && clampForce) {
        const placedAfterClampForce = this._processClampForce(text as IText, bmpTool, bitmap, overlapPadding);
        if (placedAfterClampForce) {
          result.push(text);
          continue;
        }
      }

      !hasPlace && !hideOnHit && result.push(text);
    }
    return result;
  }

  protected getBaseMarkGroup() {
    const { baseMarkGroupName } = this.attribute as BaseLabelAttrs;
    if (!baseMarkGroupName) {
      return;
    }
    return (this.getRootNode() as IGroup).find(node => node.name === baseMarkGroupName, true) as IGroup;
  }

  protected getGraphicBounds(
    graphic?: IGraphic,
    point: Partial<PointLocationCfg> = {},
    position?: string
  ): IBoundsLike {
    if (graphic) {
      if (graphic.attribute.visible !== false) {
        return graphic.AABBBounds;
      }
      const { x, y } = graphic.attribute;
      return { x1: x, x2: x, y1: y, y2: y } as IBoundsLike;
    }
    if (point && position && position === 'inside-middle') {
      const { x, y, x1 = x, y1 = y } = point;
      return {
        x1: (x + x1) / 2,
        x2: (x + x1) / 2,
        y1: (y + y1) / 2,
        y2: (y + y1) / 2
      };
    }
    const { x, y } = point;
    return { x1: x, x2: x, y1: y, y2: y } as IBoundsLike;
  }

  protected _renderLabels(labels: (IText | IRichText)[]) {
    const { syncState } = this.attribute;
    const currentTextMap: Map<any, LabelContent> = new Map();
    const prevTextMap: Map<any, LabelContent> = this._graphicToText || new Map();
    const texts = [] as (IText | IRichText)[];
    const labelLines = [] as ILine[];
    const { visible: showLabelLine } = this.attribute.line ?? {};

    labels &&
      labels.forEach((text, index) => {
        const relatedGraphic = this.getRelatedGraphic(text.attribute);
        const textKey = this._isCollectionBase ? (text.attribute as LabelItem).id : relatedGraphic;
        const state = prevTextMap?.get(textKey) ? 'update' : 'enter';
        let labelLine;
        if (showLabelLine) {
          labelLine = this._createLabelLine(text as IText, relatedGraphic);
        }
        if (syncState) {
          this.updateStatesOfLabels([labelLine ? { text, labelLine } : { text }], relatedGraphic.currentStates ?? []);
        }

        if (state === 'enter') {
          texts.push(text);
          currentTextMap.set(textKey, labelLine ? { text, labelLine } : { text });
          this._addLabel({ text, labelLine }, texts, labelLines, index);
        } else if (state === 'update') {
          const prevLabel = prevTextMap.get(textKey);
          prevTextMap.delete(textKey);
          currentTextMap.set(textKey, prevLabel);
          this._updateLabel(prevLabel, { text, labelLine });
        }
      });

    this._removeLabel(prevTextMap);

    this._graphicToText = currentTextMap;
  }

  protected _addLabel(
    label: LabelContent,
    texts?: LabelContent['text'][],
    labelLines?: LabelContent['labelLine'][],
    index?: number
  ) {
    const { text, labelLine } = label;
    // TODO: 或许还需要判断关联图元是否有动画？
    const relatedGraphic = this.getRelatedGraphic(text.attribute);
    this._syncStateWithRelatedGraphic(relatedGraphic);

    if (this._enableAnimation !== false && this._animationConfig.enter !== false) {
      if (relatedGraphic) {
        const { from, to } = getAnimationAttributes(text.attribute, 'fadeIn');
        if (text) {
          this.add(text);
        }

        if (labelLine) {
          labelLines.push(labelLine);
          this.add(labelLine);
        }

        // enter的时长如果不是大于0，那么直接跳过动画
        this._animationConfig.enter.duration > 0 &&
          relatedGraphic.once('animate-bind', a => {
            // text和labelLine共用一个from
            text.setAttributes(from);
            labelLine && labelLine.setAttributes(from);
            const listener = this._afterRelatedGraphicAttributeUpdate(
              text,
              texts,
              labelLine,
              labelLines,
              index,
              relatedGraphic,
              to,
              this._animationConfig.enter as ILabelEnterAnimation
            );
            relatedGraphic.on('afterAttributeUpdate', listener);
          });
      }
    } else {
      if (text) {
        this.add(text);
      }
      if (labelLine) {
        this.add(labelLine);
      }
    }
  }

  protected _updateLabel(prevLabel: LabelContent, currentLabel: LabelContent) {
    const { text: prevText, labelLine: prevLabelLine } = prevLabel;
    const { text: curText, labelLine: curLabelLine } = currentLabel;
    if (this._enableAnimation !== false && this._animationConfig.update !== false) {
      const { duration, easing } = this._animationConfig.update;
      updateAnimation(prevText, curText, this._animationConfig.update);
      if (prevLabelLine && curLabelLine) {
        prevLabel.labelLine.animate().to(curLabelLine.attribute, duration, easing);
      }
    } else {
      prevLabel.text.setAttributes(curText.attribute as any);
      if (prevLabelLine && curLabelLine) {
        prevLabel.labelLine.setAttributes(curLabelLine.attribute);
      }
    }
  }

  protected _removeLabel(textMap: Map<any, LabelContent>) {
    const removeLabelAndLine = (label: LabelContent) => {
      this.removeChild(label.text);
      if (label.labelLine) {
        this.removeChild(label.labelLine);
      }
    };

    if (this._enableAnimation !== false && this._animationConfig.exit !== false) {
      const { duration, easing } = this._animationConfig.exit;
      textMap.forEach(label => {
        label.text
          ?.animate()
          .to(getAnimationAttributes(label.text.attribute, 'fadeOut').to, duration, easing)
          .onEnd(() => {
            removeLabelAndLine(label);
          });
      });
    } else {
      textMap.forEach(label => {
        removeLabelAndLine(label);
      });
    }
  }

  private updateStatesOfLabels(labels: LabelContent[], currentStates?: string[]) {
    labels.forEach(label => {
      if (label) {
        if (label.text) {
          label.text.useStates(currentStates);
        }

        if (label.labelLine) {
          label.labelLine.useStates(currentStates);
        }
      }
    });
  }

  protected _handleRelatedGraphicSetState = (e: any) => {
    if (
      e.detail?.type === AttributeUpdateType.STATE ||
      (e.detail?.type === AttributeUpdateType.ANIMATE_UPDATE && e.detail.animationState?.isFirstFrameOfStep)
    ) {
      const currentStates = e.target?.currentStates ?? [];
      const labels = this._isCollectionBase ? [...this._graphicToText.values()] : [this._graphicToText.get(e.target)];

      this.updateStatesOfLabels(labels, currentStates);
    }
  };

  protected _syncStateWithRelatedGraphic(relatedGraphic: IGraphic) {
    if (this.attribute.syncState && relatedGraphic) {
      relatedGraphic.on('afterAttributeUpdate', this._handleRelatedGraphicSetState);
    }
  }

  // 默认labelLine和text共用相同动画属性
  protected _afterRelatedGraphicAttributeUpdate(
    text: IText | IRichText,
    texts: (IText | IRichText)[],
    labelLine: ILine,
    labelLines: ILine[],
    index: number,
    relatedGraphic: IGraphic,
    to: any,
    { mode, duration, easing, delay }: ILabelAnimation
  ) {
    // TODO: 跟随动画
    const listener = (event: any) => {
      const { detail } = event;
      if (!detail) {
        return {};
      }
      const step = detail.animationState?.step;
      const isValidAnimateState =
        detail.type === AttributeUpdateType.ANIMATE_UPDATE &&
        step &&
        // 不是第一个wait
        !(step.type === 'wait' && step.prev?.type == null);

      if (!isValidAnimateState) {
        return {};
      }
      // const prevStep = step.prev;
      // if (prevStep && prevStep.type === 'wait' && prevStep.prev?.type == null) {
      //   delay = delay ?? step.position;
      // }
      if (detail.type === AttributeUpdateType.ANIMATE_END) {
        text.setAttributes(to);
        labelLine && labelLine.setAttributes(to);
        return;
      }

      const onStart = () => {
        if (relatedGraphic) {
          relatedGraphic.onAnimateBind = undefined;
          relatedGraphic.removeEventListener('afterAttributeUpdate', listener);
        }
      };

      switch (mode) {
        case 'after':
          // 3. 当前关联图元的动画播放结束后
          if (detail.animationState.end) {
            text.animate({ onStart }).wait(delay).to(to, duration, easing);
            labelLine && labelLine.animate().wait(delay).to(to, duration, easing);
          }
          break;
        case 'after-all':
          //  2. 所有完成后才开始；
          if (index === texts.length - 1) {
            if (detail.animationState.end) {
              texts.forEach(t => {
                t.animate({ onStart }).wait(delay).to(to, duration, easing);
              });
              labelLines.forEach(t => {
                t.animate().wait(delay).to(to, duration, easing);
              });
            }
          }
          break;
        case 'same-time':
        default:
          if (this._isCollectionBase) {
            const point = this._idToPoint.get((text.attribute as LabelItem).id);
            if (
              point &&
              (!text.animates || !text.animates.has('label-animate')) &&
              relatedGraphic.containsPoint(point.x, point.y, IContainPointMode.LOCAL, this.stage?.getPickerService())
            ) {
              text.animate({ onStart }).wait(delay).to(to, duration, easing);
              labelLine && labelLine.animate().wait(delay).to(to, duration, easing);
            }
          } else if (detail.animationState.isFirstFrameOfStep) {
            text.animate({ onStart }).wait(delay).to(to, duration, easing);
            labelLine && labelLine.animate().wait(delay).to(to, duration, easing);
          }

          break;
      }
    };
    return listener;
  }

  protected _smartInvert(labels: (IText | IRichText)[]) {
    const option = (isObject(this.attribute.smartInvert) ? this.attribute.smartInvert : {}) as SmartInvertAttrs;
    const { textType, contrastRatiosThreshold, alternativeColors, mode, interactInvertType } = option;
    const fillStrategy = option.fillStrategy ?? 'invertBase';
    const strokeStrategy = option.strokeStrategy ?? 'base';
    const brightColor = option.brightColor ?? '#ffffff';
    const darkColor = option.darkColor ?? '#000000';
    const outsideEnable = option.outsideEnable ?? false;

    if (fillStrategy === 'null' && strokeStrategy === 'null') {
      return;
    }

    for (let i = 0; i < labels.length; i++) {
      const label = labels[i];
      if (!label) {
        continue;
      }

      const baseMark = this.getRelatedGraphic(label.attribute as LabelItem);

      /**
       * 增加smartInvert时fillStrategy和 strokeStrategy的四种策略：
       * base（baseMark色），
       * inverBase（执行智能反色），
       * similarBase（智能反色的补色），
       * null（不执行智能反色，保持fill设置的颜色）
       * */
      let backgroundColor = baseMark.attribute.fill as IColor;
      let foregroundColor = label.attribute.fill as IColor;

      if (isObject(backgroundColor) && backgroundColor.gradient) {
        const firstStopColor = (backgroundColor as ILinearGradient).stops?.[0]?.color;

        if (firstStopColor) {
          backgroundColor = firstStopColor;
          foregroundColor = firstStopColor; // 渐变色的时候，标签的颜色可能会和背景色不一致，所以需要设置为相同的颜色
        }
      }

      const invertColor = labelSmartInvert(
        foregroundColor,
        backgroundColor,
        textType,
        contrastRatiosThreshold,
        alternativeColors,
        mode
      );
      const similarColor = contrastAccessibilityChecker(invertColor, brightColor) ? brightColor : darkColor;
      const isInside = this._canPlaceInside(label.AABBBounds, baseMark.AABBBounds);
      const isIntersect =
        !isInside && label.AABBBounds && baseMark.AABBBounds && baseMark.AABBBounds.intersects(label.AABBBounds);

      if (isInside || outsideEnable || (isIntersect && interactInvertType === 'inside')) {
        // 按照标签展示在柱子内部的情况，执行反色逻辑
        const fill = smartInvertStrategy(fillStrategy, backgroundColor, invertColor, similarColor);
        fill && label.setAttributes({ fill });

        if (label.attribute.lineWidth === 0 || label.attribute.strokeOpacity === 0) {
          continue;
        }

        const stroke = smartInvertStrategy(strokeStrategy, backgroundColor, invertColor, similarColor);
        stroke && label.setAttributes({ stroke });
      } else if (isIntersect && interactInvertType !== 'none') {
        // 存在相交的情况
        /** 当label无法设置stroke时，不进行反色计算（容易反色为白色与白色背景混合不可见） */
        if (label.attribute.lineWidth === 0 || label.attribute.strokeOpacity === 0) {
          continue;
        }
        /** 当label设置stroke时，保留stroke设置的颜色，根据stroke对fill做反色 */
        if (label.attribute.stroke) {
          // stroke 作为背景色进行反色计算
          label.setAttributes({
            fill: labelSmartInvert(
              label.attribute.fill as IColor,
              label.attribute.stroke as IColor,
              textType,
              contrastRatiosThreshold,
              alternativeColors,
              mode
            )
          });
          continue;
        }
        /** 当label未设置stroke，且可设置stroke时，正常计算 */
        const fill = smartInvertStrategy(fillStrategy, backgroundColor, invertColor, similarColor);
        fill && label.setAttributes({ fill });

        const stroke = smartInvertStrategy(strokeStrategy, backgroundColor, invertColor, similarColor);
        stroke && label.setAttributes({ stroke });
      }
    }
  }

  /**
   * 是否在图形内部
   * @param textBound
   * @param shapeBound
   * @returns
   */
  protected _canPlaceInside(textBound: IBoundsLike, shapeBound: IAABBBounds) {
    if (!textBound || !shapeBound) {
      return false;
    }
    return shapeBound.encloses(textBound);
  }

  setLocation(point: PointLocationCfg) {
    this.translateTo(point.x, point.y);
  }

  disableAnimation() {
    this._enableAnimation = false;
  }

  enableAnimation() {
    this._enableAnimation = true;
  }
}
