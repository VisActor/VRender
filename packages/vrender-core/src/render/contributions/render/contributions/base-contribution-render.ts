import type {
  IGraphicAttribute,
  IContext2d,
  IGraphic,
  IThemeAttribute,
  IBaseRenderContribution,
  IContributionProvider,
  IDrawContext,
  ISymbol,
  IPath,
  ISymbolGraphicAttribute
} from '../../../../interface';
import type { IBounds } from '@visactor/vutils';
import { inject, injectable, named } from '../../../../common/inversify-lite';
import { getTheme } from '../../../../graphic/theme';
import { canvasAllocate } from '../../../../allocator/canvas-allocate';
import { BaseRenderContributionTime } from '../../../../common/enums';
import { ContributionProvider } from '../../../../common/contribution-provider';
import { InteractiveSubRenderContribution } from './constants';

export class DefaultBaseBackgroundRenderContribution implements IBaseRenderContribution<IGraphic, IGraphicAttribute> {
  time: BaseRenderContributionTime = BaseRenderContributionTime.beforeFillStroke;
  useStyle: boolean = true;
  order: number = 0;
  drawShape(
    graphic: IGraphic,
    context: IContext2d,
    x: number,
    y: number,
    doFill: boolean,
    doStroke: boolean,
    fVisible: boolean,
    sVisible: boolean,
    graphicAttribute: Required<IGraphicAttribute>,
    drawContext: IDrawContext,
    fillCb?: (ctx: IContext2d, markAttribute: Partial<IGraphicAttribute>, themeAttribute: IThemeAttribute) => boolean,
    strokeCb?: (ctx: IContext2d, markAttribute: Partial<IGraphicAttribute>, themeAttribute: IThemeAttribute) => boolean,
    options?: any
  ) {
    const {
      background,
      backgroundOpacity = graphic.attribute.fillOpacity ?? graphicAttribute.backgroundOpacity,
      opacity = graphicAttribute.opacity,
      backgroundMode = graphicAttribute.backgroundMode,
      backgroundFit = graphicAttribute.backgroundFit,
      backgroundScale = graphicAttribute.backgroundScale,
      backgroundOffsetX = graphicAttribute.backgroundOffsetX,
      backgroundOffsetY = graphicAttribute.backgroundOffsetY
    } = graphic.attribute;
    if (!background) {
      return;
    }

    if (graphic.backgroundImg && graphic.resources) {
      const res = graphic.resources.get(background as any);
      if (res.state !== 'success' || !res.data) {
        return;
      }

      context.save();

      if (graphic.parent && !graphic.transMatrix.onlyTranslate()) {
        const groupAttribute = getTheme(graphic.parent).group;
        const { scrollX = groupAttribute.scrollX, scrollY = groupAttribute.scrollY } = graphic.parent.attribute;
        context.setTransformFromMatrix(graphic.parent.globalTransMatrix, true);
        context.translate(scrollX, scrollY);
      }
      context.clip();
      const b = graphic.AABBBounds;
      context.setCommonStyle(graphic, graphic.attribute, x, y, graphicAttribute);
      context.globalAlpha = backgroundOpacity * opacity;
      this.doDrawImage(context, res.data, b, {
        backgroundMode,
        backgroundFit,
        backgroundScale,
        backgroundOffsetX,
        backgroundOffsetY
      });
      context.restore();
      if (!graphic.transMatrix.onlyTranslate()) {
        context.setTransformForCurrent();
      }
    } else {
      context.highPerformanceSave();
      context.setCommonStyle(graphic, graphic.attribute, x, y, graphicAttribute);
      context.globalAlpha = backgroundOpacity * opacity;
      context.fillStyle = background as string;
      context.fill();
      context.highPerformanceRestore();
    }
  }

  protected doDrawImage(
    context: IContext2d,
    data: any,
    b: IBounds,
    params: {
      backgroundMode: 'repeat' | 'repeat-x' | 'repeat-y' | 'no-repeat';
      backgroundFit: boolean;
      backgroundScale?: number;
      backgroundOffsetX?: number;
      backgroundOffsetY?: number;
    }
  ): void {
    const { backgroundMode, backgroundFit, backgroundScale = 1, backgroundOffsetX = 0, backgroundOffsetY = 0 } = params;
    const targetW = b.width();
    const targetH = b.height();
    let w = targetW;
    let h = targetH;
    if (backgroundMode === 'no-repeat') {
      if (backgroundFit) {
        context.drawImage(data, b.x1, b.y1, b.width(), b.height());
      } else {
        const resW = data.width * backgroundScale;
        const resH = data.height * backgroundScale;
        context.drawImage(data, b.x1 + backgroundOffsetX, b.y1 + backgroundOffsetY, resW, resH);
      }
    } else {
      // debugger;
      // TODO 考虑缓存
      if (backgroundFit && backgroundMode !== 'repeat' && (data.width || data.height)) {
        const resW = data.width;
        const resH = data.height;

        if (backgroundMode === 'repeat-x') {
          // 高度适应
          const ratio = targetH / resH;
          w = resW * ratio;
          h = targetH;
        } else if (backgroundMode === 'repeat-y') {
          // 宽度适应
          const ratio = targetW / resW;
          h = resH * ratio;
          w = targetW;
        }

        const dpr = context.dpr;
        const canvas = canvasAllocate.allocate({ width: w, height: h, dpr });
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.inuse = true;
          ctx.clearMatrix();
          ctx.setTransformForCurrent(true);
          ctx.clearRect(0, 0, w, h);
          ctx.drawImage(data, 0, 0, w, h);
          data = canvas.nativeCanvas;
        }
        canvasAllocate.free(canvas);
      }
      const dpr = context.dpr;
      const pattern = context.createPattern(data, backgroundMode);
      pattern.setTransform && pattern.setTransform(new DOMMatrix([1 / dpr, 0, 0, 1 / dpr, 0, 0]));
      context.fillStyle = pattern;
      context.translate(b.x1, b.y1);
      context.fillRect(0, 0, targetW, targetH);
      context.translate(-b.x1, -b.y1);
    }
  }
}

export const defaultBaseBackgroundRenderContribution = new DefaultBaseBackgroundRenderContribution();

export interface IInteractiveSubRenderContribution {
  render: (
    graphic: IGraphic,
    context: IContext2d,
    x: number,
    y: number,
    doFill: boolean,
    doStroke: boolean,
    fVisible: boolean,
    sVisible: boolean,
    graphicAttribute: Required<IGraphicAttribute>,
    drawContext: IDrawContext,
    fillCb?: (ctx: IContext2d, markAttribute: Partial<IGraphicAttribute>, themeAttribute: IThemeAttribute) => boolean,
    strokeCb?: (ctx: IContext2d, markAttribute: Partial<IGraphicAttribute>, themeAttribute: IThemeAttribute) => boolean,
    options?: any
  ) => void;
}

@injectable()
export class DefaultBaseInteractiveRenderContribution implements IBaseRenderContribution<IGraphic, IGraphicAttribute> {
  time: BaseRenderContributionTime = BaseRenderContributionTime.afterFillStroke;
  useStyle: boolean = true;
  order: number = 0;

  _subRenderContribitions?: IInteractiveSubRenderContribution[];
  constructor(
    @inject(ContributionProvider)
    @named(InteractiveSubRenderContribution)
    protected readonly subRenderContribitions: IContributionProvider<IInteractiveSubRenderContribution>
  ) {}

  drawShape(
    graphic: IGraphic,
    context: IContext2d,
    x: number,
    y: number,
    doFill: boolean,
    doStroke: boolean,
    fVisible: boolean,
    sVisible: boolean,
    graphicAttribute: Required<IGraphicAttribute>,
    drawContext: IDrawContext,
    fillCb?: (ctx: IContext2d, markAttribute: Partial<IGraphicAttribute>, themeAttribute: IThemeAttribute) => boolean,
    strokeCb?: (ctx: IContext2d, markAttribute: Partial<IGraphicAttribute>, themeAttribute: IThemeAttribute) => boolean,
    options?: any
  ) {
    if (!this._subRenderContribitions) {
      this._subRenderContribitions = this.subRenderContribitions.getContributions();
    }
    this._subRenderContribitions.forEach(c => {
      c.render(
        graphic,
        context,
        x,
        y,
        doFill,
        doStroke,
        fVisible,
        sVisible,
        graphicAttribute,
        drawContext,
        fillCb,
        strokeCb,
        options
      );
    });
  }
}
