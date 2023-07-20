import { injectable } from 'inversify';
import type {
  IContext2d,
  IGraphic,
  IGraphicAttribute,
  IInteractiveSubRenderContribution,
  IThemeAttribute,
  IDrawContext
} from '@visactor/vrender';
import { PopTip } from './poptip';
import { merge } from '@visactor/vutils';

function wrapPoptip(target: Record<string, any>, source: Record<string, any>) {
  const theme = {
    visible: true,
    position: 'top',
    titleStyle: {
      fontSize: 16,
      fill: '#08979c'
    },
    contentStyle: {
      fontSize: 12,
      fill: 'green'
    },
    panel: {
      visible: true,

      fill: '#e6fffb',

      stroke: '#87e8de',
      lineWidth: 1,
      cornerRadius: 4
    }
  };
  merge(target, theme, source);
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
      if (!this.poptipComponent) {
        this.poptipComponent = new PopTip((graphic.attribute as any).poptip);
      }
      // 如果text图元没有配置title的话
      let poptip = (graphic.attribute as any).poptip || {};
      if (graphic.type === 'text' && poptip.title == null && poptip.content == null) {
        const out = {};
        wrapPoptip(out, poptip);
        poptip = out;
        poptip.title = poptip.title ?? (graphic.attribute as any).text;
      }
      this.poptipComponent.setAttributes({
        visibleAll: true,
        ...poptip,
        x: 0,
        y: 0,
        postMatrix: graphic.globalTransMatrix
      });
      // 添加到交互层中
      const interactiveLayer = drawContext.stage.getLayer('_builtin_interactive');
      if (interactiveLayer) {
        interactiveLayer.add(this.poptipComponent);
      }
    } else if (graphic._showPoptip === 2) {
      graphic._showPoptip = 0;
      this.poptipComponent.setAttributes({
        visibleAll: false
      });
    }
  }
}
