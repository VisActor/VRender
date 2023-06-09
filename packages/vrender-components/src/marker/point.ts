import {
  createRichText,
  createSymbol,
  createImage,
  createLine,
  IGroup,
  IImage,
  INode,
  ISymbol,
  IImageGraphicAttribute,
  IRichText,
  IRichTextGraphicAttribute,
  ILine
} from '@visactor/vrender';
import { IPointLike, merge } from '@visactor/vutils';
import { Segment } from '../segment';
import { Tag } from '../tag';
import { Marker } from './base';
import { DEFAULT_MARK_POINT_TEXT_STYLE_MAP, DEFAULT_MARK_POINT_THEME } from './config';
import { IItemContent, IItemLine, IMarkPointItemPosition, MarkPointAttrs } from './type';

export class MarkPoint extends Marker<MarkPointAttrs> {
  static defaultAttributes = DEFAULT_MARK_POINT_THEME;

  private _item!: ISymbol | Tag | IImage | IRichText;

  private _line?: Segment;

  private _decorativeLine!: ILine;

  constructor(attributes: MarkPointAttrs) {
    super(merge({}, MarkPoint.defaultAttributes, attributes));
  }

  protected setLabelPos() {
    //do nothing
  }

  protected setItemAttributes(
    item: ISymbol | Tag | IImage | IRichText,
    itemContent: IItemContent,
    itemPosition: IPointLike,
    itemType: 'symbol' | 'text' | 'image' | 'richText' | 'custom'
  ) {
    const {
      autoRotate = true,
      refX = 0,
      refY = 0,
      refAngle = 0,
      textStyle,
      richTextStyle,
      imageStyle,
      position = IMarkPointItemPosition.middle
    } = itemContent;
    const itemAngle = this._line?.getEndAngle() || 0;
    const itemOffsetX = refX * Math.cos(itemAngle) + refY * Math.cos(itemAngle - Math.PI / 2);
    const itemOffsetY = refX * Math.sin(itemAngle) + refY * Math.sin(itemAngle - Math.PI / 2);
    if (itemType === 'text') {
      item.setAttributes({
        ...textStyle,
        textStyle: {
          ...DEFAULT_MARK_POINT_TEXT_STYLE_MAP[itemContent?.position || 'end'],
          ...textStyle?.textStyle
        }
      });
    } else if (itemType === 'richText') {
      item.setAttributes({
        dx: this.getItemDx(item, position, richTextStyle) + (richTextStyle?.dx || 0),
        dy: this.getItemDy(item, position, richTextStyle) + (richTextStyle?.dy || 0)
      });
    } else if (itemType === 'image') {
      item.setAttributes({
        dx: this.getItemDx(item, position, imageStyle) + (imageStyle?.dx || 0),
        dy: this.getItemDy(item, position, imageStyle) + (imageStyle?.dy || 0)
      });
    }
    item.setAttributes({
      x: itemPosition.x + (itemOffsetX || 0),
      y: itemPosition.y + (itemOffsetY || 0),
      angle: autoRotate && itemAngle + refAngle
    });
  }

  protected getItemDx(
    item: ISymbol | Tag | IImage | IRichText,
    position: IMarkPointItemPosition,
    style?: IImageGraphicAttribute | IRichTextGraphicAttribute
  ) {
    const width = (item as IGroup)?.AABBBounds?.width() ?? (style?.width || 0);
    if (position.includes('inside')) {
      return -width;
    } else if (position === 'insideTop') {
      return 0;
    }
    return 0;
  }

  protected getItemDy(
    item: ISymbol | Tag | IImage | IRichText,
    position: IMarkPointItemPosition,
    style?: IImageGraphicAttribute | IRichTextGraphicAttribute
  ) {
    const height = (item as IGroup)?.AABBBounds?.height() ?? (style?.height || 0);
    if (position.includes('top') || position.includes('Top')) {
      return -height;
    } else if (position.includes('middle') || position.includes('Middle')) {
      return -height / 2;
    }
    return 0;
  }

  protected renderItem(itemContent: IItemContent, itemPosition: IPointLike) {
    const { type = 'text', symbolStyle, richTextStyle, imageStyle, renderCustomCallback } = itemContent;
    let item: ISymbol | Tag | IImage | IRichText | IGroup;
    if (type === 'symbol') {
      item = createSymbol({
        ...itemPosition,
        ...symbolStyle
      });
    } else if (type === 'text') {
      item = new Tag({
        ...itemPosition
      });
    } else if (type === 'richText') {
      item = createRichText({
        ...itemPosition,
        ...richTextStyle
      });
    } else if (type === 'image') {
      item = createImage({
        ...itemPosition,
        ...imageStyle
      });
    } else if (type === 'custom' && renderCustomCallback) {
      item = renderCustomCallback();
    }
    this.setItemAttributes(item, itemContent, itemPosition, type);
    return item;
  }

  protected renderItemLine(itemLine: IItemLine, position: IPointLike, itemPosition: IPointLike) {
    const { startSymbol, endSymbol, lineStyle, type = 'type-s' } = itemLine;
    let points: IPointLike[] = [];
    if (type === 'type-do') {
      points = [
        position,
        {
          x: (position.x + itemPosition.x) / 2,
          y: itemPosition.y
        },
        itemPosition
      ];
    } else if (type === 'type-po') {
      points = [
        position,
        {
          x: itemPosition.x,
          y: position.y
        },
        itemPosition
      ];
    } else if (type === 'type-op') {
      points = [
        position,
        {
          x: position.x,
          y: itemPosition.y
        },
        itemPosition
      ];
    } else {
      points = [position, itemPosition];
    }

    const line = new Segment({
      points,
      startSymbol,
      endSymbol,
      lineStyle
    });
    return line;
  }

  protected renderDecorativeLine(itemLine: IItemLine, itemPosition: IPointLike) {
    const { lineStyle } = itemLine;
    const decorativeLength = itemLine?.decorativeLine?.length || 10;
    const itemAngle = this._line.getEndAngle() || 0;
    const startPointOffsetX = (decorativeLength / 2) * Math.cos(itemAngle - Math.PI / 2);
    const startPointOffsetY = (decorativeLength / 2) * Math.sin(itemAngle - Math.PI / 2);
    const endPointOffsetX = (-decorativeLength / 2) * Math.cos(itemAngle - Math.PI / 2);
    const endPointOffsetY = (-decorativeLength / 2) * Math.sin(itemAngle - Math.PI / 2);
    return createLine({
      points: [
        {
          x: itemPosition.x + startPointOffsetX,
          y: itemPosition.y + startPointOffsetY
        },
        {
          x: itemPosition.x + endPointOffsetX,
          y: itemPosition.y + endPointOffsetY
        }
      ],
      ...lineStyle
    });
  }

  protected renderMarker(container: IGroup) {
    const { position, itemLine, itemContent } = this.attribute as MarkPointAttrs;
    const itemPosition = {
      x: position.x + (itemContent?.offsetX || 0),
      y: position.y + (itemContent?.offsetY || 0)
    };

    if (itemLine?.visible) {
      const line = this.renderItemLine(itemLine, position, itemPosition);
      line.name = 'mark-point-line';
      this._line = line;
      container.add(line as unknown as INode);

      if (itemLine?.decorativeLine?.visible) {
        const decorativeLine = this.renderDecorativeLine(itemLine, itemPosition);
        decorativeLine.name = 'mark-point-decorativeLine';
        this._decorativeLine = decorativeLine;
        container.add(decorativeLine as unknown as INode);
      }
    }

    const item = this.renderItem(itemContent as any, itemPosition);
    this._item = item;
    container.add(item as unknown as INode);
  }
}
