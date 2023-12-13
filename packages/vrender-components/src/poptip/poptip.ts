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
} from '@visactor/vrender-core';
import {
  AABBBounds,
  Bounds,
  getRectIntersect,
  isArray,
  isBoolean,
  isEmpty,
  isValid,
  max,
  merge,
  normalizePadding,
  pi,
  rectInsideAnotherRect
} from '@visactor/vutils';
import { AbstractComponent } from '../core/base';
import type { BackgroundAttributes, ComponentOptions } from '../interface';
import type { PopTipAttributes } from './type';
import { loadPoptip, loadPoptipComponent } from './register';

const _tBounds = new AABBBounds();

loadPoptipComponent();
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
    maxWidthPercent: 0.8,
    space: 8,
    padding: 10
  };

  constructor(attributes: PopTipAttributes, options?: ComponentOptions) {
    super(options?.skipDefault ? attributes : merge({}, PopTip.defaultAttributes, attributes));
  }

  protected render() {
    const {
      titleStyle = {} as ITextGraphicAttribute,
      position,
      contentStyle = {} as ITextGraphicAttribute,
      panel = {} as BackgroundAttributes & ISymbolGraphicAttribute & { space?: number },
      space = 4,
      minWidth = 0,
      maxWidth = Infinity,
      padding = 4,
      maxWidthPercent,
      visible,
      state,
      dx = 0,
      dy = 0
    } = this.attribute as PopTipAttributes;

    let { title = '', content = '' } = this.attribute as PopTipAttributes;

    title = this.attribute.titleFormatMethod ? this.attribute.titleFormatMethod(title) : title;
    content = this.attribute.contentFormatMethod ? this.attribute.contentFormatMethod(content) : content;

    const parsedPadding = normalizePadding(padding);

    const group = this.createOrUpdateChild('poptip-content', { x: 0, y: 0, zIndex: 1 }, 'group') as IGroup;

    const maxLineWidth = maxWidth - parsedPadding[1] - parsedPadding[3];

    const titleVisible = isValid(title) && visible !== false;
    const titleAttrs = {
      text: isArray(title) ? title : ([title] as any),
      visible: titleVisible,
      ...titleStyle,
      x: parsedPadding[3],
      y: parsedPadding[0],
      maxLineWidth,
      textAlign: 'left' as TextAlignType,
      textBaseline: 'top' as TextBaselineType
    };

    const titleShape = group.createOrUpdateChild('poptip-title', titleAttrs, 'wrapText') as IText;
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
      text: isArray(content) ? content : ([content] as any),
      visible: contentVisible,
      ...contentStyle,
      x: parsedPadding[3],
      y: parsedPadding[0] + height,
      maxLineWidth,
      textAlign: 'left' as TextAlignType,
      textBaseline: 'top' as TextBaselineType
    };

    const contentShape = group.createOrUpdateChild('poptip-content', contentAttrs, 'wrapText') as IText;
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
    let poptipHeight = parsedPadding[0] + parsedPadding[2] + height;

    // 绘制背景层
    const { visible: bgVisible, ...backgroundStyle } = panel;
    const symbolSize = backgroundStyle.size ?? 12;
    const spaceSize: number | [number, number] = isArray(symbolSize)
      ? [symbolSize[0] + (backgroundStyle.space ?? 0), symbolSize[1] + (backgroundStyle.space ?? 0)]
      : (symbolSize as number) + (backgroundStyle.space ?? 0);
    const lineWidth = backgroundStyle.lineWidth ?? 1;
    const range: [number, number] | undefined = (this as any).stage
      ? [
          (this as any).stage.viewWidth ?? (this as any).stage.width,
          (this as any).stage.viewHeight ?? (this as any).stage.height
        ]
      : undefined;

    if (range) {
      // 尝试进行换行
      const b = (this as any).AABBBounds;
      const leftWidth = this.attribute.x ?? b.x1;
      const rightWidth = range[0] - b.x1;
      let maxSpace = Math.max(leftWidth, rightWidth);
      // 减一些buffer，buffer不能超过maxSpace的20%
      const buf = (isArray(symbolSize) ? symbolSize[0] : 12) + 3;
      maxSpace = Math.min(maxSpace - buf, maxSpace * maxWidthPercent);
      // 需要进行换行
      if (maxSpace < popTipWidth) {
        popTipWidth = maxSpace;
        const buf = parsedPadding[1] + parsedPadding[3];
        titleShape.setAttribute('maxLineWidth', maxSpace - buf);
        contentShape.setAttribute('maxLineWidth', maxSpace - buf);
        poptipHeight = parsedPadding[0] + parsedPadding[2];
        if (titleVisible) {
          poptipHeight += titleShape.AABBBounds.height() + space;
        }
        poptipHeight += contentShape.AABBBounds.height();
      }
    }

    const layout = position === 'auto';
    // 最多循环this.positionList次
    let maxBBoxI: number;
    let maxBBoxSize: number = -Infinity;
    for (let i = 0; i < this.positionList.length + 1; i++) {
      const p = layout ? this.positionList[i === this.positionList.length ? maxBBoxI : i] : position;
      const { angle, offset, rectOffset } = this.getAngleAndOffset(
        p,
        popTipWidth,
        poptipHeight,
        isArray(spaceSize) ? (spaceSize as [number, number]) : [spaceSize, spaceSize - lineWidth]
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
            strokeBoundsBuffer: -1,
            boundsPadding: -2,
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
            zIndex: -8
          },
          'rect'
        ) as IRect;
        if (!isEmpty(state?.panel)) {
          bgRect.states = state.panel;
        }
      }

      group.setAttributes({
        x: -offset[0] + dx,
        y: -offset[1] + dy
      });

      if (layout && range) {
        _tBounds.setValue(0, 0, popTipWidth, poptipHeight).transformWithMatrix(group.globalTransMatrix);
        const b = _tBounds;
        const stageBounds = new Bounds().setValue(0, 0, range[0], range[1]);
        if (rectInsideAnotherRect(b, stageBounds, false)) {
          break;
        } else {
          const bbox = getRectIntersect(b, stageBounds, false);
          const size = (bbox.x2 - bbox.x1) * (bbox.y2 - bbox.y1);
          if (size > maxBBoxSize) {
            maxBBoxSize = size;
            maxBBoxI = i;
          }
        }
      } else {
        break;
      }
    }
  }

  positionList = ['top', 'tl', 'tr', 'bottom', 'bl', 'br', 'left', 'lt', 'lb', 'right', 'rt', 'rb'];

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
