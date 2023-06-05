import { createStage, createArc, createLine, createGroup, createRect, createText } from '@visactor/vrender';
import { addShapesToStage, colorPools } from '../utils';

export const page = () => {
  const root = createGroup({
    x: 600,
    y: 0,
    width: 100,
    height: 100,
    fillColor: colorPools[0]
  });
  root.name = 'root';
  const l1 = createGroup({
    x: -350,
    y: 200,
    width: 100,
    height: 100,
    fillColor: colorPools[1]
  });
  l1.name = 'l1';
  const r1 = createGroup({
    x: 350,
    y: 200,
    width: 100,
    height: 100,
    fillColor: colorPools[2]
  });
  r1.name = 'r1';
  const l11 = createGroup({
    x: -200,
    y: 200,
    width: 100,
    height: 100,
    fillColor: colorPools[3]
  });
  l11.name = 'l11';
  const l12 = createGroup({
    x: 200,
    y: 200,
    width: 100,
    height: 100,
    fillColor: colorPools[4]
  });
  l12.name = 'l12';
  const r11 = createGroup({
    x: -200,
    y: 200,
    width: 100,
    height: 100,
    fillColor: colorPools[5]
  });
  r11.name = 'r11';
  const r12 = createGroup({
    x: 200,
    y: 200,
    width: 100,
    height: 100,
    fillColor: colorPools[6]
  });
  r12.name = 'r12';
  root.add(l1);
  root.add(r1);
  l1.add(l11);
  l1.add(l12);
  r1.add(r11);
  r1.add(r12);

  l1.add(
    createArc({
      innerRadius: 10,
      outerRadius: 20,
      startAngle: -1.5707963267948966,
      endAngle: -0.3141592653589793,
      cornerRadius: 100,
      strokeColor: 'green',
      cap: false
    })
  );
  l1.add(
    createRect({
      width: 20,
      height: 20
    })
  );

  r1.add(
    createArc({
      innerRadius: 10,
      outerRadius: 20,
      startAngle: -1.5707963267948966,
      endAngle: -0.3141592653589793,
      cornerRadius: 100,
      strokeColor: 'green',
      cap: false
    })
  );
  r1.add(
    createRect({
      fillColor: 'red',
      width: 20,
      height: 20
    })
  );

  r1.add(
    createText({
      text: 'r1',
      fillColor: 'red'
    })
  );

  l1.add(
    createText({
      text: 'l1'
    })
  );

  l11.add(
    createText({
      text: 'l11'
    })
  );

  l12.add(
    createText({
      text: 'l12'
    })
  );

  // r11.add(
  //   createText({
  //     text: 'r11',
  //     fillColor: 'red'
  //   })
  // );

  r12.add(
    createText({
      text: 'r12',
      fillColor: 'red'
    })
  );

  root.setTheme({
    text: {
      fontSize: 36
    }
  });

  l1.setTheme({
    text: {
      fontSize: 12
    },
    common: {
      fill: true,
      fillColor: 'red'
    }
  });

  r1.setTheme({
    text: {
      fontSize: 26
    },
    common: {
      visible: false
    }
  });

  // l11.setTheme({
  //   text: {
  //     fontSize: 32
  //   }
  // });

  // l12.setTheme({
  //   text: {
  //     fontSize: 38
  //   }
  // });

  r12.setTheme({
    text: {
      fontSize: 68
    }
  });

  l11.hideAll();

  const c = document.getElementById('main') as HTMLCanvasElement;
  const stage = createStage({
    canvas: c as HTMLCanvasElement,
    width: 1200,
    height: 600,
    canvasControled: false
  });
  stage.defaultLayer.add(root);
  console.log(stage);
  stage.render();
};
