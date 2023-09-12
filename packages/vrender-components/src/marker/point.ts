import type {
  IGroup,
  IImage,
  INode,
  ISymbol,
  IImageGraphicAttribute,
  IRichText,
  IRichTextGraphicAttribute,
  ILine,
  ILineGraphicAttribute
} from '@visactor/vrender';
// eslint-disable-next-line no-duplicate-imports
import { createRichText, createSymbol, createImage, createLine } from '@visactor/vrender';
import type { IPointLike } from '@visactor/vutils';
// eslint-disable-next-line no-duplicate-imports
import { merge } from '@visactor/vutils';
import { Segment } from '../segment';
import { Tag } from '../tag';
import { Marker } from './base';
import { DEFAULT_MARK_POINT_TEXT_STYLE_MAP, DEFAULT_MARK_POINT_THEME } from './config';
import type { IItemContent, IItemLine, MarkPointAttrs } from './type';
// eslint-disable-next-line no-duplicate-imports
import { IMarkPointItemPosition } from './type';
import type { Point } from '../core/type';
import { limitShapeInBounds } from '../util/limit-shape';

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
    itemPosition: Point,
    itemType: 'symbol' | 'text' | 'image' | 'richText' | 'custom'
  ) {
    if (!item) {
      return;
    }
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

    if (this.attribute.clipRange && this.attribute.itemContent?.autoRange) {
      const { x, y, width, height } = this.attribute.clipRange;
      limitShapeInBounds(item, {
        x1: x,
        y1: y,
        x2: x + width,
        y2: y + height
      });
    }
  }

  protected getItemDx(
    item: ISymbol | Tag | IImage | IRichText,
    position: IMarkPointItemPosition,
    style?: IImageGraphicAttribute | IRichTextGraphicAttribute
  ) {
    const width = (item as IGroup)?.AABBBounds?.width() ?? (style?.width || 0);
    if (position.includes('inside')) {
      return -width;
    }
    if (position === 'insideTop') {
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
    }
    if (position.includes('middle') || position.includes('Middle')) {
      return -height / 2;
    }
    return 0;
  }

  protected initItem(itemContent: IItemContent, itemPosition: Point) {
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

  protected getItemLineAttr(itemLine: IItemLine, position: Point, itemPosition: Point) {
    let points: Point[] = [];
    const { type = 'type-s' } = itemLine;
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
    return points;
  }

  protected setItemLineAttr(itemLine: IItemLine, position: Point, itemPosition: Point, visible: boolean) {
    const { startSymbol, endSymbol, lineStyle } = itemLine;
    const points = this.getItemLineAttr(itemLine, position, itemPosition);
    this._line?.setAttributes({
      points,
      startSymbol,
      endSymbol,
      lineStyle,
      visible
    });
  }

  protected getDecorativeLineAttr(itemLine: IItemLine, itemPosition: Point) {
    const decorativeLength = itemLine?.decorativeLine?.length || 10;
    const itemAngle = this._line.getEndAngle() || 0;
    const startPointOffsetX = (decorativeLength / 2) * Math.cos(itemAngle - Math.PI / 2);
    const startPointOffsetY = (decorativeLength / 2) * Math.sin(itemAngle - Math.PI / 2);
    const endPointOffsetX = (-decorativeLength / 2) * Math.cos(itemAngle - Math.PI / 2);
    const endPointOffsetY = (-decorativeLength / 2) * Math.sin(itemAngle - Math.PI / 2);
    return {
      startPointOffsetX,
      startPointOffsetY,
      endPointOffsetX,
      endPointOffsetY
    };
  }

  protected setDecorativeLineAttr(itemLine: IItemLine, itemPosition: Point, visible: boolean) {
    const { lineStyle } = itemLine;
    const { startPointOffsetX, startPointOffsetY, endPointOffsetX, endPointOffsetY } = this.getDecorativeLineAttr(
      itemLine,
      itemPosition
    );
    this._decorativeLine?.setAttributes({
      points: [
        {
          x: itemPosition.x + startPointOffsetX,
          y: itemPosition.y + startPointOffsetY
        },
        {
          x: itemPosition.x + endPointOffsetX,
          y: itemPosition.y + endPointOffsetY
        }
      ] as IPointLike[],
      ...(lineStyle as Partial<ILineGraphicAttribute>),
      visible
    });
  }

  protected initMarker(container: IGroup) {
    const { position, itemLine, itemContent } = this.attribute as MarkPointAttrs;
    const itemPosition = {
      x: position.x + (itemContent?.offsetX || 0),
      y: position.y + (itemContent?.offsetY || 0)
    };

    const line = new Segment({
      points: []
    });
    line.name = 'mark-point-line';
    this._line = line;
    container.add(line as unknown as INode);

    const decorativeLine = createLine({
      points: []
    });
    decorativeLine.name = 'mark-point-decorativeLine';
    this._decorativeLine = decorativeLine;
    container.add(decorativeLine as unknown as INode);

    this.setItemLineAttr(itemLine, position, itemPosition, itemLine?.visible);
    this.setDecorativeLineAttr(itemLine, itemPosition, itemLine?.decorativeLine?.visible);

    const item = this.initItem(itemContent as any, itemPosition);
    this._item = item;
    container.add(item as unknown as INode);
  }

  protected updateMarker() {
    const { position, itemLine, itemContent } = this.attribute as MarkPointAttrs;
    const { type = 'text' } = itemContent;
    const itemPosition = {
      x: position.x + (itemContent?.offsetX || 0),
      y: position.y + (itemContent?.offsetY || 0)
    };
    this.setItemLineAttr(itemLine, position, itemPosition, itemLine?.visible);
    this.setDecorativeLineAttr(itemLine, itemPosition, itemLine?.decorativeLine?.visible);
    this.setItemAttributes(this._item, itemContent, itemPosition, type);
  }
}
