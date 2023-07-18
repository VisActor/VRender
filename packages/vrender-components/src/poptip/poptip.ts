/**
 * @description PopTip组件
 */
import type {
  IGroup,
  IRect,
  ISymbol,
  ISymbolGraphicAttribute,
  IText,
  ITextGraphicAttribute,
  TextAlignType,
  TextBaselineType
} from '@visactor/vrender';
import { isArray, isBoolean, isEmpty, isValid, max, merge, normalizePadding, pi } from '@visactor/vutils';
import { AbstractComponent } from '../core/base';
import type { BackgroundAttributes } from '../interface';
import type { PopTipAttributes } from './type';

export class PopTip extends AbstractComponent<Required<PopTipAttributes>> {
  name = 'poptip';

  static defaultAttributes: Partial<PopTipAttributes> = {
    position: 'rt',
    visible: true,
    title: null,
    content: null,
    titleStyle: {
      fontSize: 12,
      fill: '#000',
      textAlign: 'left',
      textBaseline: 'top'
    },
    contentStyle: {
      fontSize: 12,
      fill: '#000',
      textAlign: 'left',
      textBaseline: 'top'
    },
    space: 8,
    padding: 10
  };

  constructor(attributes: PopTipAttributes) {
    super(merge({}, PopTip.defaultAttributes, attributes));
  }

  protected render() {
    const {
      title = '',
      titleStyle = {} as ITextGraphicAttribute,
      position,
      content = '',
      contentStyle = {} as ITextGraphicAttribute,
      panel = {} as BackgroundAttributes & ISymbolGraphicAttribute,
      space = 4,
      minWidth = 0,
      maxWidth = Infinity,
      padding = 4,
      visible,
      state
    } = this.attribute as PopTipAttributes;

    const parsedPadding = normalizePadding(padding);

    const group = this.createOrUpdateChild('poptip-content', { x: 0, y: 0, zIndex: 1 }, 'group') as IGroup;

    const maxLineWidth = maxWidth - parsedPadding[1] - parsedPadding[3];

    const titleVisible = isValid(title) && visible !== false;
    const titleAttrs = {
      text: title,
      visible: titleVisible,
      ...titleStyle,
      x: parsedPadding[3],
      y: parsedPadding[0],
      maxLineWidth,
      textAlign: 'left' as TextAlignType,
      textBaseline: 'top' as TextBaselineType
    };

    const titleShape = group.createOrUpdateChild('poptip-title', titleAttrs, 'text') as IText;
    if (!isEmpty(state?.title)) {
      titleShape.states = state.title;
    }

    const titleBounds = titleShape.AABBBounds;
    const titleHeight = titleBounds.height();
    const titleWidth = titleBounds.width();
    let height = titleHeight + space;
    if (!titleVisible) {
      height = 0;
    }

    const contentVisible = isValid(content) && visible !== false;
    const contentAttrs = {
      text: content,
      visible: contentVisible,
      ...contentStyle,
      x: parsedPadding[3],
      y: parsedPadding[0] + height,
      maxLineWidth,
      textAlign: 'left' as TextAlignType,
      textBaseline: 'top' as TextBaselineType
    };

    const contentShape = group.createOrUpdateChild('poptip-content', contentAttrs, 'text') as IText;
    if (!isEmpty(state?.content)) {
      contentShape.states = state.content;
    }

    const contentBounds = contentShape.AABBBounds;
    const contentHeight = contentBounds.height();
    const contentWidth = contentBounds.width();

    if (contentVisible) {
      height += contentHeight;
    }

    // 计算整个popTip的宽高
    let popTipWidth = max(
      titleWidth + parsedPadding[1] + parsedPadding[3],
      contentWidth + parsedPadding[1] + parsedPadding[3]
    );
    if (popTipWidth > maxWidth) {
      popTipWidth = maxWidth;
    } else if (popTipWidth < minWidth) {
      popTipWidth = minWidth;
    }
    const poptipHeight = parsedPadding[0] + parsedPadding[2] + height;

    // 绘制背景层
    const { visible: bgVisible, ...backgroundStyle } = panel;
    const symbolSize = backgroundStyle.size ?? 12;
    const lineWidth = backgroundStyle.lineWidth ?? 1;
    const { angle, offset, rectOffset } = this.getAngleAndOffset(
      position,
      popTipWidth,
      poptipHeight,
      isArray(symbolSize) ? symbolSize : [symbolSize, symbolSize - lineWidth]
    );
    if (isBoolean(bgVisible)) {
      const offsetX = (isArray(symbolSize) ? symbolSize[0] : symbolSize) / 4;
      const bgSymbol = group.createOrUpdateChild(
        'poptip-symbol-panel',
        {
          ...backgroundStyle,
          visible: bgVisible && (contentVisible || titleVisible),
          x: offsetX,
          y: 0,
          anchor: [0, 0],
          symbolType: 'arrow2Left',
          angle: angle,
          dx: offset[0],
          dy: offset[1],
          size: symbolSize,
          zIndex: -9
        },
        'symbol'
      ) as ISymbol;
      if (!isEmpty(state?.panel)) {
        bgSymbol.states = state.panel;
      }

      const bgRect = group.createOrUpdateChild(
        'poptip-rect-panel',
        {
          ...backgroundStyle,
          visible: bgVisible && (contentVisible || titleVisible),
          x: 0,
          y: 0,
          width: popTipWidth,
          height: poptipHeight,
          zIndex: -10
        },
        'rect'
      ) as IRect;
      if (!isEmpty(state?.panel)) {
        bgRect.states = state.panel;
      }
    }

    group.setAttributes({
      x: -offset[0],
      y: -offset[1]
    });
  }

  getAngleAndOffset(
    position: string,
    width: number,
    height: number,
    size: [number, number]
  ): { angle: number; offset: [number, number]; rectOffset: [number, number] } {
    // const sizeW = size[0];
    const sizeH = size[1] / 2;
    switch (position) {
      case 'tl':
        return {
          angle: (pi / 2) * 3,
          offset: [width / 4, height + sizeH],
          rectOffset: [-width / 4, -height - size[1]]
        };
      case 'top':
        return { angle: (pi / 2) * 3, offset: [width / 2, height + sizeH], rectOffset: [0, -height - size[1]] };
      case 'tr':
        return {
          angle: (pi / 2) * 3,
          offset: [(width / 4) * 3, height + sizeH],
          rectOffset: [(width / 4) * 3, -height - size[1]]
        };
      case 'rt':
        return { angle: 0, offset: [-sizeH, height / 5], rectOffset: [(width / 4) * 3, -height - size[1]] };
      case 'right':
        return { angle: 0, offset: [-sizeH, height / 2], rectOffset: [(width / 4) * 3, -height - size[1]] };
      case 'rb':
        return { angle: 0, offset: [-sizeH, (height / 5) * 4], rectOffset: [(width / 4) * 3, -height - size[1]] };
      case 'bl':
        return { angle: pi / 2, offset: [width / 4, -sizeH], rectOffset: [-width / 4, -height - size[1]] };
      case 'bottom':
        return { angle: pi / 2, offset: [width / 2, -sizeH], rectOffset: [0, -height - size[1]] };
      case 'br':
        return { angle: pi / 2, offset: [(width / 4) * 3, -sizeH], rectOffset: [(width / 4) * 3, -height - size[1]] };
      case 'lt':
        return { angle: pi, offset: [width + sizeH, height / 5], rectOffset: [-width / 4, -height - size[1]] };
      case 'left':
        return { angle: pi, offset: [width + sizeH, height / 2], rectOffset: [0, -height - size[1]] };
      case 'lb':
        return {
          angle: pi,
          offset: [width + sizeH, (height / 5) * 4],
          rectOffset: [(width / 4) * 3, -height - size[1]]
        };
    }
  }
}
