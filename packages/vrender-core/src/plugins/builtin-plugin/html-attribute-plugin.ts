import { Generator } from '../../common/generator';
import type {
  IGraphic,
  IPlugin,
  IPluginService,
  IRenderService,
  IGroup,
  IStage,
  CreateDOMParamsType,
  CommonDomOptions,
  SimpleDomStyleOptions
} from '../../interface';
import { application } from '../../application';
import { DefaultAttribute, getTheme } from '../../graphic';
import { textAttributesToStyle } from '../../common/text';

export class HtmlAttributePlugin implements IPlugin {
  name: string = 'HtmlAttributePlugin';
  activeEvent: 'onRegister' = 'onRegister';
  pluginService: IPluginService;
  _uid: number = Generator.GenAutoIncrementId();
  key: string = this.name + this._uid;
  lastDomContainerSet: Set<any> = new Set();
  currentDomContainerSet: Set<any> = new Set();

  activate(context: IPluginService): void {
    this.pluginService = context;
    context.stage.hooks.afterRender.tap(this.key, stage => {
      if (!(stage && stage === this.pluginService.stage)) {
        return;
      }

      this.drawHTML(context.stage.renderService);
    });
    application.graphicService.hooks.onRemove.tap(this.key, graphic => {
      this.removeDom(graphic);
    });
    application.graphicService.hooks.onRelease.tap(this.key, graphic => {
      this.removeDom(graphic);
    });
  }
  deactivate(context: IPluginService): void {
    context.stage.hooks.afterRender.taps = context.stage.hooks.afterRender.taps.filter(item => {
      return item.name !== this.key;
    });
    application.graphicService.hooks.onRemove.unTap(this.key);
    application.graphicService.hooks.onRelease.unTap(this.key);
    this.release();
  }

  getWrapContainer(stage: IStage, userContainer?: string | HTMLElement | null, domParams?: CreateDOMParamsType) {
    let nativeContainer;
    if (userContainer) {
      if (typeof userContainer === 'string') {
        nativeContainer = application.global.getElementById(userContainer);
      } else {
        nativeContainer = userContainer;
      }
    } else {
      nativeContainer = stage.window.getContainer();
    }
    // 创建wrapGroup
    return {
      wrapContainer: application.global.createDom({ tagName: 'div', parent: nativeContainer, ...domParams }),
      nativeContainer
    };
  }

  parseDefaultStyleFromGraphic(graphic: IGraphic) {
    const attrs: any = graphic.type === 'text' && graphic.attribute ? graphic.attribute : getTheme(graphic).text;

    return textAttributesToStyle(attrs);
  }

  updateStyleOfWrapContainer(
    graphic: IGraphic,
    stage: IStage,
    wrapContainer: HTMLElement,
    nativeContainer: HTMLElement,
    options: SimpleDomStyleOptions & CommonDomOptions
  ) {
    const { pointerEvents, anchorType = 'boundsLeftTop' } = options;

    // 解析图形上的配置，转换为style，优先级最低，可以被用户配置覆盖
    application.global.updateDom(wrapContainer, { style: this.parseDefaultStyleFromGraphic(graphic) });
    // 更新样式
    application.global.updateDom(wrapContainer, options);

    // 事件穿透
    wrapContainer.style.pointerEvents = pointerEvents === true ? 'all' : pointerEvents ? pointerEvents : 'none';
    // 定位wrapGroup
    if (!wrapContainer.style.position) {
      wrapContainer.style.position = 'absolute';
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
    wrapContainer.style.left = `${offsetX}px`;
    wrapContainer.style.top = `${offsetTop}px`;
  }

  protected clearCacheContainer() {
    // 删掉这次不存在的节点
    this.lastDomContainerSet.forEach(item => {
      if (!this.currentDomContainerSet.has(item)) {
        application.global.removeDom(item);
      }
    });
    this.lastDomContainerSet = new Set(this.currentDomContainerSet);
    this.currentDomContainerSet.clear();
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

      this.clearCacheContainer();
    }
  }

  renderGroupHTML(group: IGroup) {
    this.renderGraphicHTML(group);
    group.forEachChildren((g: IGraphic) => {
      if (g.isContainer) {
        this.renderGroupHTML(g as IGroup);
      } else {
        this.renderGraphicHTML(g);
      }
    });
  }

  removeDom(graphic: IGraphic) {
    if (graphic.bindDom && graphic.bindDom.size) {
      // 删除dom
      graphic.bindDom.forEach(item => {
        application.global.removeDom(item.dom);
      });
      graphic.bindDom.clear();
    }
  }

  renderGraphicHTML(graphic: IGraphic) {
    const { html } = graphic.attribute;
    if (!html) {
      if (graphic.bindDom && graphic.bindDom.size) {
        // 删除dom
        graphic.bindDom.forEach(item => {
          application.global.removeDom(item.dom);
        });
        graphic.bindDom.clear();
      }
      return;
    }
    const stage = graphic.stage;
    if (!stage) {
      return;
    }
    const { dom, container, width, height, style } = html;
    if (!graphic.bindDom) {
      graphic.bindDom = new Map();
    }
    const lastDom = graphic.bindDom.get(dom);

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
      // 转化这个dom为nativeDOM
      let nativeDom: HTMLElement;
      if (typeof dom === 'string') {
        nativeDom = new DOMParser().parseFromString(dom, 'text/html').firstChild as any;
        if ((nativeDom as any).lastChild) {
          nativeDom = (nativeDom as any).lastChild.firstChild;
        }
      } else {
        nativeDom = dom;
      }

      // 创建wrapGroup
      const res = this.getWrapContainer(
        stage,
        container ||
          (stage.params.enableHtmlAttribute === true ? null : (stage.params.enableHtmlAttribute as HTMLElement))
      );
      wrapGroup = res.wrapContainer;
      nativeContainer = res.nativeContainer;
      if (wrapGroup) {
        wrapGroup.appendChild(nativeDom);
        graphic.bindDom.set(dom, { dom: nativeDom, container, wrapGroup: wrapGroup as any });
      }
    }

    if (wrapGroup) {
      this.updateStyleOfWrapContainer(graphic, stage, wrapGroup, nativeContainer, html);
    }

    this.currentDomContainerSet.add(wrapGroup);
  }

  release() {
    if (application.global.env === 'browser') {
      this.removeAllDom(this.pluginService.stage.defaultLayer);
      this.lastDomContainerSet.clear();
      this.currentDomContainerSet.clear();
    }
  }
  removeAllDom(g: IGraphic) {
    this.removeDom(g);
    g.forEachChildren((item: IGraphic) => {
      if (item.isContainer) {
        this.removeAllDom(g);
      }
    });
  }
}
