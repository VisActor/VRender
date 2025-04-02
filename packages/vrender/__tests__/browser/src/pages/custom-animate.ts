import { createStage, createGroup } from '@visactor/vrender';
import { createText, createRichText } from '@visactor/vrender';
import { AnimateExecutor, registerAnimate, registerCustomAnimate } from '@visactor/vrender-animate';

registerAnimate();
registerCustomAnimate();

let stage: any;

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
        // 启用字符透明度渐变效果
        fadeInChars: true,
        fadeInDuration: 0.3
      },
      duration: 3000,
      easing: 'linear'
    });
  });

  // Advanced example with a more complex RichText
  addCase('Complex InputRichText Animation', container, stage => {
    // Create a richText with empty textConfig
    const richText = createRichText({
      x: 20,
      y: 20,
      width: 600,
      height: 120,
      textConfig: [],
      textBaseline: 'top'
    });

    // Create a group and add the richText to it
    const group = createGroup({});
    group.add(richText);
    stage.defaultLayer.add(group);
    stage.render();

    // Define a more complex final textConfig
    const complexTextConfig = [
      {
        text: '富文本打字动画',
        fontSize: 22,
        fill: '#6600CC',
        fontWeight: 'bold'
      },
      {
        text: '\n', // Line break
        fontSize: 22
      },
      {
        text: 'Supports ',
        fontSize: 18,
        fill: '#FF6600'
      },
      {
        text: 'multiple ',
        fontSize: 18,
        fill: '#0099FF',
        fontStyle: 'italic'
      },
      {
        text: 'styles ',
        fontSize: 18,
        fill: '#33CC33',
        textDecoration: 'underline'
      },
      {
        text: 'and formats!',
        fontSize: 18,
        fill: '#CC3366',
        fontWeight: 'bold'
      }
    ];

    // Create an AnimateExecutor and run the animation
    const executor = new AnimateExecutor(group);
    executor.execute({
      type: 'inputRichText',
      to: { textConfig: complexTextConfig },
      customParameters: {
        showCursor: true,
        cursorChar: '▎',
        blinkCursor: true,
        // 启用字符透明度渐变效果，设置较长的渐变时间提供更平滑的效果
        fadeInChars: true,
        fadeInDuration: 0.5
      },
      duration: 5000,
      easing: 'linear'
    });
  });

  // Comparison demo to show the difference with/without fade effect
  addCase('RichText With/Without Fade', container, stage => {
    // Create two richTexts for comparison
    const richTextNoFade = createRichText({
      x: 20,
      y: 50,
      width: 600,
      height: 100,
      textConfig: [],
      textBaseline: 'middle'
    });

    const richTextWithFade = createRichText({
      x: 20,
      y: 150,
      width: 600,
      height: 100,
      textConfig: [],
      textBaseline: 'middle'
    });

    // Add title texts
    const titleNoFade = createText({
      x: 20,
      y: 20,
      text: 'Without Fade Effect:',
      fontSize: 16,
      fill: '#000'
    });

    const titleWithFade = createText({
      x: 20,
      y: 120,
      text: 'With Fade Effect:',
      fontSize: 16,
      fill: '#000'
    });

    // Create a group and add everything to it
    const group = createGroup({});
    group.add(richTextNoFade);
    group.add(richTextWithFade);
    group.add(titleNoFade);
    group.add(titleWithFade);
    stage.defaultLayer.add(group);
    stage.render();

    // Define the textConfig to use for both examples
    const textConfig = [
      {
        text: 'Compare these typing animations to see the difference.',
        fontSize: 18,
        fill: '#333333',
        fontWeight: 'bold'
      }
    ];

    // Create an AnimateExecutor and run both animations
    const executor1 = new AnimateExecutor(richTextNoFade);
    const executor2 = new AnimateExecutor(richTextWithFade);
    // Animation without fade effect
    executor1.execute({
      type: 'inputRichText',
      to: { textConfig },
      customParameters: {
        showCursor: true,
        cursorChar: '|',
        blinkCursor: true,
        fadeInChars: false
      },
      duration: 4000,
      easing: 'linear'
    });

    // Animation with fade effect
    executor2.execute({
      type: 'inputRichText',
      to: { textConfig },
      customParameters: {
        showCursor: true,
        cursorChar: '|',
        blinkCursor: true,
        fadeInChars: true,
        fadeInDuration: 0.4
      },
      duration: 4000,
      easing: 'linear'
    });
  });

  return container;
};
