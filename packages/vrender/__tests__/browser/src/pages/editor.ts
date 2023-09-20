import { createStage, createGroup, createRect, container, IGraphic, DragNDrop, createSymbol } from '@visactor/vrender';
import { loadEditable } from './editor/register';
import { TranformComponent } from './editor/transform-component';
import { TranformComponent2 } from './editor/transform-component2';
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

  const r = createRect({
    x: 0,
    y: 0,
    width: 100,
    height: 100,
    fill: 'orange',
    _debug_bounds: c => (c.strokeStyle = 'red')
  });

  const c2 = new TranformComponent2(
    {
      childrenPickable: true,
      pickable: false
    },
    r.AABBBounds
  );

  c2.onUpdate(data => {
    // console.log(data.anchor);
    r.setAttributes({
      x: data.x,
      y: data.y,
      angle: data.angle,
      width: data.width,
      height: data.height,
      anchor: data.anchor
    });
    const out = {};
    if (data.width < 0) {
      out.width = 0;
    }
    if (data.height < 0) {
      out.height = 0;
    }

    return out;
  });

  let offsetX, offsetY;
  let start = false;
  stage.addEventListener('mousedown', e => {
    offsetX = e.offsetX;
    offsetY = e.offsetY;
    if (e.target === r) {
      start = true;
    }
  });

  stage.addEventListener('mousemove', e => {
    if (!start) {
      return;
    }
    if (isFinite(offsetX)) {
      c2.moveBy(e.offsetX - offsetX, e.offsetY - offsetY);
    }
    offsetX = e.offsetX;
    offsetY = e.offsetY;
  });
  stage.addEventListener('mouseup', e => {
    start = false;
  });
  // r.addEventListener('on', e => {
  //   if (isFinite(offsetX)) {
  //     c2.moveTo(e.offsetX - offsetX, e.offsetY - offsetY);
  //   }
  //   offsetX = e.offsetX;
  //   offsetY = e.offsetY;
  // });
  // const rg = createGroup({});
  // rg.add(r);

  stage.defaultLayer.add(r);
  // r.attachShadow(c2);
  stage.defaultLayer.add(c2);

  stage.render(undefined, { renderStyle: 'rough' });

  window.stage = stage;
};
