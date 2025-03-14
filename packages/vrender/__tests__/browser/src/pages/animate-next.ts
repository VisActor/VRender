import { DefaultTicker, DefaultTimeline, Animate, registerAnimate } from '@visactor/vrender-animate';
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

registerAnimate();

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
    ticker.setFPS(30);
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

  addCase('Animate chain', btnContainer, stage => {
    const rect = createRect({
      x: 100,
      y: 100,
      width: 100,
      height: 100,
      fill: 'red'
    });
    stage.defaultLayer.add(rect);

    rect.animate().to({ x: 300 }, 1000, 'linear').to({ y: 300 }, 1000, 'linear').to({ fill: 'blue' }, 1000, 'linear');
    // 中途设置值没问题，它会从orange开始
    rect.setAttribute('fill', 'orange');
  });
  addCase('Animate chain loop', btnContainer, stage => {
    const rect = createRect({
      x: 100,
      y: 100,
      width: 100,
      height: 100,
      fill: 'red'
    });
    stage.defaultLayer.add(rect);

    rect
      .animate()
      .to({ x: 300 }, 1000, 'linear')
      .to({ y: 300 }, 1000, 'linear')
      .to({ fill: 'blue' }, 1000, 'linear')
      .loop(2)
      .bounce(true);
    // 中途设置值没问题，它会从orange开始
    rect.setAttribute('fill', 'purple');
  });

  addCase('Bounce Demo', btnContainer, stage => {
    const rect = createRect({
      x: 100,
      y: 100,
      width: 100,
      height: 100,
      fill: 'green'
    });
    stage.defaultLayer.add(rect);

    // Create a bouncing animation that moves right, then down, then changes color
    // With bounce enabled, it will play forward then backward
    rect
      .animate()
      .to({ x: 400 }, 1000, 'linear')
      .to({ y: 400 }, 1000, 'linear')
      .to({ fill: 'yellow' }, 1000, 'linear')
      .loop(3) // Play the animation 3 times
      .bounce(true); // Enable bounce so it goes forward and backward

    // Add explanatory text
    const text = createText({
      x: 100,
      y: 50,
      text: 'Bounce Demo: Animation plays forward then backward with bounce(true)',
      fontSize: 16,
      fill: 'black'
    });
    stage.defaultLayer.add(text);
  });
};
