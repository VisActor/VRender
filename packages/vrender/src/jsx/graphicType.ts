import {
  createArc,
  createArc3d,
  createArea,
  createCircle,
  createGlyph,
  createGroup,
  createImage,
  createLine,
  createPath,
  createPolygon,
  createPyramid3d,
  createRect,
  createRect3d,
  createSymbol,
  createText
} from '../graphic';
import type {
  IArc3dGraphicAttribute,
  IArcGraphicAttribute,
  IAreaGraphicAttribute,
  ICircleGraphicAttribute,
  IGlyphGraphicAttribute,
  IGroupGraphicAttribute,
  IImageGraphicAttribute,
  ILineGraphicAttribute,
  IPathGraphicAttribute,
  IPolygonGraphicAttribute,
  IPyramid3dGraphicAttribute,
  IRect3dGraphicAttribute,
  IRectGraphicAttribute,
  ISymbolGraphicAttribute,
  ITextGraphicAttribute
} from '../interface';
import { IArcAttribute, IGraphic, IGroup, ISymbol, ISymbolAttribute } from '../interface';

export const REACT_TO_CANOPUS_EVENTS = {
  onPointerDown: 'pointerdown',
  onPointerUp: 'pointerup',
  onPointerUpOutside: 'pointerupoutside',
  onPointerTap: 'pointertap',
  onPointerOver: 'pointerover',
  onPointerMove: 'pointermove',
  onPointerEnter: 'pointerenter',
  onPointerLeave: 'pointerleave',
  onPointerOut: 'pointerout',
  onMouseDown: 'mousedown',
  onMouseUp: 'mouseup',
  onMouseUpOutside: 'mouseupoutside',
  onMouseMove: 'mousemove',
  onMouseOver: 'mouseover',
  onMouseOut: 'mouseout',
  onMouseEnter: 'mouseenter',
  onMouseLeave: 'mouseleave',
  onPinch: 'pinch',
  onPinchStart: 'pinchstart',
  onPinchEnd: 'pinchend',
  onPan: 'pan',
  onPanStart: 'panstart',
  onPanEnd: 'panend',
  onDrag: 'drag',
  onDragStart: 'dragstart',
  onDragEnter: 'dragenter',
  onDragLeave: 'dragleave',
  onDragOver: 'dragover',
  onDragEnd: 'dragend',
  onRightDown: 'rightdown',
  onRightUp: 'rightup',
  onRightUpOutside: 'rightupoutside',
  onTouchStart: 'touchstart',
  onTouchEnd: 'touchend',
  onTouchEndOutside: 'touchendoutside',
  onTouchMove: 'touchmove',
  onTouchCancel: 'touchcancel',
  onPress: 'press',
  onPressUp: 'pressup',
  onPressEnd: 'pressend',
  onSwipe: 'swipe',
  onDrop: 'drop',
  onWeel: 'wheel',
  onClick: 'click',
  onDblClick: 'dblclick'
};

export const REACT_TO_CANOPUS_EVENTS_LIST = Object.keys(REACT_TO_CANOPUS_EVENTS);

export type IEventParamsType = {
  [t in keyof typeof REACT_TO_CANOPUS_EVENTS]?: (d: any) => void;
};

export type IDefaultGraphicParamsType<T> = {
  attribute?: T;
} & IEventParamsType;

export function VArc(params: IDefaultGraphicParamsType<IArcGraphicAttribute>) {
  return createArc(params ? params.attribute : {});
}
export function VArc3d(params: IDefaultGraphicParamsType<IArc3dGraphicAttribute>) {
  return createArc3d(params ? params.attribute : {});
}
export function VArea(params: IDefaultGraphicParamsType<IAreaGraphicAttribute>) {
  return createArea(params ? params.attribute : {});
}
export function VCircle(params: IDefaultGraphicParamsType<ICircleGraphicAttribute>) {
  return createCircle(params ? params.attribute : {});
}
export function VGroup(params: IDefaultGraphicParamsType<IGroupGraphicAttribute>) {
  return createGroup(params ? params.attribute : {});
}
export function VGlyph(params: IDefaultGraphicParamsType<IGlyphGraphicAttribute>) {
  return createGlyph(params ? params.attribute : {});
}
export function VImage(params: IDefaultGraphicParamsType<IImageGraphicAttribute>) {
  return createImage(params ? params.attribute : {});
}
export function VLine(params: IDefaultGraphicParamsType<ILineGraphicAttribute>) {
  return createLine(params ? params.attribute : {});
}
export function VPath(params: IDefaultGraphicParamsType<IPathGraphicAttribute>) {
  return createPath(params ? params.attribute : {});
}
export function VPolygon(params: IDefaultGraphicParamsType<IPolygonGraphicAttribute>) {
  return createPolygon(params ? params.attribute : {});
}
export function VPyramid3d(params: IDefaultGraphicParamsType<IPyramid3dGraphicAttribute>) {
  return createPyramid3d(params ? params.attribute : {});
}
export function VRect(params: IDefaultGraphicParamsType<IRectGraphicAttribute>) {
  return createRect(params ? params.attribute : {});
}
export function VRect3d(params: IDefaultGraphicParamsType<IRect3dGraphicAttribute>) {
  return createRect3d(params ? params.attribute : {});
}
export function VSymbol(params: IDefaultGraphicParamsType<ISymbolGraphicAttribute>) {
  return createSymbol(params ? params.attribute : {});
}
export function VText(params: IDefaultGraphicParamsType<ITextGraphicAttribute>) {
  return createText(params ? params.attribute : {});
}
