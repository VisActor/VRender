/**
 * @description 标题组件
 */
import type {
  IGroup,
  IText,
  IRichText,
  IRect,
  ISymbol,
  ITextGraphicAttribute,
  TextAlignType
} from '@visactor/vrender-core';
import { builtinSymbolsMap, calculateLineHeight } from '@visactor/vrender-core';
import { merge, isValid, normalizePadding, isNil } from '@visactor/vutils';
import { AbstractComponent } from '../core/base';
import { alignTextInLine, initTextMeasure } from '../util/text';
import { isVisible } from '../util';
import type { TooltipAttributes, TooltipRowAttrs, TooltipRowStyleAttrs, TooltipRichTextAttrs } from './type';
import { getRichTextAttribute, mergeRowAttrs } from './util';
import { defaultAttributes, TOOLTIP_POSITION_ATTRIBUTES } from './config';
import type { ComponentOptions } from '../interface';
import type { TextMeasureInput } from '@visactor/vutils';
import { DEFAULT_HTML_TEXT_SPEC } from '../constant';
import { loadTooltipComponent } from './register';

const TOOLTIP_BACKGROUND_NAME = 'tooltip-background';
const TOOLTIP_TITLE_NAME = 'tooltip-title';
const TOOLTIP_CONTENT_NAME = 'tooltip-content';

const TOOLTIP_SHAPE_NAME_SUFFIX = 'shape';
const TOOLTIP_KEY_NAME_SUFFIX = 'key';
const TOOLTIP_VALUE_NAME_SUFFIX = 'value';

loadTooltipComponent();
export class Tooltip extends AbstractComponent<Required<TooltipAttributes>> {
  name = 'tooltip';

  // tooltip 背景
  private _tooltipPanel!: IRect;
  // tooltip title 容器
  private _tooltipTitleContainer!: IGroup;
  // tooltip title shape
  private _tooltipTitleSymbol!: ISymbol;
  // tooltip title 文本
  private _tooltipTitle!: IText | IRichText;
  // tooltip 内容项容器
  private _tooltipContent!: IGroup;

  static defaultAttributes: Partial<TooltipAttributes> = defaultAttributes;

  constructor(attributes: TooltipAttributes, options?: ComponentOptions) {
    super(options?.skipDefault ? attributes : merge({}, Tooltip.defaultAttributes, attributes), options);
  }

  protected render() {
    const {
      visible,
      content,
      panel,
      keyWidth,
      valueWidth,
      hasContentShape,
      autoCalculatePosition,
      autoMeasure,
      align
    } = this.attribute;

    if (!visible) {
      this.hideAll();
      return;
    }

    if (autoMeasure) {
      Tooltip.measureTooltip(this.attribute);
    }
    if (autoCalculatePosition) {
      Tooltip.calculateTooltipPosition(this.attribute);
    }

    const padding = normalizePadding(this.attribute.padding);

    // 创建背景层
    this._tooltipPanel = this.createOrUpdateChild(
      TOOLTIP_BACKGROUND_NAME,
      {
        visible: true,
        ...panel
      },
      'rect'
    ) as IRect;

    // 创建标题层
    this._tooltipTitleContainer = this.createOrUpdateChild(
      TOOLTIP_TITLE_NAME,
      { visible: true, x: padding[3], y: padding[0] },
      'group'
    ) as IGroup;

    // 合并样式
    const titleAttr = Tooltip.getTitleAttr(this.attribute);

    // 创建标题 shape
    // 创建 symbol
    this._tooltipTitleSymbol = this._tooltipTitleContainer.createOrUpdateChild(
      `${TOOLTIP_TITLE_NAME}-${TOOLTIP_SHAPE_NAME_SUFFIX}`,
      merge({ symbolType: 'circle' }, titleAttr.shape, {
        visible: isVisible(titleAttr) && isVisible(titleAttr.shape)
      }),
      'symbol'
    ) as ISymbol;

    // 文本
    if (
      typeof titleAttr.value.text === 'object' &&
      titleAttr.value.text !== null &&
      ((titleAttr.value.text as TooltipRichTextAttrs).type === 'rich' ||
        (titleAttr.value.text as TooltipRichTextAttrs).type === 'html')
    ) {
      if ((titleAttr.value.text as TooltipRichTextAttrs).type === 'rich') {
        this._tooltipTitle = this._tooltipTitleContainer.createOrUpdateChild(
          `${TOOLTIP_TITLE_NAME}-${TOOLTIP_VALUE_NAME_SUFFIX}`,
          {
            visible: isVisible(titleAttr) && isVisible(titleAttr.value),
            ...getRichTextAttribute(titleAttr.value)
          },
          'richtext'
        ) as IRichText;
      } else if ((titleAttr.value.text as TooltipRichTextAttrs).type === 'html') {
        this._tooltipTitle = this._tooltipTitleContainer.createOrUpdateChild(
          `${TOOLTIP_TITLE_NAME}-${TOOLTIP_VALUE_NAME_SUFFIX}`,
          {
            html: {
              dom: (titleAttr.value.text as TooltipRichTextAttrs).text as string,
              ...DEFAULT_HTML_TEXT_SPEC,
              ...titleAttr.value
            },
            visible: isVisible(titleAttr) && isVisible(titleAttr.value),
            width: titleAttr.value.width,
            height: titleAttr.value.height,
            wordBreak: titleAttr.value.wordBreak as any,
            textAlign: titleAttr.value.textAlign as any,
            textBaseline: titleAttr.value.textBaseline as any,
            singleLine: false,
            textConfig: [],
            ...(titleAttr.value as any)
          },
          'richtext'
        ) as IRichText;
      }
    } else if (titleAttr.value.multiLine) {
      this._tooltipTitle = this._tooltipTitleContainer.createOrUpdateChild(
        `${TOOLTIP_TITLE_NAME}-${TOOLTIP_VALUE_NAME_SUFFIX}`,
        {
          visible: isVisible(titleAttr) && isVisible(titleAttr.value),
          ...getRichTextAttribute(titleAttr.value)
        },
        'richtext'
      ) as IRichText;
    } else {
      this._tooltipTitle = this._tooltipTitleContainer.createOrUpdateChild(
        `${TOOLTIP_TITLE_NAME}-${TOOLTIP_VALUE_NAME_SUFFIX}`,
        {
          text: (titleAttr.value.text ?? '') as any,
          visible: isVisible(titleAttr) && isVisible(titleAttr.value),
          ...titleAttr.value
        },
        'text'
      ) as IText;
    }

    // 调整标题的位置
    const titlePaddingLeft = isVisible(titleAttr.shape) ? titleAttr.shape.size + titleAttr.shape.spacing : 0;
    const { textAlign, textBaseline } = titleAttr.value;
    const contentWidth = panel.width - padding[3] - padding[0] - titlePaddingLeft;
    if (textAlign === 'center') {
      this._tooltipTitle.setAttribute('x', titlePaddingLeft + contentWidth / 2);
    } else if (textAlign === 'right' || textAlign === 'end') {
      // 右对齐
      this._tooltipTitle.setAttribute('x', titlePaddingLeft + contentWidth);
    } else {
      // 默认左对齐
      this._tooltipTitle.setAttribute('x', titlePaddingLeft);
    }
    if (textBaseline === 'bottom') {
      this._tooltipTitle.setAttribute('y', titleAttr.height);
    } else if (textBaseline === 'middle') {
      this._tooltipTitle.setAttribute('y', titleAttr.height / 2);
    } else {
      this._tooltipTitle.setAttribute('y', 0);
    }
    const titleHeight = isVisible(titleAttr) ? titleAttr.height + titleAttr.spaceRow : 0;

    // 创建内容层
    this._tooltipContent = this.createOrUpdateChild(TOOLTIP_CONTENT_NAME, { visible: true }, 'group') as IGroup;
    this._tooltipContent.removeAllChild(true); // 清空内容区

    if (content && content.length) {
      this._tooltipContent.setAttribute('x', padding[3]);
      this._tooltipContent.setAttribute('y', padding[0] + titleHeight);

      let lastYPos = 0;
      content.forEach((item, i) => {
        // 合并样式
        const itemAttr = Tooltip.getContentAttr(this.attribute, i);

        if (!isVisible(itemAttr)) {
          return;
        }

        const itemGroupName = `${TOOLTIP_CONTENT_NAME}-${i}`;
        const itemGroup = this._tooltipContent.createOrUpdateChild(
          itemGroupName,
          { visible: true, x: 0, y: lastYPos },
          'group'
        ) as IGroup;

        const shapeOffsetWidth = itemAttr.shape.size + itemAttr.shape.spacing;
        let x =
          align === 'right'
            ? (hasContentShape ? shapeOffsetWidth : 0) +
              (isVisible(itemAttr.key) ? keyWidth + itemAttr.key.spacing : 0) +
              (isVisible(itemAttr.value) ? valueWidth : 0)
            : 0;

        this._createShape(
          align === 'right' ? x - itemAttr.shape.size / 2 : x + itemAttr.shape.size / 2,
          itemAttr,
          itemGroup,
          itemGroupName
        );
        if (hasContentShape) {
          if (align === 'right') {
            x -= shapeOffsetWidth;
          } else {
            x += shapeOffsetWidth;
          }
        }

        const keyGraphic = this._createKey(itemAttr, itemGroup, itemGroupName);

        if (keyGraphic) {
          alignTextInLine(align, keyGraphic, itemAttr.key.textAlign, x, keyWidth);
          keyGraphic.setAttribute('y', 0);
          if (align === 'right') {
            x -= keyWidth + itemAttr.key.spacing;
          } else {
            x += keyWidth + itemAttr.key.spacing;
          }
        }
        const valueGraphic = this._createValue(itemAttr, itemGroup, itemGroupName);
        if (valueGraphic) {
          let textAlign: TextAlignType = 'right';

          if (isValid(itemAttr.value.textAlign)) {
            textAlign = itemAttr.value.textAlign;
          } else if (!isVisible(itemAttr.key) && align !== 'right') {
            textAlign = 'left';
          }
          valueGraphic.setAttribute('textAlign', textAlign);
          alignTextInLine(align, valueGraphic, textAlign, x, valueWidth);
          valueGraphic.setAttribute('y', 0);
        }

        lastYPos += itemAttr.height + itemAttr.spaceRow;
      });
    }
  }

  protected _createShape(
    x: number,
    itemAttr: TooltipRowAttrs & TooltipRowStyleAttrs,
    itemGroup: IGroup,
    itemGroupName: string
  ) {
    if (isVisible(itemAttr.shape)) {
      // 存在 symbol
      return itemGroup.createOrUpdateChild(
        `${itemGroupName}-${TOOLTIP_SHAPE_NAME_SUFFIX}`,
        {
          visible: true,
          x: x,
          y:
            itemAttr.shape.size / 2 +
            ((calculateLineHeight(itemAttr.key.lineHeight, itemAttr.key.fontSize) ?? itemAttr.key.fontSize) -
              itemAttr.shape.size) /
              2,
          ...itemAttr.shape
        },
        'symbol'
      ) as ISymbol;
    }

    return;
  }

  protected _createKey(itemAttr: TooltipRowAttrs & TooltipRowStyleAttrs, itemGroup: IGroup, itemGroupName: string) {
    if (isVisible(itemAttr.key)) {
      let element: IRichText | IText;
      if (itemAttr.key.multiLine) {
        element = itemGroup.createOrUpdateChild(
          `${itemGroupName}-${TOOLTIP_KEY_NAME_SUFFIX}`,
          {
            visible: true,
            ...getRichTextAttribute(itemAttr.key),
            textBaseline: 'top'
          },
          'richtext'
        ) as IRichText;
      } else if (
        typeof itemAttr.key.text === 'object' &&
        itemAttr.key.text !== null &&
        ((itemAttr.key.text as TooltipRichTextAttrs).type === 'rich' ||
          (itemAttr.key.text as TooltipRichTextAttrs).type === 'html')
      ) {
        if ((itemAttr.key.text as TooltipRichTextAttrs).type === 'rich') {
          element = itemGroup.createOrUpdateChild(
            `${itemGroupName}-${TOOLTIP_VALUE_NAME_SUFFIX}`,
            {
              visible: true,
              ...getRichTextAttribute(itemAttr.key),
              textBaseline: 'top'
            },
            'richtext'
          ) as IRichText;
        } else {
          element = itemGroup.createOrUpdateChild(
            `${itemGroupName}-${TOOLTIP_VALUE_NAME_SUFFIX}`,
            {
              html: {
                dom: (itemAttr.key.text as TooltipRichTextAttrs).text as string,
                ...DEFAULT_HTML_TEXT_SPEC,
                ...itemAttr.key
              }
            },
            'richtext'
          ) as IRichText;
        }
      } else {
        element = itemGroup.createOrUpdateChild(
          `${itemGroupName}-${TOOLTIP_KEY_NAME_SUFFIX}`,
          {
            visible: true,
            text: (itemAttr.key.text ?? '') as any,
            ...itemAttr.key,
            textBaseline: 'top'
          },
          'text'
        ) as IText;
      }

      return element;
    }
    return;
  }

  protected _createValue(itemAttr: TooltipRowAttrs & TooltipRowStyleAttrs, itemGroup: IGroup, itemGroupName: string) {
    if (isVisible(itemAttr.value)) {
      let element: IRichText | IText;
      if (itemAttr.value.multiLine) {
        element = itemGroup.createOrUpdateChild(
          `${itemGroupName}-${TOOLTIP_VALUE_NAME_SUFFIX}`,
          {
            visible: true,
            ...getRichTextAttribute(itemAttr.value),
            textBaseline: 'top'
          },
          'richtext'
        ) as IRichText;
      } else if (
        typeof itemAttr.value.text === 'object' &&
        itemAttr.value.text !== null &&
        ((itemAttr.value.text as TooltipRichTextAttrs).type === 'rich' ||
          (itemAttr.value.text as TooltipRichTextAttrs).type === 'html')
      ) {
        if ((itemAttr.value.text as TooltipRichTextAttrs).type === 'rich') {
          element = itemGroup.createOrUpdateChild(
            `${itemGroupName}-${TOOLTIP_VALUE_NAME_SUFFIX}`,
            {
              visible: true,
              ...getRichTextAttribute(itemAttr.value),
              textBaseline: 'top'
            },
            'richtext'
          ) as IRichText;
        } else {
          element = itemGroup.createOrUpdateChild(
            `${itemGroupName}-${TOOLTIP_VALUE_NAME_SUFFIX}`,
            {
              html: {
                dom: (itemAttr.value.text as TooltipRichTextAttrs).text as string,
                container: '',
                width: 30,
                height: 30,
                style: {},
                ...itemAttr.value
              }
            },
            'richtext'
          ) as IRichText;
        }
      } else {
        element = itemGroup.createOrUpdateChild(
          `${itemGroupName}-${TOOLTIP_VALUE_NAME_SUFFIX}`,
          {
            visible: true,
            text: (itemAttr.value.text ?? '') as any,
            ...itemAttr.value,
            textBaseline: 'top'
          },
          'text'
        ) as IText;
      }

      return element;
    }

    return;
  }

  setAttributes(params: Partial<Required<TooltipAttributes>>, forceUpdateTag?: boolean | undefined): void {
    const keys = Object.keys(params) as (keyof TooltipAttributes)[];
    // 优化：只更改 tooltip 位置
    if (this.attribute.autoCalculatePosition && keys.every(key => TOOLTIP_POSITION_ATTRIBUTES.includes(key))) {
      this._mergeAttributes(params, keys);
      // 计算 x y
      if (isNil(this.attribute.panel.width) && this.attribute.autoMeasure) {
        Tooltip.measureTooltip(this.attribute);
      }
      Tooltip.calculateTooltipPosition(this.attribute);
      // 应用 x y
      super.setAttributes(
        {
          x: this.attribute.x,
          y: this.attribute.y
        },
        forceUpdateTag
      );
    } else {
      super.setAttributes(params, forceUpdateTag);
    }
  }

  static calculateTooltipPosition(attribute: Partial<TooltipAttributes>): Partial<TooltipAttributes> {
    const { width: tooltipBoxWidth = 0, height: tooltipBoxHeight = 0 } = attribute.panel;

    const { offsetX, offsetY, pointerX, pointerY, positionX, positionY, parentBounds } = attribute;

    let x = pointerX;
    let y = pointerY;
    if (positionX === 'left') {
      x -= tooltipBoxWidth + offsetX;
    } else if (positionX === 'center') {
      x -= tooltipBoxWidth / 2;
    } else {
      x += offsetX;
    }
    if (positionY === 'top') {
      y -= tooltipBoxHeight + offsetY;
    } else if (positionY === 'middle') {
      y -= tooltipBoxHeight / 2;
    } else {
      y += offsetY;
    }

    /* 确保tooltip在视区内 */
    if (x + tooltipBoxWidth > parentBounds.x2) {
      // 位置不超出视区右界
      x -= tooltipBoxWidth + offsetX;
    }
    if (y + tooltipBoxHeight > parentBounds.y2) {
      // 位置不超出视区下界
      y -= tooltipBoxHeight + offsetY;
    }
    if (x < parentBounds.x1) {
      // 位置不超出视区左界
      x = parentBounds.x1;
    }
    if (y < parentBounds.y1) {
      // 位置不超出视区上界
      y = parentBounds.y1;
    }

    attribute.x = x;
    attribute.y = y;

    return attribute;
  }

  static measureTooltip(attribute: Partial<TooltipAttributes>): Partial<TooltipAttributes> {
    const { content, contentStyle } = attribute;
    const padding = normalizePadding(attribute.padding);
    // 合并样式
    const titleAttr = Tooltip.getTitleAttr(attribute);

    let maxWidth = 0;
    let containerHeight = padding[0] + padding[2];

    // calculate title
    let titleMaxHeight = 0;
    const { value: titleValue, shape: titleShape } = titleAttr;
    const { visible: titleHasShape = false, symbolType: titleShapeType = '' } = titleShape ?? {};

    if (isValid(titleValue) && typeof titleAttr.value.text !== 'object') {
      const { width, height } = initTextMeasure(titleValue as Partial<ITextGraphicAttribute>).quickMeasure(
        titleValue.text as TextMeasureInput
      );
      maxWidth = width;
      titleMaxHeight = height;
    }
    if (titleHasShape && builtinSymbolsMap[titleShapeType]) {
      maxWidth += titleShape.size + titleShape.spacing;
      titleMaxHeight = Math.max(titleShape.size, titleMaxHeight);
    }

    if (attribute.title) {
      attribute.title.width = maxWidth;
      attribute.title.height = titleMaxHeight;
    }

    if (isVisible(titleAttr)) {
      containerHeight += titleMaxHeight + titleAttr.spaceRow;
    }

    // calculate content
    if (content && content.length) {
      // filter content
      const filteredContent: [TooltipRowAttrs, TooltipRowAttrs][] = [];
      content.forEach((item, i) => {
        // 合并样式
        const itemAttr = Tooltip.getContentAttr(attribute, i);
        if ((item.key || item.value) && isVisible(itemAttr)) {
          filteredContent.push([item, itemAttr]);
        }
      });

      if (filteredContent.length) {
        let hasContentShape = false;
        const shapeWidths: number[] = [];
        const keyWidths: number[] = [];
        const valueWidths: number[] = [];

        filteredContent.forEach(([item, itemAttr], i) => {
          const { key, value, shape, spaceRow } = itemAttr;
          const itemHasShape = isVisible(shape);
          const itemShapeType = shape?.symbolType ?? '';

          const keyTextMeasure = initTextMeasure(key as Partial<ITextGraphicAttribute>);
          const valueTextMeasure = initTextMeasure(value as Partial<ITextGraphicAttribute>);

          let itemHeight = 0;
          if (isVisible(key)) {
            const { width, height } = keyTextMeasure.quickMeasure(key.text as TextMeasureInput);
            keyWidths.push(width);
            itemHeight = Math.max(itemHeight, height);
          }
          if (isVisible(value)) {
            const { width, height } = valueTextMeasure.quickMeasure(value.text as TextMeasureInput);
            valueWidths.push(width);
            itemHeight = Math.max(itemHeight, height);
          }
          if (itemHasShape && builtinSymbolsMap[itemShapeType]) {
            hasContentShape = true;
            shapeWidths.push(shape.size);
            itemHeight = Math.max(shape.size, itemHeight);
          }

          item.height = itemHeight;
          containerHeight += itemHeight;
          if (i < filteredContent.length - 1) {
            containerHeight += spaceRow ?? contentStyle.spaceRow;
          }
        });

        const maxShapeWidth = shapeWidths.length ? Math.max(...shapeWidths) : 0; // shape 需要对齐
        const maxKeyWidth = keyWidths.length ? Math.max(...keyWidths) : 0; // name 需要对齐
        const maxValueWidth = valueWidths.length ? Math.max(...valueWidths) : 0; // value 需要对齐
        maxWidth = Math.max(
          maxKeyWidth +
            maxValueWidth +
            contentStyle.key.spacing +
            contentStyle.value.spacing +
            (hasContentShape ? maxShapeWidth + contentStyle.shape.spacing : 0),
          maxWidth
        );
        content.forEach(item => {
          item.width = maxWidth;
        });
        attribute.hasContentShape = hasContentShape;
        attribute.keyWidth = maxKeyWidth;
        attribute.valueWidth = maxValueWidth;
      }
    }

    attribute.panel.width = maxWidth + padding[1] + padding[3];
    attribute.panel.height = containerHeight;

    return attribute;
  }

  static getTitleAttr(attribute: Partial<TooltipAttributes>): TooltipRowAttrs & TooltipRowStyleAttrs {
    return mergeRowAttrs(
      {},
      Tooltip.defaultAttributes.titleStyle,
      Tooltip.defaultAttributes.title,
      attribute.titleStyle,
      attribute.title
    );
  }

  static getContentAttr(attribute: Partial<TooltipAttributes>, index: number): TooltipRowAttrs & TooltipRowStyleAttrs {
    return mergeRowAttrs({}, Tooltip.defaultAttributes.contentStyle, attribute.contentStyle, attribute.content[index]);
  }
}
