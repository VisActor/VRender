import type { IGraphic, IGroup, IPlugin, IPluginService } from '@visactor/vrender-core';
import { Generator, injectable } from '@visactor/vrender-core';
import { ScrollBar } from './scrollbar';
import type { IAABBBounds } from '@visactor/vutils';
import { AABBBounds, abs, Bounds } from '@visactor/vutils';
import { SCROLLBAR_EVENT } from '../constant';
import type { ScrollBarAttributes } from './type';

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
  scrollContainer?: { g: IGroup; showH: boolean; showV: boolean };
  scrollContainerBounds: IAABBBounds;
  childrenBounds: IAABBBounds;

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
    // 计算子元素的bounds
    const graphic = e.target as any;
    // childrenBounds.set(0, 0, scrollContainer.AABBBounds.width(), scrollContainer.AABBBounds.height());

    const data = this.getScrollContainer(graphic);

    if (!data && !this.scrollContainer) {
      return;
    }

    if (!data && this.scrollContainer) {
      if (!this.scrollContainer.g.stage || this.scrollContainer.g.stage !== graphic.stage) {
        return;
      }
      const newScrollContainer = this.formatScrollContainer(this.scrollContainer.g);

      if (!newScrollContainer) {
        this.clearScrollbar(this.scrollContainer.g, 'all');
        // 删除老的scrollbar
        return;
      }
      if (this.scrollContainer.showH && !newScrollContainer.showH) {
        this.clearScrollbar(this.scrollContainer.g, 'horizontal');
      }

      if (this.scrollContainer.showV && !newScrollContainer.showV) {
        this.clearScrollbar(this.scrollContainer.g, 'vertical');
      }

      this.scrollContainer = newScrollContainer;
    } else if (data && this.scrollContainer && data.g !== this.scrollContainer.g) {
      this.clearScrollbar(this.scrollContainer.g, 'all');
    }

    this.scrollContainer = data ?? this.scrollContainer;
    if (!data) {
      return;
    }
    const scrollContainer = data.g;
    if (!scrollContainer) {
      return;
    }
    const { width, height, scrollX = 0, scrollY = 0 } = scrollContainer.attribute;
    let newScrollX = scrollX;
    let newScrollY = scrollY;
    let { showH, showV } = data;
    this.scrollContainerBounds = new Bounds().set(
      0,
      0,
      scrollContainer.attribute.width,
      scrollContainer.attribute.height
    );
    if (showH && showH) {
      if (abs(e.deltaX) > abs(e.deltaY)) {
        showH = showH && true;
        showV = showV && false;
      } else {
        showH = showH && false;
        showV = showV && true;
      }
    }

    const scrollWidth = this.childrenBounds.width();
    const scrollHeight = this.childrenBounds.height();

    if (showH) {
      newScrollX = scrollX - (e.deltaX ?? 0);
      if (newScrollX > 0) {
        newScrollX = 0;
      } else if (newScrollX < width - scrollWidth) {
        newScrollX = width - scrollWidth;
      }
    }

    if (showV) {
      newScrollY = scrollY - (e.deltaY ?? 0);
      if (newScrollY > 0) {
        newScrollY = 0;
      } else if (newScrollY < height - scrollHeight) {
        newScrollY = height - scrollHeight;
      }
    }

    scrollContainer.setAttributes({
      scrollX: newScrollX,
      scrollY: newScrollY
    });
    this.addOrUpdateScroll(showH, showV, scrollContainer.parent, scrollContainer);
  };

  handleScrollBarChange = (params: any) => {
    if (
      !this.scrollContainer ||
      !this.scrollContainerBounds ||
      !this.childrenBounds ||
      !params ||
      !params.target ||
      !params.detail ||
      !params.detail.value
    ) {
      return;
    }
    const scrollbar = params.target;
    const newRange = params.detail.value;

    if (scrollbar.attribute.direction === 'horizontal') {
      const scrollWidth = this.childrenBounds.width();

      this.scrollContainer.g.setAttributes({ scrollX: -newRange[0] * scrollWidth });
    } else {
      const scrollHeight = this.childrenBounds.height();

      this.scrollContainer.g.setAttributes({ scrollY: -newRange[0] * scrollHeight });
    }
  };

  initEventOfScrollbar(scrollContainer: IGroup, scrollbar: IGroup, isHorozntal?: boolean) {
    scrollContainer.addEventListener('pointerover', () => {
      scrollbar.setAttribute('visibleAll', true);
    });
    scrollContainer.addEventListener('pointermove', () => {
      scrollbar.setAttribute('visibleAll', true);
    });
    scrollContainer.addEventListener('pointerout', () => {
      scrollbar.setAttribute('visibleAll', false);
    });
    scrollbar.addEventListener('pointerover', () => {
      scrollbar.setAttribute('visibleAll', true);
    });
    scrollbar.addEventListener('pointerout', () => {
      scrollbar.setAttribute('visibleAll', true);
    });

    scrollbar.addEventListener('scrollUp', this.handleScrollBarChange);
    scrollbar.addEventListener(SCROLLBAR_EVENT, this.handleScrollBarChange);
  }

  addOrUpdateScroll(showH: boolean, showV: boolean, container: IGroup, scrollContainer: IGroup) {
    if (showH) {
      const { scrollBar: hScrollbar, isUpdate } = this.addOrUpdateHScroll(scrollContainer, container, true);

      if (!isUpdate) {
        this.initEventOfScrollbar(scrollContainer, hScrollbar, true);
      }
    } else {
      this.clearScrollbar(scrollContainer, 'horizontal');
    }
    if (showV) {
      const { scrollBar: vScrollbar, isUpdate } = this.addOrUpdateHScroll(scrollContainer, container, false);

      if (!isUpdate) {
        this.initEventOfScrollbar(scrollContainer, vScrollbar, false);
      }
    } else {
      this.clearScrollbar(scrollContainer, 'vertical');
    }
  }

  getDirection(isHorozntal?: boolean) {
    return isHorozntal ? 'horizontal' : 'vertical';
  }

  addOrUpdateHScroll(scrollContainer: IGroup, container: IGroup, isHorozntal?: boolean) {
    const direction = this.getDirection(isHorozntal);
    const name = `${scrollContainer.name ?? scrollContainer._uid}_${this.getDirection(isHorozntal)}_${this.name}`;
    const scrollbars = container.children.filter((g: ScrollBar) => g.name === name);
    let isUpdate = true;
    let scrollBar = scrollbars[0] as ScrollBar;

    const { y = 0, dy = 0, x = 0, dx = 0, height, width, zIndex = 0 } = this.scrollContainer.g.attribute;
    const attrs: Partial<ScrollBarAttributes> = {
      x: 0,
      y: 0,
      direction,
      zIndex: zIndex + 1,
      visibleAll: true,
      padding: [2, 0],
      railStyle: {
        fill: 'rgba(0, 0, 0, .1)'
      },
      range: [0, 0.05]
    };

    if (isHorozntal) {
      attrs.width = this.scrollContainerBounds.width();
      attrs.height = 12;
    } else {
      attrs.height = this.scrollContainerBounds.height();
      attrs.width = 12;
    }

    if (!scrollBar) {
      isUpdate = false;

      scrollBar = new ScrollBar(attrs as ScrollBarAttributes);
      scrollBar.name = name;
      container.add(scrollBar);
      (scrollBar as any).isScrollBar = true;
    } else if (scrollbars.length > 1) {
      scrollbars.forEach((child: IGraphic, index: number) => {
        if (index) {
          child.parent?.removeChild(child);
        }
      });
    }
    const childrenBounds = this.childrenBounds;

    const { scrollX, scrollY } = scrollContainer.attribute;
    if (isHorozntal) {
      const ratio = Math.min(this.scrollContainerBounds.width() / childrenBounds.width(), 1);
      const start = Math.max(Math.min(scrollX / this.childrenBounds.width(), 0), ratio - 1);
      attrs.x = x + dx;
      attrs.y = y + dy + height - (attrs.height ?? 0);
      attrs.range = [-start, -start + ratio];
    } else {
      const ratio = Math.min(this.scrollContainerBounds.height() / childrenBounds.height(), 1);
      const start = Math.max(Math.min(scrollY / this.childrenBounds.height(), 0), ratio - 1);
      attrs.x = x + dx + width - this.scrollContainerBounds.width();
      attrs.y = y + dy;
      attrs.range = [-start, -start + ratio];
    }

    scrollBar.setAttributes(attrs);
    return {
      scrollBar,
      isUpdate
    };
  }

  clearScrollbar(scrollContainer: IGroup, type: 'horizontal' | 'vertical' | 'all') {
    if (!scrollContainer.parent) {
      return;
    }
    const scrollbarBars = scrollContainer.parent.children.filter((child: IGroup) => {
      return (child as any).isScrollBar && (type === 'all' || (child.attribute as any).direction === type);
    });

    scrollbarBars.forEach((child: IGraphic) => {
      child.parent.removeChild(child);
    });
  }

  formatScrollContainer(g: IGraphic) {
    if (!g || g.type !== 'group' || !g.attribute) {
      return null;
    }

    const { overflow, width, height } = (g as IGroup).attribute;

    if (!overflow || overflow === 'hidden') {
      return null;
    }

    let showH = false;
    let showV = false;

    if (overflow === 'scroll') {
      showH = true;
      showV = true;
    } else {
      showH = overflow === 'scroll-x';
      showV = !showH;
    }

    const childrenBounds = this.childrenBounds;

    childrenBounds.clear();
    g.forEachChildren((g: IGraphic) => {
      childrenBounds.union(g.AABBBounds);
    });

    if (!g.AABBBounds.empty()) {
      if (showH) {
        showH = width < childrenBounds.width();
      }

      if (showV) {
        showV = height < childrenBounds.height();
      }
    }

    return showH || showV ? { g: g as IGroup, showH, showV } : null;
  }

  // 获取响应滚动的元素
  getScrollContainer(graphic: IGraphic): { g: IGroup; showH: boolean; showV: boolean } | null {
    let g = graphic;
    while (g) {
      const res = this.formatScrollContainer(g);

      if (res) {
        return res;
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
