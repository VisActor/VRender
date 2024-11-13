import { Generator } from '../../common/generator';
import { application } from '../../application';
import type { IGraphic, IPlugin, IPluginService } from '../../interface';

export class AutoRefreshPlugin implements IPlugin {
  name: 'AutoRefreshPlugin' = 'AutoRefreshPlugin';
  activeEvent: 'onRegister' = 'onRegister';
  pluginService: IPluginService;
  _uid: number = Generator.GenAutoIncrementId();
  key: string = this.name + this._uid;
  dpr: number;
  rafId: number;

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
    this.dpr = application.global.devicePixelRatio;
    this.refresh();
  }

  refresh() {
    if (!this._refreshByMediaQuery()) {
      this._refreshByRaf();
    }
  }
  protected _refreshByRaf() {
    const raf = application.global.getRequestAnimationFrame();
    this.rafId = raf(() => {
      if (application.global.devicePixelRatio !== this.dpr) {
        this.dpr = application.global.devicePixelRatio;
        this.pluginService.stage.setDpr(this.dpr, true);
      }
      this.refresh();
    });
  }
  protected _refreshByMediaQuery() {
    try {
      const mqString = `(resolution: ${window.devicePixelRatio}dppx)`;

      const updatePixelRatio = () => {
        if (window.devicePixelRatio !== this.dpr) {
          this.dpr = window.devicePixelRatio;
          this.pluginService.stage.setDpr(this.dpr, true);
        }
      };

      matchMedia(mqString).addEventListener('change', updatePixelRatio);
    } catch (err) {
      return false;
    }
    return true;
  }
  deactivate(context: IPluginService): void {
    const craf = application.global.getCancelAnimationFrame();
    craf && this.rafId && craf(this.rafId);
  }
}
