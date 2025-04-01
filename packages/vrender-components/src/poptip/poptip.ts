/**
 * @description PopTip组件
 */
import {
  type IGraphic,
  type IGroup,
  type IRect,
  type ISymbol,
  type IText,
  type ITextGraphicAttribute,
  type TextAlignType,
  type TextBaselineType
} from '@visactor/vrender-core';
import { InputText } from '@visactor/vrender-animate';
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
  min,
  normalizePadding,
  pi,
  rectInsideAnotherRect,
  type IAABBBoundsLike
} from '@visactor/vutils';
import { AbstractComponent } from '../core/base';
import type { ComponentOptions } from '../interface';
import type { PopTipAttributes } from './type';
import { loadPoptipComponent } from './register';

const _tBounds = new AABBBounds();

loadPoptipComponent();

const tlStr = 'M -0.5 -0.5, L -0.5 0.5, L 0.5 -0.5, Z';
const blStr = 'M -0.5 -0.5, L -0.5 0.5, L 0.5 0.5, Z';
const trStr = 'M -0.5 -0.5, L 0.5 -0.5, L 0.5 0.5, Z';
const brStr = 'M 0.5 -0.5, L 0.5 0.5, L -0.5 0.5, Z';

const conciseSymbolMap = {
  tl: tlStr,
  tr: trStr,
  bl: blStr,
  br: brStr,
  lt: tlStr,
  lb: blStr,
  rt: trStr,
  rb: brStr
};
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
    panel: {} as any,
    maxWidthPercent: 0.8,
    space: 8,
    padding: 10
  };

  titleShape?: IText;
  contentShape?: IText;
  group?: IGroup;

  constructor(attributes: PopTipAttributes, options?: ComponentOptions) {
    super(options?.skipDefault ? attributes : merge({}, PopTip.defaultAttributes, attributes));
  }

  protected render() {
    const {
      titleStyle = {} as ITextGraphicAttribute,
      position,
      contentStyle = {} as ITextGraphicAttribute,
      panel,
      logoSymbol,
      poptipAnchor = 'position',
      logoText,
      logoTextStyle = {} as ITextGraphicAttribute,
      triangleMode = 'default',
      space = 4,
      minWidth = 0,
      maxWidth = Infinity,
      padding = 4,
      maxWidthPercent,
      visible,
      state,
      dx = 0,
      dy = 0,
      positionBounds
    } = this.attribute as PopTipAttributes;

    let { title = '', content = '' } = this.attribute as PopTipAttributes;

    title = this.attribute.titleFormatMethod ? this.attribute.titleFormatMethod(title) : title;
    content = this.attribute.contentFormatMethod ? this.attribute.contentFormatMethod(content) : content;

    const parsedPadding = normalizePadding(padding);

    const group = this.createOrUpdateChild('poptip-content', { x: 0, y: 0, zIndex: 1 }, 'group') as IGroup;
    this.group = group;

    const maxLineWidth = maxWidth - parsedPadding[1] - parsedPadding[3];

    const titleVisible = isValid(title) && visible !== false;
    const titleAttrs = {
      text: isArray(title) ? title : ([title] as any),
      visible: titleVisible,
      wrap: true,
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
      text: isArray(content) ? content : ([content] as any),
      visible: contentVisible,
      wrap: true,
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

    this.titleShape = titleShape;
    this.contentShape = contentShape;

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
    const { visible: bgVisible, square, ...backgroundStyle } = panel;
    // 如果是正方形，取宽高的最大值，同时文字也需要居中
    if (square) {
      const maxWH = max(popTipWidth, poptipHeight);
      popTipWidth = maxWH;
      const deltaH = maxWH - poptipHeight;
      poptipHeight = maxWH;
      titleShape.setAttributes({ dy: deltaH / 2 });
      contentShape.setAttributes({ dy: deltaH / 2 });
    }
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

    const layout = position === 'auto' || isArray(position);
    const positionList = isArray(position) ? position : this.positionList;
    // 最多循环this.positionList次
    let maxBBoxI: number;
    let maxBBoxSize: number = -Infinity;

    for (let i = 0; i < positionList.length + 1; i++) {
      const p = layout ? positionList[i === positionList.length ? maxBBoxI : i] : position;
      let symbolType = 'arrow2Left';
      let offsetX = (isArray(symbolSize) ? symbolSize[0] : symbolSize) / 4;
      let offsetY = 0;
      if (p === 'top' || p === 'bottom' || p === 'left' || p === 'right') {
        symbolType = 'arrow2Left';
      } else if (triangleMode === 'concise') {
        symbolType = (conciseSymbolMap as any)[p];
        offsetX = ['tl', 'bl', 'rt', 'rb'].includes(p)
          ? (isArray(symbolSize) ? symbolSize[0] : symbolSize) / 2
          : -(isArray(symbolSize) ? symbolSize[0] : symbolSize) / 2;
        offsetY = ['tl', 'tr', 'lb', 'rb'].includes(p)
          ? -(isArray(symbolSize) ? symbolSize[1] : symbolSize) / 2
          : (isArray(symbolSize) ? symbolSize[1] : symbolSize) / 2;
      }

      const { angle, offset } = this.getAngleAndOffset(
        p,
        popTipWidth,
        poptipHeight,
        isArray(spaceSize) ? (spaceSize as [number, number]) : [spaceSize, spaceSize - lineWidth],
        symbolType
      );

      // Calculate anchor point if using bounds
      let anchorPoint = { x: 0, y: 0 };
      if (poptipAnchor === 'bounds' && positionBounds) {
        anchorPoint = this.calculateAnchorPoint(p, positionBounds);
      }

      // 后续可能需要偏移，所以需要保存
      let bgSymbol: ISymbol;
      if (isBoolean(bgVisible)) {
        bgSymbol = group.createOrUpdateChild(
          'poptip-symbol-panel',
          {
            ...backgroundStyle,
            visible: bgVisible && (contentVisible || titleVisible),
            x: offsetX,
            y: offsetY,
            strokeBoundsBuffer: -1,
            boundsPadding: -2,
            anchor: [0, 0],
            symbolType,
            angle: angle,
            dx: offset[0],
            // 标签和背景同时移动
            dy: offset[1] - (backgroundStyle.space ?? 0),
            size: symbolSize,
            zIndex: 9
          },
          'symbol'
        ) as ISymbol;
        if (!isEmpty(state?.panel)) {
          bgSymbol.states = state.panel;
        }

        let bgRect: IGraphic;
        if (panel.panelSymbolType) {
          bgRect = group.createOrUpdateChild(
            'poptip-rect-panel',
            {
              ...backgroundStyle,
              visible: bgVisible && (contentVisible || titleVisible),
              x: 0,
              y: 0,
              symbolType: 'rect',
              size: [popTipWidth, poptipHeight],
              zIndex: -8
            },
            'symbol'
          ) as ISymbol;
        } else {
          bgRect = group.createOrUpdateChild(
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
        }
        if (!isEmpty(state?.panel)) {
          bgRect.states = state.panel;
        }
      }

      group.setAttributes({
        x: -offset[0] + dx + anchorPoint.x,
        y: -offset[1] + dy + anchorPoint.y,
        anchor: [offsetX, offsetY]
      });

      // 添加logo和logo内的text
      if (logoSymbol) {
        const { size = 12 } = logoSymbol;
        const sizeArray = isArray(size) ? (size as [number | string, number | string]) : [size, size];
        if (sizeArray[1] === 'auto') {
          sizeArray[1] = poptipHeight;
        }
        if (sizeArray[0] === 'auto') {
          sizeArray[0] = poptipHeight;
        }
        const sizeW = sizeArray[0] as number;
        group.createOrUpdateChild(
          'poptip-logo',
          {
            ...logoSymbol,
            x: 0,
            y: poptipHeight / 2,
            visible: bgVisible && (contentVisible || titleVisible),
            zIndex: 10,
            size: sizeArray as [number, number]
          },
          'symbol'
        );
        group.setAttributes({
          x: -offset[0] + dx + sizeW / 2,
          y: -offset[1] + dy
        });
        if (logoText) {
          group.createOrUpdateChild(
            'poptip-logo-text',
            {
              ...logoTextStyle,
              x: 0,
              y: poptipHeight / 2,
              visible: bgVisible && (contentVisible || titleVisible),
              text: logoText,
              textAlign: 'center',
              textBaseline: 'middle',
              zIndex: 10
            },
            'text'
          );
        }
      }

      if (range) {
        _tBounds.setValue(0, 0, popTipWidth, poptipHeight).transformWithMatrix(group.globalTransMatrix);
        const b = _tBounds;
        const stageBounds = new Bounds().setValue(0, 0, range[0], range[1]);
        if (layout) {
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
        }

        // 检测是否是'top' | 'bottom' | 'left' | 'right'，如果是，则需要进行偏移
        // 1. 判断主方向上有没有重叠（top|bottom的话就是垂直方向，left|right的话就是水平方向），如果重叠就无法偏移
        // 2. 找到次方向上的偏移量（top|bottom的话就是水平方向，left|right的话就是垂直方向），然后对group进行偏移即可
        if (['top', 'bottom', 'left', 'right'].includes(p)) {
          const isVerticalPosition = p === 'top' || p === 'bottom';
          const isHorizontalPosition = p === 'left' || p === 'right';

          // 判断主方向上有没有偏移
          let mainDirectionOverlap = false;
          if (isVerticalPosition) {
            mainDirectionOverlap = (p === 'top' && b.y1 < 0) || (p === 'bottom' && b.y2 > stageBounds.y2);
          } else if (isHorizontalPosition) {
            mainDirectionOverlap = (p === 'left' && b.x1 < 0) || (p === 'right' && b.x2 > stageBounds.x2);
          }

          // 如果主方向上没有偏移，则可以尝试在次方向上找到合适的偏移量
          if (!mainDirectionOverlap) {
            let secondaryOffset = 0;

            const szNumber = (isArray(symbolSize) ? symbolSize[1] : symbolSize) / 2;
            if (isVerticalPosition) {
              // 水平偏移
              if (b.x1 < 0) {
                secondaryOffset = -b.x1;
              } else if (b.x2 > stageBounds.x2) {
                secondaryOffset = stageBounds.x2 - b.x2;
              }
              group.setAttribute('x', group.attribute.x + secondaryOffset);
              bgSymbol.setAttribute(
                'dx',
                min(max(bgSymbol.attribute.dx - secondaryOffset, szNumber), b.width() - szNumber)
              );
            } else if (isHorizontalPosition) {
              // 垂直偏移
              if (b.y1 < 0) {
                secondaryOffset = -b.y1;
              } else if (b.y2 > stageBounds.y2) {
                secondaryOffset = stageBounds.y2 - b.y2;
              }

              group.setAttribute('y', group.attribute.y + secondaryOffset);
              bgSymbol.setAttribute(
                'dy',
                min(max(bgSymbol.attribute.dy - secondaryOffset, szNumber), b.height() - szNumber)
              );
            }
            break;
          }
        }

        if (!layout) {
          break;
        }
      } else {
        break;
      }
    }
  }

  positionList = ['top', 'tl', 'tr', 'bottom', 'bl', 'br', 'left', 'lt', 'lb', 'right', 'rt', 'rb'];

  /**
   * Calculate anchor point based on positionBounds and position
   */
  calculateAnchorPoint(position: string, positionBounds?: IAABBBoundsLike): { x: number; y: number } {
    if (!positionBounds) {
      return { x: 0, y: 0 };
    }

    const { x, y } = this.attribute;

    const { x1, y1, x2, y2 } = positionBounds;
    const width = x2 - x1;
    const height = y2 - y1;

    // Calculate anchor point based on position
    switch (position) {
      case 'top':
      case 'tl':
      case 'tr':
        return { x: x1 + width / 2 - x, y: y1 - y };
      case 'bottom':
      case 'bl':
      case 'br':
        return { x: x1 + width / 2 - x, y: y2 - y };
      case 'left':
      case 'lt':
      case 'lb':
        return { x: x1 - x, y: y1 + height / 2 - y };
      case 'right':
      case 'rt':
      case 'rb':
        return { x: x2 - x, y: y1 + height / 2 - y };
      default:
        return { x: 0, y: 0 };
    }
  }

  getAngleAndOffset(
    position: string,
    width: number,
    height: number,
    size: [number, number],
    symbolType: 'arrow2Left' | string
  ): { angle: number; offset: [number, number] } {
    // const sizeW = size[0];
    const sizeH = symbolType === 'arrow2Left' ? size[1] / 2 : size[1];
    switch (position) {
      case 'tl':
        return {
          angle: symbolType === 'arrow2Left' ? (pi / 2) * 3 : 0,
          offset: symbolType === 'arrow2Left' ? [width / 4, height + sizeH] : [0, height + sizeH]
        };
      case 'top':
        return { angle: (pi / 2) * 3, offset: [width / 2, height + sizeH] };
      case 'tr':
        return {
          angle: symbolType === 'arrow2Left' ? (pi / 2) * 3 : 0,
          offset: symbolType === 'arrow2Left' ? [(width / 4) * 3, height + sizeH] : [width, height + sizeH]
        };
      case 'rt':
        return {
          angle: 0,
          offset: symbolType === 'arrow2Left' ? [-sizeH, height / 5] : [-sizeH, 0]
        };
      case 'right':
        return { angle: 0, offset: [-sizeH, height / 2] };
      case 'rb':
        return {
          angle: 0,
          offset: symbolType === 'arrow2Left' ? [-sizeH, (height / 5) * 4] : [-sizeH, height]
        };
      case 'bl':
        return {
          angle: symbolType === 'arrow2Left' ? pi / 2 : 0,
          offset: symbolType === 'arrow2Left' ? [width / 4, -sizeH] : [0, -sizeH]
        };
      case 'bottom':
        return { angle: pi / 2, offset: [width / 2, -sizeH] };
      case 'br':
        return {
          angle: symbolType === 'arrow2Left' ? pi / 2 : 0,
          offset: symbolType === 'arrow2Left' ? [(width / 4) * 3, -sizeH] : [width, -sizeH]
        };
      case 'lt':
        return {
          angle: symbolType === 'arrow2Left' ? pi : 0,
          offset: symbolType === 'arrow2Left' ? [width + sizeH, height / 5] : [width + sizeH, 0]
        };
      case 'left':
        return { angle: pi, offset: [width + sizeH, height / 2] };
      case 'lb':
        return {
          angle: symbolType === 'arrow2Left' ? pi : 0,
          offset: symbolType === 'arrow2Left' ? [width + sizeH, (height / 5) * 4] : [width + sizeH, height]
        };
    }
  }
}
