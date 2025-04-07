import {
  DefaultTicker,
  DefaultTimeline,
  Animate,
  registerAnimate,
  IncreaseCount,
  InputText,
  AnimateExecutor,
  ACustomAnimate,
  registerCustomAnimate
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
};
