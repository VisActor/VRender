import { IPointLike } from '@visactor/vutils';
import render from '../../util/render';
import { LineCrosshair } from '../../../src';

/**
 * @ignore
 * 获取点到圆心的连线与水平方向的夹角
 */
function getAngleByPoint(center: IPointLike, point: IPointLike): number {
  return Math.atan2(point.y - center.y, point.x - center.x);
}

/**
 * @ignore
 * 根据弧度计算极坐标系下的坐标点
 * @param centerX
 * @param centerY
 * @param radius
 * @param angleInRadian
 * @returns
 */
function polarToCartesian(centerX: number, centerY: number, radius: number, angleInRadian: number) {
  return {
    x: centerX + radius * Math.cos(angleInRadian),
    y: centerY + radius * Math.sin(angleInRadian)
  };
}

export function run() {
  console.log('LineCrosshair');

  const cartesianCrosshair = new LineCrosshair({
    start: { x: 100, y: 50 },
    end: { x: 100, y: 400 },
    lineStyle: {
      stroke: '#000'
    }
  });

  const cartesianHorizontalCrosshair = new LineCrosshair({
    start: { x: 50, y: 300 },
    end: { x: 450, y: 300 },
    lineStyle: {
      stroke: '#000'
    }
  });

  const center = { x: 350, y: 225 };
  const endPoint = { x: 450, y: 100 };
  const polarCrosshair = new LineCrosshair({
    start: center,
    end: endPoint,
    lineStyle: {
      stroke: '#000'
    }
  });
  const stage = render([cartesianCrosshair, polarCrosshair, cartesianHorizontalCrosshair], 'main');

  stage.addEventListener('pointermove', e => {
    cartesianCrosshair.setLocation({
      start: { x: e.viewX, y: 50 },
      end: { x: e.viewX, y: 400 }
    });
    cartesianHorizontalCrosshair.setLocation({
      start: { x: 50, y: e.viewY },
      end: { x: 450, y: e.viewY }
    });

    // 处理极坐标系下的直线型 crosshair
    const angle = getAngleByPoint(center, { x: e.viewX, y: e.viewY });
    const radius = Math.sqrt((endPoint.x - center.x) ** 2 + (endPoint.y - center.y) ** 2);
    const curEnd = polarToCartesian(center.x, center.y, radius, angle);
    polarCrosshair.setLocation({
      start: center,
      end: curEnd
    });
  });
}
