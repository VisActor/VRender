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

// Custom rainbow color interpolator function
function rainbowColorInterpolator(
  ratio: number,
  from: any,
  to: any,
  out: Record<string, any>,
  datum: any,
  target: IGraphic,
  params: any
) {
  // Create rainbow effect using HSL colors
  const hue = (ratio * 360) % 360;
  target.attribute.fill = `hsl(${hue}, 80%, 60%)`;
}

// Path tracing interpolator function
function pathTracingInterpolator(
  ratio: number,
  from: any,
  to: any,
  out: Record<string, any>,
  datum: any,
  target: IGraphic,
  params: any
) {
  const path = params.path || 'M0,0 L100,0 L100,100 L0,100 Z';
  const length = 1000; // Estimate of path length

  // Set stroke-dasharray and stroke-dashoffset to create tracing effect
  // out.strokeDasharray = length;
  console.log(target.attribute);
  // out.strokeDashoffset = length * (1 - ratio);
  target.attribute.lineDash = [length, length];
  target.attribute.lineDashOffset = length * (1 - ratio);
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

  addCase('Animate basic', btnContainer, stage => {
    const rect = createRect({
      x: 100,
      y: 100,
      width: 100,
      height: 100,
      fill: 'red'
    });
    stage.defaultLayer.add(rect);

    rect.animate().to({ x: 300 }, 1000, 'linear').to({ y: 300 }, 1000, 'linear');
    // 中途设置值没问题，它会从orange开始
    rect.setAttribute('fill', 'orange');
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
  addCase('Animate conflict', btnContainer, stage => {
    const rect = createRect({
      x: 100,
      y: 100,
      width: 100,
      height: 100,
      fill: 'red'
    });
    stage.defaultLayer.add(rect);

    rect.animate().to({ x: 600, y: 300 }, 6000, 'linear');
    setTimeout(() => {
      rect.animate().to({ fill: 'orange' }, 1000, 'linear').to({ x: 0 }, 2000, 'linear');
    }, 1000);
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
      easing: 'elasticOut'
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
  addCase('AnimateExecutor Item', btnContainer, stage => {
    // Add explanatory text

    for (let i = 0; i < 6; i++) {
      const rect = createRect({
        x: i * 100,
        y: 100,
        width: 80,
        height: 100,
        fill: 'black'
      });
      const executor = new AnimateExecutor(rect);

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
        easing: 'elasticOut'
      });
      stage.defaultLayer.add(rect);
    }

    // Add title
    const text = createText({
      x: 300,
      y: 50,
      text: 'Basic AnimateExecutor - Simultaneous Animation',
      fontSize: 16,
      fill: 'black',
      textAlign: 'center'
    });

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
      timeSlices: [
        {
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
        }
      ],
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
  addCase('AnimateExecutor lifecycle', btnContainer, stage => {
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
      loop: 2,
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
      text: 'AnimateExecutor with lifecycle',
      fontSize: 16,
      fill: 'black',
      textAlign: 'center'
    });

    executor.onStart(() => {
      console.log('onStart');
    });
    executor.onEnd(() => {
      console.log('onEnd');
      alert('完成');
    });
    stage.defaultLayer.add(group);
    stage.defaultLayer.add(text);
  });
  addCase('AnimateExecutor builtInAnimate', btnContainer, stage => {
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
          type: 'scaleIn',
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
      text: 'AnimateExecutor with lifecycle',
      fontSize: 16,
      fill: 'black',
      textAlign: 'center'
    });

    executor.onStart(() => {
      console.log('onStart');
    });
    executor.onEnd(() => {
      console.log('onEnd');
      alert('完成');
    });
    stage.defaultLayer.add(group);
    stage.defaultLayer.add(text);
  });

  // New test cases for custom animations
  addCase('AnimateExecutor Custom Interpolator', btnContainer, stage => {
    // Create a group to hold all elements
    const group = createGroup({
      x: 100,
      y: 100
    });

    // Add a title
    const title = createText({
      x: 400,
      y: 30,
      text: 'AnimateExecutor with Custom Interpolator Function',
      fontSize: 18,
      fill: 'black',
      textAlign: 'center'
    });

    // Create a row of rectangles for the rainbow effect
    const rectangles = [];
    for (let i = 0; i < 10; i++) {
      const rect = createRect({
        x: i * 70,
        y: 80,
        width: 60,
        height: 60,
        fill: 'gray',
        cornerRadius: 5 // Using cornerRadius instead of radius
      });
      rectangles.push(rect);
      group.add(rect);
    }

    // Create path for the path tracing demo
    const pathElement = createPath({
      path: 'M50,250 C150,150 250,350 350,250 S550,150 650,250',
      stroke: 'black',
      lineWidth: 5,
      fill: 'orange'
      // strokeDasharray and strokeDashoffset will be set by the animation
    });
    group.add(pathElement);

    // Create a text label for the path tracing demo
    const pathLabel = createText({
      x: 350,
      y: 210,
      text: 'Path Tracing Animation',
      fontSize: 14,
      fill: 'black',
      textAlign: 'center'
    });
    group.add(pathLabel);

    // Create executor
    const executor = new AnimateExecutor(group);

    // Rainbow color animation using custom interpolator
    executor.execute({
      type: 'to',
      custom: rainbowColorInterpolator,
      channel: {},
      oneByOne: 50,
      duration: 2000,
      loop: Infinity
    });

    // Path tracing animation using custom interpolator
    executor.executeItem(
      {
        type: 'to',
        custom: pathTracingInterpolator,
        customParameters: {
          path: 'M50,250 C150,150 250,350 350,250 S550,150 650,250',
          length: 800 // Approximate length of the path
        },
        channel: {
          strokeDasharray: { to: 800 },
          strokeDashoffset: { to: 0 }
        },
        duration: 3000,
        loop: Infinity
      },
      pathElement
    );

    stage.defaultLayer.add(group);
    stage.defaultLayer.add(title);
  });

  addCase('AnimateExecutor Custom Animation Class', btnContainer, stage => {
    // Create a group to hold all elements
    const group = createGroup({
      x: 100,
      y: 100
    });

    // Add a title
    const title = createText({
      x: 400,
      y: 30,
      text: 'AnimateExecutor with Custom Animation Classes',
      fontSize: 18,
      fill: 'black',
      textAlign: 'center'
    });

    // Create text element for typewriter effect
    const typewriterText = createText({
      x: 350,
      y: 100,
      text: '',
      fontSize: 20,
      fill: 'blue',
      textAlign: 'center'
    });
    group.add(typewriterText);

    // Create a row of circles for wave animation
    const circles = [];
    for (let i = 0; i < 12; i++) {
      const circle = createCircle({
        x: 50 + i * 60,
        y: 200,
        radius: 15,
        fill: 'purple',
        opacity: 0.6
      });
      circles.push(circle);
      group.add(circle);
    }

    // Create executor
    const executor = new AnimateExecutor(group);

    // Apply typewriter animation
    executor.executeItem(
      {
        type: 'to',
        custom: InputText,
        channel: {
          text: { to: 'This is a custom typewriter animation effect!' }
        },
        duration: 3000,
        loop: true
      },
      typewriterText
    );

    // Apply wave animation to circles
    // circles.forEach((circle, index) => {
    //   executor.executeItem(
    //     {
    //       type: 'to',
    //       custom: WaveAnimate,
    //       customParameters: {
    //         amplitude: 30,
    //         frequency: 2 + index * 0.2 // Different frequency for each circle
    //       },
    //       channel: {
    //         y: { to: 200 } // This will be replaced by the wave animation
    //       },
    //       duration: 3000,
    //       loop: true
    //     },
    //     circle
    //   );
    // });

    stage.defaultLayer.add(group);
    stage.defaultLayer.add(title);
  });

  addCase('AnimateExecutor conflict', btnContainer, stage => {
    // Create a group to hold all elements
    const group = createGroup({
      x: 100,
      y: 100
    });

    // Add a title
    const title = createText({
      x: 400,
      y: 30,
      text: 'AnimateExecutor with Custom Animation Classes',
      fontSize: 18,
      fill: 'black',
      textAlign: 'center'
    });

    // Create text element for typewriter effect
    const typewriterText = createText({
      x: 350,
      y: 100,
      text: '',
      fontSize: 20,
      fill: 'blue',
      textAlign: 'center'
    });
    group.add(typewriterText);

    // Create a row of circles for wave animation
    const circles = [];
    for (let i = 0; i < 12; i++) {
      const circle = createCircle({
        x: 50 + i * 60,
        y: 200,
        radius: 15,
        fill: 'purple',
        opacity: 0.6
      });
      circles.push(circle);
      group.add(circle);
    }

    // Create executor
    const executor = new AnimateExecutor(group);

    // Apply typewriter animation
    executor.executeItem(
      {
        type: 'to',
        custom: InputText,
        channel: {
          text: { to: 'This is a custom typewriter animation effect!' }
        },
        duration: 3000,
        loop: true
      },
      typewriterText
    );

    // Apply wave animation to circles
    // circles.forEach((circle, index) => {
    //   executor.executeItem(
    //     {
    //       type: 'to',
    //       custom: WaveAnimate,
    //       customParameters: {
    //         amplitude: 30,
    //         frequency: 2 + index * 0.2 // Different frequency for each circle
    //       },
    //       channel: {
    //         y: { to: 200 } // This will be replaced by the wave animation
    //       },
    //       duration: 3000,
    //       loop: true
    //     },
    //     circle
    //   );
    // });

    stage.defaultLayer.add(group);
    stage.defaultLayer.add(title);
  });
};
