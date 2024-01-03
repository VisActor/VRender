import { BaseRenderContributionTime } from '../../../../common/enums';
import type {
  IArcGraphicAttribute,
  IArea,
  IAreaRenderContribution,
  IContext2d,
  IDrawContext,
  IGraphicAttribute,
  IThemeAttribute
} from '../../../../interface';
import { DefaultBaseTextureRenderContribution } from './base-texture-contribution-render';
import { getAttributeFromDefaultAttrList } from '../../../../common/utils';

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
    drawContext: IDrawContext,
    fillCb?: (ctx: IContext2d, markAttribute: Partial<IGraphicAttribute>, themeAttribute: IThemeAttribute) => boolean,
    strokeCb?: (ctx: IContext2d, markAttribute: Partial<IGraphicAttribute>, themeAttribute: IThemeAttribute) => boolean,
    options?: {
      attribute?: Partial<IArcGraphicAttribute>;
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
    this.drawTexture(texture, graphic, context, x, y, graphicAttribute, textureColor, textureSize, texturePadding);
  }
}
