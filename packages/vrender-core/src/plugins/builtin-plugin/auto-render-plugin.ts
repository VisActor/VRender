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
    const stage = this.pluginService.stage;
    if (!stage) {
      return;
    }
    stage.graphicService.hooks.onAttributeUpdate.tap(this.key, this.handleChange);
    stage.graphicService.hooks.onSetStage.tap(this.key, this.handleChange);
    stage.graphicService.hooks.onRemove.tap(this.key, this.handleChange);
  }
  deactivate(context: IPluginService): void {
    const filterByName = (taps: FullTap[]) => {
      return taps.filter(item => {
        return item.name !== this.key;
      });
    };
    const stage = this.pluginService.stage;
    if (!stage) {
      return;
    }

    stage.graphicService.hooks.onAttributeUpdate.taps = filterByName(stage.graphicService.hooks.onAttributeUpdate.taps);
    stage.graphicService.hooks.onSetStage.taps = filterByName(stage.graphicService.hooks.onSetStage.taps);
    stage.graphicService.hooks.onRemove.taps = filterByName(stage.graphicService.hooks.onRemove.taps);
  }
}
