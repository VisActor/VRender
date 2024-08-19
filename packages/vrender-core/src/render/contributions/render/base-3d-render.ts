import { ColorStore, ColorType } from '../../../color-string/store';
import type { IContext2d } from '../../../interface/context';
import type { IGraphic, IGraphicAttribute } from '../../../interface/graphic';
import type { IMarkAttribute, IThemeAttribute } from '../../../interface/graphic/creator';
import type { IFace3d, IPolygonItem } from '../../../interface/graphic/face3d';
import type { IDirectionLight } from '../../../interface/light';
import { BaseRender } from './base-render';

export abstract class Base3dRender<T extends IGraphic> extends BaseRender<T> {
  stroke(x: number, y: number, z: number, face3d: IFace3d, context: IContext2d) {
    const vertices = face3d.vertices;
    face3d.edges.forEach(edge => {
      const p1 = vertices[edge[0]];
      const v1 = {
        x: x + p1[0],
        y: y + p1[1],
        z: z + p1[2]
      };
      const p2 = vertices[edge[1]];
      const v2 = {
        x: x + p2[0],
        y: y + p2[1],
        z: z + p2[2]
      };
      context.beginPath();
      context.moveTo(v1.x, v1.y, v1.z);
      context.lineTo(v2.x, v2.y, v2.z);
      context.stroke();
    });
  }

  fill(
    x: number,
    y: number,
    z: number,
    face3d: IFace3d,
    faces: [boolean, boolean, boolean, boolean, boolean, boolean] | undefined,
    fillColor: string,
    context: IContext2d,
    light: IDirectionLight,
    graphic3d: T | undefined,
    graphic3dAttribute: Partial<IMarkAttribute & IGraphicAttribute> | undefined,
    fillCb?: (
      ctx: IContext2d,
      markAttribute: Partial<IMarkAttribute & IGraphicAttribute>,
      themeAttribute: IThemeAttribute
    ) => boolean
  ) {
    const rgbArray = ColorStore.Get(fillColor as string, ColorType.Color255);

    // 上下左右前后
    // 0,1,2,3,4,5
    const vertices = face3d.vertices;
    // 计算每个顶点的view
    const viewdVerticesZ = vertices.map(v => {
      return context.view(v[0], v[1], v[2])[2];
    });
    // 排序
    const sortFace: { faceIdx: number; polygon: IPolygonItem }[] = [];
    face3d.polygons.forEach((p, i) => {
      if (faces && !faces[i]) {
        return;
      }
      sortFace.push({
        faceIdx: i,
        polygon: p
      });
      // 设置ave_z进行排序
      const { polygon } = p;

      const z1 = viewdVerticesZ[polygon[0]];
      const z2 = viewdVerticesZ[polygon[1]];
      const z3 = viewdVerticesZ[polygon[2]];
      const z4 = viewdVerticesZ[polygon[3]];

      p.ave_z = z1 + z2 + z3 + z4;
    });
    sortFace.sort((a, b) => b.polygon.ave_z - a.polygon.ave_z);
    sortFace.forEach(item => {
      const { polygon, normal } = item.polygon;

      const p1 = vertices[polygon[0]];
      const p2 = vertices[polygon[1]];
      const p3 = vertices[polygon[2]];
      const p4 = vertices[polygon[3]];

      const v1 = {
        x: x + p1[0],
        y: y + p1[1],
        z: z + p1[2]
      };
      const v2 = {
        x: x + p2[0],
        y: y + p2[1],
        z: z + p2[2]
      };
      const v3 = {
        x: x + p3[0],
        y: y + p3[1],
        z: z + p3[2]
      };
      const v4 = {
        x: x + p4[0],
        y: y + p4[1],
        z: z + p4[2]
      };
      context.beginPath();
      context.moveTo(v1.x, v1.y, v1.z);
      context.lineTo(v2.x, v2.y, v2.z);
      context.lineTo(v3.x, v3.y, v3.z);
      context.lineTo(v4.x, v4.y, v4.z);
      context.closePath();
      if (fillCb) {
        fillCb(context, graphic3d && graphic3d.attribute, graphic3dAttribute);
      } else {
        context.fillStyle = light ? light.computeColor(normal, rgbArray as any) : fillColor;
        context.fill();
      }
    });
  }
}
