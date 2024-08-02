import type {
  IGraphicRender,
  IRenderService,
  IArc,
  IGraphicAttribute,
  IContext2d,
  IGraphic,
  IMarkAttribute,
  IThemeAttribute,
  IDrawContext,
  IGraphicRenderDrawParams
} from '@visactor/vrender-core';
import {
  ARC_NUMBER_TYPE,
  DefaultCanvasArcRender,
  getTheme,
  CustomPath2D,
  drawArcPath,
  inject,
  injectable
} from '@visactor/vrender-core';
import rough from 'roughjs';
import { defaultRouthThemeSpec } from './config';
import { RoughBaseRender } from './base-render';

@injectable()
export class RoughCanvasArcRender extends RoughBaseRender implements IGraphicRender {
  type: 'arc';
  numberType: number;
  style: 'rough' = 'rough';

  constructor(
    @inject(DefaultCanvasArcRender)
    public readonly canvasRenderer: IGraphicRender
  ) {
    super();
    this.type = 'arc';
    this.numberType = ARC_NUMBER_TYPE;
  }

  draw(arc: IArc, renderService: IRenderService, drawContext: IDrawContext, params?: IGraphicRenderDrawParams) {
    const { context } = drawContext;
    if (!context) {
      return;
    }
    // 获取到原生canvas
    const canvas = context.canvas.nativeCanvas;
    const rc = rough.canvas(canvas);

    context.highPerformanceSave();

    // const arcAttribute = graphicService.themeService.getCurrentTheme().arcAttribute;
    const arcAttribute = arc.getGraphicTheme();
    let { x = arcAttribute.x, y = arcAttribute.y } = arc.attribute;
    if (!arc.transMatrix.onlyTranslate()) {
      // 性能较差
      x = 0;
      y = 0;
      context.transformFromMatrix(arc.transMatrix, true);
    } else {
      const { dx = arcAttribute.dx, dy = arcAttribute.dy } = arc.attribute;
      x += dx;
      y += dy;
      // 当前context有rotate/scale，重置matrix
      context.setTransformForCurrent();
    }

    const customPath = new CustomPath2D();

    const {
      fill = arcAttribute.fill,
      stroke = arcAttribute.stroke,
      lineWidth = arcAttribute.lineWidth,
      outerRadius = arcAttribute.outerRadius,
      innerRadius = arcAttribute.innerRadius,
      maxRandomnessOffset = defaultRouthThemeSpec.maxRandomnessOffset,
      roughness = defaultRouthThemeSpec.roughness,
      bowing = defaultRouthThemeSpec.bowing,
      curveFitting = defaultRouthThemeSpec.curveFitting,
      curveTightness = defaultRouthThemeSpec.curveTightness,
      curveStepCount = defaultRouthThemeSpec.curveStepCount,
      fillStyle = defaultRouthThemeSpec.fillStyle,
      fillWeight = defaultRouthThemeSpec.fillWeight,
      hachureAngle = defaultRouthThemeSpec.hachureAngle,
      hachureGap = defaultRouthThemeSpec.hachureGap,
      simplification = defaultRouthThemeSpec.simplification,
      dashOffset = defaultRouthThemeSpec.dashOffset,
      dashGap = defaultRouthThemeSpec.dashGap,
      zigzagOffset = defaultRouthThemeSpec.zigzagOffset,
      seed = defaultRouthThemeSpec.seed,
      fillLineDash = defaultRouthThemeSpec.fillLineDash,
      fillLineDashOffset = defaultRouthThemeSpec.fillLineDashOffset,
      disableMultiStroke = defaultRouthThemeSpec.disableMultiStroke,
      disableMultiStrokeFill = defaultRouthThemeSpec.disableMultiStrokeFill,
      preserveVertices = defaultRouthThemeSpec.preserveVertices,
      fixedDecimalPlaceDigits = defaultRouthThemeSpec.fixedDecimalPlaceDigits
    } = arc.attribute as any;

    drawArcPath(arc, customPath, x, y, outerRadius, innerRadius);

    rc.path(customPath.toString(), {
      fill: fill ? (fill as string) : undefined,
      stroke: stroke ? (stroke as string) : undefined,
      strokeWidth: lineWidth,
      maxRandomnessOffset,
      roughness,
      bowing,
      curveFitting,
      curveTightness,
      curveStepCount,
      fillStyle,
      fillWeight,
      hachureAngle,
      hachureGap,
      simplification,
      dashOffset,
      dashGap,
      zigzagOffset,
      seed,
      fillLineDash,
      fillLineDashOffset,
      disableMultiStroke,
      disableMultiStrokeFill,
      preserveVertices,
      fixedDecimalPlaceDigits
    });

    context.highPerformanceRestore();
  }
}
