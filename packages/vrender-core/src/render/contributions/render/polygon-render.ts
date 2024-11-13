import { isArray } from '@visactor/vutils';
import { inject, injectable, named } from '../../../common/inversify-lite';
import { getTheme } from '../../../graphic/theme';
import { POLYGON_NUMBER_TYPE } from '../../../graphic/constants';
import type {
  IGraphicAttribute,
  IContext2d,
  IMarkAttribute,
  IPolygon,
  IThemeAttribute,
  IGraphicRender,
  IPolygonRenderContribution,
  IContributionProvider,
  IDrawContext,
  IGraphicRenderDrawParams,
  IRenderService
} from '../../../interface';
import { drawPolygon, drawRoundedPolygon } from '../../../common/polygon';
import { drawPathProxy, fillVisible, runFill, runStroke, strokeVisible } from './utils';
import { PolygonRenderContribution } from './contributions/constants';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { ContributionProvider } from '../../../common/contribution-provider';
import { BaseRenderContributionTime } from '../../../common/enums';
import { BaseRender } from './base-render';
import {
  defaultPolygonBackgroundRenderContribution,
  defaultPolygonTextureRenderContribution
} from './contributions/polygon-contribution-render';

@injectable()
export class DefaultCanvasPolygonRender extends BaseRender<IPolygon> implements IGraphicRender {
  type: 'polygon';
  numberType: number = POLYGON_NUMBER_TYPE;

  constructor(
    @inject(ContributionProvider)
    @named(PolygonRenderContribution)
    protected readonly polygonRenderContribitions: IContributionProvider<IPolygonRenderContribution>
  ) {
    super();
    this.builtinContributions = [defaultPolygonBackgroundRenderContribution, defaultPolygonTextureRenderContribution];
    this.init(polygonRenderContribitions);
  }

  drawShape(
    polygon: IPolygon,
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
    // const polygonAttribute = graphicService.themeService.getCurrentTheme().polygonAttribute;
    const polygonAttribute = getTheme(polygon, params?.theme).polygon;
    const {
      points = polygonAttribute.points,
      cornerRadius = polygonAttribute.cornerRadius,
      x: originX = polygonAttribute.x,
      y: originY = polygonAttribute.y,
      closePath = polygonAttribute.closePath,
      fillStrokeOrder = polygonAttribute.fillStrokeOrder
    } = polygon.attribute;

    const data = this.valid(polygon, polygonAttribute, fillCb, strokeCb);
    if (!data) {
      return;
    }
    const { fVisible, sVisible, doFill, doStroke } = data;

    context.beginPath();

    if ((cornerRadius as number) <= 0 || (isArray(cornerRadius) && (<number[]>cornerRadius).every(num => num === 0))) {
      drawPolygon(context.camera ? context : context.nativeContext, points, x, y);
    } else {
      // FIXME: type
      drawRoundedPolygon(context.camera ? context : context.nativeContext, points, x, y, cornerRadius, closePath);
    }
    // polygon 默认闭合
    closePath && context.closePath();

    // shadow
    context.setShadowBlendStyle && context.setShadowBlendStyle(polygon, polygon.attribute, polygonAttribute);

    this.beforeRenderStep(
      polygon,
      context,
      x,
      y,
      doFill,
      doStroke,
      fVisible,
      sVisible,
      polygonAttribute,
      drawContext,
      fillCb,
      strokeCb
    );

    const _runFill = () => {
      if (doFill) {
        if (fillCb) {
          fillCb(context, polygon.attribute, polygonAttribute);
        } else if (fVisible) {
          // 存在fill
          context.setCommonStyle(polygon, polygon.attribute, originX - x, originY - y, polygonAttribute);
          context.fill();
        }
      }
    };
    const _runStroke = () => {
      if (doStroke) {
        if (strokeCb) {
          strokeCb(context, polygon.attribute, polygonAttribute);
        } else if (sVisible) {
          // 存在stroke
          context.setStrokeStyle(polygon, polygon.attribute, originX - x, originY - y, polygonAttribute);
          context.stroke();
        }
      }
    };

    if (!fillStrokeOrder) {
      _runFill();
      _runStroke();
    } else {
      _runStroke();
      _runFill();
    }

    this.afterRenderStep(
      polygon,
      context,
      x,
      y,
      doFill,
      doStroke,
      fVisible,
      sVisible,
      polygonAttribute,
      drawContext,
      fillCb,
      strokeCb
    );
  }

  draw(polygon: IPolygon, renderService: IRenderService, drawContext: IDrawContext, params?: IGraphicRenderDrawParams) {
    const polygonAttribute = getTheme(polygon, params?.theme).polygon;
    this._draw(polygon, polygonAttribute, false, drawContext, params);
  }
}
