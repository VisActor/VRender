import type { IGroup, IPlugin, IPluginService, IDrawContext } from '../../interface';
import { application } from '../../application';
import { Generator } from '../../common/generator';

export class IncrementalAutoRenderPlugin implements IPlugin {
  name: 'IncrementalAutoRenderPlugin' = 'IncrementalAutoRenderPlugin';
  activeEvent: 'onRegister' = 'onRegister';
  pluginService: IPluginService;
  protected nextFrameRenderGroupSet: Set<IGroup> = new Set();
  protected willNextFrameRender: boolean = false;
  nextUserParams: Partial<IDrawContext> = {};
  _uid: number = Generator.GenAutoIncrementId();
  key: string = this.name + this._uid;

  activate(context: IPluginService): void {
    this.pluginService = context;
    application.graphicService.hooks.onAddIncremental.tap(this.key, (graphic, group, stage) => {
      if (graphic.glyphHost) {
        graphic = graphic.glyphHost;
      }
      if (graphic.stage === context.stage && graphic.stage != null) {
        this.nextUserParams.startAtId = group._uid;
        this.renderNextFrame(group);
      }
    });
    application.graphicService.hooks.onClearIncremental.tap(this.key, (group, stage) => {
      if (group.stage === context.stage && group.stage != null) {
        this.nextUserParams.startAtId = group._uid;
        this.nextUserParams.restartIncremental = true;
        this.renderNextFrame(group);
      }
    });
  }
  deactivate(context: IPluginService): void {
    application.graphicService.hooks.onAddIncremental.taps =
      application.graphicService.hooks.onAddIncremental.taps.filter(item => {
        return item.name !== this.key;
      });
    application.graphicService.hooks.onClearIncremental.taps =
      application.graphicService.hooks.onClearIncremental.taps.filter(item => {
        return item.name !== this.key;
      });
  }

  renderNextFrame(group: IGroup): void {
    this.nextFrameRenderGroupSet.add(group);
    if (!this.willNextFrameRender) {
      this.willNextFrameRender = true;
      application.global.getRequestAnimationFrame()(() => {
        this._doRenderInThisFrame();
        this.willNextFrameRender = false;
      });
    }
  }

  _doRenderInThisFrame() {
    const stage = this.pluginService.stage;
    if (this.nextFrameRenderGroupSet.size) {
      this.nextFrameRenderGroupSet.forEach(group => {
        const layer = group.layer;
        if (!layer || !group.layer.subLayers) {
          return;
        }
        const subLayer = group.layer.subLayers.get(group._uid);
        if (!subLayer || !subLayer.drawContribution) {
          return;
        }
        subLayer.drawContribution.draw(stage.renderService, {
          stage,
          layer,
          viewBox: stage.window.getViewBox(),
          transMatrix: stage.window.getViewBoxTransform(),
          // TODO: 多图层时不应该再用默认background
          clear: 'transparent',
          renderService: stage.renderService,
          updateBounds: false,
          startAtId: group._uid,
          context: subLayer.layer.getNativeHandler().getContext(),
          ...this.nextUserParams
        });
      });
      this.nextUserParams = {};
      this.nextFrameRenderGroupSet.clear();
    }
  }
}
