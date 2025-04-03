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

  return container;
};
