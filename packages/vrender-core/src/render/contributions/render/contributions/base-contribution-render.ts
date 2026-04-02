import type {
  IGraphicAttribute,
  BackgroundSizing,
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
      backgroundKeepAspectRatio = graphicAttribute.backgroundKeepAspectRatio,
      backgroundScale = graphicAttribute.backgroundScale,
      backgroundOffsetX = graphicAttribute.backgroundOffsetX,
      backgroundOffsetY = graphicAttribute.backgroundOffsetY,
      backgroundClip = graphicAttribute.backgroundClip,
      backgroundPosition = graphicAttribute.backgroundPosition
    } = graphic.attribute;
    if (!background) {
      return;
    }

    if (graphic.backgroundImg && graphic.resources) {
      const res = graphic.resources.get(getBackgroundImage(background) as any);
      if (!res || res.state !== 'success' || !res.data) {
        return;
      }

      context.save();

      if (graphic.parent && !graphic.transMatrix.onlyTranslate()) {
        const groupAttribute = getTheme(graphic.parent).group;
        const { scrollX = groupAttribute.scrollX, scrollY = groupAttribute.scrollY } = graphic.parent.attribute;
        context.setTransformFromMatrix(graphic.parent.globalTransMatrix, true);
        context.translate(scrollX, scrollY);
      }
      backgroundClip && context.clip();
      const b = graphic.AABBBounds;
      context.setCommonStyle(graphic, graphic.attribute, x, y, graphicAttribute);
      context.globalAlpha = backgroundOpacity * opacity;
      this.doDrawImage(context, res.data, b, {
        backgroundMode,
        backgroundFit,
        backgroundKeepAspectRatio,
        backgroundScale,
        backgroundOffsetX,
        backgroundOffsetY,
        backgroundPosition
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

  protected doDrawImage(context: IContext2d, data: any, b: IBounds, params: IBackgroundImageDrawParams): void {
    drawBackgroundImage(context, data, b, params);
  }
}

export const defaultBaseBackgroundRenderContribution = new DefaultBaseBackgroundRenderContribution();

export type IBackgroundImageDrawParams = {
  backgroundMode: IGraphicAttribute['backgroundMode'];
  backgroundFit: boolean;
  backgroundKeepAspectRatio: boolean;
  backgroundScale?: number;
  backgroundOffsetX?: number;
  backgroundOffsetY?: number;
  backgroundPosition?: IGraphicAttribute['backgroundPosition'];
};

type BackgroundPositionValue = number | string;

const verticalPositionKeywords = new Set(['top', 'center', 'bottom']);

export function getBackgroundImage(background: any) {
  return background?.background ?? background;
}

export function resolveBackgroundSizing({
  backgroundFit,
  backgroundKeepAspectRatio
}: Pick<IBackgroundImageDrawParams, 'backgroundFit' | 'backgroundKeepAspectRatio'>): NonNullable<BackgroundSizing> {
  if (backgroundFit) {
    return backgroundKeepAspectRatio ? 'cover' : 'fill';
  }
  return 'auto';
}

export function isNoRepeatSizingMode(
  mode: IGraphicAttribute['backgroundMode']
): mode is Extract<IGraphicAttribute['backgroundMode'], `no-repeat-${string}`> {
  return typeof mode === 'string' && mode.startsWith('no-repeat-');
}

const NO_REPEAT_SIZING_MAP: Record<string, BackgroundSizing> = {
  'no-repeat-cover': 'cover',
  'no-repeat-contain': 'contain',
  'no-repeat-fill': 'fill',
  'no-repeat-auto': 'auto'
};

export function resolveBackgroundDrawMode({
  backgroundMode,
  backgroundFit,
  backgroundKeepAspectRatio
}: Pick<IBackgroundImageDrawParams, 'backgroundMode' | 'backgroundFit' | 'backgroundKeepAspectRatio'>): {
  backgroundRepeatMode: 'repeat' | 'repeat-x' | 'repeat-y' | 'no-repeat';
  backgroundSizing: BackgroundSizing;
} {
  const sizing = NO_REPEAT_SIZING_MAP[backgroundMode];
  if (sizing) {
    return {
      backgroundRepeatMode: 'no-repeat',
      backgroundSizing: sizing
    };
  }

  return {
    backgroundRepeatMode: backgroundMode as 'repeat' | 'repeat-x' | 'repeat-y' | 'no-repeat',
    backgroundSizing: resolveBackgroundSizing({
      backgroundFit,
      backgroundKeepAspectRatio
    })
  };
}

function isPercentageValue(value: string): boolean {
  return /^-?\d+(\.\d+)?%$/.test(value);
}

function parsePositionToken(
  value: BackgroundPositionValue,
  remainSpace: number,
  startKeyword: 'left' | 'top',
  centerKeyword: 'center',
  endKeyword: 'right' | 'bottom'
): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  const normalizedValue = `${value ?? ''}`.trim().toLowerCase();

  if (!normalizedValue || normalizedValue === startKeyword) {
    return 0;
  }
  if (normalizedValue === centerKeyword) {
    return remainSpace / 2;
  }
  if (normalizedValue === endKeyword) {
    return remainSpace;
  }
  if (isPercentageValue(normalizedValue)) {
    return (remainSpace * parseFloat(normalizedValue)) / 100;
  }

  const parsedValue = Number(normalizedValue);
  if (Number.isFinite(parsedValue)) {
    return parsedValue;
  }

  return 0;
}

function normalizeBackgroundPosition(
  position?: IGraphicAttribute['backgroundPosition']
): [BackgroundPositionValue, BackgroundPositionValue] {
  if (Array.isArray(position)) {
    return [position[0] ?? 'left', position[1] ?? 'top'];
  }

  const normalizedPosition = `${position ?? 'top-left'}`.trim().toLowerCase().replace(/-/g, ' ');
  const tokens = normalizedPosition.split(/\s+/).filter(Boolean);

  if (tokens.length === 0) {
    return ['left', 'top'];
  }

  if (tokens.length === 1) {
    const token = tokens[0];
    if (token === 'center') {
      return ['center', 'center'];
    }
    if (verticalPositionKeywords.has(token)) {
      return ['center', token];
    }
    return [token, 'center'];
  }

  let horizontal: BackgroundPositionValue | undefined;
  let vertical: BackgroundPositionValue | undefined;
  const genericTokens: BackgroundPositionValue[] = [];

  for (let i = 0; i < 2; i++) {
    const token = tokens[i];
    if (token === 'left' || token === 'right') {
      horizontal = token;
      continue;
    }
    if (token === 'top' || token === 'bottom') {
      vertical = token;
      continue;
    }
    genericTokens.push(token);
  }

  if (horizontal == null && genericTokens.length) {
    horizontal = genericTokens.shift();
  }
  if (vertical == null && genericTokens.length) {
    vertical = genericTokens.shift();
  }

  return [horizontal ?? 'left', vertical ?? 'top'];
}

export function resolveBackgroundPosition(
  position: IGraphicAttribute['backgroundPosition'],
  remainWidth: number,
  remainHeight: number
) {
  const [horizontalPosition, verticalPosition] = normalizeBackgroundPosition(position);
  return {
    x: parsePositionToken(horizontalPosition, remainWidth, 'left', 'center', 'right'),
    y: parsePositionToken(verticalPosition, remainHeight, 'top', 'center', 'bottom')
  };
}

function pickRenderableDimension(...values: any[]): number | null {
  for (const value of values) {
    if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
      return value;
    }
  }
  return null;
}

export function resolveRenderableImageSize(data: any): { width: number; height: number } | null {
  if (!data) {
    return null;
  }

  // DOM image-like resources may expose intrinsic size on naturalWidth/videoWidth
  // while width/height stays 0, so prefer intrinsic dimensions when available.
  const width = pickRenderableDimension(data.naturalWidth, data.videoWidth, data.width);
  const height = pickRenderableDimension(data.naturalHeight, data.videoHeight, data.height);

  if (width == null || height == null) {
    return null;
  }

  return { width, height };
}

export function drawBackgroundImage(
  context: IContext2d,
  data: any,
  b: IBounds,
  params: IBackgroundImageDrawParams
): void {
  const {
    backgroundMode,
    backgroundFit,
    backgroundKeepAspectRatio,
    backgroundScale = 1,
    backgroundOffsetX = 0,
    backgroundOffsetY = 0,
    backgroundPosition = 'top-left'
  } = params;
  const targetW = b.width();
  const targetH = b.height();
  const sourceSize = resolveRenderableImageSize(data);
  const { backgroundRepeatMode, backgroundSizing: resolvedBackgroundSizing } = resolveBackgroundDrawMode({
    backgroundMode,
    backgroundFit,
    backgroundKeepAspectRatio
  });
  let w = targetW;
  let h = targetH;

  if (targetW <= 0 || targetH <= 0) {
    return;
  }

  if (backgroundRepeatMode === 'no-repeat') {
    let drawWidth = sourceSize?.width ?? targetW;
    let drawHeight = sourceSize?.height ?? targetH;

    if ((resolvedBackgroundSizing === 'cover' || resolvedBackgroundSizing === 'contain') && sourceSize) {
      const scale =
        resolvedBackgroundSizing === 'cover'
          ? Math.max(targetW / sourceSize.width, targetH / sourceSize.height)
          : Math.min(targetW / sourceSize.width, targetH / sourceSize.height);
      drawWidth = sourceSize.width * scale;
      drawHeight = sourceSize.height * scale;
    } else if (resolvedBackgroundSizing === 'fill') {
      drawWidth = targetW;
      drawHeight = targetH;
    }

    drawWidth *= backgroundScale;
    drawHeight *= backgroundScale;

    const { x, y } = resolveBackgroundPosition(backgroundPosition, targetW - drawWidth, targetH - drawHeight);
    context.drawImage(data, b.x1 + x + backgroundOffsetX, b.y1 + y + backgroundOffsetY, drawWidth, drawHeight);
    return;
  }

  // TODO 考虑缓存
  if (backgroundFit && backgroundRepeatMode !== 'repeat' && sourceSize) {
    const resW = sourceSize.width;
    const resH = sourceSize.height;

    if (backgroundRepeatMode === 'repeat-x') {
      // 高度适应
      const ratio = targetH / resH;
      w = resW * ratio;
      h = targetH;
    } else if (backgroundRepeatMode === 'repeat-y') {
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
  const pattern = context.createPattern(data, backgroundRepeatMode);
  pattern.setTransform && pattern.setTransform(new DOMMatrix([1 / dpr, 0, 0, 1 / dpr, 0, 0]));
  context.fillStyle = pattern;
  context.translate(b.x1, b.y1);
  context.fillRect(0, 0, targetW, targetH);
  context.translate(-b.x1, -b.y1);
}

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

export class DefaultBaseClipRenderBeforeContribution implements IBaseRenderContribution<IGraphic, IGraphicAttribute> {
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
    fillCb?: (
      ctx: IContext2d,
      markAttribute: Partial<IGraphicAttribute>,
      themeAttribute: IThemeAttribute,
      final?: boolean
    ) => boolean,
    strokeCb?: (
      ctx: IContext2d,
      markAttribute: Partial<IGraphicAttribute>,
      themeAttribute: IThemeAttribute,
      final?: boolean
    ) => boolean,
    options?: any
  ) {
    const { clipConfig } = graphic.attribute;
    if (!clipConfig) {
      return;
    }
    const clipPath = graphic.getClipPath();
    if (!clipPath) {
      return;
    }
    const draw = !(fillCb || strokeCb);
    const b = graphic.AABBBounds;
    const width = (graphic.attribute as any).width ?? b.width();
    const height = (graphic.attribute as any).height ?? b.height();
    if (draw) {
      context.save();
    }
    context.beginPath();
    if (clipPath.draw(context, [width, height], x + width / 2, y + height / 2, 0) === false) {
      context.closePath();
    }
    if (fillCb) {
      fillCb(context, graphic.attribute, graphicAttribute, true);
    }

    if (draw) {
      context.clip();
    }
  }
}

export const defaultBaseClipRenderBeforeContribution = new DefaultBaseClipRenderBeforeContribution();
export class DefaultBaseClipRenderAfterContribution implements IBaseRenderContribution<IGraphic, IGraphicAttribute> {
  time: BaseRenderContributionTime = BaseRenderContributionTime.afterFillStroke;
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
    const { clipConfig } = graphic.attribute;
    if (!clipConfig) {
      return;
    }
    const clipPath = graphic.getClipPath();
    if (!clipPath) {
      return;
    }
    if (!(fillCb || strokeCb)) {
      context.restore();
    }
  }
}

export const defaultBaseClipRenderAfterContribution = new DefaultBaseClipRenderAfterContribution();
