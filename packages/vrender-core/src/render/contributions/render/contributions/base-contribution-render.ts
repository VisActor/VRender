import type {
  IGraphicAttribute,
  IContext2d,
  IGraphic,
  IStage,
  IThemeAttribute,
  IBaseRenderContribution,
  IContributionProvider,
  IDrawContext
} from '../../../../interface';
import { inject, injectable, named } from '../../../../common/inversify-lite';
import { getTheme } from '../../../../graphic';
import { canvasAllocate } from '../../../../allocator/canvas-allocate';
import { pi2 } from '@visactor/vutils';
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
    const { background } = graphic.attribute;
    if (!background) {
      return;
    }

    if (graphic.backgroundImg && graphic.resources) {
      const res = graphic.resources.get(background);
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
      context.drawImage(res.data, b.x1, b.y1, b.width(), b.height());
      context.restore();
      if (!graphic.transMatrix.onlyTranslate()) {
        context.setTransformForCurrent();
      }
    } else {
      context.highPerformanceSave();
      context.setCommonStyle(graphic, graphic.attribute, x, y, graphicAttribute);
      context.fillStyle = background as string;
      context.fill();
      context.highPerformanceRestore();
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
//   'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFEAAABRCAYAAACqj0o2AAAAAXNSR0IArs4c6QAAByRJREFUeF7tnU1oXUUUx/+XLirxA8QGSdA0tGBNRFNBxYJCoRsXKkZQVFSwKKKFLhp14cbiwoWYgoEiorSgolIRQV24KRQUFAzYKMZaaIm1JEgiQtVgF+XKvPvmvbn3zsf/zLs3Hy/vbTMz557fnDkzc2bmJEnTNEXEb2Lfs5g8/HZETWGVS/9lFTZdJqwoLx6rUxIF8fwpJNePID1yAHhqUv61bA0FcPZwVnp0X70gj04g2XsI6e+/ANfdyH5ho5wc4vlTwGt7kLw1j/RJALtrBHn2Y2Dx20yhvqH6QB6dAE4cQvIekD43CLx8XARSBrEJEP/OZwIVRPWrA6QJUNvFVTuAkedFVhIs3ATYsCit0+UykDxEA2BOoP7KKkHaAGo5/buAbY8E2VAFDIAlnQQgOYgFgFaIVVmkD2CVIAsArTqRIMMQLQCdEDsFyQCsAqQFoFMnAqQfogOgF2IsSAnATkA6AHp1CoB0Q/QADEKUgvzjG2DuE8qNlQpJfKQHYFAnD0g7xADAoEDJZLM0DZx5Pw6grjWwBxi6399GACClkwNkGSIBkBLIgKwCoJaz/Qlgy212kARAVbH/GLD4cKA/LSDzEEmAIoiuoV0lQB9IEqBIpwLINkQBQJFAm0XWAdAGUgBQrJMBMoMoBCgWaIK879HOfWDIg6qh/cVHja2c5JfbhTEVmyAziMdexYMvvoLPzjE1uTLjQ1k5aZvju7dn9U6c8Qoa3HIF5pf+4T6GKDXYB8wvEwULRcbvGDECEHWavhKszX9gOIvMLFfYY6ZiOlCxMNcIlKh9PvsTW2Jzq5ufWAQgRQKLM5oOcVUNcvM1wM0vtUNmQjcl0smIFZSXOCRIWqBrkVo1yE19wOh+oG8gb3gCkNQSx7LasC+2CZAUxNC+8+JfwE+vA5cinJGJygVQlyFBUjpZolXubV8AZLDXQgC1gssLwOxUPMgQQAHIIERHuM8fgIjZrJuTCBtmjwXJAiRBeiF64qXhUJgkbBQDMNYipQAJkE6IgYBzGKISzgQwOwEoBRkLMADSCpGI2HMQLSBLAlkfGFq0MUPbF2wIte8BWdKJAKia4yEWQOYEVgVQK/j3WWD2TTuOKgA6QMYevskgGiBjT8ZYQ4EtSFElQAvI1oqDtEDdhBxiE2TjoDvijJaGqAqaIOsAWADZOEuPuJAQB1H5gSRBOvcDsHWniIu4sAKpfq6Aq7hBR4XfTiIZvhUxt2riIC5NI+m/HemPb9R3K6EqOEw7zS1ocssLSBe/F3eYHGJziCV3TiH9Tu1Vh4Ab9gKbr2Y+d+2VMfbwLZ2ErkMG0fBRLYEKS6frttVCWwiC5HQSgOQhFmbLnMD1CFKtR0+/A1z8s9WFJZ2GHwKuvSvYxRxEy3KjJHA9gXQs6PvveReLXz2dh0aca4chnvscWDhe6g0rxPUA0rMjcuoUAOmH6Lna4RS4lkEGtpRenTwg3RADd2O8AjXIHc8AV24L+pQVKUDsyYM6OUDaIRKXi4ICNRnBLFcbTAKgkk3pZAFZhkgApAWuBZBqUpz7lIqcjz3+IWY+eCzclwrk1gdaB2J5iCRAMURVYTUsUnjTYmLqa0zuvzsMUZUw7pBnENWi8/QR4MKvXAOs6RdbW0mQQoBRhtEEmUEUWKDmQvkPW5fsPFj/FlGdIp48SBtERzr172oGZXuW2OAoNoycJequEFikWOBKDmWtj3BIi3Qq+UTT8EmQIoGrAdAEuaKzs8AirftMmxdaTYD6e8h1IjU7U+tEEmTQElV4bEPvWAiQvb1ze9j1ojiGC6oniuOZ5boxnmjVqZJ4ogNkN0a2S3vnSiPbFpDdeMaSm50Fq4qwTywuW3qnfaWFnByiaqJ37pwDGQexdwOiAog66UTvLk4WuBBnIzGTTqgcEFVfq/MFDwTOno6D2fJa1HorzLgxm7v4XjXIrr2f6Es6obq9KpBMsKAKi2TyWpAWyQ3nDXJne+xLYObegiMgQIYhbqDXAxPTwKTt3XlHrwd671jaZhn1jqWTpBMSH8n4QN9Uy17rI56mVfuiqve2z91t1Ns+AmBjgWnmCvNZyjp6ZUrrVAAZ/d45+EDSBLth3juTFqjZ0L2mK3T9y/sackDQ2651XrCdA4KYuYq6ii1RNaB8SddmI1EKCkGKIZrOWHgzQWSs5pawThdVyoujv1IAUgTRtlCtA6RtTy0ASU+WzgxNQpA0RN+WqUqQFeQKo3QK5goTgKQEEpt362tS0fgFsOay1pEggxAZgFpWV+ZPJEDGJp1wGhl5Gy1XnzhYL8mLCapEZ/IMgIxNOuEdqRKQMQC1cEl4jwg2h+OJjuVPbNKJoLtjQHYC0AMyNq8FB9ECsrQckPjAEMmuzLNtGdqxSSdC/Fp/78qM7wWQvf890DYHfjibJtT7Lxi5ARUHEcDYTaOY+XmWHp3RBVfw/7HE6vQ/kFqNtpDetQkAAAAASUVORK5CYII=';

export class DefaultBaseTextureRenderContribution implements IBaseRenderContribution<IGraphic, IGraphicAttribute> {
  time: BaseRenderContributionTime = BaseRenderContributionTime.afterFillStroke;
  useStyle: boolean = true;
  textureMap?: Map<string, CanvasPattern>;
  order: number = 10;

  createCommonPattern(
    size: number,
    padding: number,
    color: string,
    targetContext: IContext2d,
    cb: (r: number, targetContext: IContext2d) => void
  ) {
    const r = (size - padding * 2) / 2;
    const dpr = targetContext.dpr;
    const canvas = canvasAllocate.allocate({ width: size, height: size, dpr });
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return null;
    }
    ctx.inuse = true;
    ctx.clearMatrix();
    ctx.setTransformForCurrent(true);
    ctx.clearRect(0, 0, size, size);
    //setup up design for pattern
    cb(r, ctx);
    const pattern = targetContext.createPattern(canvas.nativeCanvas, 'repeat');
    pattern.setTransform && pattern.setTransform(new DOMMatrix([1 / dpr, 0, 0, 1 / dpr, 0, 0]));

    canvasAllocate.free(canvas);
    return pattern;
  }

  createCirclePattern(size: number, padding: number, color: string, targetContext: IContext2d) {
    return this.createCommonPattern(size, padding, color, targetContext, (r, ctx) => {
      ctx.fillStyle = color;
      ctx.arc(r, r, r, 0, pi2);
      ctx.fill();
    });
  }

  createDiamondPattern(size: number, padding: number, color: string, targetContext: IContext2d) {
    return this.createCommonPattern(size, padding, color, targetContext, (r, ctx) => {
      const x = size / 2;
      const y = x;
      ctx.fillStyle = color;
      ctx.moveTo(x, y - r);
      ctx.lineTo(r + x, y);
      ctx.lineTo(x, y + r);
      ctx.lineTo(x - r, y);
      ctx.closePath();
      ctx.fill();
    });
  }

  createRectPattern(size: number, padding: number, color: string, targetContext: IContext2d) {
    return this.createCommonPattern(size, padding, color, targetContext, (r, ctx) => {
      const x = padding;
      const y = x;
      ctx.fillStyle = color;
      ctx.fillRect(x, y, r * 2, r * 2);
    });
  }

  createVerticalLinePattern(size: number, padding: number, color: string, targetContext: IContext2d) {
    return this.createCommonPattern(size, padding, color, targetContext, (r, ctx) => {
      const x = padding;
      const y = 0;
      ctx.fillStyle = color;
      ctx.fillRect(x, y, r * 2, size);
    });
  }

  createHorizontalLinePattern(size: number, padding: number, color: string, targetContext: IContext2d) {
    return this.createCommonPattern(size, padding, color, targetContext, (r, ctx) => {
      const x = 0;
      const y = padding;
      ctx.fillStyle = color;
      ctx.fillRect(x, y, size, r * 2);
    });
  }

  createBiasLRLinePattern(size: number, padding: number, color: string, targetContext: IContext2d) {
    return this.createCommonPattern(size, padding, color, targetContext, (r, ctx) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = r;
      ctx.moveTo(0, 0);
      ctx.lineTo(size, size);
      const dx = size / 2;
      const dy = -dx;
      ctx.moveTo(dx, dy);
      ctx.lineTo(dx + size, dy + size);
      ctx.moveTo(-dx, -dy);
      ctx.lineTo(-dx + size, -dy + size);
      ctx.stroke();
    });
  }

  createBiasRLLinePattern(size: number, padding: number, color: string, targetContext: IContext2d) {
    return this.createCommonPattern(size, padding, color, targetContext, (r, ctx) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = r;
      ctx.moveTo(size, 0);
      ctx.lineTo(0, size);
      const dx = size / 2;
      const dy = dx;
      ctx.moveTo(size + dx, dy);
      ctx.lineTo(dx, dy + size);
      ctx.moveTo(size - dx, -dy);
      ctx.lineTo(-dx, -dy + size);
      ctx.stroke();
    });
  }

  createGridPattern(size: number, padding: number, color: string, targetContext: IContext2d) {
    return this.createCommonPattern(size, padding, color, targetContext, (r, ctx) => {
      const x = padding;
      const y = x;
      ctx.fillStyle = color;
      ctx.fillRect(x, y, r, r);
      ctx.fillRect(x + r, y + r, r, r);
    });
  }

  initTextureMap(ctx: IContext2d, stage: IStage) {
    this.textureMap = new Map();
    // ResourceLoader.GetImage(rect1, {
    //   imageLoadFail: () => {
    //     return;
    //   },
    //   imageLoadSuccess: (url, img) => {
    //     const pattern = ctx.createPattern(img, 'repeat');
    //     this.textureMap.set('rect1', pattern);
    //     stage && stage.renderNextFrame();
    //   }
    // });
  }

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
    if (!this.textureMap) {
      this.initTextureMap(context, graphic.stage);
    }
    const {
      texture = graphicAttribute.texture,
      textureColor = graphicAttribute.textureColor,
      textureSize = graphicAttribute.textureSize,
      texturePadding = graphicAttribute.texturePadding
    } = graphic.attribute;
    if (!texture) {
      return;
    }
    let pattern: CanvasPattern = this.textureMap.get(texture);
    if (!pattern) {
      switch (texture) {
        case 'circle':
          pattern = this.createCirclePattern(textureSize, texturePadding, textureColor, context);
          break;
        case 'diamond':
          pattern = this.createDiamondPattern(textureSize, texturePadding, textureColor, context);
          break;
        case 'rect':
          pattern = this.createRectPattern(textureSize, texturePadding, textureColor, context);
          break;
        case 'vertical-line':
          pattern = this.createVerticalLinePattern(textureSize, texturePadding, textureColor, context);
          break;
        case 'horizontal-line':
          pattern = this.createHorizontalLinePattern(textureSize, texturePadding, textureColor, context);
          break;
        case 'bias-lr':
          pattern = this.createBiasLRLinePattern(textureSize, texturePadding, textureColor, context);
          break;
        case 'bias-rl':
          pattern = this.createBiasRLLinePattern(textureSize, texturePadding, textureColor, context);
          break;
        case 'grid':
          pattern = this.createGridPattern(textureSize, texturePadding, textureColor, context);
          break;
      }
    }

    if (pattern) {
      context.highPerformanceSave();
      context.setCommonStyle(graphic, graphic.attribute, x, y, graphicAttribute);
      context.fillStyle = pattern;
      context.fill();
      context.highPerformanceRestore();
    }
  }
}

export const defaultBaseTextureRenderContribution = new DefaultBaseTextureRenderContribution();
