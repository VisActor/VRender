import {
  DefaultTicker,
  DefaultTimeline,
  Animate,
  registerAnimate,
  IncreaseCount,
  InputText,
  AnimateExecutor
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
  createGroup
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
  btnContainer.style.width = '1000px';
  btnContainer.style.background = '#cecece';
  btnContainer.style.display = 'flex';
  btnContainer.style.flexDirection = 'row';
  btnContainer.style.gap = '3px';
  btnContainer.style.flexWrap = 'wrap';
  btnContainer.style.height = '90px';
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
      .loop(2);
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
  addCase('Animate Schedule', btnContainer, stage => {
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
    const rectAnimate = rect
      .animate()
      .to({ x: 400 }, 1000, 'linear')
      .to({ y: 400 }, 1000, 'linear')
      .to({ fill: 'yellow' }, 1000, 'linear')
      .loop(3) // Play the animation 3 times
      .bounce(true); // Enable bounce so it goes forward and backward

    // Add explanatory text
    const text = createText({
      x: 300,
      y: 50,
      text: 'Animate Schedule',
      fontSize: 16,
      fill: 'black',
      textAlign: 'center',
      opacity: 0
    });
    const textAnimate = text.animate().to({ opacity: 1 }, 1000, 'linear');
    textAnimate.after(rectAnimate);
    stage.defaultLayer.add(text);
  });

  addCase('startAt', btnContainer, stage => {
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
    const rectAnimate = rect
      .animate()
      .startAt(2000)
      .to({ x: 400 }, 1000, 'linear')
      .to({ y: 400 }, 1000, 'linear')
      .to({ fill: 'yellow' }, 1000, 'linear')
      .loop(3) // Play the animation 3 times
      .bounce(true); // Enable bounce so it goes forward and backward

    // Add explanatory text
    const text = createText({
      x: 300,
      y: 50,
      text: 'Animate Schedule',
      fontSize: 16,
      fill: 'black',
      textAlign: 'center',
      opacity: 0
    });
    const textAnimate = text.animate().to({ opacity: 1 }, 1000, 'linear');
    textAnimate.after(rectAnimate);
    stage.defaultLayer.add(text);
  });
  addCase('custom IncreaseCount', btnContainer, stage => {
    // Add explanatory text
    const text = createText({
      x: 300,
      y: 50,
      text: '0%咿呀呀',
      fontSize: 16,
      fill: 'black',
      textAlign: 'center',
      opacity: 1
    });
    const customAnimate = new IncreaseCount(null, { text: '12,345,678%咿呀呀' }, 1000, 'linear', {
      decimalLength: 0,
      format: 'thousandth',
      formatTemplate: '{{var}}%咿呀呀'
    });
    // Use cast to avoid type errors
    text.animate().play(customAnimate as any);
    stage.defaultLayer.add(text);
  });
  addCase('custom InputText', btnContainer, stage => {
    // Add explanatory text
    const text = createText({
      x: 300,
      y: 50,
      text: '',
      fontSize: 16,
      fill: 'black',
      textAlign: 'center',
      opacity: 1
    });
    // Terminal-style animation with prompt
    const terminalAnimation = new InputText({ text: '' }, { text: '这是一段文本内容' }, 1000, 'linear');
    // Use cast to avoid type errors
    text.animate().play(terminalAnimation as any);
    stage.defaultLayer.add(text);
  });
  addCase('AnimateExecutor Basic', btnContainer, stage => {
    // Add explanatory text
    const group = createGroup({
      x: 100,
      y: 100
    });

    for (let i = 0; i < 6; i++) {
      const rect = createRect({
        x: i * 100,
        y: 100,
        width: 80,
        height: 100,
        fill: 'black'
      });
      group.add(rect);
    }
    const executor = new AnimateExecutor(group);

    // Basic animation - all elements fade and change color simultaneously
    executor.execute({
      type: 'to',
      channel: {
        fill: {
          to: 'red'
        },
        opacity: {
          to: 0.5
        }
      },
      duration: 1000,
      easing: 'linear'
    });

    // Add title
    const text = createText({
      x: 300,
      y: 50,
      text: 'Basic AnimateExecutor - Simultaneous Animation',
      fontSize: 16,
      fill: 'black',
      textAlign: 'center'
    });
    stage.defaultLayer.add(group);
    stage.defaultLayer.add(text);
  });

  addCase('AnimateExecutor oneByOne', btnContainer, stage => {
    // Create a group with multiple rects
    const group = createGroup({
      x: 100,
      y: 100
    });

    for (let i = 0; i < 6; i++) {
      const rect = createRect({
        x: i * 100,
        y: 0,
        width: 80,
        height: 100,
        fill: 'blue',
        opacity: 0.3
      });
      group.add(rect);
    }
    const executor = new AnimateExecutor(group);

    // Sequential animation - elements animate one after another
    executor.execute({
      type: 'to',
      channel: {
        y: {
          to: 200
        },
        fill: {
          to: 'green'
        },
        opacity: {
          to: 1
        }
      },
      oneByOne: true, // Enable sequential animation
      duration: 500,
      easing: 'quadOut'
    });

    // Add title
    const text = createText({
      x: 300,
      y: 50,
      text: 'AnimateExecutor with oneByOne - Sequential Animation',
      fontSize: 16,
      fill: 'black',
      textAlign: 'center'
    });
    stage.defaultLayer.add(group);
    stage.defaultLayer.add(text);
  });

  addCase('AnimateExecutor totalTime', btnContainer, stage => {
    // Create a group with multiple elements
    const group = createGroup({
      x: 50,
      y: 150
    });

    for (let i = 0; i < 10; i++) {
      const circle = createCircle({
        x: i * 80,
        y: 0,
        radius: 30,
        fill: 'purple',
        opacity: 0.5
      });
      group.add(circle);
    }
    const executor = new AnimateExecutor(group);

    // Sequential animation with fixed total time
    executor.execute({
      type: 'to',
      channel: {
        y: {
          to: (datum: any, graphic: IGraphic, params: any) => {
            // Alternate between up and down
            return (graphic as any).idx % 2 === 0 ? 100 : -100;
          }
        },
        radius: {
          to: 50
        },
        opacity: {
          to: 1
        }
      },
      oneByOne: true, // Enable sequential animation
      totalTime: 600, // Entire animation sequence takes exactly 3 seconds
      duration: 500, // Base duration before scaling
      easing: 'bounceOut'
    });

    // Add title
    const text = createText({
      x: 400,
      y: 50,
      text: 'AnimateExecutor with totalTime - Fixed Duration Animation',
      fontSize: 16,
      fill: 'black',
      textAlign: 'center'
    });
    stage.defaultLayer.add(group);
    stage.defaultLayer.add(text);
  });

  addCase('AnimateExecutor Timeline', btnContainer, stage => {
    // Create a group with elements
    const group = createGroup({
      x: 200,
      y: 200
    });

    // Create 8 shapes arranged in a circle
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const x = Math.cos(angle) * 150;
      const y = Math.sin(angle) * 150;

      // Create a symbol for variety
      const symbol = createSymbol({
        x: x,
        y: y,
        size: 40,
        symbolType: i % 4 === 0 ? 'circle' : i % 4 === 1 ? 'square' : i % 4 === 2 ? 'triangle' : 'diamond',
        fill: 'orange',
        stroke: 'black',
        lineWidth: 2,
        angle: 0
      });
      group.add(symbol);
    }

    const executor = new AnimateExecutor(group);

    // Complex timeline animation
    executor.execute({
      // Use a timeline configuration with multiple time slices
      timeSlices: [
        {
          // First slice - scale up
          effects: {
            type: 'to',
            channel: {
              size: {
                to: 60
              },
              opacity: {
                to: 0.7
              }
            },
            easing: 'quadIn'
          },
          duration: 500
        },
        {
          // Second slice - rotate
          effects: {
            type: 'to',
            channel: {
              angle: {
                to: Math.PI * 2
              }
            },
            easing: 'linear'
          },
          duration: 1000
        },
        {
          // Third slice - change color and scale down
          effects: [
            {
              type: 'to',
              channel: {
                fill: {
                  to: 'red'
                }
              }
            },
            {
              type: 'to',
              channel: {
                size: {
                  to: 40
                }
              }
            }
          ],
          duration: 500
        }
      ],
      oneByOne: 100, // Sequential with 100ms interval
      loop: 2 // Repeat twice
    });

    // Add title
    const text = createText({
      x: 400,
      y: 50,
      text: 'AnimateExecutor with Timeline - Complex Animation Sequence',
      fontSize: 16,
      fill: 'black',
      textAlign: 'center'
    });
    stage.defaultLayer.add(group);
    stage.defaultLayer.add(text);
  });

  addCase('AnimateExecutor Partitioner', btnContainer, stage => {
    // Create a group with a grid of rectangles
    const group = createGroup({
      x: 100,
      y: 150
    });

    // Create a 6x4 grid of rectangles
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 6; col++) {
        const rect = createRect({
          x: col * 100,
          y: row * 100,
          width: 80,
          height: 80,
          fill: 'gray'
        });
        rect.context = {
          data: [{ row, col, even: (row + col) % 2 === 0 }]
        };
        group.add(rect);
      }
    }

    const executor = new AnimateExecutor(group);

    // Apply animation only to elements where row + col is even
    executor.execute({
      timeSlices: {
        effects: {
          type: 'to',
          channel: {
            fill: {
              to: 'blue'
            },
            width: {
              to: 90
            },
            height: {
              to: 90
            }
          },
          easing: 'elasticOut'
        },
        duration: 1000
      },
      // Partitioner function to filter elements
      partitioner: (datum: any, graphic: IGraphic, params: any) => {
        return datum && datum.length && datum[0].even === true;
      },
      oneByOne: 50
    });

    // Add title
    const text = createText({
      x: 400,
      y: 50,
      text: 'AnimateExecutor with Partitioner - Filtered Animation',
      fontSize: 16,
      fill: 'black',
      textAlign: 'center'
    });
    stage.defaultLayer.add(group);
    stage.defaultLayer.add(text);
  });
};
