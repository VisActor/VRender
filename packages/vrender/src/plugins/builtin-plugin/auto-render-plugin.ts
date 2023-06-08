import { Generator } from '../../common/generator';
import { application } from '../../application';
import { IPlugin, IPluginService } from '../plugin-service';

export class AutoRenderPlugin implements IPlugin {
  name: 'AutoRenderPlugin' = 'AutoRenderPlugin';
  activeEvent: 'onRegister' = 'onRegister';
  pluginService: IPluginService;
  _uid: number = Generator.GenAutoIncrementId();
  key: string = this.name + this._uid;

  activate(context: IPluginService): void {
    this.pluginService = context;
    application.graphicService.hooks.onAttributeUpdate.tap(this.key, graphic => {
      if (graphic.glyphHost) {
        graphic = graphic.glyphHost;
      }
      if (graphic.stage === context.stage && graphic.stage != null) {
        graphic.stage.renderNextFrame();
      }
    });
    application.graphicService.hooks.onSetStage.tap(this.key, graphic => {
      if (graphic.glyphHost) {
        graphic = graphic.glyphHost;
      }
      if (graphic.stage === context.stage && graphic.stage != null) {
        graphic.stage.renderNextFrame();
      }
    });
  }
  deactivate(context: IPluginService): void {
    application.graphicService.hooks.onAttributeUpdate.taps =
      application.graphicService.hooks.onAttributeUpdate.taps.filter(item => {
        return item.name !== this.key;
      });
    application.graphicService.hooks.onSetStage.taps = application.graphicService.hooks.onSetStage.taps.filter(item => {
      return item.name !== this.key;
    });
  }
}
