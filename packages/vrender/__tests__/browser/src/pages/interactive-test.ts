// import { loadFeishuContributions } from '@visactor/vrender';
import { renderArc } from '../interactive/arc';
import { renderArea } from '../interactive/area';
import { renderCircle } from '../interactive/circle';
import { renderImage } from '../interactive/image';
import { renderLine } from '../interactive/line';
import { renderPath } from '../interactive/path';
import { renderRect } from '../interactive/rect';
import { renderSymbol } from '../interactive/symbol';
import { renderText } from '../interactive/text';

// loadFeishuContributions();

export const page = () => {
  renderCircle(20);
  renderRect(20);
  renderArc(20);
  renderArea(20);
  renderImage(20);
  renderLine(20);
  renderPath(20);
  renderSymbol(20);
  renderText(20);
};
