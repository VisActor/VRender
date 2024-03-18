import { Generator } from '../../common/generator';
import type { IGraphic, IPlugin, IPluginService, IRenderService, IDrawContext, IGroup } from '../../interface';
import { application } from '../../application';
import { DefaultAttribute } from '../../graphic';
import { HtmlAttributePlugin } from './html-attribute-plugin';

export class ReactAttributePlugin extends HtmlAttributePlugin implements IPlugin {
  name: 'ReactAttributePlugin' = 'ReactAttributePlugin';
  activeEvent: 'onRegister' = 'onRegister';
  pluginService: IPluginService;
  _uid: number = Generator.GenAutoIncrementId();
  key: string = this.name + this._uid;

  removeDom(graphic: IGraphic) {
    if (graphic.bindDom && graphic.bindDom.size) {
      // 删除dom
      graphic.bindDom.forEach(item => {
        item.root && item.root.unmount();
      });
      graphic.bindDom.clear();
    }
  }

  renderGraphicHTML(graphic: IGraphic) {
    const { react } = graphic.attribute;
    if (!react) {
      if (graphic.bindDom && graphic.bindDom.size) {
        // 删除dom
        graphic.bindDom.forEach(item => {
          item.root && item.root.unmount();
        });
        graphic.bindDom.clear();
      }
      return;
    }
    const stage = graphic.stage;
    if (!stage) {
      return;
    }
    const ReactDOM = stage.params.ReactDOM;
    const { element, container, width, height, style, anchorType = 'boundsLeftTop', pointerEvents } = react;
    if (!(element && ReactDOM && ReactDOM.createRoot)) {
      return;
    }

    if (!graphic.bindDom) {
      graphic.bindDom = new Map();
    }
    const lastDom = graphic.bindDom.get(element);

    let wrapGroup;
    // 获取container的dom，默认为window的container
    let nativeContainer;
    // 如果存在了（dom存在，且container没有变化），就不做事情
    if (lastDom && !(container && container !== lastDom.container)) {
      wrapGroup = lastDom.wrapGroup;
      nativeContainer = wrapGroup.parentNode;
    } else {
      // 清除上一次的dom
      graphic.bindDom.forEach(({ wrapGroup }) => {
        application.global.removeDom(wrapGroup);
      });

      const _container = container;
      if (_container) {
        if (typeof _container === 'string') {
          nativeContainer = application.global.getElementById(_container);
        } else {
          nativeContainer = _container;
        }
      } else {
        // nativeContainer = application.global.getRootElement();
        nativeContainer = graphic.stage.window.getContainer();
      }
      // 创建wrapGroup
      wrapGroup = application.global.createDom({ tagName: 'div', width, height, style, parent: nativeContainer });
      if (wrapGroup) {
        const root = ReactDOM.createRoot(wrapGroup);
        root.render(element);
        // wrapGroup.appendChild(nativeDom);
        graphic.bindDom.set(element, { dom: element, container, wrapGroup: wrapGroup, root });
      }
    }

    // 事件穿透
    wrapGroup.style.pointerEvents = pointerEvents || 'none';
    // 定位wrapGroup
    if (!wrapGroup.style.position) {
      wrapGroup.style.position = 'absolute';
      nativeContainer.style.position = 'relative';
    }
    let left: number = 0;
    let top: number = 0;
    const b = graphic.globalAABBBounds;
    if (anchorType === 'position' || b.empty()) {
      const matrix = graphic.globalTransMatrix;
      left = matrix.e;
      top = matrix.f;
    } else {
      left = b.x1;
      top = b.y1;
    }
    // 查看wrapGroup的位置
    // const wrapGroupTL = application.global.getElementTopLeft(wrapGroup, false);
    const containerTL = application.global.getElementTopLeft(nativeContainer, false);
    const windowTL = stage.window.getTopLeft(false);
    const offsetX = left + windowTL.left - containerTL.left;
    const offsetTop = top + windowTL.top - containerTL.top;
    // wrapGroup.style.transform = `translate(${offsetX}px, ${offsetTop}px)`;
    wrapGroup.style.left = `${offsetX}px`;
    wrapGroup.style.top = `${offsetTop}px`;
  }
}
