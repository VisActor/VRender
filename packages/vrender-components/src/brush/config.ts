export const DEFAULT_BRUSH_ATTRIBUTES = {
  trigger: 'pointerdown',
  updateTrigger: 'pointermove',
  endTrigger: ['pointerup', 'pointerleave'],
  resetTrigger: 'pointerupoutside',
  hasMask: true,
  brushMode: 'single',
  brushType: 'rect',
  brushStyle: {
    fill: '#B0C8F9',
    fillOpacity: 0.2,
    stroke: '#B0C8F9',
    strokeWidth: 2
  },
  brushMoved: true,
  removeOnClick: true,
  delayType: 'throttle',
  delayTime: 10,
  interactiveRange: {
    minY: -Infinity,
    maxY: Infinity,
    minX: -Infinity,
    maxX: Infinity
  }
};

export const DEFAULT_SIZE_THRESHOLD = 5;
