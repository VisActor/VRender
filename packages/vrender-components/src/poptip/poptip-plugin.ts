import type { FederatedPointerEvent, IGraphic, IPlugin, IPluginService } from '@visactor/vrender-core';
import { Generator, injectable } from '@visactor/vrender-core';

// _showPoptip: 0-没有，1-添加，2-删除

@injectable()
export class PopTipPlugin implements IPlugin {
  name: 'poptip' = 'poptip';
  activeEvent: 'onRegister' = 'onRegister';
  pluginService: IPluginService;
  _uid: number = Generator.GenAutoIncrementId();
  key: string = this.name + this._uid;
  activeGraphic: IGraphic;

  activate(context: IPluginService): void {
    this.pluginService = context;
    const { stage } = this.pluginService;

    stage.addEventListener('pointerover', this.poptip);
  }
  poptip = (e: FederatedPointerEvent) => {
    const graphic = e.target as any;
    if (graphic.isContainer || !graphic.attribute) {
      this.unpoptip(e);
      return;
    }
    // 触发graphic重绘
    if (graphic === this.activeGraphic) {
      return;
    }
    const { poptip } = graphic.attribute;
    if (poptip) {
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
export class PopTipForClipedTextPlugin implements IPlugin {
  name: 'poptipForText' = 'poptipForText';
  activeEvent: 'onRegister' = 'onRegister';
  pluginService: IPluginService;
  _uid: number = Generator.GenAutoIncrementId();
  key: string = this.name + this._uid;
  activeGraphic: IGraphic;

  activate(context: IPluginService): void {
    this.pluginService = context;
    const { stage } = this.pluginService;

    stage.addEventListener('pointerover', this.poptip);
    stage.addEventListener('pointerleave', this.pointerlave);
  }
  pointerlave = (e: any) => {
    const { stage } = this.pluginService;
    if (e.target === stage) {
      this.unpoptip(e);
    }
  };
  poptip = (e: FederatedPointerEvent) => {
    const graphic = e.target as any;
    if (
      graphic.type !== 'text' ||
      !graphic.cliped ||
      graphic.isContainer ||
      !graphic.attribute ||
      graphic.attribute.disableAutoClipedPoptip
    ) {
      this.unpoptip(e);
      return;
    }
    // 触发graphic重绘
    if (graphic === this.activeGraphic) {
      return;
    }
    const { poptip = {} } = graphic.attribute;
    if (poptip) {
      graphic.setAttributes({});
      graphic._showPoptip = 1;
    }
    // 添加默认poptip
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
    stage.removeEventListener('pointerleave', this.pointerlave);
  }
}
