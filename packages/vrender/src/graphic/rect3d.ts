import { min } from '@visactor/vutils';
import { GraphicType, IFace3d, IRect3d, IRect3dGraphicAttribute } from '../interface';
import { genNumberType } from './graphic';
import { Rect } from './rect';
import { getTheme } from './theme';

export const RECT3D_NUMBER_TYPE = genNumberType();

const CUBE_VERTICES = [
  [0, 0, 0],
  [1, 0, 0],
  [1, 1, 0],
  [0, 1, 0],
  [0, 0, 1],
  [1, 0, 1],
  [1, 1, 1],
  [0, 1, 1]
];

export class Rect3d extends Rect implements IRect3d {
  type: GraphicType = 'rect3d';
  declare attribute: IRect3dGraphicAttribute;

  constructor(params: IRect3dGraphicAttribute) {
    super(params);
    this.numberType = RECT3D_NUMBER_TYPE;
  }

  findFace(): IFace3d {
    const faces: IFace3d = { polygons: [], vertices: [], edges: [] };
    const rectTheme = getTheme(this).rect3d;
    const {
      width = rectTheme.width,
      height = rectTheme.width,
      length = min(rectTheme.width, rectTheme.height)
    } = this.attribute;
    for (let i = 0; i < CUBE_VERTICES.length; i++) {
      const v = CUBE_VERTICES[i];
      faces.vertices.push([v[0] * width, v[1] * height, v[2] * length]);
    }

    // 上
    faces.polygons.push({ polygon: [0, 1, 5, 4], normal: [0, -1, 0] });
    // 下
    faces.polygons.push({ polygon: [2, 3, 7, 6], normal: [0, 1, 0] });
    // 左
    faces.polygons.push({ polygon: [4, 7, 3, 0], normal: [-1, 0, 0] });
    // 右
    faces.polygons.push({ polygon: [1, 2, 6, 5], normal: [1, 0, 0] });
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
}
