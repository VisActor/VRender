Component({
  properties: {
    styles: {
      type: String
    },
    canvasId: {
      type: String
    },
    events: {
      type: Object,
      value: []
    }
  },
  data: {
    offscreenCanvasWidth: 0,
    offscreenCanvasHeight: 0,
    eventManager: undefined,
    stage: undefined
  },
  methods: {
    // bindEvent(event: any) {
    //   const { type } = event;
    //   if (!this.data.eventManager.cache[type]) {
    //     return;
    //   }

    //   // hack for offsetX offsetY
    //   if (event.changedTouches && event.changedTouches[0]) {
    //     event.offsetX = event.changedTouches[0].x;
    //     event.changedTouches[0].offsetX = event.changedTouches[0].x;
    //     event.changedTouches[0].clientX = event.changedTouches[0].x;
    //     event.offsetY = event.changedTouches[0].y;
    //     event.changedTouches[0].offsetY = event.changedTouches[0].y;
    //     event.changedTouches[0].clientY = event.changedTouches[0].y;
    //   }
    //   event.preventDefault = () => {};
    //   event.stopPropagation = () => {};
    //   if (this.data.eventManager.cache[type].listener) {
    //     this.data.eventManager.cache[type].listener.forEach(f => {
    //       f(event);
    //     });
    //   }
    // }
    init() {
      wx.createSelectorQuery()
        .select(`#${this.data.canvasId}_draw_canvas`) // 在 WXML 中填入的 id
        .fields({ node: true, size: true })
        .exec((res) => {
            // Canvas 对象
            const canvas = res[0].node
            // 渲染上下文
            const ctx = canvas.getContext('2d')
        });
    }
  },
  lifetimes: {
    ready() {
      wx.onWindowResize(res => {
        this.init();
      });
  
      // 初始化图表库
      this.init();
    },
    detached() {
      // this.data.
    }
  },
  
})
