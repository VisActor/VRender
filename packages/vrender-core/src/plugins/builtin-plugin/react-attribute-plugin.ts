import { Generator } from '../../common/generator';
import type { IGraphic, IPlugin, IPluginService } from '../../interface';
import { application } from '../../application';
import { HtmlAttributePlugin } from './html-attribute-plugin';
import { isNil } from '@visactor/vutils';

export class ReactAttributePlugin extends HtmlAttributePlugin implements IPlugin {
  name: 'ReactAttributePlugin' = 'ReactAttributePlugin';
  activeEvent: 'onRegister' = 'onRegister';
  pluginService: IPluginService;
  _uid: number = Generator.GenAutoIncrementId();
  key: string = this.name + this._uid;

  reactRootMap: Record<
    string,
    {
      root: any;
      wrapContainer: HTMLElement;
      nativeContainer: HTMLElement;
      container: string | HTMLElement | null;
      renderId: number;
    }
  > = {};
  reactRenderId: number = 0;

  removeReact(id: string) {
    if (!this.reactRootMap || !this.reactRootMap[id]) {
      return;
    }

    const { root, wrapContainer } = this.reactRootMap[id];

    if (root) {
      const raf = application.global.getRequestAnimationFrame();
      raf(() => {
        root.unmount();
      });
    }

    wrapContainer && application.global.removeDom(wrapContainer);

    this.reactRootMap[id] = null;
  }

  removeDom(graphic: IGraphic) {
    // do nothing
  }

  protected clearCacheContainer() {
    if (this.reactRootMap) {
      Object.keys(this.reactRootMap).forEach(key => {
        if (this.reactRenderId[key] && this.reactRenderId[key].renderId !== this.reactRenderId) {
          this.removeReact(key);
        }
      });
    }

    this.reactRenderId += 1;
  }

  renderGraphicHTML(graphic: IGraphic) {
    const { react } = graphic.attribute;
    if (!react) {
      return;
    }
    const stage = graphic.stage;
    if (!stage) {
      return;
    }
    const ReactDOM = stage.params.ReactDOM;
    const { element, container, width, height, style } = react;
    if (!(element && ReactDOM && ReactDOM.createRoot)) {
      return;
    }
    const id = isNil(react.id) ? `${graphic.id ?? graphic._uid}_react` : react.id;

    if (this.reactRootMap && this.reactRootMap[id] && container && container !== this.reactRootMap[id].container) {
      this.removeReact(id);
    }

    if (!this.reactRootMap || !this.reactRootMap[id]) {
      // createa a wrapper contianer to be the root of react element
      const { wrapContainer, nativeContainer } = this.getWrapContainer(
        stage,
        container ||
          (stage.params.enableHtmlAttribute === true ? null : (stage.params.enableHtmlAttribute as HTMLElement))
      );

      if (wrapContainer) {
        const root = ReactDOM.createRoot(wrapContainer);
        root.render(element);

        if (!this.reactRootMap) {
          this.reactRootMap = {};
        }

        this.reactRootMap[id] = { root, wrapContainer, nativeContainer, container, renderId: this.reactRenderId };
      }
    } else {
      // update react element
      this.reactRootMap[id].root.render(element);
    }

    if (!this.reactRootMap || !this.reactRootMap[id]) {
      return;
    }

    const { wrapContainer, nativeContainer } = this.reactRootMap[id];

    this.updateStyleOfWrapContainer(graphic, stage, wrapContainer, nativeContainer, react);
    this.reactRootMap[id].renderId = this.reactRenderId;
  }

  removeAllDom(g: IGraphic) {
    if (this.reactRootMap) {
      Object.keys(this.reactRootMap).forEach(key => {
        this.removeReact(key);
      });

      this.reactRootMap = null;
    }
  }
}
