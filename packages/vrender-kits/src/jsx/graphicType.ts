import {
  graphicCreator,
  type IArc3dGraphicAttribute,
  type IArcGraphicAttribute,
  type IAreaGraphicAttribute,
  type ICircleGraphicAttribute,
  type IGlyphGraphicAttribute,
  type IGroupGraphicAttribute,
  type IImageGraphicAttribute,
  type ILineGraphicAttribute,
  type IPathGraphicAttribute,
  type IPolygonGraphicAttribute,
  type IPyramid3dGraphicAttribute,
  type IRect3dGraphicAttribute,
  type IRectGraphicAttribute,
  type IRichTextCharacter,
  type IRichTextGraphicAttribute,
  type IRichTextImageCharacter,
  type ISymbolGraphicAttribute,
  type ITextGraphicAttribute
} from '@visactor/vrender-core';

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
  stateProxy?: (stateName: string, targetStates?: string[]) => Partial<T>;
  // react可能类型报错
  children?: any;
  name?: string;
  id?: string;
} & IEventParamsType;

export function VArc(params: IDefaultGraphicParamsType<IArcGraphicAttribute>) {
  return (graphicCreator as any).arc(params ? params.attribute : {});
}
export function VArc3d(params: IDefaultGraphicParamsType<IArc3dGraphicAttribute>) {
  return (graphicCreator as any).arc3d(params ? params.attribute : {});
}
export function VArea(params: IDefaultGraphicParamsType<IAreaGraphicAttribute>) {
  return (graphicCreator as any).area(params ? params.attribute : {});
}
export function VCircle(params: IDefaultGraphicParamsType<ICircleGraphicAttribute>) {
  return (graphicCreator as any).circle(params ? params.attribute : {});
}
export function VGroup(params: IDefaultGraphicParamsType<IGroupGraphicAttribute>) {
  return (graphicCreator as any).group(params ? params.attribute : {});
}
export function VGlyph(params: IDefaultGraphicParamsType<IGlyphGraphicAttribute>) {
  return (graphicCreator as any).glyph(params ? params.attribute : {});
}
export function VImage(params: IDefaultGraphicParamsType<IImageGraphicAttribute>) {
  return (graphicCreator as any).image(params ? params.attribute : {});
}
export function VLine(params: IDefaultGraphicParamsType<ILineGraphicAttribute>) {
  return (graphicCreator as any).line(params ? params.attribute : {});
}
export function VPath(params: IDefaultGraphicParamsType<IPathGraphicAttribute>) {
  return (graphicCreator as any).path(params ? params.attribute : {});
}
export function VPolygon(params: IDefaultGraphicParamsType<IPolygonGraphicAttribute>) {
  return (graphicCreator as any).polygon(params ? params.attribute : {});
}
export function VPyramid3d(params: IDefaultGraphicParamsType<IPyramid3dGraphicAttribute>) {
  return (graphicCreator as any).pyramid3d(params ? params.attribute : {});
}
export function VRect(params: IDefaultGraphicParamsType<IRectGraphicAttribute>) {
  return (graphicCreator as any).rect(params ? params.attribute : {});
}
export function VRect3d(params: IDefaultGraphicParamsType<IRect3dGraphicAttribute>) {
  return (graphicCreator as any).rect3d(params ? params.attribute : {});
}
export function VSymbol(params: IDefaultGraphicParamsType<ISymbolGraphicAttribute>) {
  return (graphicCreator as any).symbol(params ? params.attribute : {});
}
export function VText(params: IDefaultGraphicParamsType<ITextGraphicAttribute>) {
  return (graphicCreator as any).text(params ? params.attribute : {});
}
export function VRichText(params: IDefaultGraphicParamsType<IRichTextGraphicAttribute>) {
  return (graphicCreator as any).richtext(params ? params.attribute : {});
}

VRichText.Text = function (params: IDefaultGraphicParamsType<IRichTextCharacter>) {
  return {
    type: 'rich/text',
    ...params
  };
};

VRichText.Image = function (params: IDefaultGraphicParamsType<IRichTextImageCharacter>) {
  return {
    type: 'rich/image',
    ...params
  };
};
