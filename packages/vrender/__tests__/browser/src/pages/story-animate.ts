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

  // SlideIn Animation Demo
  addCase('SlideIn - From Right', btnContainer, stage => {
    const rect = createRect({
      x: 400,
      y: 200,
      width: 100,
      height: 100,
      fill: '#1890FF',
      cornerRadius: 10
    });
    stage.defaultLayer.add(rect);

    const executor = new AnimateExecutor(rect);
    executor.execute({
      type: 'slideIn',
      customParameters: {
        direction: 'right',
        distance: 200
      },
      duration: 1000,
      easing: 'quadOut'
    });
  });

  addCase('SlideIn - From Left', btnContainer, stage => {
    const rect = createRect({
      x: 400,
      y: 200,
      width: 100,
      height: 100,
      fill: '#FF7A45',
      cornerRadius: 10
    });
    stage.defaultLayer.add(rect);

    const executor = new AnimateExecutor(rect);
    executor.execute({
      type: 'slideIn',
      customParameters: {
        direction: 'left',
        distance: 200
      },
      duration: 1000,
      easing: 'quadOut'
    });
  });

  addCase('SlideIn - From Top', btnContainer, stage => {
    const rect = createRect({
      x: 400,
      y: 200,
      width: 100,
      height: 100,
      fill: '#52C41A',
      cornerRadius: 10
    });
    stage.defaultLayer.add(rect);

    const executor = new AnimateExecutor(rect);
    executor.execute({
      type: 'slideIn',
      customParameters: {
        direction: 'top',
        distance: 200
      },
      duration: 1000,
      easing: 'quadOut'
    });
  });

  addCase('SlideIn - From Bottom', btnContainer, stage => {
    const rect = createRect({
      x: 400,
      y: 200,
      width: 100,
      height: 100,
      fill: '#722ED1',
      cornerRadius: 10
    });
    stage.defaultLayer.add(rect);

    const executor = new AnimateExecutor(rect);
    executor.execute({
      type: 'slideIn',
      customParameters: {
        direction: 'bottom',
        distance: 200
      },
      duration: 1000,
      easing: 'quadOut'
    });
  });

  // GrowIn Animation Demo
  addCase('GrowIn - XY Scale', btnContainer, stage => {
    const rect = createRect({
      x: 400,
      y: 200,
      width: 100,
      height: 100,
      fill: '#FA8C16',
      cornerRadius: 10
    });
    stage.defaultLayer.add(rect);

    const executor = new AnimateExecutor(rect);
    executor.execute({
      type: 'growIn',
      customParameters: {
        fromScale: 0.2,
        direction: 'xy'
      },
      duration: 1000,
      easing: 'elasticOut'
    });
  });

  addCase('GrowIn - X Scale', btnContainer, stage => {
    const rect = createRect({
      x: 400,
      y: 200,
      width: 100,
      height: 100,
      fill: '#13C2C2',
      cornerRadius: 10
    });
    stage.defaultLayer.add(rect);

    const executor = new AnimateExecutor(rect);
    executor.execute({
      type: 'growIn',
      customParameters: {
        fromScale: 0.2,
        direction: 'x'
      },
      duration: 1000,
      easing: 'elasticOut'
    });
  });

  addCase('GrowIn - Y Scale', btnContainer, stage => {
    const rect = createRect({
      x: 400,
      y: 200,
      width: 100,
      height: 100,
      fill: '#EB2F96',
      cornerRadius: 10
    });
    stage.defaultLayer.add(rect);

    const executor = new AnimateExecutor(rect);
    executor.execute({
      type: 'growIn',
      customParameters: {
        fromScale: 0.2,
        direction: 'y'
      },
      duration: 1000,
      easing: 'elasticOut'
    });
  });

  // SpinIn Animation Demo
  addCase('SpinIn - 360 Rotation', btnContainer, stage => {
    const rect = createRect({
      x: 400,
      y: 200,
      width: 100,
      height: 100,
      fill: '#F5222D',
      cornerRadius: 10
    });
    stage.defaultLayer.add(rect);

    const executor = new AnimateExecutor(rect);
    executor.execute({
      type: 'spinIn',
      customParameters: {
        fromAngle: Math.PI * 2,
        fromScale: 0.6
      },
      duration: 1000,
      easing: 'quadOut'
    });
  });

  addCase('SpinIn - 180 Rotation', btnContainer, stage => {
    const rect = createRect({
      x: 400,
      y: 200,
      width: 100,
      height: 100,
      fill: '#2F54EB',
      cornerRadius: 10
    });
    stage.defaultLayer.add(rect);

    const executor = new AnimateExecutor(rect);
    executor.execute({
      type: 'spinIn',
      customParameters: {
        fromAngle: Math.PI / 3,
        fromScale: 0.6
      },
      duration: 500,
      easing: 'quadOut'
    });
  });

  // MoveScaleIn Animation Demo
  addCase('MoveScaleIn - From Right', btnContainer, stage => {
    const rect = createRect({
      x: 400,
      y: 200,
      width: 100,
      height: 100,
      fill: '#A0D911',
      cornerRadius: 10
    });
    stage.defaultLayer.add(rect);

    const executor = new AnimateExecutor(rect);
    executor.execute({
      type: 'moveScaleIn',
      customParameters: {
        slideDirection: 'right',
        slideDistance: 200,
        fromScale: 0.6,
        scaleDirection: 'xy',
        slideRatio: 0.6
      },
      duration: 2000,
      easing: 'cubicOut'
    });
  });

  addCase('MoveScaleIn - From Bottom', btnContainer, stage => {
    const rect = createRect({
      x: 400,
      y: 200,
      width: 100,
      height: 100,
      fill: '#FAAD14',
      cornerRadius: 10
    });
    stage.defaultLayer.add(rect);

    const executor = new AnimateExecutor(rect);
    executor.execute({
      type: 'moveScaleIn',
      customParameters: {
        slideDirection: 'bottom',
        slideDistance: 200,
        fromScale: 0.2,
        scaleDirection: 'xy',
        slideRatio: 0.6
      },
      duration: 2000,
      easing: 'cubicOut'
    });
  });

  // MoveRotateIn Animation Demo
  addCase('MoveRotateIn - From Left', btnContainer, stage => {
    const rect = createRect({
      x: 400,
      y: 200,
      width: 100,
      height: 100,
      fill: '#1D39C4',
      cornerRadius: 10
    });
    stage.defaultLayer.add(rect);

    const executor = new AnimateExecutor(rect);
    executor.execute({
      type: 'moveRotateIn',
      customParameters: {
        slideDirection: 'left',
        slideDistance: 200,
        fromAngle: Math.PI * 2,
        fromScale: 0.2,
        slideRatio: 0.4
      },
      duration: 2000,
      easing: 'quadOut'
    });
  });

  addCase('MoveRotateIn - From Top', btnContainer, stage => {
    const rect = createRect({
      x: 400,
      y: 200,
      width: 100,
      height: 100,
      fill: '#C41D7F',
      cornerRadius: 10
    });
    stage.defaultLayer.add(rect);

    const executor = new AnimateExecutor(rect);
    executor.execute({
      type: 'moveRotateIn',
      customParameters: {
        slideDirection: 'top',
        slideDistance: 200,
        fromAngle: Math.PI * 2,
        fromScale: 0.2,
        slideRatio: 0.4
      },
      duration: 2000,
      easing: 'quadOut'
    });
  });

  // Complex Animation Demo with Multiple Rectangles
  addCase('Story Animation Sequence', btnContainer, stage => {
    // Create a group of rectangles in different positions
    const positions = [
      { x: 150, y: 150, color: '#FF4D4F' },
      { x: 300, y: 150, color: '#FADB14' },
      { x: 450, y: 150, color: '#52C41A' },
      { x: 600, y: 150, color: '#1890FF' },
      { x: 150, y: 300, color: '#722ED1' },
      { x: 300, y: 300, color: '#EB2F96' },
      { x: 450, y: 300, color: '#FA8C16' },
      { x: 600, y: 300, color: '#13C2C2' }
    ];

    const rects = positions.map((pos, index) => {
      const rect = createRect({
        x: pos.x,
        y: pos.y,
        width: 80,
        height: 80,
        fill: pos.color,
        cornerRadius: 10
      });
      stage.defaultLayer.add(rect);
      return rect;
    });

    // Apply different animations with staggered delays
    rects.forEach((rect, index) => {
      const executor = new AnimateExecutor(rect);

      // Choose different animation types based on index
      const delay = index * 200; // 200ms stagger

      switch (index % 4) {
        case 0:
          executor.execute({
            type: 'slideIn',
            customParameters: {
              direction: 'right',
              distance: 150
            },
            duration: 1000,
            easing: 'quadOut',
            delay
          });
          break;
        case 1:
          executor.execute({
            type: 'growIn',
            customParameters: {
              fromScale: 0.2,
              direction: 'xy'
            },
            duration: 1000,
            easing: 'elasticOut',
            delay
          });
          break;
        case 2:
          executor.execute({
            type: 'spinIn',
            customParameters: {
              fromAngle: Math.PI * 2,
              fromScale: 0.2
            },
            duration: 1000,
            easing: 'backOut',
            delay
          });
          break;
        case 3:
          executor.execute({
            type: index < 4 ? 'moveScaleIn' : 'moveRotateIn',
            customParameters: {
              slideDirection: 'bottom',
              slideDistance: 150,
              fromScale: 0.2,
              fromAngle: Math.PI,
              slideRatio: 0.5
            },
            duration: 1500,
            easing: 'cubicOut',
            delay
          });
          break;
      }
    });
  });

  // ====== EXIT ANIMATIONS DEMOS ======

  // SlideOut Animation Demo
  addCase('SlideOut - To Right', btnContainer, stage => {
    const rect = createRect({
      x: 400,
      y: 200,
      width: 100,
      height: 100,
      fill: '#1890FF',
      cornerRadius: 10
    });
    stage.defaultLayer.add(rect);

    const executor = new AnimateExecutor(rect);
    executor.execute({
      type: 'slideOut',
      customParameters: {
        direction: 'right',
        distance: 200
      },
      duration: 1000,
      easing: 'quadOut'
    });
  });

  addCase('SlideOut - To Left', btnContainer, stage => {
    const rect = createRect({
      x: 400,
      y: 200,
      width: 100,
      height: 100,
      fill: '#FF7A45',
      cornerRadius: 10
    });
    stage.defaultLayer.add(rect);

    const executor = new AnimateExecutor(rect);
    executor.execute({
      type: 'slideOut',
      customParameters: {
        direction: 'left',
        distance: 200
      },
      duration: 1000,
      easing: 'quadOut'
    });
  });

  addCase('SlideOut - To Top', btnContainer, stage => {
    const rect = createRect({
      x: 400,
      y: 200,
      width: 100,
      height: 100,
      fill: '#52C41A',
      cornerRadius: 10
    });
    stage.defaultLayer.add(rect);

    const executor = new AnimateExecutor(rect);
    executor.execute({
      type: 'slideOut',
      customParameters: {
        direction: 'top',
        distance: 200
      },
      duration: 1000,
      easing: 'quadOut'
    });
  });

  addCase('SlideOut - To Bottom', btnContainer, stage => {
    const rect = createRect({
      x: 400,
      y: 200,
      width: 100,
      height: 100,
      fill: '#722ED1',
      cornerRadius: 10
    });
    stage.defaultLayer.add(rect);

    const executor = new AnimateExecutor(rect);
    executor.execute({
      type: 'slideOut',
      customParameters: {
        direction: 'bottom',
        distance: 200
      },
      duration: 1000,
      easing: 'quadOut'
    });
  });

  // GrowOut Animation Demo
  addCase('GrowOut - XY Scale', btnContainer, stage => {
    const rect = createRect({
      x: 400,
      y: 200,
      width: 100,
      height: 100,
      fill: '#FA8C16',
      cornerRadius: 10
    });
    stage.defaultLayer.add(rect);

    const executor = new AnimateExecutor(rect);
    executor.execute({
      type: 'growOut',
      customParameters: {
        fromScale: 0.2,
        direction: 'xy'
      },
      duration: 1000,
      easing: 'elasticOut'
    });
  });

  addCase('GrowOut - X Scale', btnContainer, stage => {
    const rect = createRect({
      x: 400,
      y: 200,
      width: 100,
      height: 100,
      fill: '#13C2C2',
      cornerRadius: 10
    });
    stage.defaultLayer.add(rect);

    const executor = new AnimateExecutor(rect);
    executor.execute({
      type: 'growOut',
      customParameters: {
        fromScale: 0.2,
        direction: 'x'
      },
      duration: 1000,
      easing: 'elasticOut'
    });
  });

  addCase('GrowOut - Y Scale', btnContainer, stage => {
    const rect = createRect({
      x: 400,
      y: 200,
      width: 100,
      height: 100,
      fill: '#EB2F96',
      cornerRadius: 10
    });
    stage.defaultLayer.add(rect);

    const executor = new AnimateExecutor(rect);
    executor.execute({
      type: 'growOut',
      customParameters: {
        fromScale: 0.2,
        direction: 'y'
      },
      duration: 1000,
      easing: 'elasticOut'
    });
  });

  // SpinOut Animation Demo
  addCase('SpinOut - 360 Rotation', btnContainer, stage => {
    const rect = createRect({
      x: 400,
      y: 200,
      width: 100,
      height: 100,
      fill: '#F5222D',
      cornerRadius: 10
    });
    stage.defaultLayer.add(rect);

    const executor = new AnimateExecutor(rect);
    executor.execute({
      type: 'spinOut',
      customParameters: {
        fromAngle: Math.PI * 2,
        fromScale: 0.6
      },
      duration: 1000,
      easing: 'quadOut'
    });
  });

  addCase('SpinOut - 180 Rotation', btnContainer, stage => {
    const rect = createRect({
      x: 400,
      y: 200,
      width: 100,
      height: 100,
      fill: '#2F54EB',
      cornerRadius: 10
    });
    stage.defaultLayer.add(rect);

    const executor = new AnimateExecutor(rect);
    executor.execute({
      type: 'spinOut',
      customParameters: {
        fromAngle: Math.PI / 3,
        fromScale: 0.6
      },
      duration: 500,
      easing: 'quadOut'
    });
  });

  // MoveScaleOut Animation Demo
  addCase('MoveScaleOut - To Right', btnContainer, stage => {
    const rect = createRect({
      x: 400,
      y: 200,
      width: 100,
      height: 100,
      fill: '#A0D911',
      cornerRadius: 10
    });
    stage.defaultLayer.add(rect);

    const executor = new AnimateExecutor(rect);
    executor.execute({
      type: 'moveScaleOut',
      customParameters: {
        slideDirection: 'right',
        slideDistance: 200,
        fromScale: 0.6,
        scaleDirection: 'xy',
        slideRatio: 0.6
      },
      duration: 2000,
      easing: 'cubicOut'
    });
  });

  addCase('MoveScaleOut - To Bottom', btnContainer, stage => {
    const rect = createRect({
      x: 400,
      y: 200,
      width: 100,
      height: 100,
      fill: '#FAAD14',
      cornerRadius: 10
    });
    stage.defaultLayer.add(rect);

    const executor = new AnimateExecutor(rect);
    executor.execute({
      type: 'moveScaleOut',
      customParameters: {
        slideDirection: 'bottom',
        slideDistance: 200,
        fromScale: 0.2,
        scaleDirection: 'xy',
        slideRatio: 0.6
      },
      duration: 2000,
      easing: 'cubicOut'
    });
  });

  // MoveRotateOut Animation Demo
  addCase('MoveRotateOut - To Left', btnContainer, stage => {
    const rect = createRect({
      x: 400,
      y: 200,
      width: 100,
      height: 100,
      fill: '#1D39C4',
      cornerRadius: 10
    });
    stage.defaultLayer.add(rect);

    const executor = new AnimateExecutor(rect);
    executor.execute({
      type: 'moveRotateOut',
      customParameters: {
        slideDirection: 'left',
        slideDistance: 200,
        fromAngle: Math.PI * 2,
        fromScale: 0.2,
        slideRatio: 0.4
      },
      duration: 2000,
      easing: 'quadOut'
    });
  });

  addCase('MoveRotateOut - To Top', btnContainer, stage => {
    const rect = createRect({
      x: 400,
      y: 200,
      width: 100,
      height: 100,
      fill: '#C41D7F',
      cornerRadius: 10
    });
    stage.defaultLayer.add(rect);

    const executor = new AnimateExecutor(rect);
    executor.execute({
      type: 'moveRotateOut',
      customParameters: {
        slideDirection: 'top',
        slideDistance: 200,
        fromAngle: Math.PI * 2,
        fromScale: 0.2,
        slideRatio: 0.4
      },
      duration: 2000,
      easing: 'quadOut'
    });
  });

  // In-Out Animation Sequence
  addCase('In-Out Animation Sequence', btnContainer, stage => {
    const rect = createRect({
      x: 400,
      y: 200,
      width: 100,
      height: 100,
      fill: '#FF4D4F',
      cornerRadius: 10
    });
    stage.defaultLayer.add(rect);

    const executor = new AnimateExecutor(rect);

    // First perform entrance animation
    executor.execute({
      type: 'slideIn',
      customParameters: {
        direction: 'right',
        distance: 200
      },
      duration: 1000,
      easing: 'quadOut'
    });

    // Then perform exit animation after delay
    executor.execute({
      type: 'slideOut',
      customParameters: {
        direction: 'left',
        distance: 200
      },
      duration: 1000,
      easing: 'quadOut',
      delay: 2000 // Wait 2 seconds before starting exit animation
    });
  });

  // Opacity Control in Exit Animations Demo
  addCase('Exit Animation Opacity Control', btnContainer, stage => {
    // Create a row of rectangles
    const colors = ['#1890FF', '#13C2C2', '#F5222D', '#A0D911', '#1D39C4'];
    const rects = [];

    // Create 5 rectangles in a row
    for (let i = 0; i < 5; i++) {
      const rect = createRect({
        x: 150 + i * 150,
        y: 200,
        width: 80,
        height: 80,
        fill: colors[i],
        cornerRadius: 10
      });
      stage.defaultLayer.add(rect);
      rects.push(rect);
    }

    // Standard moveScaleOut
    const executor1 = new AnimateExecutor(rects[0]);
    executor1.execute({
      type: 'moveScaleOut',
      customParameters: {
        slideDirection: 'right',
        slideDistance: 100,
        fromScale: 0.2,
        scaleDirection: 'xy',
        slideRatio: 0.5
      },
      duration: 2000,
      easing: 'cubicOut'
    });

    // GrowOut with no opacity change (toOpacity: 1)
    const executor2 = new AnimateExecutor(rects[1]);
    executor2.execute({
      type: 'growOut',
      customParameters: {
        fromScale: 0.2,
        direction: 'xy',
        toOpacity: 1 // Keep fully visible during scale
      },
      duration: 1000,
      easing: 'quadOut'
    });

    // SpinOut with no opacity change, followed by fade out
    const executor3 = new AnimateExecutor(rects[2]);
    // First spin without opacity change
    executor3.execute({
      type: 'spinOut',
      customParameters: {
        fromAngle: Math.PI * 1.5,
        fromScale: 0.4,
        toOpacity: 1 // Keep fully visible during spin
      },
      duration: 1000,
      easing: 'quadOut'
    });
    // Then fade out
    executor3.execute({
      type: 'fadeOut',
      duration: 500,
      easing: 'quadOut',
      delay: 1000
    });

    // SlideOut with partial opacity
    const executor4 = new AnimateExecutor(rects[3]);
    executor4.execute({
      type: 'slideOut',
      customParameters: {
        direction: 'top',
        distance: 200,
        toOpacity: 0.3 // Fade to 30% opacity rather than fully invisible
      },
      duration: 1000,
      easing: 'quadOut'
    });

    // Custom two-phase exit animation
    const executor5 = new AnimateExecutor(rects[4]);
    // Phase 1: Scale down without opacity change
    executor5.execute({
      type: 'growOut',
      customParameters: {
        fromScale: 0.6,
        direction: 'xy',
        toOpacity: 1 // Maintain visibility
      },
      duration: 800,
      easing: 'quadOut'
    });
    // Phase 2: Move out with opacity change
    executor5.execute({
      type: 'slideOut',
      customParameters: {
        direction: 'right',
        distance: 150
      },
      duration: 1000,
      easing: 'quadOut',
      delay: 800 // Start after first animation
    });
  });

  // Combined Enter-Exit Sequence Demo with Opacity Control
  addCase('Enter-Exit Sequence with Opacity Control', btnContainer, stage => {
    const rect = createRect({
      x: 400,
      y: 200,
      width: 100,
      height: 100,
      fill: '#EB2F96',
      cornerRadius: 10
    });
    stage.defaultLayer.add(rect);

    const executor = new AnimateExecutor(rect);

    // First: entrance animation
    executor.execute({
      type: 'growIn',
      customParameters: {
        fromScale: 0.2,
        direction: 'xy'
      },
      duration: 1000,
      easing: 'elasticOut'
    });

    // Middle: wait in visible state

    // Last: custom exit animation - first spin without fading, then slide out with fade
    executor.execute({
      type: 'spinOut',
      customParameters: {
        fromAngle: Math.PI,
        fromScale: 0.7,
        toOpacity: 1 // Keep fully visible during spin
      },
      duration: 800,
      easing: 'quadOut',
      delay: 1500 // Wait 1.5s after entrance completes
    });

    executor.execute({
      type: 'slideOut',
      customParameters: {
        direction: 'bottom',
        distance: 100
        // Default toOpacity: 0 for complete fade-out
      },
      duration: 600,
      easing: 'quadOut',
      delay: 2300 // Wait for spin to complete
    });
  });
};
