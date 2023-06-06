import { injectable } from 'inversify';
import {
  IGraphicAttribute,
  IContext2d,
  IMarkAttribute,
  ISymbol,
  ISymbolGraphicAttribute,
  IThemeAttribute,
  IArea,
  IAreaGraphicAttribute
} from '../../../../interface';
import { getAttributeFromDefaultAttrList, getScaledStroke } from '../../../../common';
import {
  BaseRenderContributionTime,
  DefaultBaseBackgroundRenderContribution,
  DefaultBaseTextureRenderContribution,
  IBaseRenderContribution
} from './base-contribution-render';

export const AreaRenderContribution = Symbol.for('AreaRenderContribution');

export interface IAreaRenderContribution extends IBaseRenderContribution {
  drawShape: (
    area: IArea,
    context: IContext2d,
    x: number,
    y: number,
    doFill: boolean,
    doStroke: boolean,
    fVisible: boolean,
    sVisible: boolean,
    areaAttribute: Required<IAreaGraphicAttribute>,
    fillCb?: (
      ctx: IContext2d,
      markAttribute: Partial<IMarkAttribute & IGraphicAttribute>,
      themeAttribute: IThemeAttribute
    ) => boolean,
    strokeCb?: (
      ctx: IContext2d,
      markAttribute: Partial<IMarkAttribute & IGraphicAttribute>,
      themeAttribute: IThemeAttribute
    ) => boolean,
    options?: {
      attribute?: Partial<IAreaGraphicAttribute>;
    }
  ) => void;
}

@injectable()
export class DefaultAreaBackgroundRenderContribution
  extends DefaultBaseBackgroundRenderContribution
  implements IAreaRenderContribution
{
  time: BaseRenderContributionTime = BaseRenderContributionTime.beforeFillStroke;
}

@injectable()
export class DefaultAreaTextureRenderContribution
  extends DefaultBaseTextureRenderContribution
  implements IAreaRenderContribution
{
  time: BaseRenderContributionTime = BaseRenderContributionTime.afterFillStroke;

  drawShape(
    graphic: IArea,
    context: IContext2d,
    x: number,
    y: number,
    doFill: boolean,
    doStroke: boolean,
    fVisible: boolean,
    sVisible: boolean,
    graphicAttribute: Required<IGraphicAttribute>,
    fillCb?: (ctx: IContext2d, markAttribute: Partial<IGraphicAttribute>, themeAttribute: IThemeAttribute) => boolean,
    strokeCb?: (ctx: IContext2d, markAttribute: Partial<IGraphicAttribute>, themeAttribute: IThemeAttribute) => boolean,
    options?: {
      attribute?: Partial<IAreaGraphicAttribute>;
    }
  ) {
    if (!this.textureMap) {
      this.initTextureMap(context, graphic.stage);
    }

    const { attribute = graphic.attribute } = options || {};

    const {
      texture = graphic.attribute.texture ?? getAttributeFromDefaultAttrList(graphicAttribute, 'texture'),
      textureColor = graphic.attribute.textureColor ??
        getAttributeFromDefaultAttrList(graphicAttribute, 'textureColor'),
      textureSize = graphic.attribute.textureSize ?? getAttributeFromDefaultAttrList(graphicAttribute, 'textureSize'),
      texturePadding = graphic.attribute.texturePadding ??
        getAttributeFromDefaultAttrList(graphicAttribute, 'texturePadding')
    } = attribute;
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
