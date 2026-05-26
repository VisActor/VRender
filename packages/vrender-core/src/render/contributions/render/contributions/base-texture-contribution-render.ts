import { canvasAllocate } from '../../../../allocator/canvas-allocate';
import { BaseRenderContributionTime } from '../../../../common/enums';
import { createSymbol } from '../../../../graphic';
import type {
  IBaseRenderContribution,
  ICanvas,
  IContext2d,
  IDrawContext,
  IGraphic,
  IGraphicAttribute,
  IStage,
  ISymbol,
  IThemeAttribute
} from '../../../../interface';
import { pi2 } from '@visactor/vutils';

// 仅这些内置纹理会通过程序绘制 tile，且会受 size/padding/color 影响
const builtinProceduralTextureTypes = new Set([
  'circle',
  'diamond',
  'rect',
  'vertical-line',
  'horizontal-line',
  'bias-lr',
  'bias-rl',
  'grid'
]);

function formatRatio(ratio: number) {
  if (ratio <= 0.5) {
    return ratio * 4 - 1;
  }
  return -4 * ratio + 3;
}

function drawWave(
  ctx: IContext2d,
  ratio: number,
  boundsWidth: number,
  boundsHeight: number,
  textureOptions: {
    fill?: string;
    percent?: number;
    frequency?: number;
    amplitude?: number;
    opacity?: number;
    phi?: number;
  },
  offsetX: number,
  offsetY: number
) {
  const { fill = 'orange', percent = 0.6, frequency = 4, opacity, phi = 0 } = textureOptions;
  let { amplitude = 10 } = textureOptions;
  amplitude = amplitude * formatRatio(ratio);

  const height = boundsHeight * (1 - percent);
  const width = boundsWidth;

  const step = Math.max(Math.round(width / 70), 2);
  ctx.beginPath();
  ctx.moveTo(0 + offsetX, boundsHeight + offsetY);
  ctx.lineTo(0 + offsetX, height + offsetY);
  const delta = (width / frequency) * ratio;
  const c = width / Math.PI / (frequency * 2);

  for (let i = 0; i < width; i += step) {
    const y = amplitude * Math.sin((i + delta + phi) / c + phi);
    ctx.lineTo(i + offsetX, height + y + offsetY);
  }

  ctx.lineTo(width + offsetX, boundsHeight + offsetY);
  ctx.closePath();

  ctx.fillStyle = fill;
  if (isFinite(opacity)) {
    ctx.globalAlpha = opacity;
  }
  ctx.fill();
}

export class DefaultBaseTextureRenderContribution implements IBaseRenderContribution<IGraphic, IGraphicAttribute> {
  time: BaseRenderContributionTime = BaseRenderContributionTime.afterFillStroke;
  useStyle: boolean = true;
  textureMap?: Map<string | HTMLImageElement | HTMLCanvasElement, CanvasPattern>;
  order: number = 10;
  _tempSymbolGraphic: ISymbol | null = null;

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
    texture: string | HTMLImageElement | HTMLCanvasElement,
    graphic: IGraphic,
    context: IContext2d,
    x: number,
    y: number,
    graphicAttribute: Required<IGraphicAttribute>,
    textureColor: string,
    textureSize: number,
    texturePadding: number
  ) {
    const { textureRatio = graphicAttribute.textureRatio, textureOptions = null } = graphic.attribute;
    let pattern: CanvasPattern = null;
    const textureRadius = textureOptions?.radius ?? 0;
    const patternKey = this.getPatternCacheKey(
      texture,
      textureSize,
      texturePadding,
      textureColor,
      context.dpr,
      textureRadius
    );
    if (patternKey !== null) {
      pattern = this.textureMap.get(patternKey);
    }

    if (!pattern) {
      if (typeof texture === 'string') {
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
      if (!pattern) {
        pattern = this.createResourcePattern(texture, graphic, context, texturePadding, textureRadius);
      }
      if (pattern && patternKey !== null) {
        this.textureMap.set(patternKey, pattern);
      }
    }

    if (typeof texture === 'string' && textureOptions && textureOptions.dynamicTexture) {
      // 动态纹理
      const { gridConfig = {}, useNewCanvas } = textureOptions;
      const b = graphic.AABBBounds;
      x = b.x1;
      y = b.y1;
      const originalContext = context;

      let newCanvas: ICanvas;
      if (useNewCanvas) {
        newCanvas = canvasAllocate.allocate({ width: b.width(), height: b.height(), dpr: context.dpr });
        const ctx = newCanvas.getContext('2d');
        ctx.clearRect(0, 0, b.width(), b.height());
        x = 0;
        y = 0;
        context = ctx;
      }
      originalContext.save();
      // 避免本级已经transform过了，再用Bounds就重复了
      if (graphic.parent && !graphic.transMatrix.onlyTranslate()) {
        const { scrollX = 0, scrollY = 0 } = graphic.parent.attribute;
        originalContext.setTransformFromMatrix(graphic.parent.globalTransMatrix);
        originalContext.translate(scrollX, scrollY, true);
      }
      originalContext.setCommonStyle(graphic, graphic.attribute, x, y, graphicAttribute);
      originalContext.clip();

      const width = b.width();
      const height = b.height();
      const padding = texturePadding;
      const cellSize = textureSize;
      const gridColumns = gridConfig.columns ? gridConfig.columns : Math.ceil(width / cellSize);
      const gridRows = gridConfig.rows ? gridConfig.rows : Math.ceil(height / cellSize);
      const gutterColumn = gridConfig.gutterColumn ? gridConfig.gutterColumn : padding * 2;
      const gutterRow = gridConfig.gutterRow ? gridConfig.gutterRow : padding * 2;
      if (!this._tempSymbolGraphic) {
        this._tempSymbolGraphic = createSymbol({});
      }
      const sizeW = gridConfig.columns ? width / gridConfig.columns : cellSize;
      const sizeH = gridConfig.rows ? height / gridConfig.rows : cellSize;
      this._tempSymbolGraphic.setAttributes({
        size: [sizeW - gutterColumn, sizeH - gutterRow],
        symbolType: texture
      });
      const parsedPath = this._tempSymbolGraphic.getParsedPath();
      for (let i = 0; i < gridRows; i++) {
        for (let j = 0; j < gridColumns; j++) {
          const _x = x + cellSize / 2 + j * cellSize;
          const _y = y + cellSize / 2 + i * cellSize;
          textureOptions.beforeDynamicTexture?.(
            context,
            i,
            j,
            gridRows,
            gridColumns,
            textureRatio,
            graphic,
            b.width(),
            b.height()
          );
          context.beginPath();
          if (parsedPath.draw(context, Math.min(sizeW - gutterColumn, sizeH - gutterRow), _x, _y, 0) === false) {
            context.closePath();
          }
          context.fillStyle = textureColor;
          textureOptions.dynamicTexture(
            context,
            i,
            j,
            gridRows,
            gridColumns,
            textureRatio,
            graphic,
            b.width(),
            b.height()
          );
        }
      }
      if (useNewCanvas) {
        // 不使用外部的opacity，动态纹理的opacity自己设置
        originalContext.globalAlpha = 1;
        originalContext.drawImage(
          newCanvas.nativeCanvas,
          0,
          0,
          newCanvas.nativeCanvas.width,
          newCanvas.nativeCanvas.height,
          b.x1,
          b.y1,
          b.width() * originalContext.dpr,
          b.height() * originalContext.dpr
        );
      }

      originalContext.restore();
    } else if (pattern) {
      if (pattern.setTransform) {
        const alignToGraphic = !!textureOptions?.alignToGraphic;
        const alignOffsetX = textureOptions?.alignOffsetX ?? 0;
        const alignOffsetY = textureOptions?.alignOffsetY ?? 0;
        let translateX = 0;
        let translateY = 0;
        if (alignToGraphic) {
          // 将 pattern 原点对齐到图形的绘制原点（当前 context 坐标系）
          const m = context.currentMatrix;
          const e = m?.e ?? 0;
          const f = m?.f ?? 0;
          // 直接在用户坐标系下对齐（包含 context 的平移）
          const ux = e + x + alignOffsetX;
          const uy = f + y + alignOffsetY;
          translateX = ux;
          translateY = uy;
        } else if (alignOffsetX || alignOffsetY) {
          translateX = alignOffsetX;
          translateY = alignOffsetY;
        }
        // pattern 的 transform 使用用户坐标系单位（不再额外乘 dpr）
        pattern.setTransform(new DOMMatrix([1 / context.dpr, 0, 0, 1 / context.dpr, translateX, translateY]));
      }
      context.highPerformanceSave();
      context.setCommonStyle(graphic, graphic.attribute, x, y, graphicAttribute);
      context.fillStyle = pattern;
      context.fill();
      context.highPerformanceRestore();
    } else if (texture === 'wave') {
      context.save();
      context.setCommonStyle(graphic, graphic.attribute, x, y, graphicAttribute);
      context.clip();
      const b = graphic.AABBBounds;
      drawWave(
        context,
        textureRatio,
        b.width(),
        b.height(),
        { ...(textureOptions || {}), fill: textureColor },
        x + b.x1 - x,
        y + b.y1 - y
      );
      context.restore();
    }
  }

  protected getPatternCacheKey(
    texture: string | HTMLImageElement | HTMLCanvasElement,
    textureSize: number,
    texturePadding: number,
    textureColor: string,
    dpr: number,
    textureRadius: number
  ) {
    if (typeof texture !== 'string') {
      // 图片纹理在有 padding / 圆角时会生成新的 tile，避免缓存冲突
      return texturePadding > 0 || textureRadius > 0 ? null : texture;
    }
    if (texture === 'wave') {
      return null;
    }
    if (builtinProceduralTextureTypes.has(texture)) {
      // 内置纹理：纹理参数变化会改变 pattern 内容，使用完整 key
      return `builtin:${texture}|size:${textureSize}|padding:${texturePadding}|color:${textureColor}|dpr:${dpr}`;
    }
    // 资源纹理（url/svg/base64）：size/color 不参与 pattern 生成，避免冗余缓存；
    // 但 padding/radius 会改变最终 tile，需要保留在 key 中
    return `resource:${texture}|padding:${texturePadding}|radius:${textureRadius}|dpr:${dpr}`;
  }

  protected createResourcePattern(
    texture: string | HTMLImageElement | HTMLCanvasElement,
    graphic: IGraphic,
    context: IContext2d,
    texturePadding: number,
    textureRadius: number
  ) {
    const resource = graphic.resources?.get(texture as any);
    const data = resource?.state === 'success' ? resource.data : typeof texture === 'object' ? texture : null;
    if (!data) {
      return null;
    }
    if (texturePadding > 0 || textureRadius > 0) {
      const w = (data as HTMLImageElement).naturalWidth || (data as HTMLCanvasElement).width;
      const h = (data as HTMLImageElement).naturalHeight || (data as HTMLCanvasElement).height;
      if (w > 0 && h > 0) {
        const tileW = w + texturePadding * 2;
        const tileH = h + texturePadding * 2;
        const canvas = canvasAllocate.allocate({ width: tileW, height: tileH, dpr: context.dpr });
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.inuse = true;
          ctx.clearMatrix();
          ctx.setTransformForCurrent(true);
          ctx.clearRect(0, 0, tileW, tileH);
          if (textureRadius > 0) {
            // 先裁剪出图案本身的圆角矩形（不包含四周 padding）
            const r = Math.max(0, Math.min(textureRadius, Math.min(w, h) / 2));
            const x0 = texturePadding;
            const y0 = texturePadding;
            const x1 = x0 + w;
            const y1 = y0 + h;
            ctx.beginPath();
            ctx.moveTo(x0 + r, y0);
            ctx.lineTo(x1 - r, y0);
            ctx.quadraticCurveTo(x1, y0, x1, y0 + r);
            ctx.lineTo(x1, y1 - r);
            ctx.quadraticCurveTo(x1, y1, x1 - r, y1);
            ctx.lineTo(x0 + r, y1);
            ctx.quadraticCurveTo(x0, y1, x0, y1 - r);
            ctx.lineTo(x0, y0 + r);
            ctx.quadraticCurveTo(x0, y0, x0 + r, y0);
            ctx.closePath();
            ctx.clip();
          }
          // 在四周留出 padding 间隙
          ctx.drawImage(data as any, texturePadding, texturePadding, w, h);
          const pattern = context.createPattern(canvas.nativeCanvas as any, 'repeat');
          pattern?.setTransform && pattern.setTransform(new DOMMatrix([1 / context.dpr, 0, 0, 1 / context.dpr, 0, 0]));
          canvasAllocate.free(canvas);
          return pattern;
        }
        canvasAllocate.free(canvas);
      }
    }
    const pattern = context.createPattern(data as any, 'repeat');
    pattern?.setTransform && pattern.setTransform(new DOMMatrix([1 / context.dpr, 0, 0, 1 / context.dpr, 0, 0]));
    return pattern;
  }
}

export const defaultBaseTextureRenderContribution = new DefaultBaseTextureRenderContribution();
