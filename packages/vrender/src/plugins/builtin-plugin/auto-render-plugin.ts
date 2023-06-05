import { Generator } from '../../common';
import { graphicService } from '../../modules';
import { IPlugin, IPluginService } from '../plugin-service';

export class AutoRenderPlugin implements IPlugin {
  name: 'AutoRenderPlugin' = 'AutoRenderPlugin';
  activeEvent: 'onRegister' = 'onRegister';
  pluginService: IPluginService;
  _uid: number = Generator.GenAutoIncrementId();
  key: string = this.name + this._uid;

  activate(context: IPluginService): void {
    this.pluginService = context;
    graphicService.hooks.onAttributeUpdate.tap(this.key, graphic => {
      if (graphic.glyphHost) {
        graphic = graphic.glyphHost;
      }
      if (graphic.stage === context.stage && graphic.stage != null) {
        graphic.stage.renderNextFrame();
      }
    });
    graphicService.hooks.onSetStage.tap(this.key, graphic => {
      if (graphic.glyphHost) {
        graphic = graphic.glyphHost;
      }
      if (graphic.stage === context.stage && graphic.stage != null) {
        graphic.stage.renderNextFrame();
      }
    });
  }
  deactivate(context: IPluginService): void {
    graphicService.hooks.onAttributeUpdate.taps = graphicService.hooks.onAttributeUpdate.taps.filter(item => {
      return item.name !== this.key;
    });
    graphicService.hooks.onSetStage.taps = graphicService.hooks.onSetStage.taps.filter(item => {
      return item.name !== this.key;
    });
  }
}
