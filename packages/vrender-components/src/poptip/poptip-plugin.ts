import type { FederatedPointerEvent, IGraphic, IPlugin, IPluginService } from '@visactor/vrender-core';
import { Generator, injectable } from '@visactor/vrender-core';

// _showPoptip: 0-没有，1-添加，2-删除

export abstract class PopTipPluginBase {
  activeEvent: 'onRegister' = 'onRegister';
  pluginService: IPluginService;
  _uid: number = Generator.GenAutoIncrementId();
  activeGraphic: IGraphic;

  activate(context: IPluginService): void {
    this.pluginService = context;
    const { stage } = this.pluginService;

    stage.addEventListener('pointerover', this.poptip);
  }

  needHide(graphic: IGraphic) {
    return graphic.isContainer || !graphic.attribute;
  }

  needShow(graphic: IGraphic) {
    return !!(graphic.attribute as any).poptip;
  }

  poptip = (e: FederatedPointerEvent) => {
    const graphic = e.target as any;
    if (this.needHide(graphic)) {
      this.unpoptip(e);
      return;
    }
    // 触发graphic重绘
    if (graphic === this.activeGraphic) {
      return;
    }
    if (this.needShow(graphic)) {
      graphic.setAttributes({});
      graphic._showPoptip = 1;
    }

    if (this.activeGraphic) {
      this.activeGraphic.setAttributes({});
      this.activeGraphic._showPoptip = 2;
    }
    // console.log(graphic)
    this.setActiveGraphic(graphic, true);
  };

  unpoptip = (e: FederatedPointerEvent) => {
    if (!this.activeGraphic) {
      return;
    }
    this.activeGraphic.setAttributes({});
    this.activeGraphic._showPoptip = 2;
    this.setActiveGraphic(null, true);
  };

  setActiveGraphic(graphic: any | null, rerender?: boolean) {
    this.activeGraphic = graphic;
    // 触发重绘
    this.pluginService.stage.renderNextFrame();
  }

  deactivate(context: IPluginService): void {
    const { stage } = this.pluginService;
    stage.removeEventListener('pointerover', this.poptip);
  }
}

@injectable()
export class PopTipPlugin extends PopTipPluginBase implements IPlugin {
  name: 'poptip' = 'poptip';
  key: string = this.name + this._uid;
}

@injectable()
export class PopTipForClipedTextPlugin extends PopTipPluginBase implements IPlugin {
  name: 'poptipForText' = 'poptipForText';
  key: string = this.name + this._uid;

  activate(context: IPluginService): void {
    super.activate(context);

    const { stage } = this.pluginService;

    stage.addEventListener('pointerleave', this.pointerlave);
  }
  pointerlave = (e: any) => {
    const { stage } = this.pluginService;
    if (e.target === stage) {
      this.unpoptip(e);
    }
  };

  needHide(graphic: IGraphic) {
    return (
      graphic.type !== 'text' ||
      !graphic.cliped ||
      graphic.isContainer ||
      !graphic.attribute ||
      (graphic as any).attribute.disableAutoClipedPoptip
    );
  }
  needShow(graphic: IGraphic): boolean {
    return true;
  }

  deactivate(context: IPluginService): void {
    const { stage } = this.pluginService;
    super.deactivate(context);
    stage.removeEventListener('pointerleave', this.pointerlave);
  }
}
