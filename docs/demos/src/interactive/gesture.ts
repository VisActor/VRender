import { createStage, Gesture, createCircle } from '@visactor/vrender';

export function renderCircle() {
  const container = document.querySelector<HTMLDivElement>('#container')!;
  const div = document.createElement('div');
  div.style.display = 'flex';
  const canopusDom = document.createElement('div');
  div.appendChild(canopusDom);

  const canvas = document.createElement('canvas');
  canvas.id = 'test';
  container.appendChild(canvas);
  const t = Date.now();
  const stage = createStage({ canvas: 'main', width: 1200, height: 600, viewWidth: 600, viewHeight: 600 });
  const circle = createCircle({
    radius: 100,
    startAngle: 0,
    endAngle: Math.PI * 2,
    x: 400,
    y: 400,
    fillColor: 'red'
  });
  circle.addEventListener('pointertap', () => console.log('circle, pointertap'));
  circle.addEventListener('tap', () => console.log('circle, tap'));

  stage.defaultLayer.add(circle);

  stage.render();

  stage.addEventListener('pointerdown', (e: any) => {
    console.log('%c yo, Stage capture it!', 'color: red;font-weight: bold');
  });

  const gesture = new Gesture(stage);

  gesture.on('press', e => {
    console.log('press');
  });
  gesture.on('pressup', e => {
    console.log('pressup');
  });

  gesture.on('swipe', e => {
    console.log('swipe', e.direction, e.velocity);
  });

  gesture.on('pinch', e => {
    desDiv.innerHTML = `pinch, ${e.scale}`;
    console.log('pinch', e.scale);
  });
  gesture.on('pinchstart', e => {
    console.log('pinchstart', e.scale);
  });
  gesture.on('pinchend', e => {
    console.log('pinchend', e.scale);
  });

  gesture.on('pan', e => {
    console.log('pan', e, e.direction);
  });
  gesture.on('panstart', e => {
    console.log('panstart', e, e.direction);
  });
  gesture.on('panend', e => {
    console.log('panend', e, e.direction);
  });

  gesture.on('pointerupoutside', () => {
    console.log('--------');
  });

  const delta = Date.now() - t;
  canopusDom.innerText = `canopus耗时：` + delta.toString();
  container.appendChild(div);

  const stage1 = createStage({ canvas: 'test', width: 1200, height: 600, viewWidth: 600, viewHeight: 600 });
  const circle1 = createCircle({
    radius: 100,
    startAngle: 0,
    endAngle: Math.PI * 2,
    x: 400,
    y: 400,
    fillColor: 'red'
  });
  circle1.addEventListener('pointertap', () => console.log('circle1, pointertap'));
  circle1.addEventListener('tap', () => console.log('circle1, tap'));

  stage1.defaultLayer.add(circle1);

  stage1.render();

  console;
}
