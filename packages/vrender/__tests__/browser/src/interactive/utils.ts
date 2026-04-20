import type { IGraphic, Stage } from '@visactor/vrender';
import { createBrowserAppStage } from '../app-stage';
let stage: Stage;

function ensureMainCanvas(container: HTMLDivElement) {
  let canvas = document.querySelector<HTMLCanvasElement>('#main');
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.id = 'main';
    canvas.width = 3200;
    canvas.height = 1800;
    canvas.style.width = '1600px';
    canvas.style.height = '900px';
    container.appendChild(canvas);
  }
  return canvas;
}

function getControlsContainer(container: HTMLDivElement) {
  let controls = container.querySelector<HTMLDivElement>('[data-interactive-controls]');
  if (!controls) {
    controls = document.createElement('div');
    controls.dataset.interactiveControls = 'true';
    controls.style.display = 'flex';
    controls.style.flexWrap = 'wrap';
    controls.style.gap = '12px';
    controls.style.alignItems = 'center';
    controls.style.padding = '16px';
    container.prepend(controls);
  }
  return controls;
}

export function renderElement(num: number, type: string, canopusCb: Function) {
  const container = document.querySelector<HTMLDivElement>('#container')!;
  const controls = getControlsContainer(container);
  const btn = document.createElement('button');
  btn.innerText = `${type}`;
  btn.style.display = 'inline-flex';
  btn.style.alignItems = 'center';
  btn.style.justifyContent = 'center';
  btn.style.padding = '8px 14px';
  btn.style.fontSize = '14px';
  btn.style.fontWeight = '600';
  btn.style.border = '1px solid #d0d7de';
  btn.style.borderRadius = '6px';
  btn.style.background = '#ffffff';
  btn.style.color = '#24292f';
  btn.style.cursor = 'pointer';
  const div = document.createElement('div');
  div.style.display = 'flex';
  div.style.padding = '0 16px 16px';
  const canopusDom = document.createElement('div');
  div.appendChild(canopusDom);
  btn.addEventListener('click', () => {
    stage && stage.release();
    ensureMainCanvas(container);
    const t = Date.now();
    const arr: IGraphic[] = [];
    for (let i = 0; i < num; i++) {
      arr.push(canopusCb());
    }
    stage = createBrowserAppStage({
      canvas: 'main',
      width: 1200,
      height: 600,
      viewWidth: 600,
      viewHeight: 600,
      x: 90,
      y: 100,
      background: 'black',
      event: {
        clickInterval: 400
      }
    });
    arr.forEach(g => {
      stage.defaultLayer.add(g as any);
    });
    stage.render();

    // stage.addEventListener('pointerdown', e => {
    //   console.log('%c yo, Stage capture it!', 'color: red;font-weight: bold', e);
    // });
    arr.forEach((c, i) => {
      c.addEventListener('pointerdown', e => {
        console.log(`%c yo, ${c.type} capture it!`, 'color: blue;font-weight: bold;font-size: 20', i);
      });
      c.addEventListener('dblclick', e => {
        console.log(`%c yo, ${c.type} capture dblclick!`, 'color: red;font-weight: bold;font-size: 20', i);
      });
    });

    stage.window.getNativeHandler().nativeCanvas.addEventListener('click', e => {
      const pickResult = stage.pick(e.offsetX, e.offsetY);
      console.log({
        pick: pickResult && pickResult.graphic && pickResult.graphic.id,
        containPoint: arr.filter(graphic => {
          return graphic.containsPoint(e.offsetX, e.offsetY, 0, stage.getPickerService());
        }),
        dpr: stage.window.dpr
      });
    });
    const delta = Date.now() - t;
    canopusDom.innerText = `canopus耗时-${type}：` + delta.toString();
  });
  controls.appendChild(btn);
  container.appendChild(div);
}
