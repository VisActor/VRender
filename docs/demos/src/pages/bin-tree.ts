import { createStage, createCircle, defaultTicker } from '@visactor/vrender';
import { createGroup } from '@visactor/vrender';

export const page = () => {
  const colors = ['aliceblue', 'antiquewhite', 'blue', 'blueviolet', 'brown', 'burlywood', 'azure', 'beige', 'bisque', 'black', 'blanchedalmond', 'hotpink', 'indianred', 'indigo', 'ivory', 'khaki', 'lavender', 'lavenderblush', 'lawngreen', 'lemonchiffon', 'lightblue'];
  const stage = createStage({
    canvas: 'main',
    autoRender: true
  });

  const c1 = createCircle({
    radius: 60,
    x: 300,
    y: 300,
    fill: 'orange',
    stroke: '#ccc',
    lineWidth: 6,
    innerBorder: {
      distance: 10,
      lineWidth: 2,
      stroke: '#eee'
    }
  });

  const group = createGroup({});

  group.add(c1);

  c1.addEventListener('click', () => {
    c1.animate()
      .to({radius: 70}, 300, 'elasticOut')
      .to({radius: 60}, 600, 'linear');
    // 创建30个arc然后进行动画，完成后销毁
    for (let i = 0; i < 60; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dir = [Math.cos(angle), Math.sin(angle)];
      const c = createCircle({
        x: 300,
        y: 300,
        radius: 8,
        fill: colors[Math.floor(Math.random() * colors.length)]
      });
      group.add(c);
      c.animate({
        onEnd() {
          group.removeChild(c);
        }
      }).to({ dx: dir[0] * 200, dy: dir[1] * 200, opacity: 0 }, 2000, 'cubicOut');
    }
  });

  defaultTicker.start();

  stage.defaultLayer.add(group);
};
