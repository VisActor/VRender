import { injectable } from '../../../common/inversify-lite';
import { getTheme } from '../../../graphic/theme';
import { PYRAMID3D_NUMBER_TYPE } from '../../../graphic/constants';
import type {
  IGraphicAttribute,
  IContext2d,
  IDirectionLight,
  IMarkAttribute,
  IPyramid3d,
  IFace3d,
  IThemeAttribute,
  ICamera,
  IPolygonItem,
  IGraphicRender,
  IDrawContext,
  IGraphicRenderDrawParams,
  IRenderService
} from '../../../interface';
import { fillVisible, runFill, runStroke, strokeVisible } from './utils';
import { mat4Allocate } from '../../../allocator/matrix-allocate';
import { BaseRender } from './base-render';
import { ColorStore, ColorType } from '../../../color-string';

@injectable()
export class DefaultCanvasPyramid3dRender extends BaseRender<IPyramid3d> implements IGraphicRender {
  type = 'pyramid3d';
  numberType: number = PYRAMID3D_NUMBER_TYPE;
  declare z: number;

  drawShape(
    pyramid3d: IPyramid3d,
    context: IContext2d,
    x: number,
    y: number,
    drawContext: IDrawContext,
    params?: IGraphicRenderDrawParams,
    fillCb?: (
      ctx: IContext2d,
      markAttribute: Partial<IMarkAttribute & IGraphicAttribute>,
      themeAttribute: IThemeAttribute
    ) => boolean,
    strokeCb?: (
      ctx: IContext2d,
      markAttribute: Partial<IMarkAttribute & IGraphicAttribute>,
      themeAttribute: IThemeAttribute
    ) => boolean
  ) {
    // const rectAttribute = graphicService.themeService.getCurrentTheme().rectAttribute;
    const pyramidAttribute = getTheme(pyramid3d, params?.theme).polygon;
    const {
      fill = pyramidAttribute.fill,
      stroke = pyramidAttribute.stroke,
      opacity = pyramidAttribute.opacity,
      fillOpacity = pyramidAttribute.fillOpacity,
      lineWidth = pyramidAttribute.lineWidth,
      strokeOpacity = pyramidAttribute.strokeOpacity,
      visible = pyramidAttribute.visible,
      points,
      face = [true, true, true, true, true, true]
    } = pyramid3d.attribute;

    const z = this.z ?? 0;

    // 不绘制或者透明
    const fVisible = fillVisible(opacity, fillOpacity, fill);
    const sVisible = strokeVisible(opacity, strokeOpacity);
    const doFill = runFill(fill);
    const doStroke = runStroke(stroke, lineWidth);

    if (!(pyramid3d.valid && visible && points.length === 4)) {
      return;
    }

    if (!(doFill || doStroke)) {
      return;
    }

    // 如果存在fillCb和strokeCb，那就不直接跳过
    if (!(fVisible || sVisible || fillCb || strokeCb)) {
      return;
    }

    const { light, camera } = drawContext.stage || {};

    const face3d = pyramid3d.findFace();

    if (fill !== false) {
      context.setCommonStyle(pyramid3d, pyramid3d.attribute, x, y, pyramidAttribute);
      let fc = fill;
      if (typeof fc !== 'string') {
        fc = 'black';
      }
      this.fill(x, y, z, face3d, face, fc, context, light, camera, pyramid3d, pyramidAttribute, fillCb);
    }
    if (stroke !== false) {
      context.setStrokeStyle(pyramid3d, pyramid3d.attribute, x, y, pyramidAttribute);
      this.stroke(x, y, z, face3d, context);
    }
  }

  stroke(x: number, y: number, z: number, face3d: IFace3d, context: IContext2d) {
    const vertices = face3d.vertices;
    face3d.edges.forEach(p => {
      const p1 = vertices[p[0]];
      const p2 = vertices[p[1]];
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
    faces: [boolean, boolean, boolean, boolean, boolean, boolean],
    fillColor: string,
    context: IContext2d,
    light: IDirectionLight,
    camera: ICamera,
    pyramid3d: IPyramid3d,
    pyramid3dAttribute: Partial<IMarkAttribute & IGraphicAttribute>,
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
      if (!faces[i]) {
        return;
      }
      sortFace.push({
        faceIdx: i,
        polygon: p
      });
      // 设置ave_z进行排序
      const { polygon, normal } = p;

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
        fillCb(context, pyramid3d.attribute, pyramid3dAttribute);
      } else {
        context.fillStyle = light ? light.computeColor(normal, rgbArray as any) : fillColor;
        context.fill();
      }
    });
  }

  draw(pyramid3d: IPyramid3d, renderService: IRenderService, drawContext: IDrawContext) {
    const pyramid3dAttribute = getTheme(pyramid3d).polygon;
    this._draw(pyramid3d, pyramid3dAttribute, false, drawContext);
  }
}
