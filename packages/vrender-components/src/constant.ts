export const POLAR_START_ANGLE = -0.5 * Math.PI;
export const POLAR_END_ANGLE = 1.5 * Math.PI;

export const DEFAULT_TEXT_FONT_FAMILY =
  // eslint-disable-next-line max-len
  'PingFang SC,Helvetica Neue,Microsoft Yahei,system-ui,-apple-system,segoe ui,Roboto,Helvetica,Arial,sans-serif,apple color emoji,segoe ui emoji,segoe ui symbol';

export const DEFAULT_TEXT_FONT_SIZE = 14;

export enum StateValue {
  selected = 'selected',
  selectedReverse = 'selected_reverse',
  hover = 'hover',
  hoverReverse = 'hover_reverse'
}

export const DEFAULT_STATES = {
  [StateValue.selectedReverse]: {},
  [StateValue.selected]: {},
  [StateValue.hover]: {},
  [StateValue.hoverReverse]: {}
};

export const DEFAULT_HTML_TEXT_SPEC = {
  container: '',
  width: 30,
  height: 30,
  style: {}
};

export const SCROLLBAR_EVENT = 'scrollDrag';
