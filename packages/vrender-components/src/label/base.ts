/**
 * @description Label 基类
 */
import type { IGroup, Text, IGraphic, IText, FederatedPointerEvent, IColor } from '@visactor/vrender';
import { createText, IncreaseCount, AttributeUpdateType } from '@visactor/vrender';
import type { IBoundsLike } from '@visactor/vutils';
import { isFunction, isValidNumber, isEmpty, isValid } from '@visactor/vutils';
import { AbstractComponent } from '../core/base';
import type { PointLocationCfg } from '../core/type';
import { labelSmartInvert } from '../util/labelSmartInvert';
import { traverseGroup } from '../util';
import { StateValue } from '../constant';
import type { Bitmap } from './overlap';
import { bitmapTool, boundToRange, canPlace, canPlaceInside, clampText, place } from './overlap';
import type { BaseLabelAttrs, OverlapAttrs, ILabelAnimation, LabelItem, SmartInvertAttrs } from './type';
import { DefaultLabelAnimation, getAnimationAttributes } from './animate/animate';

export abstract class LabelBase<T extends BaseLabelAttrs> extends AbstractComponent<T> {
  name = 'label';

  protected _baseMarks?: IGraphic[];

  protected _bitmap?: Bitmap;

  setBitmap(bitmap: Bitmap) {
    this._bitmap = bitmap;
  }

  protected _bmpTool?: ReturnType<typeof bitmapTool>;
  setBitmapTool(bmpTool: ReturnType<typeof bitmapTool>) {
    this._bmpTool = bmpTool;
  }

  protected _graphicToText: Map<IGraphic, IText>;

  protected _idToGraphic: Map<string, IGraphic>;

  onAfterLabelOverlap?: (bitmap: Bitmap) => void;

  private _lastHover: IGraphic;
  private _lastSelect: IGraphic;

  private _enableAnimation: boolean;

  protected abstract labeling(
    textBounds: IBoundsLike,
    graphicBounds: IBoundsLike,
    position?: BaseLabelAttrs['position'],
    offset?: number
  ): { x: number; y: number } | undefined;

  protected render() {
    this._prepare();

    const { overlap, smartInvert, dataFilter, customLayoutFunc, customOverlapFunc } = this.attribute;
    let data = this.attribute.data;

    if (isFunction(dataFilter)) {
      data = dataFilter(data);
    }

    let labels: IText[];

    if (isFunction(customLayoutFunc)) {
      labels = customLayoutFunc(data, (d: LabelItem) => this._idToGraphic.get(d.id));
    } else {
      // 根据关联图元和配置的position计算标签坐标
      labels = this.layout(data);

      if (isFunction(customOverlapFunc)) {
        labels = customOverlapFunc(labels as Text[], (d: LabelItem) => this._idToGraphic.get(d.id));
      } else {
        // 防重叠逻辑
        if (overlap !== false) {
          labels = this._overlapping(labels);
        }
      }
    }

    if (smartInvert !== false) {
      this._smartInvert(labels);
    }

    this._renderLabels(labels);
  }

  private _bindEvent(target: IGraphic) {
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

  private _setStates(target: IGraphic) {
    if (!target) {
      return;
    }
    const state = this.attribute.state;

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

  private _createLabelText(attributes: LabelItem) {
    const text = createText(attributes);
    this._bindEvent(text);
    this._setStates(text);
    return text;
  }

  private _prepare() {
    const baseMarks = this.getBaseMarks();
    const currentBaseMarks: IGraphic[] = [];
    baseMarks.forEach(mark => {
      if ((mark as any).releaseStatus !== 'willRelease') {
        currentBaseMarks.push(mark);
      }
    });

    this._idToGraphic?.clear();
    this._baseMarks = currentBaseMarks;

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

  protected layout(data: LabelItem[] = []): IText[] {
    const { textStyle = {}, position, offset } = this.attribute;
    const labels = [];

    for (let i = 0; i < data.length; i++) {
      const textData = data[i];
      const baseMark = this._idToGraphic.get(textData.id);

      const labelAttribute = {
        ...textStyle,
        ...textData
      };
      const text = this._createLabelText(labelAttribute);
      const textBounds = this.getGraphicBounds(text);
      const graphicBounds = this.getGraphicBounds(baseMark, { x: textData.x as number, y: textData.y as number });
      const textLocation = this.labeling(
        textBounds,
        graphicBounds,
        isFunction(position) ? position(textData) : position,
        offset
      );
      if (!textLocation) {
        continue;
      }
      labelAttribute.x = textLocation.x;
      labelAttribute.y = textLocation.y;

      text.setAttributes(textLocation);
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

    const { avoidBaseMark, strategy = [], hideOnHit = true, clampForce = true } = option;
    const bmpTool = this._bmpTool || bitmapTool(size.width, size.height);
    const bitmap = this._bitmap || bmpTool.bitmap();
    const checkBounds = strategy.some(s => s.type === 'bound');

    if (avoidBaseMark) {
      this._baseMarks?.forEach(mark => {
        mark.AABBBounds && bitmap.setRange(boundToRange(bmpTool, mark.AABBBounds, true));
      });
    }

    for (let i = 0; i < labels.length; i++) {
      if (labels[i].visible === false) {
        continue;
      }
      const text = labels[i] as IText;
      const baseMark = this._idToGraphic.get((text.attribute as LabelItem).id);
      text.update();

      // 默认位置可以放置
      if (canPlace(bmpTool, bitmap, text.AABBBounds, clampForce)) {
        // 如果配置了限制在图形内部，需要提前判断；
        if (!checkBounds) {
          bitmap.setRange(boundToRange(bmpTool, text.AABBBounds, true));
          result.push(text);
          continue;
        }

        if (checkBounds && baseMark?.AABBBounds && canPlaceInside(text.AABBBounds, baseMark?.AABBBounds)) {
          bitmap.setRange(boundToRange(bmpTool, text.AABBBounds, true));
          result.push(text);
          continue;
        }
      }

      // 尝试向内挤压
      if (clampForce) {
        const { dx = 0, dy = 0 } = clampText(text, bmpTool.width, bmpTool.height);
        if (
          !(dx === 0 && dy === 0) &&
          canPlace(bmpTool, bitmap, {
            x1: text.AABBBounds.x1 + dx,
            x2: text.AABBBounds.x2 + dx,
            y1: text.AABBBounds.y1 + dy,
            y2: text.AABBBounds.y2 + dy
          })
        ) {
          text.setAttributes({ x: text.attribute.x + dx, y: text.attribute.y + dy });
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
          this.getGraphicBounds(baseMark, labels[i]),
          this.labeling
        );
        if (hasPlace !== false) {
          text.setAttributes({ x: hasPlace.x, y: hasPlace.y });
          result.push(text);
          break;
        }
      }

      !hasPlace && !hideOnHit && result.push(text);
    }

    if (isFunction(this.onAfterLabelOverlap)) {
      this.onAfterLabelOverlap(bitmap);
    }

    return result;
  }

  protected getBaseMarks() {
    const baseMarkGroup = this.getBaseMarkGroup() as IGroup;
    if (!baseMarkGroup) {
      return;
    }
    return baseMarkGroup.getChildren() as IGraphic[];
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
    const animationConfig = (this.attribute.animation ?? {}) as ILabelAnimation;
    const disableAnimation = this._enableAnimation === false || (animationConfig as unknown as boolean) === false;
    const mode = animationConfig.mode ?? DefaultLabelAnimation.mode;
    const duration = animationConfig.duration ?? DefaultLabelAnimation.duration;
    const easing = animationConfig.easing ?? DefaultLabelAnimation.easing;
    const delay = animationConfig.delay ?? 0;

    const currentTextMap = new Map();
    const prevTextMap = this._graphicToText || new Map();
    const texts = [] as IText[];
    labels.forEach((text, index) => {
      const relatedGraphic = this._idToGraphic.get((text.attribute as LabelItem).id);
      const state = prevTextMap?.get(relatedGraphic) ? 'update' : 'enter';
      if (state === 'enter') {
        texts.push(text);
        currentTextMap.set(relatedGraphic, text);
        if (!disableAnimation && relatedGraphic) {
          const { from, to } = getAnimationAttributes(text.attribute, 'fadeIn');
          this.add(text);
          relatedGraphic.onAnimateBind = () => {
            text.setAttributes(from);
            const listener = this._afterRelatedGraphicAttributeUpdate(text, texts, index, relatedGraphic, {
              mode,
              duration,
              easing,
              to,
              delay
            });
            relatedGraphic.on('afterAttributeUpdate', listener);
          };
        } else {
          this.add(text);
        }
      }

      if (state === 'update') {
        const prevText = prevTextMap.get(relatedGraphic);
        prevTextMap.delete(relatedGraphic);
        currentTextMap.set(relatedGraphic, prevText);
        if (!disableAnimation) {
          prevText.animate().to(text.attribute, duration, easing);
          if (
            animationConfig.increaseEffect !== false &&
            prevText.attribute.text !== text.attribute.text &&
            isValidNumber(Number(prevText.attribute.text) * Number(text.attribute.text))
          ) {
            prevText
              .animate()
              .play(
                new IncreaseCount(
                  { text: prevText.attribute.text as string },
                  { text: text.attribute.text as string },
                  duration,
                  easing
                )
              );
          }
        } else {
          prevText.setAttributes(text.attribute);
        }
      }
    });
    prevTextMap.forEach(label => {
      if (disableAnimation) {
        this.removeChild(label);
      } else {
        label
          ?.animate()
          .to(getAnimationAttributes(label.attribute, 'fadeOut').to, duration, easing)
          .onEnd(() => {
            this.removeChild(label);
          });
      }
    });

    this._graphicToText = currentTextMap;
  }

  protected _afterRelatedGraphicAttributeUpdate(
    text: IText,
    texts: IText[],
    index: number,
    relatedGraphic: IGraphic,
    { mode, duration, easing, to, delay }: ILabelAnimation & { to: any }
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

      const onEnd = () => {
        if (relatedGraphic) {
          relatedGraphic.onAnimateBind = undefined;
          relatedGraphic.removeEventListener('afterAttributeUpdate', listener);
        }
      };

      switch (mode) {
        case 'after':
          // 3. 当前关联图元的动画播放结束后
          if (detail.animationState.end) {
            text.animate({ onEnd }).wait(delay).to(to, duration, easing);
          }
          break;
        case 'after-all':
          //  2. 所有完成后才开始；
          if (index === texts.length - 1) {
            if (detail.animationState.end) {
              texts.forEach(t => {
                t.animate({ onEnd }).wait(delay).to(to, duration, easing);
              });
            }
          }
          break;
        case 'same-time':
        default:
          // 1. 与当前关联图元的动画播放同时进行
          if (detail.animationState.isFirstFrameOfStep) {
            text.animate({ onEnd }).wait(delay).to(to, duration, easing);
          }
          break;
      }
    };
    return listener;
  }

  protected _smartInvert(labels: IText[]) {
    const option = (this.attribute.smartInvert || {}) as SmartInvertAttrs;
    const { textType, contrastRatiosThreshold, alternativeColors } = option;

    for (let i = 0; i < labels.length; i++) {
      const label = labels[i];
      if (!label) {
        continue;
      }
      const baseMark = this._idToGraphic.get((label.attribute as LabelItem).id);
      const isInside = canPlaceInside(label.AABBBounds, baseMark?.AABBBounds);
      /**
       * stroke 的处理逻辑
       * 1. 当文本在图元内部时，有两种情况：
       *   - a. 未设置stroke：labelFill为前景色，baseMark填充色为背景色
       *   - b. 设置了stroke：labelFill为前景色，labelStroke填充色为背景色
       * 2. 当文本在图元外部时，有两种情况：
       *   - a. 未设置stroke：此时设置strokeColor为backgroundColor。labelFill为前景色，labelStroke填充色为背景色。避免文字一半在图元内部，一半在图元外部时，在图元外部文字不可见。
       *   - b. 设置了stroke：保持strokeColor。labelFill为前景色，labelStroke填充色为背景色。
       */
      if (label.attribute.stroke && label.attribute.lineWidth > 0) {
        /**
         * 1-b, 2-b
         * 若label存在stroke，label填充色为前景色，label描边色为背景色
         * WCAG 2 字母周围的文本发光/光晕可用作背景颜色
         */
        label.setAttributes({
          fill: labelSmartInvert(
            label.fill as IColor,
            label.stroke as IColor,
            textType,
            contrastRatiosThreshold,
            alternativeColors
          )
        });
      } else if (isInside) {
        /**
         * 1-a
         * label在图元内部时，label填充色为前景色，baseMark填充色为背景色
         */
        const backgroundColor = baseMark.attribute.fill as IColor;
        const foregroundColor = label.attribute.fill as IColor;
        label.setAttributes({
          fill: labelSmartInvert(foregroundColor, backgroundColor, textType, contrastRatiosThreshold, alternativeColors)
        });
      } else if (label.attribute.lineWidth > 0) {
        /**
         * 2-a
         * 当文本在图元外部时，设置strokeColor为backgroundColor。labelFill为前景色，labelStroke填充色为背景色。
         */
        const backgroundColor = label.attribute.stroke as IColor;
        const foregroundColor = label.attribute.fill as IColor;
        label.setAttributes({
          stroke: baseMark.attribute.fill,
          fill: labelSmartInvert(foregroundColor, backgroundColor, textType, contrastRatiosThreshold, alternativeColors)
        });
      }
    }
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
