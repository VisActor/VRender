import type {
  IGraphicAttribute,
  IContext2d,
  IGraphic,
  IThemeAttribute,
  IBaseRenderContribution,
  IContributionProvider,
  IDrawContext
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
      backgroundFit = graphicAttribute.backgroundFit
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
      this.doDrawImage(context, res.data, b, backgroundMode, backgroundFit);
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
    backgroundMode: 'repeat' | 'repeat-x' | 'repeat-y' | 'no-repeat',
    backgroundFit: boolean
  ): void {
    if (backgroundMode === 'no-repeat') {
      context.drawImage(data, b.x1, b.y1, b.width(), b.height());
    } else {
      const targetW = b.width();
      const targetH = b.height();
      let w = targetW;
      let h = targetH;
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

// const rect1 =
//   // @ts-ignore
//   'data:image/png;base64,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';
