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

  htmlMap: Record<
    string,
    {
      root: any;
      wrapContainer: HTMLElement;
      nativeContainer: HTMLElement;
      container: string | HTMLElement | null;
      renderId: number;
    }
  > = {};

  removeElement(id: string) {
    if (!this.htmlMap || !this.htmlMap[id]) {
      return;
    }

    const { root, wrapContainer } = this.htmlMap[id];

    if (root) {
      const raf = application.global.getRequestAnimationFrame();
      raf(() => {
        root.unmount();
      });
    }

    wrapContainer && application.global.removeDom(wrapContainer);

    this.htmlMap[id] = null;
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
    const { element, container } = react;
    if (!(element && ReactDOM && ReactDOM.createRoot)) {
      return;
    }
    const id = isNil(react.id) ? `${graphic.id ?? graphic._uid}_react` : react.id;

    if (this.htmlMap && this.htmlMap[id] && container && container !== this.htmlMap[id].container) {
      this.removeElement(id);
    }

    if (!this.htmlMap || !this.htmlMap[id]) {
      // createa a wrapper contianer to be the root of react element
      const { wrapContainer, nativeContainer } = this.getWrapContainer(stage, container);

      if (wrapContainer) {
        const root = ReactDOM.createRoot(wrapContainer);
        root.render(element);

        if (!this.htmlMap) {
          this.htmlMap = {};
        }

        this.htmlMap[id] = { root, wrapContainer, nativeContainer, container, renderId: this.renderId };
      }
    } else {
      // update react element
      this.htmlMap[id].root.render(element);
    }

    if (!this.htmlMap || !this.htmlMap[id]) {
      return;
    }

    const { wrapContainer, nativeContainer } = this.htmlMap[id];

    this.updateStyleOfWrapContainer(graphic, stage, wrapContainer, nativeContainer, react);
    this.htmlMap[id].renderId = this.renderId;
  }
}
