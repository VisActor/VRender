import { createRect, createText, type IGraphic, type IText } from '@visactor/vrender';
import { createBrowserPageApp } from '../page-stage';
import { setHarnessStage } from '../harness';

const CELL_COUNT = 5000;
const CELL_WIDTH = 120;
const CELL_HEIGHT = 28;
const COLUMN_COUNT = 50;
const TEXT_INSET_X = 8;
const TEXT_INSET_Y = 14;
const SAMPLE_TEXT_COUNT = 10;

type TVTableLiteScenario = 'basic' | 'text-stateproxy';

declare global {
  interface Window {
    __D3_VTABLE_LITE__?: {
      scenario: TVTableLiteScenario;
      cellCount: number;
      graphicCount: number;
      sampleCount?: number;
      semanticPassed?: boolean;
      sampleResults?: boolean[];
    };
  }
}

function createCellPosition(index: number) {
  const column = index % COLUMN_COUNT;
  const row = Math.floor(index / COLUMN_COUNT);
  return {
    x: column * CELL_WIDTH,
    y: row * CELL_HEIGHT
  };
}

function createBasicCell(index: number): IGraphic[] {
  const { x, y } = createCellPosition(index);
  const background = createRect({
    x,
    y,
    width: CELL_WIDTH - 2,
    height: CELL_HEIGHT - 2,
    fill: index % 2 === 0 ? '#f8fafc' : '#eef2ff',
    stroke: '#d0d7de',
    lineWidth: 1
  } as any);
  const text = createText({
    x: x + TEXT_INSET_X,
    y: y + TEXT_INSET_Y,
    text: `R${Math.floor(index / COLUMN_COUNT)}C${index % COLUMN_COUNT}`,
    fontSize: 12,
    fill: '#24292f',
    textBaseline: 'middle'
  } as any);

  return [background, text];
}

function createStateProxyCell(index: number, sampleTexts: IText[]): IGraphic[] {
  const graphics = createBasicCell(index);
  const text = graphics[1] as IText;
  text.states = {
    hover: {
      fill: '#24292f'
    }
  } as any;
  text.stateProxy = (stateName: string) => {
    if (stateName !== 'hover') {
      return undefined;
    }

    return {
      fill: '#0057ff'
    } as any;
  };

  if (sampleTexts.length < SAMPLE_TEXT_COUNT) {
    sampleTexts.push(text);
  }

  return graphics;
}

function createRunButton(count: number, run: () => void, parent: HTMLDivElement) {
  const button = document.createElement('button');
  button.innerHTML = `run ${count}`;
  button.style.display = 'inline-flex';
  button.style.alignItems = 'center';
  button.style.justifyContent = 'center';
  button.style.padding = '8px 14px';
  button.style.fontSize = '14px';
  button.style.fontWeight = '600';
  button.style.border = '1px solid #d0d7de';
  button.style.borderRadius = '6px';
  button.style.background = '#ffffff';
  button.style.color = '#24292f';
  button.style.cursor = 'pointer';
  button.onclick = () => {
    for (let i = 0; i < count; i++) {
      run();
    }
  };
  parent.appendChild(button);
}

export function createVTableLitePage(scenario: TVTableLiteScenario) {
  const container = document.querySelector<HTMLDivElement>('#container');
  const app = createBrowserPageApp();
  let stage: any;

  const run = () => {
    stage?.release();
    const graphics: IGraphic[] = [];
    const sampleTexts: IText[] = [];

    for (let i = 0; i < CELL_COUNT; i++) {
      const cellGraphics = scenario === 'basic' ? createBasicCell(i) : createStateProxyCell(i, sampleTexts);
      graphics.push(...cellGraphics);
    }

    window.__D3_VTABLE_LITE__ = {
      scenario,
      cellCount: CELL_COUNT,
      graphicCount: graphics.length,
      sampleCount: scenario === 'text-stateproxy' ? sampleTexts.length : 0,
      semanticPassed: scenario === 'text-stateproxy' ? false : undefined,
      sampleResults: scenario === 'text-stateproxy' ? [] : undefined
    };

    stage = app.createStage({
      canvas: 'main',
      canvasControled: false,
      autoRender: true,
      autoRefresh: true
    });
    setHarnessStage(stage);
    graphics.forEach(graphic => {
      stage.defaultLayer.add(graphic);
    });

    if (scenario === 'text-stateproxy') {
      const sampleResults = sampleTexts.map(text => {
        text.useStates(['hover'], false);
        return text.attribute.fill === '#0057ff' && text.currentStates?.includes('hover');
      });

      window.__D3_VTABLE_LITE__ = {
        scenario,
        cellCount: CELL_COUNT,
        graphicCount: graphics.length,
        sampleCount: sampleTexts.length,
        semanticPassed: sampleResults.every(Boolean),
        sampleResults
      };
    }
  };

  const controls = document.createElement('div');
  controls.style.display = 'flex';
  controls.style.gap = '12px';
  controls.style.alignItems = 'center';
  controls.style.padding = '16px';

  createRunButton(100, run, controls);
  createRunButton(1000, run, controls);

  if (container) {
    container.prepend(controls);
  } else {
    document.body.appendChild(controls);
  }
}
