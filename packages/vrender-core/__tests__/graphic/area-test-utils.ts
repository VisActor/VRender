// Pixel and hit-test assertions require a real Canvas instead of the default mock.
import '../../../../share/jest-config/setup-jsdom-canvas';
import '../../src/modules';
import type { IAreaGraphicAttribute, IContext2d, IDrawContext } from '../../src/interface';
import { Area } from '../../src/graphic/area';
import { DefaultCanvasAreaRender } from '../../src/render/contributions/render/area-render';

export const areaRenderer = new DefaultCanvasAreaRender({ getContributions: () => [] });

export function createAreaContext() {
  const canvas = document.createElement('canvas');
  canvas.width = 160;
  canvas.height = 80;
  const nativeContext = canvas.getContext('2d');
  const commands: Array<[string, ...number[]]> = [];
  const fills: IAreaGraphicAttribute[] = [];
  let attribute: IAreaGraphicAttribute;
  const context = {
    nativeContext,
    beginPath() {
      commands.push(['beginPath']);
      nativeContext.beginPath();
    },
    moveTo(x: number, y: number) {
      commands.push(['moveTo', x, y]);
      nativeContext.moveTo(x, y);
    },
    lineTo(x: number, y: number) {
      commands.push(['lineTo', x, y]);
      nativeContext.lineTo(x, y);
    },
    bezierCurveTo(...args: [number, number, number, number, number, number]) {
      const coordinates = args.slice(0, 6) as typeof args;
      commands.push(['bezierCurveTo', ...coordinates]);
      nativeContext.bezierCurveTo(...coordinates);
    },
    closePath() {
      commands.push(['closePath']);
      nativeContext.closePath();
    },
    setShadowBlendStyle() {
      // Geometry assertions use the native context's default shadow and blend settings.
    },
    setCommonStyle(_area: Area, attrs: IAreaGraphicAttribute) {
      attribute = attrs;
    },
    setStrokeStyle() {
      // The harness records stroke geometry without applying attribute styles.
    },
    fill() {
      fills.push(attribute);
      nativeContext.fill();
    },
    stroke() {
      nativeContext.stroke();
    }
  };
  return { context: context as unknown as IContext2d, nativeContext, commands, fills };
}

export function renderArea(attribute: IAreaGraphicAttribute | Area, x = 0, y = 0) {
  const area = attribute instanceof Area ? attribute : new Area({ fill: 'red', ...attribute });
  const record = createAreaContext();
  areaRenderer.drawShape(area, record.context, x, y, { context: record.context } as IDrawContext);
  return { ...record, area };
}

export const basisPoints = [
  { x: 0, y: 0, y1: 0 },
  { x: 10, y: 10, y1: 0 },
  { x: 500, y: 500, y1: -500, defined: false },
  { x: 20, y: 10, y1: 0 },
  { x: 30, y: 0, y1: 0 }
];
