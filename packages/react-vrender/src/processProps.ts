import type { VRenderEvents, Instance, Props } from './types';

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

const isEvent = (key: string) => !!REACT_TO_CANOPUS_EVENTS[key];

export const splitProps = (props: Props) => {
  const eventProps: VRenderEvents = {};
  const graphicProps: Partial<Props> = {};

  Object.keys(props).forEach(key => {
    if (REACT_TO_CANOPUS_EVENTS[key]) {
      eventProps[key] = props[key];
    } else {
      graphicProps[key] = props[key];
    }
  });

  return { graphicProps, eventProps };
};

export const bindGraphicEvent = (eventProps: VRenderEvents, instance: Instance) => {
  Object.keys(eventProps).forEach(propKey => {
    if (typeof eventProps[propKey] === 'function') {
      instance.addEventListener(REACT_TO_CANOPUS_EVENTS[propKey], eventProps[propKey]);
    }
  });
};

export const updateProps = (instance: Instance, newProps: Props, oldProps?: Props) => {
  Object.keys(oldProps).forEach(key => {
    const propChanged = oldProps && oldProps[key] !== newProps[key];
    if (propChanged) {
      if (isEvent(key)) {
        instance.removeEventListener(REACT_TO_CANOPUS_EVENTS[key], oldProps[key]);
      } else {
        (instance as any).setAttribute(key, undefined);
      }
    }
  });

  Object.keys(newProps).forEach(key => {
    const propChanged = oldProps[key] !== newProps[key];

    if (propChanged) {
      if (isEvent(key)) {
        if (typeof newProps[key] === 'function') {
          instance.addEventListener(REACT_TO_CANOPUS_EVENTS[key], newProps[key]);
        }
      } else {
        (instance as any).setAttribute(key, newProps[key]);
      }
    }
  });
};
