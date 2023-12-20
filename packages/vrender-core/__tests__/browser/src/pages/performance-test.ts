import {
  createCircle,
  createNode,
  // circleBound,
  createText,
  // textBound,
  // symbolBound,
  createSymbol,
  // lineBound,
  createLine,
  createRect,
  // rectBound,
  createPath,
  // pathBound,
  createArea,
  // areaBound,
  createImage,
  // imageBound,
  createArc,
  createStage,
  // arcBound,
  addRemTest,
  // bigDataChart,
  combinationChart
} from '../performance';
import { renderCircle } from '../render/circle';
import { renderText } from '../render/text';
import { renderSymbol } from '../render/symbol';
import { renderArc } from '../render/arc';
import { renderRect } from '../render/rect';
import { renderPath } from '../render/path';
import { renderLine } from '../render/line';
import { renderArea } from '../render/area';
import { renderMapPath } from '../render/path-map';

export const page = () => {
  console.time('stage');
  // createStage(40);
  console.timeEnd('stage');
  createNode(100000);
  createCircle(100000);
  // circleBound(100000);
  createText(100000);
  // textBound(100000);
  createSymbol(100000);
  // symbolBound(100000);
  createLine(100000);
  // lineBound(100000);
  createRect(100000);
  // rectBound(100000);
  createPath(100000);
  // pathBound(100000);
  createArea(100000);
  // areaBound(100000);
  createImage(100000);
  // imageBound(100000);
  createArc(100000);
  // arcBound(100000);
  addRemTest(100000);
  renderText(20000);
  renderSymbol(20000);
  renderCircle(20000);
  renderArc(20000);
  renderRect(20000);
  renderPath(20000);
  renderLine(2000);
  renderArea(2000);
  renderMapPath(100);
  // bigDataChart();
  // bigDataChart();
  combinationChart();
};
