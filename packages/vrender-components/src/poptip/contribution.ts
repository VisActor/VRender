import { injectable } from 'inversify';
import type {
  IContext2d,
  IGraphic,
  IGraphicAttribute,
  IInteractiveSubRenderContribution,
  IThemeAttribute,
  IDrawContext
} from '@visactor/vrender/src/index';
import { PopTip } from './poptip';

@injectable()
export class PopTipRenderContribution implements IInteractiveSubRenderContribution {
  declare poptipComponent: PopTip;
  render(
    graphic: IGraphic<Partial<IGraphicAttribute>>,
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
  ): void {
    if (graphic._showPoptip) {
      const { visible, visibleCb } = (graphic.attribute as any).poptip;
      if (visible === false || (visibleCb && visibleCb(graphic) === false)) {
        return;
      }
      if (!this.poptipComponent) {
        this.poptipComponent = new PopTip((graphic.attribute as any).poptip);
      }
      this.poptipComponent.setAttributes({
        ...(graphic.attribute as any).poptip,
        x,
        y
      });
      drawContext.drawContribution && drawContext.drawContribution.renderGroup(this.poptipComponent, drawContext);
    }
  }
}
