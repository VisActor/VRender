import type { IAABBBounds } from '@visactor/vutils';
import { AABBBounds } from '@visactor/vutils';
import { Generator } from '../../common/generator';
import type { IGraphic, IStage, IPlugin, IPluginService } from '../../interface';
import { application } from '../../application';

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
    const stage = this.pluginService.stage;
    if (!stage) {
      return;
    }
    stage.graphicService.hooks.beforeUpdateAABBBounds.tap(
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
    stage.graphicService.hooks.afterUpdateAABBBounds.tap(
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
    stage.graphicService.hooks.clearAABBBounds.tap(
      this.key,
      (graphic: IGraphic, stage: IStage, bounds: IAABBBounds) => {
        if (!(stage && stage === this.pluginService.stage && stage.renderCount)) {
          return;
        }
        if (stage) {
          stage.dirty(bounds);
        }
      }
    );
    stage.graphicService.hooks.onRemove.tap(this.key, (graphic: IGraphic) => {
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
    const stage = this.pluginService.stage;
    if (!stage) {
      return;
    }
    stage.graphicService.hooks.beforeUpdateAABBBounds.taps =
      stage.graphicService.hooks.beforeUpdateAABBBounds.taps.filter(item => {
        return item.name !== this.key;
      });
    stage.graphicService.hooks.afterUpdateAABBBounds.taps =
      stage.graphicService.hooks.afterUpdateAABBBounds.taps.filter(item => {
        return item.name !== this.key;
      });
    stage.graphicService.hooks.clearAABBBounds.taps = stage.graphicService.hooks.clearAABBBounds.taps.filter(item => {
      return item.name !== this.key;
    });
    stage.hooks.afterRender.taps = stage.hooks.afterRender.taps.filter(item => {
      return item.name !== this.key;
    });
    stage.graphicService.hooks.onRemove.taps = stage.graphicService.hooks.onRemove.taps.filter(item => {
      return item.name !== this.key;
    });
  }
}
