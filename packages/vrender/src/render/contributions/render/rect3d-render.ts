import { injectable } from 'inversify';
import { getTheme } from '../../../graphic/theme';
import {
  IGraphicAttribute,
  IContext2d,
  IDirectionLight,
  IFace3d,
  IMarkAttribute,
  IPolygonItem,
  IRect3d,
  IThemeAttribute,
  vec3
} from '../../../interface';
import { IDrawContext, IRenderService } from '../../render-service';
import { IGraphicRender, IGraphicRenderDrawParams } from './graphic-render';
import { rectFillVisible, rectStrokeVisible, runFill, runStroke } from './utils';
import { colorString } from '../../../color-string';
import { mat4Allocate } from '../../../allocator/matrix-allocate';
import { BaseRender } from './base-render';
import { RECT3D_NUMBER_TYPE } from '../../../graphic/constants';
@injectable()
export class DefaultCanvasRect3dRender extends BaseRender<IRect3d> implements IGraphicRender {
  type = 'rect3d';
  numberType: number = RECT3D_NUMBER_TYPE;
  declare z: number;

  drawShape(
    rect: IRect3d,
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
    const rectAttribute = getTheme(rect, params?.theme).rect3d;
    const {
      fill = rectAttribute.fill,
      stroke = rectAttribute.stroke,
      width = rectAttribute.width,
      height = rectAttribute.height,
      opacity = rectAttribute.opacity,
      fillOpacity = rectAttribute.fillOpacity,
      lineWidth = rectAttribute.lineWidth,
      strokeOpacity = rectAttribute.strokeOpacity,
      visible = rectAttribute.visible
    } = rect.attribute;

    const z = this.z ?? 0;

    // 不绘制或者透明
    const fVisible = rectFillVisible(opacity, fillOpacity, width, height);
    const sVisible = rectStrokeVisible(opacity, strokeOpacity, width, height);
    const doFill = runFill(fill);
    const doStroke = runStroke(stroke, lineWidth);

    if (!(rect.valid && visible)) {
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
    const face3d = rect.findFace();

    if (fill !== false) {
      context.setCommonStyle(rect, rect.attribute, x, y, rectAttribute);
      let fc = fill;
      if (typeof fc !== 'string') {
        fc = 'black';
      }
      this.fill(x, y, z, face3d, fc, context, light, fillCb);
    }
    if (stroke !== false) {
      context.setStrokeStyle(rect, rect.attribute, x, y, rectAttribute);
      this.stroke(x, y, z, face3d, context);
    }
  }

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
    fillColor: string,
    context: IContext2d,
    light: IDirectionLight,
    fillCb?: (
      ctx: IContext2d,
      markAttribute: Partial<IMarkAttribute & IGraphicAttribute>,
      themeAttribute: IThemeAttribute
    ) => boolean
  ) {
    const rgbArray = colorString.get(fillColor).value;
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
        fillCb(context, null, null);
      } else {
        context.fillStyle = light ? light.computeColor(normal, rgbArray) : fillColor;
        context.fill();
      }
    });
  }

  draw(rect: IRect3d, renderService: IRenderService, drawContext: IDrawContext) {
    const { context } = drawContext;
    if (!context) {
      return;
    }

    context.highPerformanceSave();
    // const rectAttribute = graphicService.themeService.getCurrentTheme().rectAttribute;
    const rectAttribute = getTheme(rect).rect;

    const data = this.transform(rect, rectAttribute, context);
    const { x, y, z, lastModelMatrix } = data;

    this.z = z;
    this.drawShape(rect, context, x, y, drawContext);
    this.z = 0;

    if (context.modelMatrix !== lastModelMatrix) {
      mat4Allocate.free(context.modelMatrix);
    }
    context.modelMatrix = lastModelMatrix;

    context.highPerformanceRestore();
  }
}
