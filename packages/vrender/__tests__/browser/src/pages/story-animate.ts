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
import type { EasingType } from '@visactor/vrender-core';
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
  btnContainer.style.height = '230px';
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

  // Apple iMessage Animation with iosSpringOut
  addCase('Apple iMessage (iosSpringOut)', btnContainer, stage => {
    // Create a group to hold the message bubble and its components
    const messageGroup = createGroup({
      x: 450,
      y: 250
    });

    // Main bubble (rounded rectangle)
    const messageBubble = createRect({
      x: 0,
      y: 0,
      width: 200,
      height: 80,
      fill: '#34C759', // Updated to match Apple's green color more closely
      cornerRadius: 20,
      shadowBlur: 5,
      shadowColor: 'rgba(0, 0, 0, 0.1)',
      shadowOffsetX: 0,
      shadowOffsetY: 2
    });

    // Message text
    const messageText = createText({
      x: 20,
      y: 40,
      text: 'Hello! 👋',
      fontSize: 18,
      fontFamily: 'SF Pro, -apple-system, BlinkMacSystemFont, Helvetica, Arial, sans-serif', // Apple system fonts
      fill: '#FFFFFF',
      textAlign: 'left',
      textBaseline: 'middle'
    });

    // Add "now" timestamp text
    const timestampText = createText({
      x: 200,
      y: 90,
      text: 'now',
      fontSize: 12,
      fontFamily: 'SF Pro, -apple-system, BlinkMacSystemFont, Helvetica, Arial, sans-serif',
      fill: 'rgba(120, 120, 128, 0.8)', // Light gray color like iOS
      textAlign: 'right',
      textBaseline: 'middle'
    });

    // Add all elements to the group
    messageGroup.add(messageBubble);
    messageGroup.add(messageText);
    messageGroup.add(timestampText);

    // Add group to stage
    stage.defaultLayer.add(messageGroup);

    // Apply animation to the group
    const executor = new AnimateExecutor(messageGroup);

    // Use our custom Apple-style animation
    executor.execute({
      type: 'growIn',
      customParameters: {
        fromScale: 0.3,
        direction: 'xy',
        fromOpacity: 0
      },
      selfOnly: true,
      duration: 400,
      easing: 'backOut' // Use our new iOS-style easing function
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

  // New: StrokeIn Animation Demo
  addCase('StrokeIn - Rectangle', btnContainer, stage => {
    const rect = createRect({
      x: 400,
      y: 200,
      width: 100,
      height: 100,
      fill: 'red',
      stroke: '#FF4D4F',
      cornerRadius: 10,
      fillOpacity: 0 // Start with no fill
    });
    stage.defaultLayer.add(rect);

    const executor = new AnimateExecutor(rect);
    executor.execute({
      type: 'strokeIn',
      customParameters: {
        lineWidth: 3,
        strokeColor: '#FF4D4F',
        showFill: true,
        fillOpacity: 0
      },
      duration: 1500,
      easing: 'quadOut'
    });
  });

  addCase('StrokeIn - Circle', btnContainer, stage => {
    const circle = createCircle({
      x: 400,
      y: 200,
      radius: 50,
      fill: '#52C41A',
      fillOpacity: 0 // Start with no fill
    });
    stage.defaultLayer.add(circle);

    const executor = new AnimateExecutor(circle);
    executor.execute({
      type: 'strokeIn',
      customParameters: {
        lineWidth: 4,
        strokeColor: '#722ED1',
        showFill: true
      },
      duration: 1500,
      easing: 'cubicOut'
    });
  });

  // StrokeOut Animation Demo
  addCase('StrokeOut - Rectangle', btnContainer, stage => {
    const rect = createRect({
      x: 400,
      y: 200,
      width: 100,
      height: 100,
      fill: '#1890FF',
      stroke: '#FF4D4F',
      lineWidth: 3,
      cornerRadius: 10
    });
    stage.defaultLayer.add(rect);

    const executor = new AnimateExecutor(rect);
    executor.execute({
      type: 'strokeOut',
      customParameters: {
        lineWidth: 3,
        strokeColor: '#FF4D4F',
        showFill: true
      },
      duration: 1500,
      easing: 'quadOut'
    });
  });

  // Combined Animations with Stroke
  addCase('StrokeIn + GrowIn', btnContainer, stage => {
    const rect = createRect({
      x: 400,
      y: 200,
      width: 100,
      height: 100,
      fill: '#1890FF',
      cornerRadius: 10,
      fillOpacity: 0 // Start with no fill
    });
    stage.defaultLayer.add(rect);

    const executor = new AnimateExecutor(rect);
    // First do the stroke animation
    executor.execute({
      type: 'strokeIn',
      customParameters: {
        lineWidth: 3,
        strokeColor: '#FF4D4F'
      },
      duration: 1000,
      easing: 'quadOut'
    });

    // Then do the fill grow animation
    executor.execute({
      type: 'growIn',
      customParameters: {
        fromScale: 1,
        direction: 'xy',
        fromOpacity: 0
      },
      duration: 800,
      easing: 'quadOut',
      delay: 1000 // Start after stroke animation completes
    });
  });

  // Path StrokeIn Animation
  addCase('StrokeIn - Path', btnContainer, stage => {
    // Create a simple path (e.g., a triangle)
    const path = createPath({
      x: 400,
      y: 200,
      path: 'M 0 -50 L 50 50 L -50 50 Z',
      fill: '#FA8C16',
      fillOpacity: 0
    });
    stage.defaultLayer.add(path);

    const executor = new AnimateExecutor(path);
    executor.execute({
      type: 'strokeIn',
      customParameters: {
        lineWidth: 4,
        strokeColor: '#EB2F96',
        dashLength: 300, // Custom dash length for the path
        showFill: true
      },
      duration: 2000,
      easing: 'elasticOut'
    });
  });

  // Text with StrokeIn Animation
  addCase('StrokeIn - Text', btnContainer, stage => {
    const text = createText({
      x: 400,
      y: 200,
      text: 'Hello World',
      fontSize: 40,
      fontWeight: 'bold',
      fill: '#1D39C4',
      fillOpacity: 0,
      textAlign: 'center',
      textBaseline: 'middle'
    });
    stage.defaultLayer.add(text);

    const executor = new AnimateExecutor(text);
    executor.execute({
      type: 'strokeIn',
      customParameters: {
        lineWidth: 2,
        strokeColor: '#1D39C4',
        dashLength: 800, // Longer dash length for text
        showFill: true
      },
      duration: 2000,
      easing: 'cubicOut'
    });
  });

  // Sequence demo with multiple shapes using StrokeIn
  addCase('Sequence - StrokeIn', btnContainer, stage => {
    // Create multiple shapes in a row
    const positions = [150, 300, 450, 600];
    const colors = ['#1890FF', '#52C41A', '#FA8C16', '#EB2F96'];
    const shapes = [];

    // Create different shapes
    shapes.push(
      createRect({
        x: positions[0],
        y: 200,
        width: 80,
        height: 80,
        fill: colors[0],
        fillOpacity: 0,
        cornerRadius: 10
      })
    );

    shapes.push(
      createCircle({
        x: positions[1],
        y: 200,
        radius: 40,
        fill: colors[1],
        fillOpacity: 0
      })
    );

    shapes.push(
      createRect({
        x: positions[2],
        y: 200,
        width: 80,
        height: 80,
        fill: colors[2],
        fillOpacity: 0
      })
    );

    shapes.push(
      createCircle({
        x: positions[3],
        y: 200,
        radius: 40,
        fill: colors[3],
        fillOpacity: 0
      })
    );

    // Add all shapes to the stage
    shapes.forEach(shape => stage.defaultLayer.add(shape));

    // Animate each shape with a delay
    shapes.forEach((shape, index) => {
      const executor = new AnimateExecutor(shape);
      executor.execute({
        type: 'strokeIn',
        customParameters: {
          lineWidth: 3,
          strokeColor: colors[index],
          showFill: true
        },
        duration: 1500,
        easing: 'quadOut',
        delay: index * 300 // Stagger the animations
      });
    });
  });

  // PULSE ANIMATION DEMOS =========================

  // Basic Opacity Pulse Animation
  addCase('Pulse - Opacity', btnContainer, stage => {
    const rect = createRect({
      x: 400,
      y: 200,
      width: 100,
      height: 100,
      opacity: 0.8,
      fill: '#1890FF',
      cornerRadius: 10
    });
    stage.defaultLayer.add(rect);

    const executor = new AnimateExecutor(rect);
    executor.execute({
      type: 'pulse',
      customParameters: {
        useOpacity: true,
        useScale: false,
        useColor: false,
        pulseOpacity: 1.3,
        pulseCount: 3 // 3 pulses over the duration
      },
      duration: 2000, // Duration for all 3 pulses
      easing: 'linear'
    });
  });

  // Scale Pulse Animation
  addCase('Pulse - Scale', btnContainer, stage => {
    const circle = createCircle({
      x: 400,
      y: 200,
      radius: 50,
      fill: '#FA8C16'
    });
    stage.defaultLayer.add(circle);

    const executor = new AnimateExecutor(circle);
    executor.execute({
      type: 'pulse',
      customParameters: {
        useOpacity: false,
        useScale: true,
        useColor: false,
        pulseScale: 1.2, // Grow to 1.2x size
        pulseCount: 3 // 5 complete pulses
      },
      duration: 2000, // 2 seconds for all 5 pulses
      easing: 'linear'
    });
  });

  // Color Pulse Animation
  addCase('Pulse - Color', btnContainer, stage => {
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
      type: 'pulse',
      customParameters: {
        useOpacity: false,
        useScale: false,
        useColor: true,
        pulseColor: 'orange', // Pulse to red
        pulseColorIntensity: 1, // Strong color shift
        pulseCount: 2 // 4 pulses
      },
      duration: 1000,
      easing: 'linear'
    });
  });

  // Combined Effects Pulse Animation
  addCase('Pulse - Combined', btnContainer, stage => {
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
      type: 'pulse',
      customParameters: {
        useOpacity: true,
        useScale: true,
        useColor: true,
        opacityMin: 0.6,
        opacityMax: 1,
        pulseScale: 1.1,
        pulseColor: '#EB2F96', // Pulse to pink
        pulseColorIntensity: 0.5,
        pulseCount: 6 // 6 pulses
      },
      duration: 3000, // 3 seconds for all 6 pulses
      easing: 'linear'
    });
  });

  // Stroke Only Pulse Animation
  addCase('Pulse - Stroke Only', btnContainer, stage => {
    const rect = createRect({
      x: 400,
      y: 200,
      width: 100,
      height: 100,
      fill: '#1D39C4',
      stroke: '#FFC53D',
      lineWidth: 4,
      cornerRadius: 10
    });
    stage.defaultLayer.add(rect);

    const executor = new AnimateExecutor(rect);
    executor.execute({
      type: 'pulse',
      customParameters: {
        useOpacity: true,
        useScale: false,
        useColor: true,
        opacityMin: 0.2,
        opacityMax: 1,
        pulseColor: '#FFFFFF', // Pulse to white
        pulseColorIntensity: 0.7,
        useFill: false, // Only pulse the stroke, not the fill
        pulseCount: 3 // 3 pulses
      },
      duration: 1500, // 1.5 seconds for all 3 pulses
      easing: 'linear'
    });
  });

  // Looping Pulse Animation using repeat
  addCase('Pulse - With Repeat', btnContainer, stage => {
    const circle = createCircle({
      x: 400,
      y: 200,
      radius: 50,
      fill: '#FF4D4F'
    });
    stage.defaultLayer.add(circle);

    const executor = new AnimateExecutor(circle);
    executor.execute({
      type: 'pulse',
      customParameters: {
        useOpacity: true,
        useScale: true,
        useColor: false,
        opacityMin: 0.3,
        opacityMax: 1,
        pulseScale: 1.3,
        pulseCount: 2 // Only 2 pulses per duration cycle
      },
      duration: 1000, // 1 second for 2 pulses
      easing: 'linear',
      loop: 4 // Repeat the animation 4 times (total 8 pulses)
    });
  });

  // Fast pulse animation (heart beat)
  addCase('Pulse - Heart Beat', btnContainer, stage => {
    // Create a heart shape
    const heart = createPath({
      x: 400,
      y: 200,
      path: 'M 0 -15 C -15 -15 -20 0 0 15 C 20 0 15 -15 0 -15 Z', // Simple heart shape
      fill: '#FF4D4F',
      scaleX: 3,
      scaleY: 3,
      lineWidth: 0
    });
    stage.defaultLayer.add(heart);

    const executor = new AnimateExecutor(heart);
    executor.execute({
      type: 'pulse',
      customParameters: {
        useOpacity: false,
        useScale: true,
        useColor: false,
        pulseScale: 1.15, // Subtle scale change
        pulseCount: 2 // Two beats per cycle - like a heart rhythm
      },
      duration: 1000, // 1 second for normal heart rate
      easing: 'linear',
      loop: 6 // Continue beating for a while
    });
  });

  // Highlight Attention Animation (realistic use case)
  addCase('Highlight Element', btnContainer, stage => {
    // Create background element
    const background = createRect({
      x: 0,
      y: 0,
      width: 900,
      height: 600,
      fill: '#F0F2F5'
    });
    stage.defaultLayer.add(background);

    // Create a group of elements to simulate a UI
    const group = createGroup({
      x: 100,
      y: 100
    });

    // Create multiple shapes representing UI elements
    for (let i = 0; i < 5; i++) {
      const rect = createRect({
        x: i * 140,
        y: 0,
        width: 120,
        height: 80,
        fill: i === 2 ? '#1890FF' : '#FFFFFF',
        stroke: '#D9D9D9',
        lineWidth: 1,
        cornerRadius: 4
      });
      group.add(rect);

      // Add some text
      const text = createText({
        x: i * 140 + 60,
        y: 40,
        text: `Item ${i + 1}`,
        fontSize: 16,
        fill: i === 2 ? '#FFFFFF' : '#000000',
        textAlign: 'center',
        textBaseline: 'middle'
      });
      group.add(text);
    }

    stage.defaultLayer.add(group);

    // After a short delay, highlight the middle element with pulse animation
    setTimeout(() => {
      const targetElement = group.children[4]; // Element at index 2 (3rd element)
      const executor = new AnimateExecutor(targetElement);

      executor.execute({
        type: 'pulse',
        customParameters: {
          useOpacity: false,
          useScale: true,
          useColor: true,
          pulseScale: 1.08,
          pulseColor: '#1890FF',
          pulseColorIntensity: 0.2,
          pulseCount: 5
        },
        duration: 2000, // 2 seconds for all 5 pulses
        easing: 'quadInOut'
      });
    }, 1000);
  });

  // Error State Pulse Animation
  addCase('Error State Pulse', btnContainer, stage => {
    // Create a form input field
    const inputField = createRect({
      x: 300,
      y: 200,
      width: 300,
      height: 40,
      fill: '#FFFFFF',
      stroke: '#D9D9D9',
      lineWidth: 1,
      cornerRadius: 4
    });

    // Add label
    const label = createText({
      x: 310,
      y: 180,
      text: 'Email',
      fontSize: 14,
      fill: '#000000',
      textAlign: 'left',
      textBaseline: 'middle'
    });

    // Add placeholder text
    const placeholder = createText({
      x: 310,
      y: 220,
      text: 'example@invalid',
      fontSize: 14,
      fill: '#BFBFBF',
      textAlign: 'left',
      textBaseline: 'middle'
    });

    stage.defaultLayer.add(inputField);
    stage.defaultLayer.add(label);
    stage.defaultLayer.add(placeholder);

    // After a delay, simulate validation error with pulse animation
    setTimeout(() => {
      // Change border to red
      inputField.setAttribute('stroke', '#FF4D4F');

      // Add error message
      const errorMessage = createText({
        x: 310,
        y: 250,
        text: 'Please enter a valid email address',
        fontSize: 12,
        fill: '#FF4D4F',
        textAlign: 'left',
        textBaseline: 'middle'
      });
      stage.defaultLayer.add(errorMessage);

      // Pulse animation for the input field
      const executor = new AnimateExecutor(inputField);
      executor.execute({
        type: 'pulse',
        customParameters: {
          useOpacity: false,
          useScale: false,
          useColor: true,
          pulseColor: '#FF7875', // Lighter red
          pulseColorIntensity: 0.3,
          strokeOnly: true,
          pulseCount: 3
        },
        duration: 1200, // 1.2 seconds for all 3 pulses
        easing: 'quadInOut'
      });
    }, 1000);
  });
};
