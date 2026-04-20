import { createGroup, createRect, IGraphic, global } from '@visactor/vrender';
import { createBrowserPageStage } from '../page-stage';

export const page = () => {
  // 添加10个rect
  new Array(10).fill(0).forEach((b, i) => {
    group.add(
      createRect({
        x: 10,
        y: 10,
        width: 70,
        height: 60,
        fill: 'green',
        boundsPadding: [0, 6, 6, 0],
        pickable: true
      })
    );
  });

  group.addEventListener('click', e => {
    console.log('click', e.clone());
  });

  const stage = createBrowserPageStage({
    canvas: 'main',
    width: 1200,
    height: 600,
    enableLayout: true
  });

  stage.defaultLayer.add(group);

  stage.render(undefined, { renderStyle: 'rough' });

  window.stage = stage;
};
