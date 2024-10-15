import { createStage, Stage } from '@visactor/vrender';
let stage: Stage;
export function renderElement(num: number, type: string, canopusCb: Function) {
  const container = document.querySelector<HTMLDivElement>('#container')!;
  const btn = document.createElement('button');
  btn.innerText = `${type}`;
  const div = document.createElement('div');
  div.style.display = 'flex';
  const canopusDom = document.createElement('div');
  div.appendChild(canopusDom);
  btn.addEventListener('click', () => {
    stage && stage.release();
    const t = Date.now();
    const arr: IGraphic[] = [];
    for (let i = 0; i < num; i++) {
      arr.push(canopusCb());
    }
    stage = createStage({
      canvas: 'main',
      width: 1200,
      height: 600,
      viewWidth: 600,
      viewHeight: 600,
      x: 90,
      y: 100,
      background: 'black'
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
        console.log(`%c yo, ${c.type} capture it!`, 'color: yellow;font-weight: bold', i);
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
  container.appendChild(btn);
  container.appendChild(div);
}
