import { pi2 } from '@visactor/vutils';
import { ARC3D_NUMBER_TYPE } from '../graphic/constants';
import type { IGraphic } from '../interface/graphic';
import type { IArc } from '../interface/graphic/arc';
import type { IContext2d } from '../interface/context';

export const draw3dItem = (
  context: IContext2d,
  graphic: IGraphic,
  callback: (isPie: boolean, is3d: boolean) => any,
  output: any
) => {
  // hack逻辑，如果是饼图的话，需要依次绘制不同的边
  let isPie: boolean = false;
  let is3d: boolean = false;
  graphic.forEachChildren((c: IGraphic) => {
    isPie = c.numberType === ARC3D_NUMBER_TYPE;
    return !isPie;
  });
  graphic.forEachChildren((c: IGraphic) => {
    is3d = !!c.findFace;
    return !is3d;
  });

  let result: any;
  if (isPie) {
    const children = graphic.getChildren() as IArc[];
    // 绘制内层
    // drawContext.hack_pieFace = 'inside';
    // drawContribution.renderGroup(graphic as IGroup, drawContext);
    // 绘制底部
    // drawContext.hack_pieFace = 'bottom';
    // drawContribution.renderGroup(graphic as IGroup, drawContext);
    // 绘制外部
    // 排序一下
    const sortedChildren = [...children];
    sortedChildren.sort((a, b) => {
      let angle1 = (a.attribute.startAngle ?? 0 + a.attribute.endAngle ?? 0) / 2;
      let angle2 = (b.attribute.startAngle ?? 0 + b.attribute.endAngle ?? 0) / 2;
      while (angle1 < 0) {
        angle1 += pi2;
      }
      while (angle2 < 0) {
        angle2 += pi2;
      }
      return angle2 - angle1;
    });
    sortedChildren.forEach(c => {
      c._next = null;
      c._prev = null;
    });
    graphic.removeAllChild();
    graphic.update();
    sortedChildren.forEach(c => {
      graphic.appendChild(c);
    });
    output.hack_pieFace = 'outside';
    result = callback(isPie, is3d);
    if (!result || !result.graphic) {
      // 绘制内部
      output.hack_pieFace = 'inside';
      result = callback(isPie, is3d);
    }
    if (!result || !result.graphic) {
      // 绘制顶部
      output.hack_pieFace = 'top';
      result = callback(isPie, is3d);
    }
    graphic.removeAllChild();
    children.forEach(c => {
      c._next = null;
      c._prev = null;
    });
    children.forEach(c => {
      graphic.appendChild(c);
    });
  } else if (is3d) {
    // 排序这些图元
    const children = graphic.getChildren() as IGraphic[];
    const zChildren = children.map(g => {
      const face3d = g.findFace();
      const vertices = face3d.vertices;
      // 计算每个顶点的view
      const viewdVerticesZ = vertices.map(v => {
        return context.view(v[0], v[1], v[2] + g.attribute.z ?? 0)[2];
      });
      const ave_z = viewdVerticesZ.reduce((a, b) => a + b, 0);
      return {
        ave_z,
        g
      };
    });
    zChildren.sort((a, b) => b.ave_z - a.ave_z);
    graphic.removeAllChild();
    zChildren.forEach(i => {
      i.g._next = null;
      i.g._prev = null;
    });
    graphic.update();
    zChildren.forEach(i => {
      graphic.add(i.g);
    });

    result = callback(isPie, is3d);

    graphic.removeAllChild();
    children.forEach(g => {
      g._next = null;
      g._prev = null;
    });
    graphic.update();
    children.forEach(g => {
      graphic.add(g);
    });
  } else {
    result = callback(isPie, is3d);
  }

  return result;
};
