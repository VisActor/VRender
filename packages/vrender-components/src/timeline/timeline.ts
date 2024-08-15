import { isArray, merge } from '@visactor/vutils';
import { AbstractComponent } from '../core/base';
import { loadTimelineComponent } from './register';
import type { TimelineAttrs } from './type';
import type { ComponentOptions } from '../interface';
import { getTheme, type IGraphicAttribute, type IGroup, type ILine, type IText } from '@visactor/vrender-core';
import type { ISymbol } from '@visactor/vrender-core';

loadTimelineComponent();

export class Timeline extends AbstractComponent<Required<TimelineAttrs>> {
  name = 'timeline';

  private _line?: ILine;
  private _activeLine?: ILine;
  private _symbolGroup?: IGroup;
  private _labelGroup?: IGroup;
  private _timesPercent?: number[];

  static defaultAttributes: Partial<TimelineAttrs> = {
    labelSpace: 10,
    pointLayoutMode: 'space-around',
    animation: true,
    symbolStyle: {
      fill: 'black',
      size: 12,
      symbolType: 'circle'
    },
    activeSymbolStyle: {
      fill: 'orange',
      size: 16
    },
    lineStyle: {
      lineDash: [2, 2],
      lineCap: 'butt',
      stroke: 'black',
      lineWidth: 2
    },
    activeLineStyle: {
      stroke: 'orange',
      lineWidth: 4
    },
    labelStyle: {
      fontSize: 12,
      fill: 'black',
      textAlign: 'center',
      textBaseline: 'top'
    },
    activeLabelStyle: {
      fontSize: 14,
      fill: 'orange'
    },
    clipRange: 0
  };

  constructor(attributes: TimelineAttrs, options?: ComponentOptions) {
    super(options?.skipDefault ? attributes : merge({}, Timeline.defaultAttributes, attributes));
  }

  protected render(): void {
    const {
      width,
      lineStyle,
      activeLineStyle,
      symbolStyle,
      activeSymbolStyle,
      labelStyle,
      activeLabelStyle,
      times,
      pointLayoutMode,
      labelSpace,
      clipRange,
      animation
    } = this.attribute;

    if (!(times && times.length)) {
      return;
    }

    // 计算线段中心的y位置，考虑线宽和symbol宽度
    const symbolHeight = (isArray(symbolStyle.size) ? symbolStyle.size[1] : symbolStyle.size) || 0;
    const activeSymbolHeight =
      (isArray(activeSymbolStyle.size) ? activeSymbolStyle.size[1] : activeSymbolStyle.size) || 0;
    const lineSymbolHeight = Math.max(
      lineStyle.lineWidth || 0,
      activeLineStyle.lineWidth || 0,
      symbolHeight,
      activeSymbolHeight
    );
    const lineY = lineSymbolHeight / 2;
    const lineAttr = {
      y: lineY,
      points: [
        { x: 0, y: 0 },
        { x: width, y: 0 }
      ]
    };
    this._line = this.createOrUpdateChild(
      'line-axes',
      {
        ...lineStyle,
        ...lineAttr
      },
      'line'
    ) as ILine;
    this._activeLine = this.createOrUpdateChild(
      'active-line-axes',
      {
        ...activeLineStyle,
        ...lineAttr,
        clipRange
      },
      'line'
    ) as ILine;

    const activeWidth = width * clipRange;

    const symbolGroup = this.createOrUpdateChild(
      'symbol-group',
      {
        y: lineY
      },
      'group'
    ) as IGroup;
    const symbolSpace =
      times.length === 1
        ? width
        : pointLayoutMode === 'space-between'
        ? width / (times.length - 1)
        : width / times.length;
    const symbolStartX = pointLayoutMode === 'space-between' ? 0 : symbolSpace / 2;
    this._timesPercent = times.map((_, i) => (symbolStartX + symbolSpace * i) / width);

    times.forEach((item, i) => {
      const x = this._timesPercent[i] * width;
      symbolGroup.createOrUpdateChild(
        item.label,
        {
          ...symbolStyle,
          x
        },
        'symbol'
      );
    });
    this._symbolGroup = symbolGroup;

    const labelY = lineSymbolHeight + labelSpace;
    const labelGroup = this.createOrUpdateChild(
      'label-group',
      {
        y: labelY
      },
      'group'
    ) as IGroup;

    times.forEach((item, i) => {
      const x = this._timesPercent[i] * width;
      labelGroup.createOrUpdateChild(
        item.label,
        {
          ...labelStyle,
          x,
          text: item.label
        },
        'text'
      );
    });
    this._labelGroup = labelGroup;

    const setActive = (group: IGroup, activeStyle: Partial<IGraphicAttribute>) => {
      group.forEachChildren((label: IText) => {
        if (label.currentStates) {
          const currentStates = label.currentStates;
          label.clearStates();
          label.useStates(currentStates, false);
        }
        label.states = {
          active: activeStyle
        };
        if (label.attribute.x <= activeWidth) {
          label.useStates(['active'], animation);
        }
      });
    };

    setActive(labelGroup, activeLabelStyle);
    setActive(symbolGroup, activeSymbolStyle);
  }

  appearAnimate(animateConfig: { duration?: number; easing?: string }) {
    // 基准时间，line[0, 500], point[100, 600] 100 onebyone, pointNormal[600, 1000] 90+90 onebyone, activeLine[500, 700]
    // line和activeLine的clipRange
    const { duration = 1000, easing = 'quadOut' } = animateConfig;
    const { activeLabelStyle, activeSymbolStyle } = this.attribute;
    const percent = duration / 1000;
    const lineDuration = percent * 500;
    const activeLineDuration = percent * 200;
    const perSymbolDuration = percent * 100;
    const perSymbolNormalDuration = percent * 90;
    const symbolDelay = percent * 100;
    const symbolNormalDelay = percent * 600;
    if (this._line) {
      this._line.setAttributes({ clipRange: 0 });
      this._line.animate().to({ clipRange: 1 }, lineDuration, easing as any);
    }
    if (this._activeLine) {
      this._activeLine.setAttributes({ opacity: 0 });
      this._activeLine
        .animate()
        .wait(500)
        .to({ opacity: 1 }, activeLineDuration, easing as any);
    }
    if (this._symbolGroup) {
      const size = this._symbolGroup.count - 1;
      const delay = percent * (size === 1 ? 0 : (500 - 100) / (size - 1));
      const delayNormal = percent * (size === 1 ? 0 : (400 - 160) / (size - 1));
      this._symbolGroup.forEachChildren((symbol: ISymbol, i) => {
        const originAttrs: Record<string, any> = {};
        Object.keys(activeSymbolStyle).forEach(k => {
          originAttrs[k] = (symbol.attribute as any)[k];
        });

        symbol.setAttributes({ opacity: 0 });
        symbol
          .animate()
          .wait(symbolDelay + delay * i)
          .to({ opacity: 1 }, perSymbolDuration, easing as any);
        symbol
          .animate()
          .wait(symbolNormalDelay + delayNormal * i)
          .to({ ...activeSymbolStyle }, perSymbolNormalDuration, easing as any)
          .to({ ...originAttrs }, perSymbolNormalDuration, easing as any);
      });
    }
    if (this._labelGroup) {
      const size = this._labelGroup.count - 1;
      const delay = percent * (size === 1 ? 0 : (500 - 100) / (size - 1));
      const delayNormal = percent * (size === 1 ? 0 : (400 - 160) / (size - 1));
      this._labelGroup.forEachChildren((label: IText, i) => {
        const originAttrs: Record<string, any> = {};
        Object.keys(activeLabelStyle).forEach(k => {
          originAttrs[k] = (label.attribute as any)[k];
        });
        label.setAttributes({ opacity: 0 });
        label
          .animate()
          .wait(symbolDelay + delay * i)
          .to({ opacity: 1 }, perSymbolDuration, easing as any);
        label
          .animate()
          .wait(symbolNormalDelay + delayNormal * i)
          .to({ dy: 10, ...activeLabelStyle }, perSymbolNormalDuration, easing as any)
          .to({ dy: 0, ...originAttrs }, perSymbolNormalDuration, easing as any);
      });
    }
  }

  goto(flag: 1 | -1, animateConfig: { duration?: number; easing?: string }) {
    let { clipRange } = this.attribute;
    const { animation } = this.attribute;

    // 合法性判断
    if (flag > 0) {
      if (clipRange >= 1) {
        return;
      } else if (clipRange < 0) {
        clipRange = 0;
      }
    } else {
      if (clipRange <= 0) {
        return;
      } else if (clipRange > 1) {
        clipRange = 1;
      }
    }

    if (clipRange !== this.attribute.clipRange) {
      this.setAttributes({ clipRange });
    }

    // 判断区间
    let i = 0;
    for (; i < this._timesPercent.length; i++) {
      if (clipRange < this._timesPercent[i]) {
        break;
      }
    }

    const nextClipRange = flag > 0 ? this._timesPercent[i] || 1 : this._timesPercent[i - 1] || 0;
    if (animation) {
      const { duration = 1000, easing = 'quadOut' } = animateConfig;
      // const actDuration =
      //   (Math.abs(nextClipRange - clipRange) / ((this._timesPercent[i] ?? 1) - (this._timesPercent[i - 1] ?? 0))) *
      //   duration;
      this.animate().to({ clipRange: nextClipRange }, duration, easing as any);
    } else {
      this.setAttributes({ clipRange: nextClipRange });
    }
  }

  forward(animateConfig: { duration?: number; easing?: string }) {
    this.goto(1, animateConfig);
  }

  backward(animateConfig: { duration?: number; easing?: string }) {
    this.goto(-1, animateConfig);
  }
}
