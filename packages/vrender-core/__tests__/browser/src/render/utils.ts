import { createStage, IGraphic } from '@visactor/vrender';
import * as zrender from 'zrender';

export function renderElement(num: number, type: string, canopusCb: Function, zrenderCb: Function) {
  const container = document.querySelector<HTMLDivElement>('#container')!;
  const btn = document.createElement('button');
  btn.innerText = `${type}`;
  const btn2 = document.createElement('button');
  btn2.innerText = `zrender ${type}`;
  const div = document.createElement('div');
  div.style.display = 'flex';
  const canopusDom = document.createElement('div');
  const zrenderDom = document.createElement('div');
  zrenderDom.style.padding = '0 60px';
  div.appendChild(canopusDom);
  div.appendChild(zrenderDom);
  btn.addEventListener('click', () => {
    const t = Date.now();
    const arr: IGraphic[] = [];
    for (let i = 0; i < num; i++) {
      arr.push(canopusCb());
    }
    const stage = createStage({ canvas: 'main', width: 600, height: 600, viewWidth: 600, viewHeight: 600 });
    arr.forEach(g => {
      stage.defaultLayer.add(g as any);
    });
    stage.render();
    // document.getElementById('main')?.addEventListener('click', e => {
    //   console.log(
    //     stage.pick(e.offsetX, e.offsetY),
    //     arr.filter(graphic => {
    //       return graphic.containsPoint(e.offsetX, e.offsetY, 0);
    //     })
    //   );
    // });
    const delta = Date.now() - t;
    canopusDom.innerText = `canopus耗时-${type}：` + delta.toString();
  });
  btn2.addEventListener('click', () => {
    const t = Date.now();
    const arr = [];
    for (let i = 0; i < num; i++) {
      arr.push(zrenderCb(zrender));
    }
    // console.log(zrender);
    var zr = zrender.init(document.getElementById('main'), {
      devicePixelRatio: 2,
      width: 600,
      height: 600
    });
    arr.forEach(g => {
      zr.add(g);
    });
    zr.on('rendered', () => {
      const delta = Date.now() - t;
      zrenderDom.innerText = `zrender耗时-${type}：` + delta.toString();
    });
  });
  // console.log(canopusCb(), zrenderCb());
  container.appendChild(btn);
  container.appendChild(btn2);
  container.appendChild(div);
}
