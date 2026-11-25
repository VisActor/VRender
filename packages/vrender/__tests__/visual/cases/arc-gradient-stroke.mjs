import { assertionError } from '../assertions.mjs';

/** 保留 VChart #4079 的圆心、等半径、描边宽度和渐变配置。 */
export function createSpec(v, stage) {
  const background = v.createRect({ width: 800, height: 600, fill: '#121b24' });
  const group = v.createGroup({ x: 15, y: 15 });
  const arc = v.createArc({
    x: 345,
    y: 245,
    innerRadius: 73.5,
    outerRadius: 73.5,
    startAngle: -Math.PI,
    endAngle: 0,
    boundsMode: 'imprecise',
    lineWidth: 1,
    stroke: {
      gradient: 'conical',
      x: 0.5,
      y: 0.5,
      startAngle: -Math.PI,
      endAngle: 0,
      stops: [
        { offset: 0, color: 'rgba(0,110,255,0.2)' },
        { offset: 0.5, color: 'rgba(0,110,255,0.5)' },
        { offset: 1, color: 'rgba(0,110,255,1)' }
      ]
    }
  });
  group.add(arc);
  stage.defaultLayer.add(background);
  stage.defaultLayer.add(group);
  return { arc };
}

/** 沿细弧采样，检查描边存在且透明度从起点到终点增加。 */
export async function verify(page) {
  const blue = await page.evaluate(() => {
    const { arc } = window.__visualObjects;
    const { outerRadius, startAngle, endAngle } = arc.attribute;
    const { e: x, f: y } = arc.globalTransMatrix;
    const context = document.querySelector('#chart canvas').getContext('2d');
    return [0.1, 0.5, 0.9].map(fraction => {
      const angle = startAngle + (endAngle - startAngle) * fraction;
      const pixelX = Math.round(x + outerRadius * Math.cos(angle));
      const pixelY = Math.round(y + outerRadius * Math.sin(angle));
      const { data } = context.getImageData(pixelX - 2, pixelY - 2, 5, 5);
      let maxBlue = 0;
      for (let i = 2; i < data.length; i += 4) {
        maxBlue = Math.max(maxBlue, data[i]);
      }
      return maxBlue;
    });
  });

  if (blue[0] <= 70 || blue[1] <= blue[0] || blue[2] <= blue[1] || blue[2] - blue[0] < 40) {
    throw assertionError(`圆弧描边未显示预期渐变，蓝色通道采样为 ${blue.join(', ')}`);
  }
}
