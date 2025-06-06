import { createStage, createGroup } from '@visactor/vrender';
import { createText, createRichText } from '@visactor/vrender';
import { AnimateExecutor, registerAnimate, registerCustomAnimate } from '@visactor/vrender-animate';

registerAnimate();
registerCustomAnimate();

let stage: any;

// 基础富文本配置
const basicTextConfig = [
  {
    text: 'VRender 富文本',
    fontSize: 24,
    fill: '#3A86FF',
    fontWeight: 'bold'
  }
];

// 带格式的富文本配置
const formattedTextConfig = [
  {
    text: '富文本',
    fontSize: 24,
    fill: '#3A86FF',
    fontWeight: 'bold'
  },
  {
    text: '退场',
    fontSize: 24,
    fill: '#FF006E',
    fontWeight: 'bold'
  },
  {
    text: '动画效果',
    fontSize: 24,
    fill: '#FFBE0B',
    fontWeight: 'bold'
  }
];

// 段落富文本配置
const paragraphTextConfig = [
  {
    text: 'VRender中的富文本动画\n',
    fontSize: 24,
    fill: '#3A86FF',
    fontWeight: 'bold'
  },
  {
    text: '这是一段用于演示的多行文本，\n',
    fontSize: 18,
    fill: '#000'
  },
  {
    text: '支持逐字符退场和逐单词退场效果',
    fontSize: 18,
    fill: '#FF006E'
  }
];

// Utility function to add test cases to the page
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
  const container = document.createElement('div');
  container.style.width = '1000px';
  container.style.background = '#cecece';
  container.style.display = 'flex';
  container.style.flexDirection = 'row';
  container.style.gap = '3px';
  container.style.flexWrap = 'wrap';
  container.style.height = '120px';
  const canvas = document.getElementById('main');
  // 将container添加到canvas之前
  canvas.parentNode.insertBefore(container, canvas);

  // Test case for InputText animation
  addCase('InputText Animation', container, stage => {
    const text = createText({
      x: 20,
      y: 80,
      text: '',
      fontSize: 20,
      fill: '#000',
      textBaseline: 'middle'
    });

    // Create a group and add the text to it
    const group = createGroup({});
    group.add(text);
    stage.defaultLayer.add(group);
    stage.render();

    // Create an AnimateExecutor and run the animation
    const executor = new AnimateExecutor(group);
    executor.execute({
      type: 'inputText',
      to: { text: 'Hello, this is a typing animation!' },
      customParameters: {
        showCursor: true,
        cursorChar: '|',
        blinkCursor: true
      },
      duration: 2000,
      easing: 'linear'
    });
  });

  // Test case for InputRichText animation
  addCase('InputRichText Animation', container, stage => {
    // Create a richText with empty textConfig
    const richText = createRichText({
      x: 20,
      y: 80,
      width: 600,
      height: 100,
      textConfig: [],
      textBaseline: 'middle'
    });

    // Create a group and add the richText to it
    const group = createGroup({});
    group.add(richText);
    stage.defaultLayer.add(group);
    stage.render();

    // Define the final textConfig with different styles
    const finalTextConfig = [
      {
        text: 'Rich ',
        fontSize: 24,
        fill: '#FF5500',
        fontWeight: 'bold'
      },
      {
        text: 'Text ',
        fontSize: 24,
        fill: '#0055FF',
        fontStyle: 'italic'
      },
      {
        text: 'Typing ',
        fontSize: 24,
        fill: '#33AA33'
      },
      {
        text: 'Animation!',
        fontSize: 24,
        fill: '#AA33AA',
        textDecoration: 'underline'
      }
    ];

    // Create an AnimateExecutor and run the animation
    const executor = new AnimateExecutor(group);
    executor.execute({
      type: 'inputRichText',
      to: { textConfig: finalTextConfig },
      customParameters: {
        showCursor: true,
        cursorChar: '|',
        blinkCursor: true,
        fadeInChars: true,
        fadeInDuration: 0.3
      },
      duration: 3000,
      easing: 'linear'
    });
  });

  // Slide RichText Animation - Right direction (default)
  addCase('SlideRichText - Right Direction', container, stage => {
    // Create a richText with empty textConfig
    const richText = createRichText({
      x: 20,
      y: 80,
      width: 600,
      height: 100,
      textConfig: [],
      textBaseline: 'middle',
      ascentDescentMode: 'font'
    });

    // Create a group and add the richText to it
    const group = createGroup({});
    group.add(richText);
    stage.defaultLayer.add(group);
    stage.render();

    // Define the textConfig
    const textConfig = [
      ...Array.from('Slide from Right ').map(item => ({
        text: item,
        fontSize: 24,
        fill: '#FF5500',
        fontWeight: 'bold'
      })),
      ...Array.from('- Characters slide in while typing!').map(item => ({
        text: item,
        fontSize: 24,
        fill: '#0055FF'
      }))
    ];

    // Create an AnimateExecutor and run the animation
    const executor = new AnimateExecutor(group);
    executor.execute({
      type: 'slideRichText',
      to: { textConfig },
      customParameters: {
        wordByWord: true,
        fadeInDuration: 0.3,
        slideDirection: 'right',
        slideDistance: 50
      },
      duration: 3000,
      easing: 'linear'
    });
  });

  // Slide RichText Animation - Left direction
  addCase('SlideRichText - Left Direction', container, stage => {
    // Create a richText with empty textConfig
    const richText = createRichText({
      x: 20,
      y: 80,
      width: 600,
      height: 100,
      textConfig: [],
      textBaseline: 'middle',
      ascentDescentMode: 'font'
    });

    // Create a group and add the richText to it
    const group = createGroup({});
    group.add(richText);
    stage.defaultLayer.add(group);
    stage.render();

    // Define the textConfig
    const textConfig = [
      ...Array.from('Slide from Left ').map(item => ({
        text: item,
        fontSize: 24,
        fill: '#FF5500',
        fontWeight: 'bold'
      })),
      ...Array.from('- Characters slide in while typing!').map(item => ({
        text: item,
        fontSize: 24,
        fill: '#0055FF'
      }))
    ];

    // Create an AnimateExecutor and run the animation
    const executor = new AnimateExecutor(group);
    executor.execute({
      type: 'slideRichText',
      to: { textConfig },
      customParameters: {
        wordByWord: true,
        fadeInDuration: 0.3,
        slideDirection: 'left',
        slideDistance: 50
      },
      duration: 3000,
      easing: 'linear'
    });
  });

  // Slide RichText Animation - Up direction
  addCase('SlideRichText - Up Direction', container, stage => {
    // Create a richText with empty textConfig
    const richText = createRichText({
      x: 20,
      y: 80,
      width: 600,
      height: 100,
      textConfig: [],
      textBaseline: 'middle',
      ascentDescentMode: 'font'
    });

    // Create a group and add the richText to it
    const group = createGroup({});
    group.add(richText);
    stage.defaultLayer.add(group);
    stage.render();

    // Define the textConfig
    const textConfig = [
      ...Array.from('Slide from Bottom ').map(item => ({
        text: item,
        fontSize: 24,
        fill: '#FF5500',
        fontWeight: 'bold'
      })),
      ...Array.from('- Characters slide upward while typing!').map(item => ({
        text: item,
        fontSize: 24,
        fill: '#0055FF'
      }))
    ];

    // Create an AnimateExecutor and run the animation
    const executor = new AnimateExecutor(richText);
    executor.execute({
      type: 'slideRichText',
      to: { textConfig },
      customParameters: {
        wordByWord: true,
        fadeInDuration: 0.3,
        slideDirection: 'up',
        slideDistance: 50
      },
      duration: 3000,
      easing: 'linear'
    });
  });

  // Slide RichText Animation - Down direction
  addCase('SlideRichText - Down Direction', container, stage => {
    // Create a richText with empty textConfig
    const richText = createRichText({
      x: 20,
      y: 80,
      width: 600,
      height: 100,
      textConfig: [],
      textBaseline: 'middle',
      ascentDescentMode: 'font'
    });

    // Create a group and add the richText to it
    const group = createGroup({});
    group.add(richText);
    stage.defaultLayer.add(group);
    stage.render();

    // Define the textConfig
    const textConfig = [
      ...Array.from('从上方').map(item => ({
        text: item,
        fontSize: 24,
        fill: '#FF5500',
        fontWeight: 'bold'
      })),
      ...Array.from('- 字符向下滑动!').map(item => ({
        text: item,
        fontSize: 24,
        fill: '#0055FF'
      }))
    ];

    // Create an AnimateExecutor and run the animation
    const executor = new AnimateExecutor(group);
    executor.execute({
      type: 'slideRichText',
      to: { textConfig },
      customParameters: {
        wordByWord: true,
        fadeInDuration: 0.3,
        slideDirection: 'down',
        slideDistance: 50
      },
      duration: 3000,
      easing: 'linear'
    });
  });

  // 基础退格删除效果
  addCase('OutputRichText - 退格删除', container, stage => {
    const richText = createRichText({
      x: 400,
      y: 200,
      textConfig: basicTextConfig,
      textAlign: 'center',
      textBaseline: 'middle'
    });
    stage.defaultLayer.add(richText);

    // 启动退场动画
    const executor = new AnimateExecutor(richText);

    // 先等待1秒，然后执行退格删除动画
    setTimeout(() => {
      executor.execute({
        type: 'outputRichText',
        customParameters: {
          showCursor: true,
          cursorChar: '|',
          blinkCursor: true,
          fadeOutChars: true,
          direction: 'backward' // 从后往前删除（退格效果）
        },
        duration: 2000,
        easing: 'linear'
      });
    }, 1000);
  });

  // 正向删除效果
  addCase('OutputRichText - 正向删除', container, stage => {
    const richText = createRichText({
      x: 400,
      y: 200,
      textConfig: basicTextConfig,
      textAlign: 'center',
      textBaseline: 'middle'
    });
    stage.defaultLayer.add(richText);

    // 启动退场动画
    const executor = new AnimateExecutor(richText);

    // 先等待1秒，然后执行正向删除动画
    setTimeout(() => {
      executor.execute({
        type: 'outputRichText',
        customParameters: {
          showCursor: true,
          cursorChar: '|',
          blinkCursor: true,
          fadeOutChars: true,
          direction: 'forward' // 从前往后删除
        },
        duration: 2000,
        easing: 'linear'
      });
    }, 1000);
  });

  // 无光标的淡出效果
  addCase('OutputRichText - 无光标淡出', container, stage => {
    const richText = createRichText({
      x: 400,
      y: 200,
      textConfig: formattedTextConfig,
      textAlign: 'center',
      textBaseline: 'middle'
    });
    stage.defaultLayer.add(richText);

    // 启动退场动画
    const executor = new AnimateExecutor(richText);

    // 先等待1秒，然后执行无光标淡出动画
    setTimeout(() => {
      executor.execute({
        type: 'outputRichText',
        customParameters: {
          showCursor: false,
          fadeOutChars: true,
          direction: 'backward'
        },
        duration: 2000,
        easing: 'linear'
      });
    }, 1000);
  });

  // 完整的出入场序列
  addCase('输入后退出序列', container, stage => {
    const richText = createRichText({
      x: 400,
      y: 200,
      textConfig: [],
      textAlign: 'center',
      textBaseline: 'middle'
    });
    stage.defaultLayer.add(richText);

    // 创建动画执行器
    const executor = new AnimateExecutor(richText);

    // 1. 首先执行输入动画
    executor.execute({
      type: 'inputRichText',
      to: {
        textConfig: formattedTextConfig
      },
      customParameters: {
        showCursor: true,
        cursorChar: '|',
        blinkCursor: true,
        fadeInChars: true
      },
      duration: 2000,
      easing: 'linear'
    });

    // 2. 等待2秒，然后执行退出动画
    setTimeout(() => {
      executor.execute({
        type: 'outputRichText',
        customParameters: {
          showCursor: true,
          cursorChar: '|',
          blinkCursor: true,
          fadeOutChars: true,
          direction: 'backward'
        },
        duration: 2000,
        easing: 'linear'
      });
    }, 4000);
  });

  // ==== SlideOutRichText演示 ====

  // 向右滑出
  addCase('SlideOutRichText - 向右滑出', container, stage => {
    const richText = createRichText({
      x: 400,
      y: 200,
      textConfig: formattedTextConfig,
      textAlign: 'center',
      textBaseline: 'middle'
    });
    stage.defaultLayer.add(richText);

    // 启动退场动画
    const executor = new AnimateExecutor(richText);

    // 先等待1秒，然后执行向右滑出动画
    setTimeout(() => {
      executor.execute({
        type: 'slideOutRichText',
        customParameters: {
          slideDirection: 'right',
          slideDistance: 100,
          fadeOutDuration: 0.3
        },
        duration: 1500,
        easing: 'quadOut'
      });
    }, 1000);
  });

  // 向上滑出
  addCase('SlideOutRichText - 向上滑出', container, stage => {
    const richText = createRichText({
      x: 400,
      y: 200,
      textConfig: formattedTextConfig,
      textAlign: 'center',
      textBaseline: 'middle'
    });
    stage.defaultLayer.add(richText);

    // 启动退场动画
    const executor = new AnimateExecutor(richText);

    // 先等待1秒，然后执行向上滑出动画
    setTimeout(() => {
      executor.execute({
        type: 'slideOutRichText',
        customParameters: {
          slideDirection: 'up',
          slideDistance: 100,
          fadeOutDuration: 0.3
        },
        duration: 1500,
        easing: 'quadOut'
      });
    }, 1000);
  });

  // 按单词滑出
  addCase('SlideOutRichText - 按单词滑出', container, stage => {
    const richText = createRichText({
      x: 400,
      y: 200,
      textConfig: paragraphTextConfig,
      textAlign: 'center',
      textBaseline: 'middle'
    });
    stage.defaultLayer.add(richText);

    // 启动退场动画
    const executor = new AnimateExecutor(richText);

    // 先等待1秒，然后执行按单词滑出动画
    setTimeout(() => {
      executor.execute({
        type: 'slideOutRichText',
        customParameters: {
          slideDirection: 'right',
          slideDistance: 80,
          fadeOutDuration: 0.3,
          wordByWord: true
        },
        duration: 2000,
        easing: 'quadOut'
      });
    }, 1000);
  });

  // 反向顺序滑出
  addCase('SlideOutRichText - 反向顺序滑出', container, stage => {
    const richText = createRichText({
      x: 400,
      y: 200,
      textConfig: formattedTextConfig,
      textAlign: 'center',
      textBaseline: 'middle'
    });
    stage.defaultLayer.add(richText);

    // 启动退场动画
    const executor = new AnimateExecutor(richText);

    // 先等待1秒，然后执行反向顺序滑出动画
    setTimeout(() => {
      executor.execute({
        type: 'slideOutRichText',
        customParameters: {
          slideDirection: 'right',
          slideDistance: 100,
          fadeOutDuration: 0.3,
          reverseOrder: true // 反转顺序
        },
        duration: 1500,
        easing: 'quadOut'
      });
    }, 1000);
  });

  // 完整的滑动入场和退场序列
  addCase('滑动入场后退场序列', container, stage => {
    const richText = createRichText({
      x: 400,
      y: 200,
      textConfig: [],
      textAlign: 'center',
      textBaseline: 'middle'
    });
    stage.defaultLayer.add(richText);

    // 创建动画执行器
    const executor = new AnimateExecutor(richText);

    // 1. 首先执行滑动入场动画
    executor.execute({
      type: 'slideRichText',
      to: {
        textConfig: paragraphTextConfig
      },
      customParameters: {
        slideDirection: 'right',
        slideDistance: 100,
        fadeInDuration: 0.3,
        wordByWord: true
      },
      duration: 2000,
      easing: 'quadOut'
    });

    // 2. 等待2.5秒，然后执行滑动退场动画（使用相反方向）
    setTimeout(() => {
      executor.execute({
        type: 'slideOutRichText',
        customParameters: {
          slideDirection: 'left', // 反方向滑出
          slideDistance: 100,
          fadeOutDuration: 0.3,
          wordByWord: true
        },
        duration: 2000,
        easing: 'quadOut'
      });
    }, 4500);
  });

  // Test case for InputRichText with stroke animation
  addCase('InputRichText - Stroke First Animation', container, stage => {
    // Create a richText with empty textConfig
    const richText = createRichText({
      x: 20,
      y: 80,
      width: 600,
      height: 100,
      textConfig: [],
      textBaseline: 'middle'
    });

    // Create a group and add the richText to it
    const group = createGroup({});
    group.add(richText);
    stage.defaultLayer.add(group);
    stage.render();

    // Define the final textConfig with different styles
    const finalTextConfig = [
      {
        text: 'Hello, ',
        fontSize: 40,
        fill: '#FF5500',
        stroke: '#FF5500',
        lineWidth: 2,
        fontWeight: 'bold'
      },
      {
        text: 'Manim',
        fontSize: 40,
        fill: '#0055FF',
        stroke: '#0055FF',
        lineWidth: 2,
        fontStyle: 'italic'
      },
      {
        text: '!',
        fontSize: 40,
        fill: '#FF5500',
        stroke: '#FF5500',
        lineWidth: 2,
        fontWeight: 'bold'
      }
    ];

    // Create an AnimateExecutor and run the animation
    const executor = new AnimateExecutor(group);
    executor.execute({
      type: 'inputRichText',
      to: { textConfig: finalTextConfig },
      customParameters: {
        showCursor: true,
        cursorChar: '|',
        blinkCursor: true,
        strokeFirst: true,
        strokeToFillRatio: 0
      },
      duration: 3000,
      easing: 'linear'
    });
  });

  // Test case with a more complex stroke first animation
  addCase('InputRichText - Complex Stroke Animation', container, stage => {
    // Black background to better show the effect
    stage.background = '#000000';

    // Create a richText with empty textConfig
    const richText = createRichText({
      x: 250,
      y: 200,
      width: 600,
      height: 200,
      textConfig: [],
      textAlign: 'center',
      textBaseline: 'middle'
    });

    stage.defaultLayer.add(richText);
    stage.render();

    // Define the final textConfig with different styles
    const finalTextConfig = [
      {
        text: 'Hello, ',
        fontSize: 60,
        fill: '#FFFFFF',
        stroke: '#FFFFFF',
        lineWidth: 1,
        fontWeight: 'bold'
      },
      {
        text: 'Manim',
        fontSize: 60,
        fill: '#3A86FF',
        stroke: '#3A86FF',
        lineWidth: 1,
        fontWeight: 'bold'
      },
      {
        text: '!',
        fontSize: 60,
        fill: '#FF006E',
        stroke: '#FF006E',
        lineWidth: 1,
        fontWeight: 'bold'
      }
    ];

    // Create an AnimateExecutor and run the animation
    const executor = new AnimateExecutor(richText);
    executor.execute({
      type: 'inputRichText',
      to: { textConfig: finalTextConfig },
      customParameters: {
        showCursor: false,
        strokeFirst: true,
        strokeToFillRatio: 1,
        fadeInChars: true,
        fadeInDuration: 0.2
      },
      duration: 4000,
      easing: 'quadOut'
    });
  });

  return container;
};
