import { DefaultTicker, DefaultTimeline, Animate } from '@visactor/vrender-animate';
import {
  container,
  createRect,
  createStage,
  createSymbol,
  IGraphic,
  vglobal,
  createCircle,
  createText
} from '@visactor/vrender';
// container.load(roughModule);

vglobal.setEnv('browser');

let stage: any;

function addCase(name: string, container: HTMLElement, cb: (stage: any) => void) {
  const button = document.createElement('button');
  button.innerText = name;
  button.style.height = '26px';
  container.appendChild(button);
  button.addEventListener('click', () => {
    stage && stage.release();
    stage = createStage({
      canvas: 'main',
      width: 900,
      height: 600,
      background: 'pink',
      disableDirtyBounds: false,
      canvasControled: false,
      autoRender: true
    });
    cb(stage);
  });
}

export const page = () => {
  const btnContainer = document.createElement('div');
  btnContainer.style.width = '80%';
  btnContainer.style.background = '#cecece';
  btnContainer.style.display = 'flex';
  btnContainer.style.flexDirection = 'row';
  btnContainer.style.gap = '3px';
  btnContainer.style.flexWrap = 'wrap';
  btnContainer.style.height = '60px';
  const canvas = document.getElementById('main');
  // 将btnContainer添加到canvas之前
  canvas.parentNode.insertBefore(btnContainer, canvas);
  // ========== Performance Example ==========
  addCase('Ticker Performance Example', btnContainer, stage => {
    let count = 0;
    for (let i = 0; i < 1000; i++) {
      const rect = createRect({
        x: 100,
        y: 100,
        width: 100,
        height: 100,
        fill: 'red'
      });
      stage.defaultLayer.add(rect);
      const ticker = new DefaultTicker(stage);
      const timeline = new DefaultTimeline();
      ticker.addTimeline(timeline);
      const animate = new Animate();
      animate.bind(rect);
      animate.to({ x: 200 }, 1000000, 'linear');
      timeline.addAnimate(animate);

      ticker.start();
      ticker.on('tick', () => {
        count++;
      });
    }
  });
  addCase('Animate Performance Example', btnContainer, stage => {
    const rect = createRect({
      x: 100,
      y: 100,
      width: 100,
      height: 100,
      fill: 'red'
    });
    stage.defaultLayer.add(rect);
    const ticker = new DefaultTicker(stage);
    const timeline = new DefaultTimeline();
    ticker.addTimeline(timeline);

    for (let i = 0; i < 200000; i++) {
      const animate = new Animate();
      animate.bind(rect);
      animate.to({ x: 2000, fill: 'blue' }, 100000, 'linear');
      timeline.addAnimate(animate);
    }

    ticker.start();
    ticker.on('tick', () => {
      stage.render();
    });
  });
};
