import {
  DefaultTicker,
  DefaultTimeline,
  Animate,
  registerAnimate,
  IncreaseCount,
  InputText,
  AnimateExecutor,
  ACustomAnimate,
  registerCustomAnimate,
  ManualTicker
} from '@visactor/vrender-animate';
import {
  container,
  createRect,
  createStage,
  createSymbol,
  IGraphic,
  vglobal,
  createCircle,
  createText,
  createGroup,
  createLine,
  createPath
} from '@visactor/vrender';
import type { EasingType } from '@visactor/vrender-animate';
// container.load(roughModule);

vglobal.setEnv('browser');

registerAnimate();
registerCustomAnimate();

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
  btnContainer.style.width = '1000px';
  btnContainer.style.background = '#cecece';
  btnContainer.style.display = 'flex';
  btnContainer.style.flexDirection = 'row';
  btnContainer.style.gap = '3px';
  btnContainer.style.flexWrap = 'wrap';
  btnContainer.style.height = '120px';
  const canvas = document.getElementById('main');
  // 将btnContainer添加到canvas之前
  canvas.parentNode.insertBefore(btnContainer, canvas);

  // Basic animation state registration and application
  addCase('Manual Ticker', btnContainer, stage => {
    stage.ticker = new ManualTicker(stage);
    // Create a rectangle to animate
    const rect = createRect({
      x: 300,
      y: 200,
      width: 100,
      height: 100,
      fill: 'blue'
    });
    rect.context = { id: 'rect1' };

    console.log(rect);

    // Create control buttons
    rect.applyAnimationState(
      ['pulse'],
      [
        {
          name: 'pulse',
          animation: {
            timeSlices: [
              {
                duration: 500,
                effects: {
                  type: 'to',
                  channel: {
                    scaleX: { to: 1.8 },
                    scaleY: { to: 1.8 }
                  },
                  easing: 'linear'
                }
              },
              {
                duration: 500,
                effects: {
                  type: 'to',
                  channel: {
                    scaleX: { to: 1 },
                    scaleY: { to: 1 }
                  },
                  easing: 'linear'
                }
              }
            ],
            loop: true
          }
        }
      ]
    );
    stage.defaultLayer.add(rect);

    stage.ticker.tickAt(200);
    // stage.ticker.tickAt(800);
  });
};
