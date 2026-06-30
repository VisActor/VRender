declare const require: any;
declare const __dirname: string;

const fs = require('fs');
const path = require('path');

describe('vrender-components root esm exports', () => {
  test('should expose marker runtime values as explicit named exports', () => {
    const rootEntry = path.resolve(__dirname, '../../src/index.ts');
    const content = fs.readFileSync(rootEntry, 'utf8');

    [
      "export { ScrollBar } from './scrollbar/scrollbar'",
      "export { loadScrollbar } from './scrollbar/module'",
      "export { loadPoptip } from './poptip/module'",
      "export { LineCrosshair } from './crosshair/line'",
      "export { CircleCrosshair } from './crosshair/circle'",
      "export { SectorCrosshair } from './crosshair/sector'",
      "export { PolygonCrosshair } from './crosshair/polygon'",
      "export { DataLabel } from './label/dataLabel'",
      "export { registerSymbolDataLabel } from './label/symbol'",
      "export { LineAxis } from './axis/line'",
      "export { CircleAxis } from './axis/circle'",
      "export { continuousTicks } from './axis/tick-data/continuous'",
      "export { polarAngleAxisDiscreteTicks } from './axis/tick-data/discrete/polar-angle'",
      "export { LineAxisGrid } from './axis/grid/line'",
      "export { CircleAxisGrid } from './axis/grid/circle'",
      "export { DataZoom } from './data-zoom/data-zoom'",
      "export { MarkLine, registerMarkLineAnimate } from './marker/line'",
      "export { MarkArea, registerMarkAreaAnimate } from './marker/area'",
      "export { MarkArcLine, registerMarkArcLineAnimate } from './marker/arc-line'",
      "export { MarkArcArea, registerMarkArcAreaAnimate } from './marker/arc-area'",
      "export { MarkPoint, registerMarkPointAnimate } from './marker/point'",
      "export { ColorContinuousLegend } from './legend/color/color'",
      "export { SizeContinuousLegend } from './legend/size/size'",
      "export { Title } from './title/title'",
      "export { Indicator } from './indicator/indicator'",
      "export { DiscretePlayer } from './player/discrete-player'",
      "export { ContinuousPlayer } from './player/continuous-player'",
      "export { PlayerEventEnum } from './player/type/event'",
      "export { Brush } from './brush/brush'",
      "export { IOperateType } from './brush/type'",
      "export { labelSmartInvert } from './util/label-smartInvert'"
    ].forEach(statement => {
      expect(content).toContain(statement);
    });
  });
});
