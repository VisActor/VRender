import { Generator } from '../../common/generator';
import type { IGraphic, IPlugin, IPluginService, IRenderService, IDrawContext, IGroup } from '../../interface';
import { application } from '../../application';
import { DefaultAttribute } from '../../graphic';

export class HtmlAttributePlugin implements IPlugin {
  name: 'HtmlAttributePlugin' = 'HtmlAttributePlugin';
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

      this.drawHTML(context.stage.renderService);
    });
  }
  deactivate(context: IPluginService): void {
    context.stage.hooks.afterRender.taps = context.stage.hooks.afterRender.taps.filter(item => {
      return item.name !== this.key;
    });
  }

  protected drawHTML(renderService: IRenderService) {
    if (application.global.env === 'browser') {
      renderService.renderTreeRoots
        .sort((a, b) => {
          return (a.attribute.zIndex ?? DefaultAttribute.zIndex) - (b.attribute.zIndex ?? DefaultAttribute.zIndex);
        })
        .forEach(group => {
          this.renderGroupHTML(group as IGroup);
        });
    }
  }

  renderGroupHTML(group: IGroup) {
    this.renderGraphicHTML(group);
    group.forEachChildren((g: IGraphic) => {
      this.renderGraphicHTML(g);
    });
  }

  renderGraphicHTML(graphic: IGraphic) {
    const { html } = graphic.attribute;
    if (!html) {
      if (graphic.bindDom && graphic.bindDom.size) {
        // 删除dom
        graphic.bindDom.forEach(item => {
          item.dom && item.dom.parentElement.removeChild(item.dom);
        });
        graphic.bindDom.clear();
      }
      return;
    }
    const stage = graphic.stage;
    if (!stage) {
      return;
    }
    const { dom, container, width, height, style, anchorType = 'boundsLeftTop' } = html;
    if (!graphic.bindDom) {
      graphic.bindDom = new Map();
    }
    const lastDom = graphic.bindDom.get(dom);
    // 如果存在了（dom存在，且container没有变化），就跳过
    if (lastDom && !(container && container !== lastDom.container)) {
      return;
    }
    // 清除上一次的dom
    graphic.bindDom.forEach(({ wrapGroup }) => {
      application.global.removeDom(wrapGroup);
    });
    // 转化这个dom为nativeDOM
    let nativeDom: HTMLElement;
    if (typeof dom === 'string') {
      nativeDom = new DOMParser().parseFromString(dom, 'text/xml').firstChild as any;
    } else {
      nativeDom = dom;
    }
    // 获取container的dom，默认为window的container
    let nativeContainer;
    const _container =
      container || (stage.params.enableHtmlAttribute === true ? null : stage.params.enableHtmlAttribute);
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
    const wrapGroup = application.global.createDom({ tagName: 'div', width, height, style, parent: nativeContainer });
    if (wrapGroup) {
      wrapGroup.appendChild(nativeDom);
      graphic.bindDom.set(dom, { dom: nativeDom, container, wrapGroup: wrapGroup as any });
    }
    // 事件穿透
    wrapGroup.style.pointerEvents = 'none';
    // 定位wrapGroup
    if (!wrapGroup.style.position) {
      wrapGroup.style.position = 'absolute';
      nativeContainer.style.position = 'relative';
    }
    let left: number = 0;
    let top: number = 0;
    if (anchorType === 'position') {
      const matrix = graphic.transMatrix;
      left = matrix.e;
      top = matrix.f;
    } else {
      const b = graphic.AABBBounds;
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
