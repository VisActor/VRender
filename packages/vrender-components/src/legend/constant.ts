export const DEFAULT_SHAPE_SIZE = 10;
export const DEFAULT_SHAPE_SPACE = 8;
export const DEFAULT_LABEL_SPACE = 8;
export const DEFAULT_VALUE_SPACE = 8;
export const DEFAULT_ITEM_SPACE_COL = 16;
export const DEFAULT_ITEM_SPACE_ROW = 8;
export const DEFAULT_TITLE_SPACE = 12;
export const DEFAULT_PAGER_SPACE = 12;

export enum LegendStateValue {
  selected = 'selected',
  unSelected = 'unSelected',
  selectedHover = 'selectedHover',
  unSelectedHover = 'unSelectedHover',
  focus = 'focus'
}

export enum LegendEvent {
  legendItemHover = 'legendItemHover',
  legendItemUnHover = 'legendItemUnHover',
  legendItemClick = 'legendItemClick'
}

export enum LEGEND_ELEMENT_NAME {
  innerView = 'innerView',
  title = 'legendTitle',
  item = 'legendItem',
  itemShape = 'legendItemShape',
  itemLabel = 'legendItemLabel',
  itemValue = 'legendItemValue',
  focus = 'legendItemFocus'
}
