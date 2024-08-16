import { Generator } from '../../common/generator';
import { application } from '../../application';
import type { FullTap, IGraphic, IPlugin, IPluginService } from '../../interface';

export class AutoRenderPlugin implements IPlugin {
  name: 'AutoRenderPlugin' = 'AutoRenderPlugin';
  activeEvent: 'onRegister' = 'onRegister';
  pluginService: IPluginService;
  _uid: number = Generator.GenAutoIncrementId();
  key: string = this.name + this._uid;

  handleChange = (graphic: IGraphic) => {
    if (graphic.glyphHost) {
      graphic = graphic.glyphHost;
    }
    if (graphic.stage === this.pluginService.stage && graphic.stage != null) {
      graphic.stage.renderNextFrame();
    }
  };

  activate(context: IPluginService): void {
    this.pluginService = context;
    application.graphicService.hooks.onAttributeUpdate.tap(this.key, this.handleChange);
    application.graphicService.hooks.onSetStage.tap(this.key, this.handleChange);
    application.graphicService.hooks.onRemove.tap(this.key, this.handleChange);
  }
  deactivate(context: IPluginService): void {
    const filterByName = (taps: FullTap[]) => {
      return taps.filter(item => {
        return item.name !== this.key;
      });
    };

    application.graphicService.hooks.onAttributeUpdate.taps = filterByName(
      application.graphicService.hooks.onAttributeUpdate.taps
    );
    application.graphicService.hooks.onSetStage.taps = filterByName(application.graphicService.hooks.onSetStage.taps);
    application.graphicService.hooks.onRemove.taps = filterByName(application.graphicService.hooks.onRemove.taps);
  }
}
