import type {
  IContext2d,
  IGraphic,
  IGraphicAttribute,
  IInteractiveSubRenderContribution,
  IThemeAttribute,
  IDrawContext
} from '@visactor/vrender-core';
import { injectable } from '@visactor/vrender-core';
import { PopTip } from './poptip';
import { merge } from '@visactor/vutils';
import { theme } from './theme';

function wrapPoptip(target: Record<string, any>, source: Record<string, any>) {
  merge(target, theme.poptip, source);
  return target;
}

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
    if (graphic._showPoptip === 1) {
      const { visible, visibleCb } = (graphic.attribute as any).poptip || {};
      if (visible === false || (visibleCb && visibleCb(graphic) === false)) {
        return;
      }
      const attribute = {};
      merge(
        attribute,
        PopTip.defaultAttributes,
        (graphic.attribute as any).poptip ? (graphic.attribute as any).poptip : {}
      );
      if (!this.poptipComponent) {
        this.poptipComponent = new PopTip(attribute);
      } else {
        this.poptipComponent.initAttributes(attribute);
      }
      // 如果text图元没有配置title和content的话
      let poptip = (graphic.attribute as any).poptip || {};
      if (graphic.type === 'text' && poptip.title == null && poptip.content == null) {
        const out = {};
        wrapPoptip(out, poptip);
        poptip = out;
        poptip.content = poptip.content ?? (graphic.attribute as any).text;
      }
      const matrix = graphic.globalTransMatrix;
      this.poptipComponent.setAttributes({
        visibleAll: true,
        pickable: false,
        childrenPickable: false,
        ...poptip,
        x: matrix.e,
        y: matrix.f
      });
      // 添加到交互层中
      drawContext.stage.tryInitInteractiveLayer();
      const interactiveLayer = drawContext.stage.getLayer('_builtin_interactive');
      if (interactiveLayer) {
        interactiveLayer.add(this.poptipComponent);
      }
    } else if (graphic._showPoptip === 2) {
      graphic._showPoptip = 0;
      if (this.poptipComponent) {
        this.poptipComponent.setAttributes({
          visibleAll: false
        });
        this.poptipComponent.parent?.removeChild(this.poptipComponent);
        this.poptipComponent = null;
      }
    }
  }
}
