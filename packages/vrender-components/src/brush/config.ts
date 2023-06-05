export const DEFAULT_BRUSH_ATTRIBUTES = {
  brushMode: 'single',
  brushType: 'rect',
  brushStyle: {
    fill: true,
    fillColor: '#B0C8F9',
    fillOpacity: 0.2,
    strokeColor: '#B0C8F9',
    strokeWidth: 2
  },
  brushMoved: true,
  removeOnClick: true,
  delayType: 'throttle',
  delayTime: 10,
  interactiveRange: {
    y1: -Infinity,
    y2: Infinity,
    x1: -Infinity,
    x2: Infinity
  }
};
