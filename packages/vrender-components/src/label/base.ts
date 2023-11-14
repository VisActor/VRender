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
  IArea
} from '@visactor/vrender-core';
import { createText, AttributeUpdateType, IContainPointMode } from '@visactor/vrender-core';
import type { IAABBBounds, IBoundsLike, IPointLike } from '@visactor/vutils';
import { isFunction, isEmpty, isValid, isString, merge, isRectIntersect, isNil, isArray } from '@visactor/vutils';
import { AbstractComponent } from '../core/base';
import type { PointLocationCfg } from '../core/type';
import { labelSmartInvert, contrastAccessibilityChecker, smartInvertStrategy } from '../util/label-smartInvert';
import { getMarksByName, getNoneGroupMarksByName, traverseGroup } from '../util';
import { StateValue } from '../constant';
import type { Bitmap } from './overlap';
import { bitmapTool, boundToRange, canPlace, clampText, place } from './overlap';
import type {
  BaseLabelAttrs,
  OverlapAttrs,
  ILabelAnimation,
  ArcLabelAttrs,
  LabelItem,
  SmartInvertAttrs,
  ILabelEnterAnimation,
  ILabelExitAnimation,
  ILabelUpdateAnimation
} from './type';
import { DefaultLabelAnimation, getAnimationAttributes, updateAnimation } from './animate/animate';
import { getPointsOfLineArea } from './util';

export class LabelBase<T extends BaseLabelAttrs> extends AbstractComponent<T> {
  name = 'label';

  protected _baseMarks?: IGraphic[];

  protected _isCollectionBase: boolean;

  protected _bitmap?: Bitmap;

  protected _animationConfig?: {
    enter: ILabelEnterAnimation;
    exit: ILabelExitAnimation;
    update: ILabelUpdateAnimation;
  };

  static defaultAttributes: Partial<BaseLabelAttrs> = {
    textStyle: {
      fontSize: 12,
      // FIXME: we need a default color. Yet in current logic, textStyle will override fill from baseMark.
      // This need a new config option like `colorFull`
      // fill: '#000',
      textAlign: 'center',
      textBaseline: 'middle',
      boundsPadding: [-1, 0, -1, 0] // to ignore the textBound buf
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

  protected _graphicToText: Map<IGraphic, { text: IText; labelLine?: ILine }>;

  protected _idToGraphic: Map<string, IGraphic>;

  protected _idToPoint: Map<string, IPointLike>;

  onAfterLabelOverlap?: (bitmap: Bitmap) => void;

  private _lastHover: IGraphic;
  private _lastSelect: IGraphic;

  private _enableAnimation: boolean;

  constructor(attributes: BaseLabelAttrs) {
    super(merge({}, LabelBase.defaultAttributes, attributes));
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

  protected _labelLine(text: IText): ILine | undefined {
    // 基类没有指定的图元类型，需要在 data 中指定位置，故无需进行 labeling
    return;
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

    let labels: IText[];

    if (isFunction(customLayoutFunc)) {
      labels = customLayoutFunc(
        data,
        this.getRelatedGrphic,
        this._isCollectionBase ? (d: LabelItem) => this._idToPoint.get(d.id) : null
      );
    } else {
      // 根据关联图元和配置的position计算标签坐标
      labels = this._layout(data);
    }

    if (isFunction(customOverlapFunc)) {
      labels = customOverlapFunc(
        labels as Text[],
        this.getRelatedGrphic,
        this._isCollectionBase ? (d: LabelItem) => this._idToPoint.get(d.id) : null
      );
    } else {
      // 防重叠逻辑
      if (overlap !== false) {
        labels = this._overlapping(labels);
      }
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

  private _setStatesOfLabelLine(target: IGraphic) {
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
    const text = createText(attributes);
    this._bindEvent(text);
    this._setStatesOfText(text);
    return text;
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

        if (points?.length) {
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
      this._animationConfig = {
        enter: merge(
          {},
          DefaultLabelAnimation,
          this.attribute.animation === true ? {} : this.attribute.animation,
          this.attribute.animationEnter ?? {}
        ),
        exit: merge(
          {},
          DefaultLabelAnimation,
          this.attribute.animation === true ? {} : this.attribute.animation,
          this.attribute.animationExit ?? {}
        ),
        update: isArray(this.attribute.animationUpdate)
          ? this.attribute.animationUpdate
          : merge(
              {},
              DefaultLabelAnimation,
              this.attribute.animation === true ? {} : this.attribute.animation,
              this.attribute.animationUpdate ?? {}
            )
      };
    }
  }

  protected getRelatedGrphic(item: LabelItem) {
    return this._idToGraphic.get(item.id);
  }

  protected _layout(data: LabelItem[] = []): IText[] {
    const { textStyle = {}, position, offset } = this.attribute;
    const labels = [];

    for (let i = 0; i < data.length; i++) {
      const textData = data[i];
      const baseMark = this.getRelatedGrphic(textData);

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
      const textBounds = this.getGraphicBounds(text);
      const graphicBounds = this._isCollectionBase
        ? this.getGraphicBounds(null, this._idToPoint.get(textData.id))
        : this.getGraphicBounds(baseMark, { x: textData.x as number, y: textData.y as number });

      const textLocation = this.labeling(
        textBounds,
        graphicBounds,
        isFunction(position) ? position(textData) : position,
        offset
      );

      if (textLocation) {
        labelAttribute.x = textLocation.x;
        labelAttribute.y = textLocation.y;
        text.setAttributes(textLocation);
      }

      labels.push(text);
    }

    return labels;
  }

  protected _overlapping(labels: IText[]) {
    if (labels.length === 0) {
      return [];
    }
    const option = this.attribute.overlap as OverlapAttrs;

    const result: IText[] = [];
    const baseMarkGroup = this.getBaseMarkGroup();

    const size = option.size ?? {
      width: baseMarkGroup?.AABBBounds.width() ?? 0,
      height: baseMarkGroup?.AABBBounds.height() ?? 0
    };

    if (size.width === 0 || size.height === 0) {
      return labels;
    }

    const {
      avoidBaseMark,
      strategy = [],
      hideOnHit = true,
      clampForce = true,
      avoidMarks = [],
      overlapPadding
    } = option;
    const bmpTool = this._bmpTool || bitmapTool(size.width, size.height);
    const bitmap = this._bitmap || bmpTool.bitmap();
    const checkBounds = strategy.some(s => s.type === 'bound');

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
      if (labels[i].visible === false) {
        continue;
      }

      const text = labels[i] as IText;
      const baseMark = this.getRelatedGrphic(text.attribute);
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

        if (checkBounds && baseMark?.AABBBounds && this._canPlaceInside(text.AABBBounds, baseMark?.AABBBounds)) {
          bitmap.setRange(boundToRange(bmpTool, text.AABBBounds, true));
          result.push(text);
          continue;
        }
      }

      let hasPlace: ReturnType<typeof place> = false;
      // 发生碰撞，根据策略寻找可放置的位置
      for (let j = 0; j < strategy.length; j++) {
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
        const { dx = 0, dy = 0 } = clampText(text, bmpTool.width, bmpTool.height);
        if (
          !(dx === 0 && dy === 0) &&
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
          result.push(text);
          continue;
        }
      }

      !hasPlace && !hideOnHit && result.push(text);
    }

    if (isFunction(this.onAfterLabelOverlap)) {
      this.onAfterLabelOverlap(bitmap);
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

  protected getGraphicBounds(graphic?: IGraphic, point: Partial<PointLocationCfg> = {}): IBoundsLike {
    // if (graphic && !isEmpty((graphic as any).finalAttrs)) {
    //   const g = graphic.clone();
    //   g.onBeforeAttributeUpdate = graphic.onBeforeAttributeUpdate;
    //   g.setAttributes((graphic as any).finalAttrs);
    //   g.update();
    //   return g.AABBBounds;
    // }

    return (
      graphic?.AABBBounds ||
      ({
        x1: point.x,
        x2: point.x,
        y1: point.y,
        y2: point.y
      } as IBoundsLike)
    );
  }

  protected _renderLabels(labels: IText[]) {
    const disableAnimation = this._enableAnimation === false || this.attribute.animation === false;

    if (disableAnimation) {
      this._renderWithOutAnimation(labels);
    } else {
      this._renderWithAnimation(labels);
    }
  }

  protected _renderWithAnimation(labels: IText[]) {
    const currentTextMap: Map<any, { text: IText; labelLine?: ILine }> = new Map();
    const prevTextMap: Map<any, { text: IText; labelLine?: ILine }> = this._graphicToText || new Map();
    const texts = [] as IText[];

    labels.forEach((text, index) => {
      const labelLine: ILine = this._labelLine(text);
      const relatedGraphic = this.getRelatedGrphic(text.attribute);
      const textId = (text.attribute as LabelItem).id;
      const textKey = this._isCollectionBase ? textId : relatedGraphic;
      const state = prevTextMap?.get(textKey) ? 'update' : 'enter';

      if (state === 'enter') {
        texts.push(text);
        currentTextMap.set(textKey, labelLine ? { text, labelLine } : { text });
        if (relatedGraphic) {
          const { from, to } = getAnimationAttributes(text.attribute, 'fadeIn');
          this.add(text);

          if (labelLine) {
            this._setStatesOfLabelLine(labelLine);
            this.add(labelLine);
          }

          this._syncStateWithRelatedGraphic(relatedGraphic);
          relatedGraphic.once('animate-bind', a => {
            text.setAttributes(from);
            const listener = this._afterRelatedGraphicAttributeUpdate(
              text,
              texts,
              index,
              relatedGraphic,
              to,
              this._animationConfig.enter
            );
            relatedGraphic.on('afterAttributeUpdate', listener);
          });
        }
      } else if (state === 'update') {
        const prevLabel = prevTextMap.get(textKey);
        prevTextMap.delete(textKey);
        currentTextMap.set(textKey, prevLabel);
        const prevText = prevLabel.text;
        const { duration, easing } = this._animationConfig.update;
        updateAnimation(prevText as Text, text, this._animationConfig.update);
        if (prevLabel.labelLine) {
          prevLabel.labelLine.animate().to(
            merge({}, prevLabel.labelLine.attribute, {
              visible:
                ((text.attribute as ArcLabelAttrs)?.line?.visible && text.attribute?.visible) ??
                text.attribute?.visible ??
                true,
              points: (text.attribute as ArcLabelAttrs)?.points
            }),
            duration,
            easing
          );
        }
      }
    });
    prevTextMap.forEach(label => {
      label.text
        ?.animate()
        .to(
          getAnimationAttributes(label.text.attribute, 'fadeOut').to,
          this._animationConfig.exit.duration,
          this._animationConfig.exit.easing
        )
        .onEnd(() => {
          this.removeChild(label.text);
          if (label?.labelLine) {
            this.removeChild(label.labelLine);
          }
        });
    });

    this._graphicToText = currentTextMap;
  }

  protected _renderWithOutAnimation(labels: IText[]) {
    const currentTextMap: Map<any, { text: IText; labelLine?: ILine }> = new Map();
    const prevTextMap: Map<any, { text: IText; labelLine?: ILine }> = this._graphicToText || new Map();
    const texts = [] as IText[];

    labels.forEach(text => {
      const labelLine = this._labelLine(text);
      const relatedGraphic = this.getRelatedGrphic(text.attribute);
      const state = prevTextMap?.get(relatedGraphic) ? 'update' : 'enter';
      const textKey = this._isCollectionBase ? (text.attribute as LabelItem).id : relatedGraphic;

      if (state === 'enter') {
        texts.push(text);
        currentTextMap.set(textKey, labelLine ? { text, labelLine } : { text });
        this.add(text);
        if (labelLine) {
          this.add(labelLine);
        }

        this._syncStateWithRelatedGraphic(relatedGraphic);
      } else if (state === 'update') {
        const prevLabel = prevTextMap.get(textKey);
        prevTextMap.delete(textKey);
        currentTextMap.set(textKey, prevLabel);
        prevLabel.text.setAttributes(text.attribute);
        if (prevLabel?.labelLine) {
          prevLabel.labelLine.setAttributes({ points: (text.attribute as ArcLabelAttrs)?.points });
        }
      }
    });

    prevTextMap.forEach(label => {
      this.removeChild(label.text);
      if (label?.labelLine) {
        this.removeChild(label.labelLine);
      }
    });

    this._graphicToText = currentTextMap;
  }

  protected _handleRelatedGraphicSetState = (e: any) => {
    if (e.detail?.type === AttributeUpdateType.STATE) {
      const currentStates = e.target?.currentStates ?? [];
      const labels = this._isCollectionBase ? [...this._graphicToText.values()] : [this._graphicToText.get(e.target)];

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
  };

  protected _syncStateWithRelatedGraphic(relatedGraphic: IGraphic) {
    if (this.attribute.syncState) {
      relatedGraphic.on('afterAttributeUpdate', this._handleRelatedGraphicSetState);
    }
  }

  protected _afterRelatedGraphicAttributeUpdate(
    text: IText,
    texts: IText[],
    index: number,
    relatedGraphic: IGraphic,
    to: any,
    { mode, duration, easing, delay }: ILabelAnimation
  ) {
    const listener = (event: any) => {
      const { detail } = event;
      if (!detail) {
        return {};
      }
      const isValidAnimateState =
        detail &&
        detail.type === AttributeUpdateType.ANIMATE_UPDATE &&
        detail.animationState &&
        detail.animationState.step?.type !== 'wait';

      if (!isValidAnimateState) {
        return {};
      }

      if (detail.type === AttributeUpdateType.ANIMATE_END) {
        text.setAttributes(to);
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
          }
          break;
        case 'after-all':
          //  2. 所有完成后才开始；
          if (index === texts.length - 1) {
            if (detail.animationState.end) {
              texts.forEach(t => {
                t.animate({ onStart }).wait(delay).to(to, duration, easing);
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
              relatedGraphic.containsPoint(point.x, point.y, IContainPointMode.LOCAL, this.stage?.pickerService)
            ) {
              text.animate({ onStart }).wait(delay).to(to, duration, easing);
            }
          } else if (detail.animationState.isFirstFrameOfStep) {
            text.animate({ onStart }).wait(delay).to(to, duration, easing);
          }

          break;
      }
    };
    return listener;
  }

  protected _smartInvert(labels: IText[]) {
    const option = (this.attribute.smartInvert || {}) as SmartInvertAttrs;
    const { textType, contrastRatiosThreshold, alternativeColors } = option;
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

      const baseMark = this.getRelatedGrphic(label.attribute as LabelItem);

      /**
       * 增加smartInvert时fillStrategy和 strokeStrategy的四种策略：
       * series（baseMark色），
       * invertSeries（执行智能反色），
       * similarSeries（智能反色的补色），
       * null（不执行智能反色，保持fill设置的颜色）
       * */
      const backgroundColor = baseMark.attribute.fill as IColor;
      const foregroundColor = label.attribute.fill as IColor;
      const baseColor = backgroundColor;
      const invertColor = labelSmartInvert(
        foregroundColor,
        backgroundColor,
        textType,
        contrastRatiosThreshold,
        alternativeColors
      );
      const similarColor = contrastAccessibilityChecker(invertColor, brightColor) ? brightColor : darkColor;

      if (outsideEnable) {
        const fill = smartInvertStrategy(fillStrategy, baseColor, invertColor, similarColor);
        fill && label.setAttributes({ fill });

        if (label.attribute.lineWidth === 0) {
          continue;
        }

        const stroke = smartInvertStrategy(strokeStrategy, baseColor, invertColor, similarColor);
        stroke && label.setAttributes({ stroke });
      } else {
        const isInside = this._canPlaceInside(label.AABBBounds, baseMark?.AABBBounds);
        if (isInside) {
          const fill = smartInvertStrategy(fillStrategy, baseColor, invertColor, similarColor);
          fill && label.setAttributes({ fill });

          if (label.attribute.lineWidth === 0) {
            continue;
          }

          const stroke = smartInvertStrategy(strokeStrategy, baseColor, invertColor, similarColor);
          stroke && label.setAttributes({ stroke });
        } else {
          /** 当label无法设置stroke时，不进行反色计算（容易反色为白色与白色背景混合不可见） */
          if (label.attribute.lineWidth === 0) {
            continue;
          }

          /** 当label设置stroke时，保留stroke设置的颜色，根据stroke对fill做反色 */
          if (label.attribute.stroke) {
            label.setAttributes({
              fill: labelSmartInvert(
                label.attribute.fill as IColor,
                label.attribute.stroke as IColor,
                textType,
                contrastRatiosThreshold,
                alternativeColors
              )
            });
            continue;
          }

          /** 当label未设置stroke，且可设置stroke时，正常计算 */
          const fill = smartInvertStrategy(fillStrategy, baseColor, invertColor, similarColor);
          fill && label.setAttributes({ fill });

          const stroke = smartInvertStrategy(strokeStrategy, baseColor, invertColor, similarColor);
          stroke && label.setAttributes({ stroke });
        }
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
