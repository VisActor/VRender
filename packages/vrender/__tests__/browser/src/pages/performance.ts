import { createArc } from '@visactor/vrender-core';

const font = `"PingFang SC", "Helvetica Neue", "Microsoft Yahei", system-ui, -apple-system, "segoe ui", Roboto, Helvetica, Arial, sans-serif, "apple color emoji", "segoe ui emoji", "segoe ui symbol"`;
let fontSize = '12px';
function addTest(container: HTMLDivElement, name: string, cb: () => void) {
  const button = document.createElement('button');
  button.innerText = name;
  button.style.display = 'inline-flex';
  button.style.alignItems = 'center';
  button.style.justifyContent = 'center';
  button.style.padding = '8px 14px';
  button.style.fontSize = '14px';
  button.style.fontWeight = '600';
  button.style.border = '1px solid #d0d7de';
  button.style.borderRadius = '6px';
  button.style.background = '#ffffff';
  button.style.color = '#24292f';
  button.style.cursor = 'pointer';
  button.addEventListener('click', cb);
  container.appendChild(button);
}

export const page = () => {
  const buttonContainer = document.createElement('div');
  buttonContainer.style.display = 'flex';
  buttonContainer.style.flexWrap = 'wrap';
  buttonContainer.style.gap = '12px';
  buttonContainer.style.alignItems = 'center';
  buttonContainer.style.padding = '16px';

  const container = document.querySelector<HTMLDivElement>('#container');
  if (container) {
    container.prepend(buttonContainer);
  } else {
    document.body.appendChild(buttonContainer);
  }

  addTest(buttonContainer, 'font', () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1000;
    canvas.height = 1000;
    const obj = {
      font: fontSize + font
    };
    function setFont(font: string) {
      if (obj.font === font) {
        return;
      }
      ctx.font = font;
    }
    const ctx = canvas.getContext('2d');
    console.time('font');
    for (let i = 0; i < 10000; i++) {
      const nextFont = fontSize + font;
      ctx.font = nextFont;
    }
    console.timeEnd('font');
    console.time('setFont');
    for (let i = 0; i < 10000; i++) {
      const nextFont = fontSize + font;
      setFont(nextFont);
    }
    console.timeEnd('setFont');
  });
  addTest(buttonContainer, 'state map', () => {
    class AAA {
      transitions: Map<string, Map<string, any>> = new Map();
      constructor(public from: string, public to: string) {}
      /**
       * 注册默认的转换规则
       */
      registerDefaultTransitions(): void {
        // 设置默认的转换规则
        // 退出动画不能被中断，除非是进入动画
        this.registerTransition('exit', 'enter', () => ({
          allowTransition: true,
          stopOriginalTransition: true
        }));
        this.registerTransition('exit', '*', () => ({
          allowTransition: false,
          stopOriginalTransition: false
        }));

        // 进入动画可以被任何动画中断
        this.registerTransition('enter', '*', () => ({
          allowTransition: true,
          stopOriginalTransition: true
        }));

        // Disappear 是一个退出动画，遵循相同的规则
        this.registerTransition('disappear', 'enter', () => ({
          allowTransition: true,
          stopOriginalTransition: true
        }));
        this.registerTransition('disappear', 'appear', () => ({
          allowTransition: true,
          stopOriginalTransition: true
        }));
        this.registerTransition('disappear', '*', () => ({
          allowTransition: false,
          stopOriginalTransition: false
        }));

        // Appear 是一个进入动画，可以被任何动画中断
        this.registerTransition('appear', '*', () => ({
          allowTransition: true,
          stopOriginalTransition: true
        }));
      }

      registerTransition(fromState: string, toState: string, transition: any): void {
        if (!this.transitions.has(fromState)) {
          this.transitions.set(fromState, new Map());
        }

        this.transitions.get(fromState)!.set(toState, transition);
      }
    }

    const aaa = new AAA('from', 'to');
    aaa.registerDefaultTransitions();
    aaa.registerTransition('from', 'to', () => ({
      allowTransition: true,
      stopOriginalTransition: true
    }));

    const fromList = new Array(10000).fill(0).map((_, i) => ['from', 'to', 'appear', 'disappear'][i % 4]);
    const toList = new Array(10000).fill(0).map((_, i) => ['from', 'to', 'appear', 'disappear'][i % 4]);
    console.time('transitions');
    for (let i = 0; i < 10000; i++) {
      aaa.transitions.get(fromList[i])?.get(toList[i])?.transition();
    }
    console.timeEnd('transitions');
  });
};
