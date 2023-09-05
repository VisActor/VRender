import { createStage, DragNDrop, Circle, createCircle } from '@visactor/vrender';

export function renderCircle() {
  const container = document.querySelector<HTMLDivElement>('#container')!;
  const div = document.createElement('div');
  div.style.display = 'flex';
  const canopusDom = document.createElement('div');
  div.appendChild(canopusDom);
  const t = Date.now();
  const stage = createStage({
    canvas: 'main',
    width: 1200,
    height: 600,
    viewWidth: 600,
    viewHeight: 600,
    autoRender: true,
    disableDirtyBounds: false
  });

  // 绑定 drag 事件
  new DragNDrop(stage);
  const targetCircle = createCircle({
    radius: 60,
    startAngle: 0,
    endAngle: Math.PI * 2,
    x: 150,
    y: 150,
    fill: '#999'
  });
  stage.defaultLayer.add(targetCircle);

  const sourceCircle = createCircle({
    radius: 25,
    startAngle: 0,
    endAngle: Math.PI * 2,
    x: 400,
    y: 400,
    fill: 'green'
  });
  stage.defaultLayer.add(sourceCircle);

  stage.render();

  console.log(sourceCircle);

  stage.addEventListener('pointerdown', e => {
    console.log('%c yo, Stage capture it!', 'color: red;font-weight: bold');
  });

  sourceCircle.addEventListener('pointerdown', e => {
    console.log('%c 绿球被点击!', 'color: green;font-weight: bold');
  });

  sourceCircle.addEventListener('dragstart', e => {
    sourceCircle.setAttributes({ fill: 'red' });
    console.log('%c 绿球开始拖拽!', 'color: green;font-weight: bold');
  });

  sourceCircle.addEventListener('drag', e => {
    sourceCircle.setAttributes({ x: e.offset.x, y: e.offset.y });
    console.log('%c 绿球拖拽中!', 'color: green;font-weight: bold');
  });

  sourceCircle.addEventListener('dragend', e => {
    sourceCircle.setAttributes({ fill: 'green' });
    console.log('%c 绿球拖拽结束!', 'color: green;font-weight: bold');
  });

  // target
  targetCircle.addEventListener('dragenter', e => {
    console.log('%c 灰球欢迎绿球到来 dragenter!', 'color: #999;font-weight: bold');
  });

  targetCircle.addEventListener('dragover', e => {
    console.log('%c 灰球被绿球 dragover!', 'color: #999;font-weight: bold');
  });

  targetCircle.addEventListener('dragleave', e => {
    console.log('%c 绿球离开灰球 dragleave!', 'color: #999;font-weight: bold');
  });

  targetCircle.addEventListener('drop', e => {
    console.log('%c 绿球投入灰球中，！drop!', 'color: #999;font-size: 20px;font-weight: bold');
  });

  const delta = Date.now() - t;
  canopusDom.innerText = `canopus耗时：` + delta.toString();
  container.appendChild(div);
}
