// import type { FederatedPointerEvent } from '../../event';
// import { Generator } from '../../common/generator';
// import type { IGraphic, IPlugin, IPluginService } from '../../interface';

// export class PopTipPlugin implements IPlugin {
//   name: 'PopTipPlugin' = 'PopTipPlugin';
//   activeEvent: 'onRegister' = 'onRegister';
//   pluginService: IPluginService;
//   _uid: number = Generator.GenAutoIncrementId();
//   key: string = this.name + this._uid;
//   activeGraphic: IGraphic;

//   activate(context: IPluginService): void {
//     this.pluginService = context;
//     const { stage } = this.pluginService;

//     stage.addEventListener('pointerover', this.poptip);
//   }
//   poptip = (e: FederatedPointerEvent) => {
//     const graphic = e.target as any;
//     if (graphic.isContainer || !graphic.attribute || graphic === this.activeGraphic) {
//       this.unpoptip(e);
//       return;
//     }
//     const { poptip } = graphic.attribute;
//     if (poptip) {
//       graphic._showPoptip = true;
//     }

//     if (this.activeGraphic) {
//       this.activeGraphic._showPoptip = false;
//     }
//     console.log(graphic)
//     this.setActiveGraphic(graphic, true);
//   }

//   unpoptip = (e: FederatedPointerEvent) => {
//     if (!this.activeGraphic) {
//       return;
//     }
//     this.activeGraphic._showPoptip = false;
//     this.setActiveGraphic(null, true);
//   }

//   setActiveGraphic(graphic: any | null, rerender?: boolean) {
//     this.activeGraphic = graphic;
//     // 触发重绘
//     this.pluginService.stage.renderNextFrame();
//   }

//   deactivate(context: IPluginService): void {
//     const { stage } = this.pluginService;
//     stage.removeEventListener('pointerover', this.poptip);
//   }
// }
