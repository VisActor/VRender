import { createStage, Arc, Rect } from '@visactor/vrender';
import { addShapesToStage, colorPools } from '../utils';

export const page = () => {
  (window as any).drawArcPathTime = 0;
  (window as any).renderCommandListTime = 0;
  const stage = createStage({ canvas: 'main', width: 1200, height: 600, viewWidth: 1200, viewHeight: 600 });

  for (let i = 0; i < 10000; i++) {
    // const arc = new Arc({
    //   innerRadius: 30,
    //   outerRadius: 50,
    //   startAngle: -Math.PI / 4,
    //   endAngle: (3 * Math.PI) / 2,
    //   x: 100,
    //   y: 100,
    //   fill: colorPools[0],
    //   
    //   stroke: 'red',
    //   lineWidth: 6,
    //   // cornerRadius: 10,
    // });
    // (stage as any).add(arc);

    const rect = new Rect({
      x: 100,
      y: 100,
      width: 100,
      height: 100,
      fill: colorPools[0],
      
      stroke: 'red',
      lineWidth: 6,
      cornerRadius: 10
    });
    (stage as any).defaultLayer.add(rect);
  }

  console.time('render');
  stage.render();
  console.log(stage);
  console.timeEnd('render');
  console.log('drawArcPath', (window as any).drawArcPathTime);

  const attr = {
    x: 100,
    y: 100,
    width: 100,
    height: 100,
    fill: colorPools[0],
    
    stroke: 'red',
    lineWidth: 6,
    cornerRadius: 10
  };
  const key = 'x';
  (window as any).update = () => {
    (window as any).drawArcPathTime = 0;
    (window as any).renderCommandListTime = 0;
    console.time('setAttributes');
    // stage.render();
    stage.children[0].forEach(rect => {
      attr[key] = Math.random();
      rect.setAttribute(attr);
    });
    console.timeEnd('setAttributes');
    console.log('drawArcPathTime', (window as any).drawArcPathTime);
    console.log('renderCommandListTime', (window as any).renderCommandListTime);
  };
};
