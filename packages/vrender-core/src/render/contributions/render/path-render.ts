import { inject, injectable, named } from '../../../common/inversify-lite';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { ContributionProvider } from '../../../common/contribution-provider';
import { renderCommandList } from '../../../common/render-command-list';
import type {
  IPath,
  ICustomPath2D,
  IContext2d,
  IThemeAttribute,
  IGraphicAttribute,
  IMarkAttribute,
  IPathRenderContribution,
  IGraphicRender,
  IContributionProvider,
  IDrawContext,
  IGraphicRenderDrawParams,
  IRenderService,
  IPathGraphicAttribute
} from '../../../interface';
import { getTheme } from '../../../graphic/theme';
import { PATH_NUMBER_TYPE } from '../../../graphic/constants';
import { drawPathProxy, fillVisible, runFill, runStroke, strokeVisible } from './utils';
import { PathRenderContribution } from './contributions/constants';
import { BaseRenderContributionTime } from '../../../common/enums';
import { BaseRender } from './base-render';
import { mat4Allocate } from '../../../allocator/matrix-allocate';
import {
  defaultPathBackgroundRenderContribution,
  defaultPathTextureRenderContribution
} from './contributions/path-contribution-render';

@injectable()
export class DefaultCanvasPathRender extends BaseRender<IPath> implements IGraphicRender {
  type: 'path';
  numberType: number = PATH_NUMBER_TYPE;
  tempTheme: Required<IPathGraphicAttribute>;

  constructor(
    @inject(ContributionProvider)
    @named(PathRenderContribution)
    protected readonly pathRenderContribitions: IContributionProvider<IPathRenderContribution>
  ) {
    super();
    this.builtinContributions = [defaultPathBackgroundRenderContribution, defaultPathTextureRenderContribution];
    this.init(pathRenderContribitions);
  }

  drawShape(
    path: IPath,
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
    // const pathAttribute = graphicService.themeService.getCurrentTheme().pathAttribute;
    const pathAttribute = this.tempTheme ?? getTheme(path, params?.theme).path;
    const {
      x: originX = pathAttribute.x,
      y: originY = pathAttribute.y,
      fillStrokeOrder = pathAttribute.fillStrokeOrder
    } = path.attribute;

    const z = this.z ?? 0;

    const data = this.valid(path, pathAttribute, fillCb, strokeCb);
    if (!data) {
      return;
    }
    const { fVisible, sVisible, doFill, doStroke } = data;

    context.beginPath();
    if (path.pathShape) {
      renderCommandList((path.pathShape as ICustomPath2D).commandList, context, x, y, 1, 1, z);
    } else {
      const path2D = path.attribute.path ?? pathAttribute.path;
      renderCommandList((path2D as ICustomPath2D).commandList, context, x, y, 1, 1, z);
    }

    // shadow
    context.setShadowBlendStyle && context.setShadowBlendStyle(path, path.attribute, pathAttribute);

    this.beforeRenderStep(
      path,
      context,
      x,
      y,
      doFill,
      doStroke,
      fVisible,
      sVisible,
      pathAttribute,
      drawContext,
      fillCb,
      strokeCb
    );

    const _runStroke = () => {
      if (doStroke) {
        if (strokeCb) {
          strokeCb(context, path.attribute, pathAttribute);
        } else if (sVisible) {
          context.setStrokeStyle(path, path.attribute, originX - x, originY - y, pathAttribute);
          context.stroke();
        }
      }
    };
    const _runFill = () => {
      if (doFill) {
        if (fillCb) {
          fillCb(context, path.attribute, pathAttribute);
        } else if (fVisible) {
          context.setCommonStyle(path, path.attribute, originX - x, originY - y, pathAttribute);
          context.fill();
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
      path,
      context,
      x,
      y,
      doFill,
      doStroke,
      fVisible,
      sVisible,
      pathAttribute,
      drawContext,
      fillCb,
      strokeCb
    );
  }

  draw(path: IPath, renderService: IRenderService, drawContext: IDrawContext, params?: IGraphicRenderDrawParams) {
    const pathAttribute = getTheme(path, params?.theme).path;
    this.tempTheme = pathAttribute;
    this._draw(path, pathAttribute, false, drawContext, params);
    this.tempTheme = null;
  }
}
