import type {
  IGroup,
  ILine,
  ILineGraphicAttribute,
  IRect,
  ISymbol,
  ISymbolGraphicAttribute,
  IText
} from '@visactor/vrender-core';
import { AbstractComponent } from '../core/base';
import type { IStoryLabelItemAttrs } from './type';
import type { ComponentOptions } from '../interface';
import { merge } from '@visactor/vutils';

export class StoryLabelItem extends AbstractComponent<Required<IStoryLabelItemAttrs>> {
  name: 'labelItem';
  _line?: ILine;
  _symbolStart: ISymbol;
  _symbolEnd: ISymbol;
  _symbolStartOuter: ISymbol;
  _titleTop: IText;
  _titleBottom: IText;
  _titleTopPanel: IRect;
  _titleBottomPanel: IRect;

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
}
