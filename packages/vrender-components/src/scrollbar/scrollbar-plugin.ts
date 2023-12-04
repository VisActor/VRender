import type { IGraphic, IGroup, IPlugin, IPluginService } from '@visactor/vrender/es/core';
import { Generator, injectable } from '@visactor/vrender/es/core';
import { ScrollBar } from './scrollbar';
import type { IAABBBounds } from '@visactor/vutils';
import { AABBBounds, abs, max, min } from '@visactor/vutils';

// _showPoptip: 0-没有，1-添加，2-删除

type IParams = {
  timeout?: number; // 消失的timeout
  bufferV?: number; // 判定是否出现滚动条的buffer
  bufferH?: number; // 判定是否出现滚动条的buffer
};

@injectable()
export class ScrollBarPlugin implements IPlugin {
  name: 'scrollbar' = 'scrollbar';
  activeEvent: 'onRegister' = 'onRegister';
  pluginService: IPluginService;
  _uid: number = Generator.GenAutoIncrementId();
  key: string = this.name + this._uid;
  activeGraphic: IGraphic;
  childrenBounds: IAABBBounds;
  scrollContainerBounds: IAABBBounds;

  static defaultParams: IParams = {
    timeout: 500
  };

  params: IParams;

  activate(context: IPluginService): void {
    this.pluginService = context;
    const { stage } = this.pluginService;

    this.childrenBounds = new AABBBounds();
    stage.addEventListener('wheel', this.scroll as any);
    this.params = ScrollBarPlugin.defaultParams;
  }
  scroll = (e: { deltaX: number; deltaY: number; target: IGraphic }) => {
    const graphic = e.target as any;
    const data = this.getScrollContainer(graphic);
    const { g: scrollContainer } = data;
    let { showH, showV } = data;
    if (!scrollContainer || scrollContainer.count === 1) {
      return;
    }
    this.scrollContainerBounds = scrollContainer.AABBBounds.clone();
    if (abs(e.deltaX) > abs(e.deltaY)) {
      showH = showH && true;
      showV = showV && false;
    } else {
      showH = showH && false;
      showV = showV && true;
    }
    scrollContainer.setAttributes({
      scrollX: showH ? (scrollContainer.attribute.scrollX || 0) + e.deltaX : scrollContainer.attribute.scrollX || 0,
      scrollY: showV ? (scrollContainer.attribute.scrollY || 0) + e.deltaY : scrollContainer.attribute.scrollY || 0
    });

    // 计算子元素的bounds
    const childrenBounds = this.childrenBounds;
    const scrollContainerBounds = this.scrollContainerBounds;
    childrenBounds.clear();
    scrollContainer.forEachChildren((c: IGraphic) => {
      childrenBounds.union(c.AABBBounds);
    });
    // 判断是否需要显示H或V，如果bounds完全在内部，那就不需要显示
    childrenBounds.transformWithMatrix(scrollContainer.transMatrix);
    if (showH && scrollContainerBounds.x1 <= childrenBounds.x1 && scrollContainerBounds.x2 >= childrenBounds.x2) {
      showH = false;
    }

    if (showV && scrollContainerBounds.y1 <= childrenBounds.y1 && scrollContainerBounds.y2 >= childrenBounds.y2) {
      showV = false;
    }

    // 转到当前坐标系下
    const m = scrollContainer.transMatrix;
    scrollContainerBounds.translate(-m.e, -m.f);
    childrenBounds.translate(-m.e, -m.f);
    // 如果子元素的bounds小于scrollContainer，那么就扩充
    if (showH) {
      childrenBounds.x1 = min(childrenBounds.x1, scrollContainerBounds.x1);
      childrenBounds.x2 = max(childrenBounds.x2, scrollContainerBounds.x2);
    }
    if (showV) {
      childrenBounds.y1 = min(childrenBounds.y1, scrollContainerBounds.y1);
      childrenBounds.y2 = max(childrenBounds.y2, scrollContainerBounds.y2);
    }
    childrenBounds.translate(scrollContainer.attribute.scrollX, scrollContainer.attribute.scrollY);

    const shadowRoot = scrollContainer.shadowRoot ?? scrollContainer.attachShadow();
    const container = shadowRoot.createOrUpdateChild('scroll-bar', {}, 'group') as IGroup;
    const { h, v, deltaH, deltaV } = this.addOrUpdateScroll(showH, showV, container, scrollContainer);
    scrollContainer.setAttributes({
      scrollX: h ? scrollContainer.attribute.scrollX || 0 : (scrollContainer.attribute.scrollX || 0) + deltaH,
      scrollY: v ? scrollContainer.attribute.scrollY || 0 : (scrollContainer.attribute.scrollY || 0) + deltaV
    });
  };
  addOrUpdateScroll(
    showH: boolean,
    showV: boolean,
    container: IGroup,
    scrollContainer: IGroup
  ): { h: boolean; deltaH: number; v: boolean; deltaV: number } {
    const scrollbars = container.children;
    let h = false;
    let v = false;
    let deltaH = 0;
    let deltaV = 0;
    if (showH) {
      const hScrollbar = scrollbars.filter((g: ScrollBar) => g.attribute.direction !== 'vertical')[0] as ScrollBar;
      const d = this.addOrUpdateHScroll(this.scrollContainerBounds, container, hScrollbar);
      h = d.valid;
      deltaH = d.delta;
      this.disappearScrollBar(hScrollbar, v);
    }
    if (showV) {
      const vScrollbar = scrollbars.filter((g: ScrollBar) => g.attribute.direction === 'vertical')[0] as ScrollBar;
      const d = this.addOrUpdateVScroll(this.scrollContainerBounds, container, vScrollbar);
      v = d.valid;
      deltaV = d.delta;
      this.disappearScrollBar(vScrollbar, v);
    }
    return {
      h,
      deltaH,
      v,
      deltaV
    };
  }
  addOrUpdateHScroll(
    scrollContainerB: IAABBBounds,
    container: IGroup,
    scrollBar?: ScrollBar
  ): { valid: boolean; delta: number } {
    if (!scrollBar) {
      scrollBar = new ScrollBar({
        direction: 'horizontal',
        x: 0,
        y: 0,
        width: scrollContainerB.width(),
        height: 12,
        padding: [2, 0],
        railStyle: {
          fill: 'rgba(0, 0, 0, .1)'
        },
        range: [0, 0.05]
      });
      container.add(scrollBar);
    }
    const b = scrollBar.AABBBounds;
    const childrenBounds = this.childrenBounds;
    const y = scrollContainerB.y2 - b.height();

    const ratio = Math.min(b.width() / this.childrenBounds.width(), 1);
    let start =
      ((scrollContainerB.x1 - childrenBounds.x1) / (childrenBounds.width() - scrollContainerB.width())) * (1 - ratio);

    let valid = true;
    let delta = 0;
    if (start < 0) {
      start = 0;
      valid = false;
      delta = scrollContainerB.x1 - childrenBounds.x1;
    } else if (start + ratio > 1) {
      start = 1 - ratio;
      valid = false;
      delta = scrollContainerB.x1 - childrenBounds.x1 - (childrenBounds.width() - scrollContainerB.width());
    }
    scrollBar.setAttributes({
      y,
      visibleAll: true,
      range: [start, start + ratio]
    });
    return {
      valid,
      delta
    };
  }

  addOrUpdateVScroll(
    scrollContainerB: IAABBBounds,
    container: IGroup,
    scrollBar?: ScrollBar
  ): { valid: boolean; delta: number } {
    if (!scrollBar) {
      scrollBar = new ScrollBar({
        direction: 'vertical',
        x: 0,
        y: 0,
        width: 12,
        height: scrollContainerB.height(),
        padding: [2, 0],
        railStyle: {
          fill: 'rgba(0, 0, 0, .1)'
        },
        range: [0, 0.05]
      });
      container.add(scrollBar);
    }
    const b = scrollBar.AABBBounds;
    const x = scrollContainerB.x2 - b.width();
    const childrenBounds = this.childrenBounds;
    const ratio = Math.min(b.height() / childrenBounds.height(), 1);
    let start =
      ((scrollContainerB.y1 - childrenBounds.y1) / (childrenBounds.height() - scrollContainerB.height())) * (1 - ratio);

    let valid = true;
    let delta = 0;
    if (start < 0) {
      start = 0;
      valid = false;
      delta = scrollContainerB.y1 - childrenBounds.y1;
    } else if (start + ratio > 1) {
      start = 1 - ratio;
      valid = false;
      delta = scrollContainerB.y1 - childrenBounds.y1 - (childrenBounds.height() - scrollContainerB.height());
    }
    scrollBar.setAttributes({
      x,
      visibleAll: true,
      range: [start, start + ratio]
    });
    return {
      valid,
      delta
    };
  }

  disappearScrollBar(scrollBar: ScrollBar, valid: boolean) {
    if ((scrollBar as any)._plugin_timeout) {
      clearTimeout((scrollBar as any)._plugin_timeout);
    }
    (scrollBar as any)._plugin_timeout = setTimeout(() => {
      scrollBar.setAttribute('visibleAll', false);
    }, this.params.timeout ?? 0);
  }

  // 获取响应滚动的元素
  getScrollContainer(graphic: IGraphic): { g: IGroup; showH: boolean; showV: boolean } | null {
    let g = graphic;
    while (g) {
      if (g.attribute.overflow && g.attribute.overflow !== 'hidden') {
        const overflow = g.attribute.overflow;
        let showH = false;
        let showV = false;
        if (overflow === 'scroll') {
          (showH = true), (showV = true);
        } else {
          showH = overflow === 'scroll-x';
          showV = !showH;
        }
        return { g: g as IGroup, showH, showV };
      }
      g = g.parent;
    }
    return null;
  }

  deactivate(context: IPluginService): void {
    const { stage } = this.pluginService;
    stage.removeEventListener('wheel', this.scroll as any);
  }
}
