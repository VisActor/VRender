import { createStage, createGroup, createRect, container, IGraphic, DragNDrop, createSymbol } from '@visactor/vrender';
import { loadEditable } from './editor/register';
import { TranformComponent } from './editor/transform-component';
// container.load(roughModule);

loadEditable();

export const page = () => {
  const group = createGroup({
    x: 100,
    y: 100,
    background: 'red',
    width: 300,
    height: 400
  });

  // 添加10个rect
  new Array(10).fill(0).forEach((b, i) => {
    const r = createRect({
      x: 10,
      y: 10,
      width: 70,
      height: 60,
      dragable: true,
      fill: 'pink',
      boundsPadding: [0, 6, 6, 0],
      pickable: true
    });
    group.add(r);
  });

  // group.addEventListener('drag', e => {
  //   console.log(e.target, '%c 绿球拖拽中!', 'color: green;font-weight: bold');
  // });

  const circle = createSymbol({
    symbolType: 'star',
    size: 100,
    x: 100,
    y: 100,
    fill: 'green'
  });

  const c = new TranformComponent({
    bbox: {
      stroke: 'lightblue',
      lineWidth: 2
    }
  });
  c.wrap(circle);

  const stage = createStage({
    canvas: 'main',
    width: 1200,
    height: 600,
    enableLayout: true,
    autoRender: true,
    pluginList: ['DraggablePlugin']
  });

  stage.addEventListener('click', e => {
    console.log('click', e.target);
  });

  stage.defaultLayer.add(group);
  stage.defaultLayer.add(c);

  stage.render(undefined, { renderStyle: 'rough' });

  window.stage = stage;
};
