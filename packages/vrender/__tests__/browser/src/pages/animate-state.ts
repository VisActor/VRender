import {
  DefaultTicker,
  DefaultTimeline,
  Animate,
  registerAnimate,
  IncreaseCount,
  InputText,
  AnimateExecutor,
  ACustomAnimate
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
  addCase('Basic Animation States', btnContainer, stage => {
    // Create a title
    const title = createText({
      x: 450,
      y: 50,
      text: 'Basic Animation States',
      fontSize: 20,
      fontWeight: 'bold',
      fill: 'black',
      textAlign: 'center'
    });

    const instructions = createText({
      x: 450,
      y: 80,
      text: 'Click the buttons below to apply different animation states',
      fontSize: 14,
      fill: 'black',
      textAlign: 'center'
    });

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

    // Register animation states
    rect.registerAnimationState({
      name: 'pulse',
      animation: {
        timeSlices: [
          {
            duration: 500,
            effects: {
              type: 'to',
              channel: {
                scaleX: { to: 1.2 },
                scaleY: { to: 1.2 }
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
    });

    rect.registerAnimationState({
      name: 'spin',
      animation: {
        type: 'to',
        channel: {
          angle: { to: 360 }
        },
        duration: 2000,
        easing: 'linear',
        loop: true
      }
    });

    rect.registerAnimationState({
      name: 'highlight',
      animation: {
        type: 'to',
        channel: {
          fill: { to: 'orange' },
          strokeWidth: { to: 3 },
          stroke: { to: 'red' }
        },
        duration: 300,
        easing: 'sineOut'
      }
    });

    // Create control buttons
    const createControlButton = (x: number, y: number, label: string, action: () => void) => {
      const buttonGroup = createGroup({
        x,
        y
      });

      const buttonBg = createRect({
        x: 0,
        y: 0,
        width: 120,
        height: 30,
        fill: 'lightgray',
        stroke: 'gray',
        lineWidth: 1,
        cornerRadius: 5
      });

      const buttonText = createText({
        x: 60,
        y: 15,
        text: label,
        fontSize: 14,
        fill: 'black',
        textAlign: 'center',
        textBaseline: 'middle'
      });

      buttonGroup.add(buttonBg);
      buttonGroup.add(buttonText);

      // Add click handler
      buttonGroup.addEventListener('click', action);

      return buttonGroup;
    };

    // Add control buttons
    const buttonsGroup = createGroup({
      x: 0,
      y: 350
    });

    buttonsGroup.add(
      createControlButton(200, 0, 'Pulse', () => {
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
                        scaleX: { to: 1.2 },
                        scaleY: { to: 1.2 }
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
      })
    );

    buttonsGroup.add(
      createControlButton(340, 0, 'Spin', () => {
        rect.applyAnimationState(
          ['spin'],
          [
            {
              name: 'spin',
              animation: {
                type: 'to',
                channel: {
                  angle: { to: 360 }
                },
                duration: 2000,
                easing: 'linear',
                loop: true
              }
            }
          ]
        );
      })
    );

    buttonsGroup.add(
      createControlButton(480, 0, 'Highlight', () => {
        rect.applyAnimationState(
          ['highlight'],
          [
            {
              name: 'highlight',
              animation: {
                type: 'to',
                channel: {
                  fill: { to: 'orange' },
                  strokeWidth: { to: 3 },
                  stroke: { to: 'red' }
                },
                duration: 300,
                easing: 'sineOut'
              }
            }
          ]
        );
      })
    );

    buttonsGroup.add(
      createControlButton(620, 0, 'Clear', () => {
        rect.clearAnimationStates();
      })
    );

    // Add to stage
    stage.defaultLayer.add(title);
    stage.defaultLayer.add(instructions);
    stage.defaultLayer.add(rect);
    stage.defaultLayer.add(buttonsGroup);
  });

  // Animation state transitions
  addCase('Animation State Transitions', btnContainer, stage => {
    // Create a title
    const title = createText({
      x: 450,
      y: 50,
      text: 'Animation State Transitions',
      fontSize: 20,
      fontWeight: 'bold',
      fill: 'black',
      textAlign: 'center'
    });

    const instructions = createText({
      x: 450,
      y: 80,
      text: 'Apply states in sequence to see transition behavior',
      fontSize: 14,
      fill: 'black',
      textAlign: 'center'
    });

    // Create a circle to animate
    const circle = createCircle({
      x: 450,
      y: 250,
      radius: 50,
      fill: 'green'
    });
    circle.context = { id: 'circle1' };

    // Create control buttons
    const createControlButton = (x: number, y: number, label: string, action: () => void) => {
      const buttonGroup = createGroup({
        x,
        y
      });

      const buttonBg = createRect({
        x: 0,
        y: 0,
        width: 120,
        height: 30,
        fill: 'lightgray',
        stroke: 'gray',
        lineWidth: 1,
        cornerRadius: 5
      });

      const buttonText = createText({
        x: 60,
        y: 15,
        text: label,
        fontSize: 14,
        fill: 'black',
        textAlign: 'center',
        textBaseline: 'middle'
      });

      buttonGroup.add(buttonBg);
      buttonGroup.add(buttonText);

      // Add click handler
      buttonGroup.addEventListener('click', action);

      return buttonGroup;
    };

    // Add transition explanations
    const statusText = createText({
      x: 450,
      y: 350,
      text: 'Current state: None',
      fontSize: 16,
      fill: 'black',
      textAlign: 'center'
    });

    const ruleExplanation = createText({
      x: 450,
      y: 380,
      text: 'Try different state sequences to see transition rules in action',
      fontSize: 14,
      fill: 'darkgray',
      textAlign: 'center'
    });

    // Add control buttons
    const buttonsGroup = createGroup({
      x: 0,
      y: 430
    });

    // First reset circle to simplify state
    circle.opacity = 0;
    circle.scaleX = 0;
    circle.scaleY = 0;

    // Helper to update status text
    const updateStatus = (state: string) => {
      statusText.setAttribute('text', `Current state: ${state}`);
    };
    console.log(circle);

    buttonsGroup.add(
      createControlButton(200, 0, 'Appear', () => {
        circle.applyAnimationState(
          ['appear'],
          [
            {
              name: 'appear',
              animation: {
                type: 'to',
                channel: {
                  opacity: { from: 0, to: 1 },
                  scaleX: { from: 0, to: 1 },
                  scaleY: { from: 0, to: 1 },
                  fill: { from: 'green', to: 'blue' }
                },
                duration: 3000,
                easing: 'linear'
              }
            }
          ]
        );
        updateStatus('appear (enter)');
        ruleExplanation.attribute.text = 'Enter animations can be interrupted by any animation';
      })
    );

    buttonsGroup.add(
      createControlButton(340, 0, 'normal', () => {
        circle.applyAnimationState(
          ['normal'],
          [
            {
              name: 'normal',
              animation: {
                timeSlices: [
                  {
                    duration: 600,
                    effects: {
                      type: 'to',
                      channel: {
                        y: { to: 200 },
                        fill: { to: 'red' }
                      },
                      easing: 'linear'
                    }
                  },
                  {
                    duration: 600,
                    effects: {
                      type: 'to',
                      channel: {
                        y: { to: 300 }
                      },
                      easing: 'linear'
                    }
                  }
                ],
                priority: 1,
                loop: true,
                bounce: true
              }
            }
          ]
        );
        updateStatus('normal');
        ruleExplanation.attribute.text = 'normal animations can be overridden by other animations';
      })
    );

    buttonsGroup.add(
      createControlButton(480, 0, 'Disappear', () => {
        circle.applyAnimationState(
          ['disappear'],
          [
            {
              name: 'disappear',
              animation: {
                type: 'to',
                channel: {
                  opacity: { from: 1, to: 0 }
                },
                duration: 800,
                easing: 'sineIn'
              }
            }
          ]
        );
        updateStatus('disappear (exit)');
        ruleExplanation.attribute.text = 'Exit animations cannot be interrupted except by enter animations';
      })
    );

    buttonsGroup.add(
      createControlButton(620, 0, 'Clear', () => {
        circle.clearAnimationStates();
        updateStatus('None');
        ruleExplanation.attribute.text = 'Try different state sequences to see transition rules in action';
      })
    );

    // for (let i = 0; i < 3; i++) {
    //   const rect = createRect({
    //     x: i * 100,
    //     y: 100,
    //     width: 80,
    //     height: 100,
    //     fill: 'black'
    //   });
    //   setTimeout(() => {
    //     const executor = new AnimateExecutor(rect);

    //     // Basic animation - all elements fade and change color simultaneously
    //     executor.execute({
    //       type: 'to',
    //       channel: {
    //         fill: {
    //           to: 'red'
    //         },
    //         opacity: {
    //           to: 0.5
    //         }
    //       },
    //       duration: 1000,
    //       easing: 'elasticOut'
    //     });
    //   }, 2000);
    //   stage.defaultLayer.add(rect);
    // }

    // Add to stage
    stage.defaultLayer.add(title);
    stage.defaultLayer.add(instructions);
    stage.defaultLayer.add(circle);
    stage.defaultLayer.add(statusText);
    stage.defaultLayer.add(ruleExplanation);
    stage.defaultLayer.add(buttonsGroup);
  });

  // Multiple state sequences
  addCase('State Sequences', btnContainer, stage => {
    // Create a title
    const title = createText({
      x: 450,
      y: 50,
      text: 'Animation State Sequences',
      fontSize: 20,
      fontWeight: 'bold',
      fill: 'black',
      textAlign: 'center'
    });

    const instructions = createText({
      x: 450,
      y: 80,
      text: 'Apply state sequences to see chained animations',
      fontSize: 14,
      fill: 'black',
      textAlign: 'center'
    });

    // Create a path to animate
    const path = createPath({
      path: 'M250,200 C300,100 400,100 450,200 S600,300 650,200',
      stroke: 'blue',
      lineWidth: 3,
      fill: 'none'
    });
    path.context = { id: 'path1' };

    // Register animation states
    path.registerAnimationState({
      name: 'draw',
      animation: {
        type: 'to',
        channel: {
          lineDash: { from: [1000, 1000], to: [0, 0] },
          lineDashOffset: { from: 1000, to: 0 }
        },
        duration: 2000,
        easing: 'linear'
      }
    });

    path.registerAnimationState({
      name: 'fill',
      animation: {
        type: 'to',
        channel: {
          fill: { from: 'none', to: 'rgba(0, 0, 255, 0.2)' }
        },
        duration: 1000,
        easing: 'sineOut'
      }
    });

    path.registerAnimationState({
      name: 'pulse',
      animation: {
        type: 'to',
        channel: {
          lineWidth: { from: 3, to: 6 }
        },
        duration: 500,
        easing: 'linear'
      }
    });

    path.registerAnimationState({
      name: 'reset',
      animation: {
        type: 'to',
        channel: {
          lineDash: { to: [1000, 1000] },
          lineDashOffset: { to: 1000 },
          fill: { to: 'none' },
          lineWidth: { to: 3 }
        },
        duration: 1000,
        easing: 'sineIn'
      }
    });

    // Create control buttons
    const createControlButton = (x: number, y: number, label: string, action: () => void) => {
      const buttonGroup = createGroup({
        x,
        y
      });

      const buttonBg = createRect({
        x: 0,
        y: 0,
        width: 160,
        height: 30,
        fill: 'lightgray',
        stroke: 'gray',
        lineWidth: 1,
        cornerRadius: 5
      });

      const buttonText = createText({
        x: 80,
        y: 15,
        text: label,
        fontSize: 14,
        fill: 'black',
        textAlign: 'center',
        textBaseline: 'middle'
      });

      buttonGroup.add(buttonBg);
      buttonGroup.add(buttonText);

      // Add click handler
      buttonGroup.addEventListener('click', action);

      return buttonGroup;
    };

    // Add control buttons
    const buttonsGroup = createGroup({
      x: 0,
      y: 350
    });

    buttonsGroup.add(
      createControlButton(200, 0, 'Draw → Fill → Pulse', () => {
        debugger;
        path.applyAnimationState(
          ['draw', 'fill', 'pulse'],
          [
            {
              name: 'draw',
              animation: {
                type: 'to',
                channel: {
                  stroke: { from: 'none', to: 'orange' }
                },
                duration: 2000,
                easing: 'linear'
              }
            },
            {
              name: 'fill',
              animation: {
                type: 'to',
                channel: {
                  fill: { from: 'none', to: 'rgba(0, 0, 255, 0.2)' }
                },
                duration: 1000,
                easing: 'sineOut'
              }
            },
            {
              name: 'pulse',
              animation: {
                type: 'to',
                channel: {
                  lineWidth: { from: 3, to: 6 }
                },
                duration: 500,
                easing: 'linear'
              }
            }
          ]
        );
      })
    );

    buttonsGroup.add(
      createControlButton(380, 0, 'Reset', () => {
        path.applyAnimationState(
          ['reset'],
          [
            {
              name: 'reset',
              animation: {
                type: 'to',
                channel: {
                  lineDash: { to: [1000, 1000] },
                  lineDashOffset: { to: 1000 },
                  fill: { to: 'none' },
                  lineWidth: { to: 3 }
                },
                duration: 1000,
                easing: 'sineIn'
              }
            }
          ]
        );
      })
    );

    buttonsGroup.add(
      createControlButton(560, 0, 'Clear', () => {
        path.clearAnimationStates();
      })
    );

    // Add to stage
    stage.defaultLayer.add(title);
    stage.defaultLayer.add(instructions);
    stage.defaultLayer.add(path);
    stage.defaultLayer.add(buttonsGroup);
  });

  // Group animation states
  addCase('Group Animation States', btnContainer, stage => {
    // Create a title
    const title = createText({
      x: 450,
      y: 50,
      text: 'Group Animation States',
      fontSize: 20,
      fontWeight: 'bold',
      fill: 'black',
      textAlign: 'center'
    });

    const instructions = createText({
      x: 450,
      y: 80,
      text: 'Apply states to a group and see the effects',
      fontSize: 14,
      fill: 'black',
      textAlign: 'center'
    });

    // Create a group with multiple elements
    const group = createGroup({
      x: 300,
      y: 200
    });
    group.context = { id: 'animationGroup' };

    const rect1 = createRect({
      x: 0,
      y: 0,
      width: 60,
      height: 60,
      fill: 'red'
    });
    rect1.context = { id: 'rect1' };

    const rect2 = createRect({
      x: 100,
      y: 0,
      width: 60,
      height: 60,
      fill: 'green'
    });
    rect2.context = { id: 'rect2' };

    const rect3 = createRect({
      x: 200,
      y: 0,
      width: 60,
      height: 60,
      fill: 'blue'
    });
    rect3.context = { id: 'rect3' };

    group.add(rect1);
    group.add(rect2);
    group.add(rect3);

    // Register animation states
    group.registerAnimationState({
      name: 'appear',
      animation: {
        type: 'to',
        channel: {
          opacity: { from: 0, to: 1 },
          scaleX: { from: 0.5, to: 1 },
          scaleY: { from: 0.5, to: 1 }
        },
        duration: 1000,
        easing: 'elasticOut'
      }
    });

    group.registerAnimationState({
      name: 'shuffle',
      animation: {
        type: 'to',
        channel: {
          x: { to: 200 }
        },
        duration: 1000,
        easing: 'linear'
      }
    });

    group.registerAnimationState({
      name: 'disappear',
      animation: {
        type: 'to',
        channel: {
          opacity: { to: 0 },
          y: { to: 250 }
        },
        duration: 800,
        easing: 'sineIn'
      }
    });

    // Create control buttons
    const createControlButton = (x: number, y: number, label: string, action: () => void) => {
      const buttonGroup = createGroup({
        x,
        y
      });

      const buttonBg = createRect({
        x: 0,
        y: 0,
        width: 120,
        height: 30,
        fill: 'lightgray',
        stroke: 'gray',
        lineWidth: 1,
        cornerRadius: 5
      });

      const buttonText = createText({
        x: 60,
        y: 15,
        text: label,
        fontSize: 14,
        fill: 'black',
        textAlign: 'center',
        textBaseline: 'middle'
      });

      buttonGroup.add(buttonBg);
      buttonGroup.add(buttonText);

      // Add click handler
      buttonGroup.addEventListener('click', action);

      return buttonGroup;
    };

    // Initialize group to be invisible
    group.opacity = 0;
    group.scaleX = 0.5;
    group.scaleY = 0.5;

    // Add control buttons
    const buttonsGroup = createGroup({
      x: 0,
      y: 350
    });

    buttonsGroup.add(
      createControlButton(200, 0, 'Appear', () => {
        group.applyAnimationState(
          ['appear'],
          [
            {
              name: 'appear',
              animation: {
                type: 'to',
                channel: {
                  opacity: { from: 0, to: 1 },
                  scaleX: { from: 0.5, to: 1 },
                  scaleY: { from: 0.5, to: 1 }
                },
                duration: 1000,
                easing: 'elasticOut'
              }
            }
          ]
        );
      })
    );

    buttonsGroup.add(
      createControlButton(340, 0, 'Shuffle', () => {
        group.applyAnimationState(
          ['shuffle'],
          [
            {
              name: 'shuffle',
              animation: {
                type: 'to',
                channel: {
                  x: { to: group.attribute.x === 300 ? 100 : 300 }
                },
                duration: 1000,
                easing: 'linear'
              }
            }
          ]
        );
      })
    );

    buttonsGroup.add(
      createControlButton(480, 0, 'Disappear', () => {
        group.applyAnimationState(
          ['disappear'],
          [
            {
              name: 'disappear',
              animation: {
                type: 'to',
                channel: {
                  opacity: { to: 0 },
                  y: { to: 250 }
                },
                duration: 800,
                easing: 'sineIn'
              }
            }
          ]
        );
      })
    );

    buttonsGroup.add(
      createControlButton(620, 0, 'Reset', () => {
        group.clearAnimationStates();
        group.opacity = 0;
        group.scaleX = 0.5;
        group.scaleY = 0.5;
        group.x = 300;
        group.y = 200;
      })
    );

    // Add to stage
    stage.defaultLayer.add(title);
    stage.defaultLayer.add(instructions);
    stage.defaultLayer.add(group);
    stage.defaultLayer.add(buttonsGroup);
  });
};
