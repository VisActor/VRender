import type { IAABBBounds, IPointLike } from '@visactor/vutils';
import { max, PointService } from '@visactor/vutils';
import type { GraphicType, IPyramid3d, IPyramid3dGraphicAttribute } from '../interface';
import type { IFace3d } from '../interface/graphic/face3d';
import { application } from '../application';
import { Polygon } from './polygon';
import { PYRAMID3D_NUMBER_TYPE } from './constants';
import { NOWORK_ANIMATE_ATTR } from './graphic';

export class Pyramid3d extends Polygon implements IPyramid3d {
  type: GraphicType = 'pyramid3d';
  declare attribute: IPyramid3dGraphicAttribute;

  static NOWORK_ANIMATE_ATTR = NOWORK_ANIMATE_ATTR;

  constructor(params: IPyramid3dGraphicAttribute) {
    super(params);
    this.numberType = PYRAMID3D_NUMBER_TYPE;
  }

  protected updateAABBBounds(
    attribute: IPyramid3dGraphicAttribute,
    polygonTheme: Required<IPyramid3dGraphicAttribute>,
    aabbBounds: IAABBBounds
  ) {
    const stage = this.stage;
    if (!stage || !stage.camera) {
      return aabbBounds;
    }

    const faces = this.findFace();
    // const outP = [0, 0, 0];
    faces.vertices.forEach(v => {
      const x = v[0];
      const y = v[1];
      aabbBounds.add(x, y);
    });
    application.graphicService.updateTempAABBBounds(aabbBounds);
    application.graphicService.transformAABBBounds(attribute, aabbBounds, polygonTheme, false, this);
    return aabbBounds;
  }

  findFace(): IFace3d {
    const { points } = this.attribute;
    // 找到斜率相同的两条边
    const kList = points.map((p, i) => {
      const p1 = i === 3 ? points[0] : points[i + 1];
      const dx = p.x - p1.x;
      if (dx === 0) {
        return 0;
      }
      return (p.y - p1.y) / dx;
    });

    const pointsMap: { p: IPointLike; d: number }[] = points.map(p => ({ p, d: 0 }));
    let find = false;
    let maxD = 0;
    for (let i = 0; i < kList.length - 1; i++) {
      for (let j = i + 1; j < kList.length; j++) {
        if (kList[i] === kList[j]) {
          find = true;
          const d1 = PointService.distancePP(pointsMap[i].p, pointsMap[i + 1].p);
          pointsMap[i].d = d1;
          pointsMap[i + 1].d = d1;
          maxD = max(maxD, d1);
          const d2 = PointService.distancePP(pointsMap[j].p, pointsMap[j + 1].p);
          pointsMap[j].d = d2;
          pointsMap[j + 1].d = d2;
          maxD = max(maxD, d2);
        }
        if (find) {
          break;
        }
      }
      if (find) {
        break;
      }
    }

    for (let i = points.length - 1; i >= 0; i--) {
      const p = points[i];
      pointsMap.unshift({
        p,
        d: 0
      });
    }

    for (let i = 0; i < points.length; i++) {
      const delta = (maxD - pointsMap[i + points.length].d) / 2;
      pointsMap[i].d += delta;
      pointsMap[i + points.length].d += delta;
    }

    const faces: IFace3d = { polygons: [], vertices: [], edges: [] };

    pointsMap.forEach(p => {
      faces.vertices.push([p.p.x, p.p.y, p.d]);
    });

    // 上
    faces.polygons.push({ polygon: [0, 4, 5, 1], normal: [0, -1, 0] });
    // 下
    faces.polygons.push({ polygon: [7, 6, 2, 3], normal: [0, 1, 0] });
    // 左
    faces.polygons.push({ polygon: [0, 4, 7, 3], normal: [-1, 0, 0] });
    // 右
    faces.polygons.push({ polygon: [1, 5, 6, 2], normal: [1, 0, 0] });
    // 前
    faces.polygons.push({ polygon: [0, 1, 2, 3], normal: [0, 0, -1] });
    // 后
    faces.polygons.push({ polygon: [4, 5, 6, 7], normal: [0, 0, 1] });

    faces.edges = [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 0],
      [4, 5],
      [5, 6],
      [6, 7],
      [7, 4],
      [0, 4],
      [3, 7],
      [1, 5],
      [2, 6]
    ];

    return faces;
  }

  protected _isValid(): boolean {
    return super._isValid() && this.attribute.points.length === 4;
  }

  getNoWorkAnimateAttr(): Record<string, number> {
    return Pyramid3d.NOWORK_ANIMATE_ATTR;
  }
}

export function createPyramid3d(attributes: IPyramid3dGraphicAttribute): IPyramid3d {
  return new Pyramid3d(attributes);
}
