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
  SimpleDomStyleOptions,
  IText,
  ILayer
} from '../../interface';
import { application } from '../../application';
import { getTheme } from '../../graphic/theme';
import { DefaultAttribute } from '../../graphic/config';
import { textAttributesToStyle } from '../../common/text';
import { isFunction, isNil, isObject, isString, styleStringToObject, calculateAnchorOfBounds } from '@visactor/vutils';
import { Factory } from '../../factory';

export class HtmlAttributePlugin implements IPlugin {
  name: string = 'HtmlAttributePlugin';
  activeEvent: 'onRegister' = 'onRegister';
  pluginService: IPluginService;
  _uid: number = Generator.GenAutoIncrementId();
  key: string = this.name + this._uid;

  htmlMap: Record<
    string,
    {
      wrapContainer: HTMLElement;
      nativeContainer: HTMLElement;
      container: string | HTMLElement | null;
      renderId: number;
    }
  > = {};
  renderId: number = 0;

  activate(context: IPluginService): void {
    this.pluginService = context;
    context.stage.hooks.afterRender.tap(this.key, stage => {
      if (!(stage && stage === this.pluginService.stage)) {
        return;
      }

      // 全量查找，因为可能会有只渲染交互层的情况
      this.drawHTML([...(context.stage.getChildren() as any)]);
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

  getTransformOfText(graphic: IText) {
    const textTheme = getTheme(graphic).text;
    const { textAlign = textTheme.textAlign, textBaseline = textTheme.textBaseline } = graphic.attribute;
    const matrix = graphic.globalTransMatrix;
    const cssAttrs = matrix.toTransformAttrs();
    const { rotateDeg, scaleX, scaleY } = cssAttrs;
    const translateMap: any = {
      left: '0',
      start: '0',
      end: '-100%',
      center: '-50%',
      right: '-100%',
      top: '0',
      middle: '-50%',
      bottom: '-100%',
      alphabetic: '-79%'
    };
    const originMap: any = {
      left: '0',
      start: '0',
      end: '100%',
      center: '50%',
      right: '100%',
      top: '0',
      middle: '50%',
      bottom: '100%',
      alphabetic: '79%'
    };

    return {
      textAlign,
      // textBaseline,
      transform: `translate(${translateMap[textAlign]},${translateMap[textBaseline]}) rotate(${rotateDeg}deg) scaleX(${scaleX}) scaleY(${scaleY})`,
      transformOrigin: `${originMap[textAlign]} ${originMap[textBaseline]}`
    };
  }

  onWheel = (ev: Event) => {
    try {
      const newEvent = new (ev as any).constructor(ev.type, ev);
      const canvas = this.pluginService.stage.window.getContext().getCanvas().nativeCanvas;
      canvas.dispatchEvent(newEvent);
    } catch (err) {
      return;
      // console.log(err);
    }
  };

  updateStyleOfWrapContainer(
    graphic: IGraphic,
    stage: IStage,
    wrapContainer: HTMLElement,
    nativeContainer: HTMLElement,
    options: SimpleDomStyleOptions & CommonDomOptions
  ) {
    const { pointerEvents, penetrateEventList = [] } = options;
    let calculateStyle = this.parseDefaultStyleFromGraphic(graphic);

    calculateStyle.display = graphic.attribute.visible !== false ? 'block' : 'none';
    // 事件穿透
    calculateStyle.pointerEvents = pointerEvents === true ? 'all' : pointerEvents ? pointerEvents : 'none';
    if (calculateStyle.pointerEvents !== 'none') {
      // 删除所有的事件
      this.removeWrapContainerEventListener(wrapContainer);
      // 监听所有的事件
      penetrateEventList.forEach(event => {
        if (event === 'wheel') {
          wrapContainer.addEventListener('wheel', this.onWheel);
        }
      });
    }

    // 定位wrapGroup
    if (!wrapContainer.style.position) {
      wrapContainer.style.position = 'absolute';
      nativeContainer.style.position = 'relative';
    }
    let left: number = 0;
    let top: number = 0;
    const b = graphic.globalAABBBounds;

    let anchorType = options.anchorType;

    if (isNil(anchorType)) {
      anchorType = graphic.type === 'text' ? 'position' : 'boundsLeftTop';
    }

    if (anchorType === 'boundsLeftTop') {
      // 兼容老的配置，统一配置
      anchorType = 'top-left';
    }
    if (anchorType === 'position' || b.empty()) {
      const matrix = graphic.globalTransMatrix;
      left = matrix.e;
      top = matrix.f;
    } else {
      const anchor = calculateAnchorOfBounds(b, anchorType);

      left = anchor.x;
      top = anchor.y;
    }

    // 查看wrapGroup的位置
    // const wrapGroupTL = application.global.getElementTopLeft(wrapGroup, false);
    const containerTL = application.global.getElementTopLeft(nativeContainer, false);
    const windowTL = stage.window.getTopLeft(false);
    const viewBox = stage.viewBox;
    const offsetX = left + windowTL.left - containerTL.left + viewBox.x1;
    const offsetTop = top + windowTL.top - containerTL.top + viewBox.y1;
    // wrapGroup.style.transform = `translate(${offsetX}px, ${offsetTop}px)`;
    calculateStyle.left = `${offsetX}px`;
    calculateStyle.top = `${offsetTop}px`;

    if (graphic.type === 'text' && anchorType === 'position') {
      calculateStyle = {
        ...calculateStyle,
        ...this.getTransformOfText(graphic as IText)
      };
    }

    if (isFunction(options.style)) {
      const userStyle = options.style(
        { top: offsetTop, left: offsetX, width: b.width(), height: b.height() },
        graphic,
        wrapContainer
      );

      if (userStyle) {
        calculateStyle = { ...calculateStyle, ...userStyle };
      }
    } else if (isObject(options.style)) {
      calculateStyle = { ...calculateStyle, ...options.style };
    } else if (isString(options.style) && options.style) {
      calculateStyle = { ...calculateStyle, ...styleStringToObject(options.style as string) };
    }

    // 更新样式
    application.global.updateDom(wrapContainer, {
      width: options.width,
      height: options.height,
      style: calculateStyle
    });
  }

  protected clearCacheContainer() {
    if (this.htmlMap) {
      Object.keys(this.htmlMap).forEach(key => {
        if (this.htmlMap[key] && this.htmlMap[key].renderId !== this.renderId) {
          this.removeElement(key);
        }
      });
    }

    this.renderId += 1;
  }

  protected drawHTML(layers: ILayer[]) {
    if (application.global.env === 'browser') {
      layers
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

  removeElement(id: string) {
    if (!this.htmlMap || !this.htmlMap[id]) {
      return;
    }

    const { wrapContainer } = this.htmlMap[id];
    if (wrapContainer) {
      application.global.removeDom(wrapContainer);
    }

    this.htmlMap[id] = null;
  }

  removeWrapContainerEventListener(wrapContainer: HTMLElement) {
    wrapContainer.removeEventListener('wheel', this.onWheel);
  }

  renderGraphicHTML(graphic: IGraphic) {
    const { html } = graphic.attribute;
    if (!html) {
      return;
    }
    const stage = graphic.stage;
    if (!stage) {
      return;
    }
    const { dom, container } = html;

    if (!dom) {
      return;
    }
    const id = isNil(html.id) ? `${graphic.id ?? graphic._uid}_react` : html.id;

    if (this.htmlMap && this.htmlMap[id] && container && container !== this.htmlMap[id].container) {
      this.removeElement(id);
    }

    if (!this.htmlMap || !this.htmlMap[id]) {
      // createa a wrapper contianer to be the root of react element
      const { wrapContainer, nativeContainer } = this.getWrapContainer(stage, container);

      if (wrapContainer) {
        // init append
        if (typeof dom === 'string') {
          wrapContainer.innerHTML = dom;
        } else {
          wrapContainer.appendChild(dom);
        }

        if (!this.htmlMap) {
          this.htmlMap = {};
        }

        this.htmlMap[id] = { wrapContainer, nativeContainer, container, renderId: this.renderId };
      }
    } else {
      if (typeof dom === 'string') {
        this.htmlMap[id].wrapContainer.innerHTML = dom;
      } else {
        if (dom !== this.htmlMap[id].wrapContainer.firstChild) {
          this.htmlMap[id].wrapContainer.removeChild(this.htmlMap[id].wrapContainer.firstChild);
          this.htmlMap[id].wrapContainer.appendChild(dom);
        }
      }
    }

    if (!this.htmlMap || !this.htmlMap[id]) {
      return;
    }

    const { wrapContainer, nativeContainer } = this.htmlMap[id];

    this.updateStyleOfWrapContainer(graphic, stage, wrapContainer, nativeContainer, html);
    this.htmlMap[id].renderId = this.renderId;
  }

  release() {
    if (application.global.env === 'browser') {
      this.removeAllDom(this.pluginService.stage.defaultLayer);
    }
  }
  removeAllDom(g: IGraphic) {
    if (this.htmlMap) {
      Object.keys(this.htmlMap).forEach(key => {
        this.removeElement(key);
      });

      this.htmlMap = null;
    }
  }
}

export const registerHtmlAttributePlugin = () => {
  Factory.registerPlugin('HtmlAttributePlugin', HtmlAttributePlugin);
};
