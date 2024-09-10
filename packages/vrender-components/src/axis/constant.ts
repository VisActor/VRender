export enum AXIS_ELEMENT_NAME {
  innerView = 'inner-view',
  axisContainer = 'axis-container',
  labelContainer = 'axis-label-container',
  tickContainer = 'axis-tick-container',
  tick = 'axis-tick',
  subTick = 'axis-sub-tick',
  label = 'axis-label',
  title = 'axis-title',
  gridContainer = 'axis-grid-container',
  grid = 'axis-grid',
  gridRegion = 'axis-grid-region',
  line = 'axis-line',
  background = 'axis-background',
  axisLabelBackground = 'axis-label-background',
  axisBreak = 'axis-break',
  axisBreakSymbol = 'axis-break-symbol'
}

export enum AxisStateValue {
  selected = 'selected',
  selectedReverse = 'selected_reverse',
  hover = 'hover',
  hoverReverse = 'hover_reverse'
}

export const DEFAULT_STATES = {
  [AxisStateValue.selectedReverse]: {},
  [AxisStateValue.selected]: {},
  [AxisStateValue.hover]: {},
  [AxisStateValue.hoverReverse]: {}
};

export const TopZIndex = 999;
