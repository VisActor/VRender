import {
  registerGroup,
  registerSymbol,
  registerRect,
  registerWrapText,
  registerLine,
  registerArc,
  registerPolygon,
  registerRichtext
} from '@visactor/vrender-kits';

export function loadStoryListComponent() {
  registerGroup();
  registerSymbol();
  registerRect();
  registerWrapText();
  registerLine();
  registerArc();
  registerPolygon();
  registerRichtext();
}
