import type {
  ILayer,
  IArc,
  IArcGraphicAttribute,
  IArea,
  IAreaGraphicAttribute,
  ICircle,
  ICircleGraphicAttribute,
  IGroup,
  IGroupGraphicAttribute,
  IImageGraphicAttribute,
  ILine,
  ILineGraphicAttribute,
  IPath,
  IPathGraphicAttribute,
  IPolygonGraphicAttribute,
  IRect,
  IRectGraphicAttribute,
  ISymbolGraphicAttribute,
  IText,
  ITextGraphicAttribute,
  ISymbol,
  IImage,
  IPolygon,
  IShadowRoot,
  IRichTextGraphicAttribute,
  IRichText,
  IGlyph,
  IGlyphGraphicAttribute,
  IRect3d,
  IRect3dGraphicAttribute
} from '@visactor/vrender';
import type { Key, ReactElement, ReactNode, Ref } from 'react';
import type { VRenderEvents } from './types';

type BaseProps<Element, Prop> = {
  key?: Key;
  ref?: Ref<Element>;
  children?: ReactNode;
} & Prop &
  VRenderEvents;

export function ElementOf<Element, Props, T extends string>(
  type: T
): (props: BaseProps<Element, Props>) => ReactElement<Props, T> {
  return type as any;
}

export const TYPES = {
  layer: 'Layer',
  arc: 'Arc',
  rect: 'Rect',
  circle: 'Circle',
  area: 'Area',
  group: 'Group'
};

export const Layer = ElementOf<ILayer, any, 'layer'>('layer');
export const Arc = ElementOf<IArc, IArcGraphicAttribute, 'arc'>('arc');
export const Area = ElementOf<IArea, IAreaGraphicAttribute, 'area'>('area');
export const Circle = ElementOf<ICircle, ICircleGraphicAttribute, 'circle'>('circle');
export const Group = ElementOf<IGroup, IGroupGraphicAttribute, 'group'>('group');
export const Image = ElementOf<IImage, IImageGraphicAttribute, 'image'>('image');
export const Line = ElementOf<ILine, ILineGraphicAttribute, 'line'>('line');
export const Path = ElementOf<IPath, IPathGraphicAttribute, 'path'>('path');
export const Rect = ElementOf<IRect, IRectGraphicAttribute, 'rect'>('rect');
export const Rect3d = ElementOf<IRect3d, IRect3dGraphicAttribute, 'rect3d'>('rect3d');
export const VRenderSymbol = ElementOf<ISymbol, ISymbolGraphicAttribute, 'symbol'>('symbol');
export const Text = ElementOf<IText, ITextGraphicAttribute, 'text'>('text');
export const RichText = ElementOf<IRichText, IRichTextGraphicAttribute, 'richtext'>('richtext');
export const Polygon = ElementOf<IPolygon, IPolygonGraphicAttribute, 'polygon'>('polygon');
export const Glyph = ElementOf<IGlyph, IGlyphGraphicAttribute, 'glyph'>('glyph');
export const ShadowRoot = ElementOf<IShadowRoot, IGroupGraphicAttribute, 'shadowroot'>('shadowroot');
