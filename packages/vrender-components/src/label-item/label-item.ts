import type {
  IGroup,
  ILine,
  ILineGraphicAttribute,
  IRect,
  ISymbol,
  ISymbolGraphicAttribute,
  IText
} from '@visactor/vrender-core';
import { ILineAttribute, InputText, ISymbolAttribute } from '@visactor/vrender-core';
import { AbstractComponent } from '../core/base';
import type { IStoryLabelItemAttrs } from './type';
import type { ComponentOptions } from '../interface';
import { max, merge } from '@visactor/vutils';

export class StoryLabelItem extends AbstractComponent<Required<IStoryLabelItemAttrs>> {
  name: 'labelItem';
  private _line?: ILine;
  private _symbolStart: ISymbol;
  private _symbolEnd: ISymbol;
  private _symbolStartOuter: ISymbol;
  private _titleTop: IText;
  private _titleBottom: IText;
  private _titleTopPanel: IRect;
  private _titleBottomPanel: IRect;

  static defaultAttributes: Partial<IStoryLabelItemAttrs> = {
    // 内容在X上的偏移量
    contentOffsetX: 100,
    // 内容在Y上的偏移量
    contentOffsetY: -60,
    titleTopStyle: {
      fontSize: 12,
      fill: 'white'
    },
    titleBottomStyle: {
      fontSize: 12,
      fill: 'white'
    },
    lineStyle: {
      stroke: 'white',
      lineWidth: 1
    } as ILineGraphicAttribute,
    // 线段开始端点的样式
    symbolStartStyle: {
      symbolType: 'circle',
      size: 3,
      fill: 'white'
    } as Partial<ISymbolGraphicAttribute>,
    // 线段结束端点的样式
    symbolEndStyle: {
      symbolType: 'circle',
      size: 3,
      fill: 'white'
    } as Partial<ISymbolGraphicAttribute>,
    // 线段开始端点外面包裹symbol的样式
    symbolStartOuterStyle: {
      symbolType: 'M0.5,0A0.5,0.5,0,1,1,-0.5,0A0.5,0.5,0,1,1,0.5,0',
      size: 8,
      stroke: 'white'
    } as Partial<ISymbolGraphicAttribute>,
    titleSpace: [2, 2],
    titleTopPanelStyle: {
      visible: false,
      padding: { left: 0, right: 0, bottom: 2, top: 2 },
      cornerRadius: 3
    },
    titleBottomPanelStyle: {
      visible: false,
      padding: { left: 0, right: 0, bottom: 2, top: 2 },
      cornerRadius: 3
    },
    // 默认和简约两套主题
    theme: 'default'
  };

  constructor(attributes: IStoryLabelItemAttrs, options?: ComponentOptions) {
    super(options?.skipDefault ? attributes : merge({}, StoryLabelItem.defaultAttributes, attributes));
  }

  protected render(): void {
    const {
      contentOffsetX,
      contentOffsetY,
      lineStyle,
      symbolStartStyle,
      symbolEndStyle,
      symbolStartOuterStyle,
      titleTop: titleTopText,
      titleBottom: titleBottomText,
      titleTopStyle,
      titleBottomStyle,
      titleSpace,
      titleTopPanelStyle,
      titleBottomPanelStyle,
      theme
    } = this.attribute;

    const group = this.createOrUpdateChild('label-item-container', { x: 0, y: 0, zIndex: 1 }, 'group') as IGroup;

    const symbolStart = group.createOrUpdateChild(
      'label-item-symbol-start',
      { x: 0, y: 0, ...symbolStartStyle },
      'symbol'
    ) as ISymbol;
    const symbolEnd = group.createOrUpdateChild(
      'label-item-symbol-end',
      { x: contentOffsetX, y: contentOffsetY, ...symbolEndStyle },
      'symbol'
    ) as ISymbol;
    const symbolStartOut = group.createOrUpdateChild(
      'label-item-symbol-start-out',
      { x: 0, y: 0, ...symbolStartOuterStyle },
      'symbol'
    ) as ISymbol;

    const spaceW = titleSpace[0];
    const spaceH = titleSpace[1];
    // 逻辑：group占满，title在group内做偏移
    const titleTopGroup = group.createOrUpdateChild(
      'label-item-title-top-group',
      { x: contentOffsetX, y: contentOffsetY, clip: true },
      'group'
    ) as IGroup;
    const titleTop = titleTopGroup.createOrUpdateChild(
      'label-item-title-top',
      {
        x: spaceW,
        y: -spaceH,
        text: titleTopText,
        ...titleTopStyle,
        textBaseline: 'bottom',
        textAlign: 'left',
        zIndex: 10
      },
      'text'
    ) as IText;
    const titleTopBounds = titleTop.AABBBounds;
    if (contentOffsetX > 0) {
      titleTopGroup.setAttributes({ x: contentOffsetX - titleTopBounds.width() - spaceW * 2 });
    }
    titleTopGroup.setAttributes({
      width: titleTopBounds.width() + spaceW * 2,
      height: -titleTopBounds.height() - spaceH * 2
    });
    // 添加panel
    const titleTopPanel = titleTopGroup.createOrUpdateChild(
      'label-item-title-top-panel',
      {
        ...titleTopPanelStyle,
        x: titleTopPanelStyle.padding.left,
        y: (titleTopGroup.attribute.height > 0 ? 0 : titleTopGroup.attribute.height) + titleTopPanelStyle.padding.top,
        width: titleTopGroup.attribute.width - titleTopPanelStyle.padding.left - titleTopPanelStyle.padding.right,
        height:
          (titleTopGroup.attribute.height > 0 ? 1 : -1) * titleTopGroup.attribute.height -
          titleTopPanelStyle.padding.bottom -
          titleTopPanelStyle.padding.top,
        scaleCenter: [titleTopGroup.attribute.width / 2, titleTopGroup.attribute.height / 2]
      },
      'rect'
    ) as IRect;
    this._titleTopPanel = titleTopPanel;

    const titleBottomGroup = group.createOrUpdateChild(
      'label-item-title-bottom-group',
      { x: contentOffsetX, y: contentOffsetY, clip: true },
      'group'
    ) as IGroup;
    const titleBottom = titleBottomGroup.createOrUpdateChild(
      'label-item-title-bottom',
      {
        x: spaceW,
        y: spaceH,
        text: titleBottomText,
        ...titleBottomStyle,
        textBaseline: 'top',
        textAlign: 'left',
        zIndex: 10
      },
      'text'
    ) as IText;
    const titleBottomBounds = titleBottom.AABBBounds;
    if (contentOffsetX > 0) {
      titleBottomGroup.setAttributes({ x: contentOffsetX - titleBottomBounds.width() - spaceW * 2 });
    }
    titleBottomGroup.setAttributes({
      width: titleBottomBounds.width() + spaceW * 2,
      height: titleTopBounds.height() + spaceH * 2
    });
    // 添加panel
    const titleBottomPanel = titleBottomGroup.createOrUpdateChild(
      'label-item-title-bottom-panel',
      {
        ...titleBottomPanelStyle,
        x: titleBottomPanelStyle.padding.left,
        y:
          (titleBottomGroup.attribute.height > 0 ? 0 : titleBottomGroup.attribute.height) +
          titleBottomPanelStyle.padding.top,
        width:
          titleBottomGroup.attribute.width - titleBottomPanelStyle.padding.left - titleBottomPanelStyle.padding.right,
        height:
          (titleBottomGroup.attribute.height > 0 ? 1 : -1) * titleBottomGroup.attribute.height -
          titleBottomPanelStyle.padding.bottom -
          titleBottomPanelStyle.padding.top,
        scaleCenter: [titleBottomGroup.attribute.width / 2, titleBottomGroup.attribute.height / 2]
      },
      'rect'
    ) as IRect;
    this._titleBottomPanel = titleBottomPanel;

    const maxTextWidth = Math.max(titleTop.AABBBounds.width(), titleBottom.AABBBounds.width()) + spaceW * 2;
    const points = [
      { x: 0, y: 0 },
      contentOffsetX > 0
        ? { x: contentOffsetX - maxTextWidth, y: contentOffsetY }
        : { x: contentOffsetX + maxTextWidth, y: contentOffsetY },
      { x: contentOffsetX, y: contentOffsetY }
    ];
    // simple风格，不绘制终点，同时文字也要居中
    if (theme === 'simple') {
      points.pop();
      const p = points[1];
      symbolEnd.setAttributes(p);
    }
    const line = group.createOrUpdateChild('label-item-line', { x: 0, y: 0, ...lineStyle, points }, 'line') as ILine;

    this._symbolEnd = symbolEnd;
    this._symbolStart = symbolStart;
    this._symbolStartOuter = symbolStartOut;
    this._titleTop = titleTop;
    this._titleBottom = titleBottom;
    this._line = line;
  }

  appearAnimate(animateConfig: {
    duration?: number;
    easing?: string;
    symbolStartOuterType?: 'scale' | 'clipRange';
    titleType?: 'typewriter' | 'move';
    titlePanelType?: 'scale' | 'stroke';
  }) {
    const {
      duration = 1000,
      easing = 'quadOut',
      symbolStartOuterType = 'scale',
      titleType = 'typewriter',
      titlePanelType = 'scale'
    } = animateConfig;
    const symbolTime = duration / 10;
    this._symbolStart.setAttributes({ scaleX: 0, scaleY: 0 });
    this._symbolStart.animate().to({ scaleX: 1, scaleY: 1 }, symbolTime * 5, easing as any);

    let symbolStartOuterFrom: ISymbolGraphicAttribute;
    let symbolStartOuterTo: ISymbolGraphicAttribute;
    if (symbolStartOuterType === 'scale') {
      symbolStartOuterFrom = { scaleX: 0, scaleY: 0 };
      symbolStartOuterTo = { scaleX: 1, scaleY: 1 };
    } else {
      symbolStartOuterFrom = { clipRange: 0 };
      symbolStartOuterTo = { clipRange: 1 };
    }
    this._symbolStartOuter.setAttributes(symbolStartOuterFrom);
    this._symbolStartOuter.animate().to(symbolStartOuterTo, symbolTime * 5, easing as any);

    this._symbolEnd.setAttributes({ scaleX: 0, scaleY: 0 });
    this._symbolEnd
      .animate()
      .wait(symbolTime * 8)
      .to({ scaleX: 1, scaleY: 1 }, symbolTime * 2, easing as any);

    this._line.setAttributes({ clipRange: 0 });
    this._line.animate().to({ clipRange: 1 }, symbolTime * 9, easing as any);

    if (titleType === 'typewriter') {
      const titleTopText = this._titleTop.attribute.text as string;
      this._titleTop.setAttributes({ text: '' });
      this._titleTop
        .animate()
        .wait(symbolTime * 5)
        .play(new InputText({ text: '' }, { text: titleTopText }, symbolTime * 4, 'linear'));

      const titleBottomText = this._titleBottom.attribute.text as string;
      this._titleBottom.setAttributes({ text: '' });
      this._titleBottom
        .animate()
        .wait(symbolTime * 5)
        .play(new InputText({ text: '' }, { text: titleBottomText }, symbolTime * 4, 'linear'));
    } else {
      this._titleTop.setAttributes({ dy: this._titleTop.AABBBounds.height() + 10 });
      this._titleTop
        .animate()
        .wait(symbolTime * 5)
        .to({ dy: 0 }, symbolTime * 4, 'linear');

      this._titleBottom.setAttributes({ dy: -(10 + this._titleBottom.AABBBounds.height()) });
      this._titleBottom
        .animate()
        .wait(symbolTime * 5)
        .to({ dy: 0 }, symbolTime * 4, 'linear');
    }

    if (titlePanelType === 'scale') {
      [this._titleTopPanel, this._titleBottomPanel].forEach(panel => {
        const scaleX = panel.attribute.scaleX;
        panel.setAttributes({ scaleX: 0 });
        panel.animate().to({ scaleX }, duration, 'circInOut');
      });
    } else if (titlePanelType === 'stroke') {
      [this._titleTopPanel, this._titleBottomPanel].forEach(panel => {
        const b = panel.AABBBounds;
        const totalLen = (b.width() + b.height()) * 2;
        panel.setAttributes({ lineDash: [0, totalLen * 10] });
        panel.animate().to({ lineDash: [totalLen, totalLen * 10] }, duration, 'quadOut');
      });
    }
  }

  disappearAnimate(animateConfig: { duration?: number; easing?: string; mode?: 'scale' | 'default' }) {
    if (animateConfig.mode === 'scale') {
      const { duration = 1000, easing = 'quadOut' } = animateConfig;
      this.animate().to({ scaleX: 0, scaleY: 0 }, duration, easing as any);
    } else {
      const { duration = 1000, easing = 'quadOut' } = animateConfig;
      this._line.animate().to({ clipRange: 0 }, duration, easing as any);
      this._symbolStart
        .animate()
        .wait(duration / 2)
        .to({ scaleX: 0, scaleY: 0 }, duration / 2, easing as any);
      this._symbolEnd.animate().to({ scaleX: 0, scaleY: 0 }, duration, easing as any);
      this._titleTop.animate().to({ dy: this._titleTop.AABBBounds.height() + 10 }, duration / 2, easing as any);
      this._titleBottom
        .animate()
        .to({ dy: -(10 + this._titleBottom.AABBBounds.height()) }, duration / 2, easing as any);
      this._symbolStartOuter
        .animate()
        .wait(duration / 2)
        .to({ clipRange: 0 }, duration / 2, easing as any);
      this._titleTopPanel.animate().to({ scaleX: 0 }, duration, 'circInOut');
      this._titleBottomPanel.animate().to({ scaleX: 0 }, duration, 'circInOut');
    }
  }
}
