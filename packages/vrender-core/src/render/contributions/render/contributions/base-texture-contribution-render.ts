import { canvasAllocate } from '../../../../allocator/canvas-allocate';
import { BaseRenderContributionTime } from '../../../../common/enums';
import type {
  IBaseRenderContribution,
  IContext2d,
  IDrawContext,
  IGraphic,
  IGraphicAttribute,
  IStage,
  IThemeAttribute
} from '../../../../interface';
import { pi2 } from '@visactor/vutils';

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
    this.drawTexture(texture, graphic, context, x, y, graphicAttribute, textureColor, textureSize, texturePadding);
  }

  protected drawTexture(
    texture: string,
    graphic: IGraphic,
    context: IContext2d,
    x: number,
    y: number,
    graphicAttribute: Required<IGraphicAttribute>,
    textureColor: string,
    textureSize: number,
    texturePadding: number
  ) {
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
