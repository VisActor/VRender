import { AABBBounds, IAABBBounds } from '@visactor/vutils';
import { Generator } from '../../common';
import { IGraphic, IStage } from '../../interface';
import { graphicService } from '../../modules';
import { IPlugin, IPluginService } from '../plugin-service';

const globalBounds = new AABBBounds();

export class DirtyBoundsPlugin implements IPlugin {
  name: 'DirtyBoundsPlugin' = 'DirtyBoundsPlugin';
  activeEvent: 'onRegister' = 'onRegister';
  pluginService: IPluginService;
  _uid: number = Generator.GenAutoIncrementId();
  key: string = this.name + this._uid;

  activate(context: IPluginService): void {
    this.pluginService = context;
    context.stage.hooks.afterRender.tap(this.key, stage => {
      if (!(stage && stage === this.pluginService.stage)) {
        return;
      }
      stage.dirtyBounds.clear();
    });
    graphicService.hooks.beforeUpdateAABBBounds.tap(
      this.key,
      (graphic: IGraphic, stage: IStage, willUpdate: boolean, bounds: IAABBBounds) => {
        if (graphic.glyphHost) {
          graphic = graphic.glyphHost;
        }
        if (!(stage && stage === this.pluginService.stage && stage.renderCount)) {
          return;
        }
        // group的子元素导致的bounds更新不用做dirtyBounds
        if (graphic.isContainer && !graphic.shouldSelfChangeUpdateAABBBounds()) {
          return;
        }
        if (willUpdate) {
          globalBounds.setValue(bounds.x1, bounds.y1, bounds.x2, bounds.y2);
          stage.dirty(globalBounds, graphic.parent && graphic.parent.globalTransMatrix);
        }
      }
    );
    graphicService.hooks.afterUpdateAABBBounds.tap(
      this.key,
      (
        graphic: IGraphic,
        stage: IStage,
        bounds: IAABBBounds,
        params: { globalAABBBounds: IAABBBounds },
        selfChange: boolean
      ) => {
        if (!(stage && stage === this.pluginService.stage && stage.renderCount)) {
          return;
        }
        // group的子元素导致的bounds更新不用做dirtyBounds
        if (graphic.isContainer && !selfChange) {
          return;
        }
        stage.dirty(params.globalAABBBounds);
      }
    );
    graphicService.hooks.onRemove.tap(this.key, (graphic: IGraphic) => {
      const stage = graphic.stage;
      if (!(stage && stage === this.pluginService.stage && stage.renderCount)) {
        return;
      }
      if (stage) {
        stage.dirty(graphic.globalAABBBounds);
      }
    });
  }
  deactivate(context: IPluginService): void {
    graphicService.hooks.beforeUpdateAABBBounds.taps = graphicService.hooks.beforeUpdateAABBBounds.taps.filter(item => {
      return item.name !== this.key;
    });
    graphicService.hooks.afterUpdateAABBBounds.taps = graphicService.hooks.afterUpdateAABBBounds.taps.filter(item => {
      return item.name !== this.key;
    });
    context.stage.hooks.afterRender.taps = context.stage.hooks.afterRender.taps.filter(item => {
      return item.name !== this.key;
    });
    graphicService.hooks.onRemove.taps = graphicService.hooks.onRemove.taps.filter(item => {
      return item.name !== this.key;
    });
  }
}
