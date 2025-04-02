import { isArray } from '@visactor/vutils';
import { inject, injectable, named } from '../../../common/inversify-lite';
import { getTheme } from '../../../graphic/theme';
import { STAR_NUMBER_TYPE } from '../../../graphic/constants';
import type {
  IGraphicAttribute,
  IContext2d,
  IMarkAttribute,
  IStar,
  IThemeAttribute,
  IGraphicRender,
  IContributionProvider,
  IDrawContext,
  IGraphicRenderDrawParams,
  IRenderService,
  IStarRenderContribution
} from '../../../interface';
import { StarRenderContribution } from './contributions/constants';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { ContributionProvider } from '../../../common/contribution-provider';
import { BaseRender } from './base-render';
import { defaultStarBackgroundRenderContribution, defaultStarTextureRenderContribution } from './contributions';

@injectable()
export class DefaultCanvasStarRender extends BaseRender<IStar> implements IGraphicRender {
  type: 'star';
  numberType: number = STAR_NUMBER_TYPE;

  constructor(
    @inject(ContributionProvider)
    @named(StarRenderContribution)
    protected readonly starRenderContribitions: IContributionProvider<IStarRenderContribution>
  ) {
    super();
    this.builtinContributions = [defaultStarBackgroundRenderContribution, defaultStarTextureRenderContribution];
    this.init(starRenderContribitions);
  }

  drawShape(
    star: IStar,
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
    // Get theme attributes
    const starAttribute = getTheme(star, params?.theme).star;
    const {
      x: originX = starAttribute.x,
      y: originY = starAttribute.y,
      fillStrokeOrder = starAttribute.fillStrokeOrder
    } = star.attribute;

    const data = this.valid(star, starAttribute, fillCb, strokeCb);
    if (!data) {
      return;
    }
    const { fVisible, sVisible, doFill, doStroke } = data;

    // Get cached points for better performance
    const points = star.getCachedPoints();

    context.beginPath();

    // Draw the star using cached points
    if (points && points.length) {
      points.forEach((point, index) => {
        if (index === 0) {
          context.moveTo(x + point.x, y + point.y);
        } else {
          context.lineTo(x + point.x, y + point.y);
        }
      });
    }

    // Close the path
    context.closePath();

    // Shadow
    context.setShadowBlendStyle && context.setShadowBlendStyle(star, star.attribute, starAttribute);

    this.beforeRenderStep(
      star,
      context,
      x,
      y,
      doFill,
      doStroke,
      fVisible,
      sVisible,
      starAttribute,
      drawContext,
      fillCb,
      strokeCb
    );

    const _runFill = () => {
      if (doFill) {
        if (fillCb) {
          fillCb(context, star.attribute, starAttribute);
        } else if (fVisible) {
          // Apply fill
          context.setCommonStyle(star, star.attribute, originX - x, originY - y, starAttribute);
          context.fill();
        }
      }
    };
    const _runStroke = () => {
      if (doStroke) {
        if (strokeCb) {
          strokeCb(context, star.attribute, starAttribute);
        } else if (sVisible) {
          // Apply stroke
          context.setStrokeStyle(star, star.attribute, originX - x, originY - y, starAttribute);
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
      star,
      context,
      x,
      y,
      doFill,
      doStroke,
      fVisible,
      sVisible,
      starAttribute,
      drawContext,
      fillCb,
      strokeCb
    );
  }

  draw(star: IStar, renderService: IRenderService, drawContext: IDrawContext, params?: IGraphicRenderDrawParams) {
    const starAttribute = getTheme(star, params?.theme).star;
    this._draw(star, starAttribute, false, drawContext, params);
  }
}
