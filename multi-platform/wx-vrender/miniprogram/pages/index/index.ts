import '../../npm-preload';
import {
  createArc,
  createArea,
  createCircle,
  createGroup,
  createImage,
  createLine,
  createPath,
  createPolygon,
  createRect,
  createRichText,
  createSymbol,
  createText,
  createWrapText,
  createWxVRenderApp,
  ArcLabel,
  ArcSegment,
  Brush,
  CheckBox,
  CircleAxis,
  CircleAxisGrid,
  CircleCrosshair,
  ColorContinuousLegend,
  ContinuousPlayer,
  DataLabel,
  DataZoom,
  DiscreteLegend,
  DiscretePlayer,
  EmptyTip,
  Indicator,
  LineAxis,
  LineAxisGrid,
  LineCrosshair,
  LineLabel,
  LinkPath,
  MarkArcArea,
  MarkArcLine,
  MarkArea,
  MarkLine,
  MarkPoint,
  Pager,
  PolygonCrosshair,
  PolygonSectorCrosshair,
  PopTip,
  Radio,
  RectCrosshair,
  RectLabel,
  ScrollBar,
  Segment,
  SectorCrosshair,
  SizeContinuousLegend,
  Slider,
  StoryLabelItem,
  Switch,
  SymbolLabel,
  TableSeriesNumber,
  Tag,
  Timeline,
  Title,
  Tooltip,
  WeatherBox
} from '@visactor/vrender';

const SCENES = [
  { key: 'primitives', label: '基础图元' },
  { key: 'text', label: '文本排版' },
  { key: 'animation', label: '动画' },
  { key: 'animationControls', label: '动画控制' },
  { key: 'resources', label: '图片资源' },
  { key: 'components', label: '组件' },
  { key: 'componentAxes', label: '轴图例' },
  { key: 'componentMarks', label: '标注准星' },
  { key: 'componentControls', label: '控件组件' },
  { key: 'componentMisc', label: '杂项组件' },
  { key: 'styles', label: '样式矩阵' },
  { key: 'transform', label: '变换裁剪' },
  { key: 'states', label: '状态刷新' },
  { key: 'stress', label: '批量' },
  { key: 'events', label: '事件拾取' },
  { key: 'geometry', label: '几何更新' },
  { key: 'lifecycle', label: '生命周期' }
] as const;

type SceneKey = (typeof SCENES)[number]['key'];

const SCENE_META: Record<SceneKey, { title: string; hint: string }> = {
  primitives: {
    title: '基础图元与事件',
    hint: '覆盖 rect/circle/symbol/line/area/arc/path/polygon，点击矩形或圆形验证事件与状态。'
  },
  text: {
    title: '文本与富文本',
    hint: '覆盖普通文本、多行文本、自动换行文本、富文本片段和文字装饰。'
  },
  animation: {
    title: '基础动画',
    hint: '覆盖 to/from、loop、bounce、颜色/尺寸/位置动画和 onFrame 渲染。'
  },
  animationControls: {
    title: '动画控制与编排',
    hint: '覆盖 pause/resume、stop(end)、after/parallel 编排和动画结束属性提交。'
  },
  resources: {
    title: '图片与资源',
    hint: '覆盖 image 图元、本地 OffscreenCanvas 资源、imageMode、圆角裁剪、拾取和资源替换重绘。'
  },
  components: {
    title: '组件与分组能力',
    hint: '覆盖 Tag、Segment、clip group、zIndex/opacity 叠放和组件状态切换。'
  },
  componentAxes: {
    title: '组件：坐标轴与图例',
    hint: '覆盖 LineAxis/CircleAxis/Grid、Discrete/Color/Size Legend 和 ScrollBar。'
  },
  componentMarks: {
    title: '组件：标注与准星',
    hint: '覆盖 MarkLine/MarkArea/MarkPoint/Arc marker、Crosshair 和 Label 组件。'
  },
  componentControls: {
    title: '组件：交互控件',
    hint: '覆盖 Slider、DataZoom、Pager、Brush、Timeline、Player、Checkbox/Radio/Switch。'
  },
  componentMisc: {
    title: '组件：提示与杂项',
    hint: '覆盖 Title、Indicator、Tooltip、PopTip、EmptyTip、LinkPath、Weather、TableSeriesNumber 等。'
  },
  styles: {
    title: '样式矩阵',
    hint: '覆盖线性/径向渐变、阴影、透明度、lineDash、stroke/fill 样式更新。'
  },
  transform: {
    title: '变换与裁剪',
    hint: '覆盖嵌套 group、旋转/缩放/位移、clip、zIndex 和 transform 后拾取。'
  },
  states: {
    title: '状态刷新',
    hint: '覆盖 setStates、状态清除、同状态 patch 刷新和状态样式重绘。'
  },
  stress: {
    title: '批量图元更新',
    hint: '覆盖批量创建、批量 setAttribute、透明度、描边样式和事件拾取。'
  },
  events: {
    title: '事件拾取边界',
    hint: '覆盖重叠图元、zIndex、旋转分组、clip 内节点和事件冒泡。'
  },
  geometry: {
    title: '几何属性更新',
    hint: '覆盖 line/area/polygon/path/arc/symbol 的几何属性更新、bounds 和重绘。'
  },
  lifecycle: {
    title: '生命周期与清理',
    hint: '覆盖 removeAllChild(true)、节点重建、属性更新后重绘和场景切换清理。'
  }
};

const CAPABILITY_CHIPS = [
  'graphics',
  'text',
  'state',
  'events',
  'animation',
  'animation-control',
  'resource',
  'components',
  'component-axis',
  'component-marker',
  'component-controls',
  'component-misc',
  'styles',
  'transform',
  'state-refresh',
  'batch',
  'geometry',
  'lifecycle'
];

type CanvasQueryResult = {
  canvas: WechatMiniprogram.Canvas;
  width: number;
  height: number;
  dpr: number;
};

type WxCanvasFactoryOptions = {
  id?: string;
  width: number;
  height: number;
  dpr: number;
  offscreen: boolean;
};

const linearGradient = (from: string, to: string): any => ({
  gradient: 'linear',
  x0: 0,
  y0: 0,
  x1: 1,
  y1: 1,
  stops: [
    { offset: 0, color: from },
    { offset: 1, color: to }
  ]
});

const axisItems = (labels: string[]) =>
  labels.map((label, index) => ({
    id: label,
    label,
    value: labels.length <= 1 ? 0 : index / (labels.length - 1),
    rawValue: label
  }));

const componentCtor = <T extends new (...args: any[]) => any>(Ctor: T) => Ctor as any;

Page({
  data: {
    status: 'waiting',
    actionStatus: '等待初始化',
    fill: '#276EF1',
    sceneKey: 'primitives' as SceneKey,
    sceneTitle: SCENE_META.primitives.title,
    sceneHint: SCENE_META.primitives.hint,
    scenes: SCENES,
    capabilityChips: CAPABILITY_CHIPS
  },
  app: undefined as any,
  stage: undefined as any,
  rect: undefined as any,
  stateCircle: undefined as any,
  componentTag: undefined as any,
  componentControls: [] as any[],
  componentInteractive: [] as any[],
  rotatingSymbol: undefined as any,
  styleNodes: undefined as any,
  transformNodes: undefined as any,
  stateNodes: undefined as any,
  lifecycleGroup: undefined as any,
  geometryNodes: undefined as any,
  animationControlNodes: undefined as any,
  resourceNodes: undefined as any,
  sceneAnimates: [] as any[],
  stressNodes: [] as any[],
  lifecycleNodes: [] as any[],
  canvasWidth: 0,
  canvasHeight: 0,
  stateCircleSelected: false,
  componentTagSelected: false,
  componentControlAlt: false,
  styleAlt: false,
  transformAlt: false,
  stateAlt: false,
  statePatchAlt: false,
  stressAlt: false,
  geometryAlt: false,
  lifecycleAlt: false,

  onReady() {
    this.mountVRender();
  },

  onUnload() {
    this.clearScene();
    this.stage?.release?.();
    this.app?.release?.();
    this.stage = undefined;
    this.app = undefined;
  },

  async mountVRender() {
    try {
      const { canvas, width, height, dpr } = await this.queryMainCanvas();
      this.canvasWidth = width;
      this.canvasHeight = height;
      this.setData({ status: `canvas ${Math.round(width)}x${Math.round(height)} @${dpr}` });

      this.app = createWxVRenderApp({
        envParams: {
          pixelRatio: dpr,
          canvasFactory: this.createWxCanvasFactory(dpr)
        }
      });

      this.stage = this.app.createStage({
        canvas,
        width,
        height,
        dpr,
        autoRender: true,
        canvasControled: true,
        interactiveLayer: false
      });

      this.renderScene(this.data.sceneKey);
      this.setData({ status: 'rendered' });
    } catch (err) {
      console.error('[wx-vrender-test] mount failed', err);
      this.setData({ status: 'failed', actionStatus: '初始化失败，查看 console' });
    }
  },

  queryMainCanvas(): Promise<CanvasQueryResult> {
    return new Promise((resolve, reject) => {
      wx.createSelectorQuery()
        .select('#vrender-main')
        .fields({ node: true, size: true })
        .exec(res => {
          const info = res?.[0];
          const canvas = info?.node as WechatMiniprogram.Canvas | undefined;
          if (!canvas) {
            reject(new Error('Cannot find #vrender-main canvas node'));
            return;
          }

          const dpr = wx.getSystemInfoSync().pixelRatio || 1;
          const width = info.width || 351;
          const height = info.height || 380;
          canvas.width = width * dpr;
          canvas.height = height * dpr;
          resolve({ canvas, width, height, dpr });
        });
    });
  },

  createWxCanvasFactory(defaultDpr: number) {
    return (options: WxCanvasFactoryOptions) => {
      const createOffscreenCanvas = (wx as any).createOffscreenCanvas;
      if (typeof createOffscreenCanvas !== 'function') {
        throw new Error('wx.createOffscreenCanvas is required for VRender internal canvas allocation.');
      }

      const dpr = options.dpr || defaultDpr || 1;
      const width = options.width || 1;
      const height = options.height || 1;
      const pixelWidth = Math.max(1, Math.ceil(width * dpr));
      const pixelHeight = Math.max(1, Math.ceil(height * dpr));
      const canvas = createOffscreenCanvas({ type: '2d', width: pixelWidth, height: pixelHeight });
      canvas.width = pixelWidth;
      canvas.height = pixelHeight;
      if (options.id != null) {
        canvas.id = options.id;
      }
      return canvas;
    };
  },

  switchScene(event: any) {
    const sceneKey = event.currentTarget?.dataset?.key as SceneKey;
    if (!SCENE_META[sceneKey]) {
      return;
    }
    this.renderScene(sceneKey);
  },

  rerenderScene() {
    this.renderScene(this.data.sceneKey);
  },

  renderScene(sceneKey: SceneKey) {
    if (!this.stage) {
      this.setData({ sceneKey });
      return;
    }

    const meta = SCENE_META[sceneKey];
    this.clearScene();
    this.setData({
      sceneKey,
      sceneTitle: meta.title,
      sceneHint: meta.hint,
      actionStatus: `${meta.title} 已渲染`
    });

    try {
      const width = this.canvasWidth || this.stage.width || 351;
      const height = this.canvasHeight || this.stage.height || 380;
      this.drawSceneFrame(width, height);

      if (sceneKey === 'primitives') {
        this.drawPrimitivesScene(width, height);
      } else if (sceneKey === 'text') {
        this.drawTextScene(width, height);
      } else if (sceneKey === 'animation') {
        this.drawAnimationScene(width, height);
      } else if (sceneKey === 'animationControls') {
        this.drawAnimationControlsScene(width, height);
      } else if (sceneKey === 'resources') {
        this.drawResourceScene(width, height);
      } else if (sceneKey === 'components') {
        this.drawComponentsScene(width, height);
      } else if (sceneKey === 'componentAxes') {
        this.drawComponentAxesScene(width, height);
      } else if (sceneKey === 'componentMarks') {
        this.drawComponentMarksScene(width, height);
      } else if (sceneKey === 'componentControls') {
        this.drawComponentControlsScene(width, height);
      } else if (sceneKey === 'componentMisc') {
        this.drawComponentMiscScene(width, height);
      } else if (sceneKey === 'styles') {
        this.drawStylesScene(width, height);
      } else if (sceneKey === 'transform') {
        this.drawTransformScene(width, height);
      } else if (sceneKey === 'states') {
        this.drawStatesScene(width, height);
      } else if (sceneKey === 'events') {
        this.drawEventsScene(width, height);
      } else if (sceneKey === 'geometry') {
        this.drawGeometryScene(width, height);
      } else if (sceneKey === 'lifecycle') {
        this.drawLifecycleScene(width, height);
      } else {
        this.drawStressScene(width, height);
      }

      this.stage.render();
    } catch (err) {
      console.error(`[wx-vrender-test] render scene ${sceneKey} failed`, err);
      this.setData({ actionStatus: `${meta.title} 渲染失败，查看 console` });
    }
  },

  clearScene() {
    this.sceneAnimates.forEach(animate => {
      animate?.stop?.();
    });
    this.sceneAnimates = [];
    this.stage?.defaultLayer?.removeAllChild?.(true);
    this.rect = undefined;
    this.stateCircle = undefined;
    this.componentTag = undefined;
    this.componentControls = [];
    this.componentInteractive = [];
    this.rotatingSymbol = undefined;
    this.styleNodes = undefined;
    this.transformNodes = undefined;
    this.stateNodes = undefined;
    this.lifecycleGroup = undefined;
    this.geometryNodes = undefined;
    this.animationControlNodes = undefined;
    this.resourceNodes = undefined;
    this.stressNodes = [];
    this.lifecycleNodes = [];
    this.stateCircleSelected = false;
    this.componentTagSelected = false;
    this.componentControlAlt = false;
    this.styleAlt = false;
    this.transformAlt = false;
    this.stateAlt = false;
    this.statePatchAlt = false;
    this.stressAlt = false;
    this.geometryAlt = false;
    this.lifecycleAlt = false;
  },

  drawSceneFrame(width: number, height: number) {
    const layer = this.stage.defaultLayer;
    layer.add(
      createRect({
        x: 8,
        y: 8,
        width: width - 16,
        height: height - 16,
        fill: '#ffffff',
        stroke: '#E1E7F0',
        lineWidth: 1,
        cornerRadius: 12
      })
    );
    layer.add(
      createText({
        x: 20,
        y: height - 20,
        text: `${this.data.sceneTitle} / ${this.data.status}`,
        fontSize: 12,
        fill: '#667085'
      })
    );
  },

  addSectionLabel(text: string, x: number, y: number) {
    this.stage.defaultLayer.add(
      createText({
        x,
        y,
        text,
        fontSize: 12,
        fill: '#667085',
        fontWeight: 500
      })
    );
  },

  recordAnimate(animate: any) {
    if (animate) {
      this.sceneAnimates.push(animate);
    }
    return animate;
  },

  bindComponentEvents(name: string, component: any, events: string[]) {
    events.forEach(eventName => {
      component?.addEventListener?.(eventName, (event: any) => {
        const detail = event?.detail ?? {};
        const detailParts = ['value', 'start', 'end', 'current', 'checked', 'index']
          .filter(key => detail[key] !== undefined)
          .map(key => `${key}=${Array.isArray(detail[key]) ? detail[key].join(',') : detail[key]}`);
        this.setData({
          actionStatus: `${name} ${eventName}${detailParts.length ? ` (${detailParts.join(' ')})` : ''}`
        });
      });
    });
  },

  addComponentSmoke(name: string, factory: () => any, x: number, y: number, events: string[] = []) {
    try {
      const component = factory();
      this.stage.defaultLayer.add(component);
      if (!events.length) {
        component.addEventListener?.('pointerdown', () => {
          this.setData({ actionStatus: `${name} pointerdown` });
        });
      }
      this.bindComponentEvents(name, component, events);
      return component;
    } catch (err) {
      console.error(`[wx-vrender-test] component smoke failed: ${name}`, err);
      this.stage.defaultLayer.add(
        createText({
          x,
          y,
          text: `${name} failed`,
          fontSize: 12,
          fill: '#D92D20'
        })
      );
      return null;
    }
  },

  drawPrimitivesScene(width: number, height: number) {
    const layer = this.stage.defaultLayer;
    this.addSectionLabel('shape / event / state', 22, 30);

    const rect = createRect({
      x: 22,
      y: 48,
      width: 92,
      height: 64,
      fill: linearGradient('#276EF1', '#12B76A'),
      stroke: '#173B83',
      lineWidth: 3,
      cornerRadius: 10,
      shadowBlur: 8,
      shadowColor: 'rgba(39, 110, 241, 0.25)'
    });
    rect.addEventListener('pointerdown', () => {
      rect.setAttribute('fill', '#11A579');
      this.setData({ actionStatus: 'rect pointerdown -> green' });
      this.stage.render();
    });
    this.rect = rect;
    layer.add(rect);

    const circle = createCircle({
      x: 158,
      y: 80,
      radius: 31,
      fill: '#E7F0FF',
      stroke: '#276EF1',
      lineWidth: 3
    });
    circle.states = {
      selected: {
        fill: '#D1FAE5',
        stroke: '#087F5B',
        lineWidth: 6,
        radius: 36
      }
    };
    circle.addEventListener('pointerdown', () => {
      this.toggleStateCircle();
    });
    this.stateCircle = circle;
    layer.add(circle);

    layer.add(
      createSymbol({
        x: 236,
        y: 80,
        size: 52,
        symbolType: 'star',
        fill: '#F5A623',
        stroke: '#8D5B00',
        lineWidth: 2
      })
    );
    layer.add(
      createPolygon({
        points: [
          { x: width - 58, y: 46 },
          { x: width - 28, y: 82 },
          { x: width - 50, y: 114 },
          { x: width - 88, y: 100 },
          { x: width - 84, y: 60 }
        ],
        fill: '#FEE4E2',
        stroke: '#D92D20',
        lineWidth: 2,
        cornerRadius: 6
      })
    );

    this.addSectionLabel('line / area / arc / path', 22, 142);
    layer.add(
      createLine({
        points: [
          { x: 24, y: 182 },
          { x: 72, y: 150 },
          { x: 120, y: 180 },
          { x: 170, y: 152 },
          { x: 220, y: 174 }
        ],
        stroke: '#7C3AED',
        lineWidth: 4,
        lineCap: 'round',
        lineJoin: 'round',
        curveType: 'monotoneX'
      })
    );
    layer.add(
      createArea({
        points: [
          { x: 24, y: 246, y1: 290 },
          { x: 72, y: 220, y1: 290 },
          { x: 120, y: 238, y1: 290 },
          { x: 170, y: 206, y1: 290 },
          { x: 220, y: 232, y1: 290 }
        ],
        fill: 'rgba(124, 58, 237, 0.22)',
        stroke: '#7C3AED',
        lineWidth: 2,
        curveType: 'monotoneX'
      })
    );
    layer.add(
      createArc({
        x: width - 78,
        y: 204,
        innerRadius: 26,
        outerRadius: 46,
        startAngle: -Math.PI * 0.2,
        endAngle: Math.PI * 1.35,
        fill: '#11A579',
        stroke: '#075E54',
        lineWidth: 2,
        cornerRadius: 6
      })
    );
    layer.add(
      createPath({
        path: `M${width - 148} 270 C${width - 150} 240 ${width - 106} 240 ${width - 108} 270 C${width - 108} 300 ${width - 150} 304 ${width - 148} 270 Z`,
        fill: '#E64980',
        stroke: '#8A1248',
        lineWidth: 2
      })
    );
  },

  drawTextScene(width: number, height: number) {
    const layer = this.stage.defaultLayer;
    this.addSectionLabel('plain text / multi line', 22, 30);
    layer.add(
      createText({
        x: 24,
        y: 56,
        text: 'Hello VRender WX',
        fontSize: 24,
        fontWeight: 700,
        fill: '#1D2939'
      })
    );
    layer.add(
      createText({
        x: width - 24,
        y: 62,
        text: ['right aligned', 'multi line'],
        fontSize: 13,
        fill: '#475467',
        textAlign: 'right',
        lineHeight: 18
      })
    );

    this.addSectionLabel('wrap text / decoration', 22, 112);
    layer.add(
      createWrapText({
        x: 24,
        y: 138,
        text: 'WrapText: 小程序 Canvas 2D 下的自动换行、ellipsis 和 lineClamp smoke。',
        fontSize: 15,
        fill: '#344054',
        maxLineWidth: width - 52,
        lineClamp: 2,
        ellipsis: true,
        lineHeight: 22
      })
    );
    layer.add(
      createText({
        x: 24,
        y: 206,
        text: 'underline + lineThrough',
        fontSize: 16,
        fill: '#D92D20',
        underline: 1,
        lineThrough: 1
      })
    );

    this.addSectionLabel('rich text', 22, 250);
    layer.add(
      createRichText({
        x: 24,
        y: 276,
        width: width - 48,
        height: Math.max(72, height - 306),
        textConfig: [
          { text: 'RichText ', fontSize: 18, fill: '#276EF1', fontWeight: 'bold' },
          { text: 'mixed ', fontSize: 16, fill: '#344054' },
          { text: 'colors', fontSize: 16, fill: '#11A579', background: '#D1FAE5' },
          { text: ' / baseline / wrapping', fontSize: 16, fill: '#344054' }
        ],
        textAlign: 'left',
        textBaseline: 'top',
        wordBreak: 'break-word'
      })
    );
  },

  drawAnimationScene(width: number, height: number) {
    const layer = this.stage.defaultLayer;
    this.addSectionLabel('loop / bounce / attribute animation', 22, 30);

    const pulse = createCircle({
      x: 72,
      y: 102,
      radius: 24,
      fill: '#276EF1',
      fillOpacity: 0.78,
      stroke: '#173B83',
      lineWidth: 3
    });
    layer.add(pulse);
    this.recordAnimate(
      pulse
        .animate?.({ onFrame: () => this.stage?.render?.() })
        .to({ radius: 42, fillOpacity: 0.28 }, 900, 'cubicInOut')
        .to({ radius: 24, fillOpacity: 0.78 }, 900, 'cubicInOut')
        .loop(true)
    );

    const star = createSymbol({
      x: width - 76,
      y: 102,
      size: 60,
      symbolType: 'star',
      fill: '#F5A623',
      stroke: '#8D5B00',
      lineWidth: 2
    });
    this.rotatingSymbol = star;
    layer.add(star);
    this.recordAnimate(
      star
        .animate?.({ onFrame: () => this.stage?.render?.() })
        .to({ angle: Math.PI * 2 }, 1800, 'linear')
        .loop(true)
    );

    const colors = ['#276EF1', '#11A579', '#F79009', '#E64980'];
    const appearLabel = createText({
      x: width - 28,
      y: 206,
      text: 'from() label',
      fontSize: 16,
      fill: '#344054',
      textAlign: 'right',
      opacity: 1
    });
    layer.add(appearLabel);
    this.recordAnimate(
      appearLabel
        .animate?.({ onFrame: () => this.stage?.render?.() })
        .from({ y: 226, opacity: 0 }, 720, 'cubicOut')
    );

    [0, 1, 2, 3].forEach(index => {
      const targetHeight = 56 + index * 24;
      const bar = createRect({
        x: 34 + index * 54,
        y: 306 - targetHeight,
        width: 34,
        height: targetHeight,
        fill: colors[index],
        opacity: 1,
        cornerRadius: [6, 6, 0, 0]
      });
      layer.add(bar);
      this.recordAnimate(
        bar
          .animate?.({ onFrame: () => this.stage?.render?.() })
          .wait(index * 120)
          .from({ y: 306, height: 0, opacity: 0 }, 860, 'cubicOut')
      );
    });

    const mover = createRect({
      x: 28,
      y: 178,
      width: 46,
      height: 34,
      fill: '#0F766E',
      cornerRadius: 8
    });
    layer.add(mover);
    this.recordAnimate(
      mover
        .animate?.({ onFrame: () => this.stage?.render?.() })
        .to({ x: width - 80, fill: '#D92D20' }, 1400, 'cubicInOut')
        .loop(true)
        .bounce(true)
    );
  },

  drawAnimationControlsScene(width: number, height: number) {
    const layer = this.stage.defaultLayer;
    this.addSectionLabel('pause / resume / stop(end)', 22, 30);

    const mover = createCircle({
      x: 54,
      y: 74,
      radius: 18,
      fill: '#276EF1',
      stroke: '#173B83',
      lineWidth: 2
    });
    layer.add(mover);
    const moverAnimate = this.recordAnimate(
      mover
        .animate?.({ onFrame: () => this.stage?.render?.() })
        .to({ x: width - 60, fill: '#11A579' }, 1100, 'cubicInOut')
        .loop(true)
        .bounce(true)
    );

    const stopRect = createRect({
      x: 28,
      y: 116,
      width: 52,
      height: 30,
      fill: '#F79009',
      cornerRadius: 8
    });
    layer.add(stopRect);
    const stopAnimate = this.recordAnimate(
      stopRect
        .animate?.({ onFrame: () => this.stage?.render?.() })
        .to({ x: width - 86, width: 64, fill: '#D92D20' }, 1800, 'cubicInOut')
    );

    this.addSectionLabel('after / parallel / final attrs', 22, 178);
    const first = createRect({
      x: 28,
      y: 210,
      width: 46,
      height: 28,
      fill: '#7C3AED',
      cornerRadius: 6
    });
    const after = createSymbol({
      x: 52,
      y: 284,
      size: 34,
      symbolType: 'diamond',
      fill: '#E64980'
    });
    const parallel = createCircle({
      x: width - 58,
      y: 224,
      radius: 15,
      fill: '#0F766E'
    });
    layer.add(first);
    layer.add(after);
    layer.add(parallel);

    const firstAnimate = this.recordAnimate(
      first
        .animate?.({ onFrame: () => this.stage?.render?.() })
        .to({ x: width - 92, fill: '#276EF1' }, 900, 'cubicOut')
    );
    this.recordAnimate(
      after
        .animate?.({ onFrame: () => this.stage?.render?.() })
        .to({ x: width - 86, angle: Math.PI, fill: '#F79009' }, 780, 'cubicOut')
        .after(firstAnimate)
    );
    this.recordAnimate(
      parallel
        .animate?.({ onFrame: () => this.stage?.render?.() })
        .to({ y: 292, radius: 28, fillOpacity: 0.46 }, 900, 'cubicInOut')
        .parallel(firstAnimate)
    );

    const finalText = createText({
      x: 24,
      y: height - 76,
      text: '切换图元颜色：pause/resume；切换状态样式：stop(end)。after/parallel 会自动编排。',
      fontSize: 13,
      fill: '#475467',
      maxLineWidth: width - 48,
      lineHeight: 18
    });
    layer.add(finalText);

    this.animationControlNodes = {
      moverAnimate,
      stopAnimate,
      paused: false
    };
  },

  createResourceCanvas(alt: boolean, size: number) {
    const createOffscreenCanvas = (wx as any).createOffscreenCanvas;
    if (!createOffscreenCanvas) {
      return null;
    }

    const canvas = createOffscreenCanvas({ type: '2d', width: size, height: size });
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return null;
    }

    const gradient = ctx.createLinearGradient(0, 0, size, size);
    gradient.addColorStop(0, alt ? '#FEE4E2' : '#E0EAFF');
    gradient.addColorStop(1, alt ? '#D92D20' : '#276EF1');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = alt ? '#101828' : '#11A579';
    ctx.beginPath();
    ctx.arc(size * 0.68, size * 0.36, size * 0.18, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = `${Math.round(size * 0.22)}px sans-serif`;
    ctx.fillText(alt ? 'B' : 'A', size * 0.16, size * 0.76);
    return canvas;
  },

  drawResourceScene(width: number, height: number) {
    const layer = this.stage.defaultLayer;
    this.addSectionLabel('image graphic / offscreen canvas resource', 22, 30);
    const imageA = this.createResourceCanvas(false, 96);
    const imageB = this.createResourceCanvas(true, 96);

    if (!imageA || !imageB) {
      layer.add(
        createText({
          x: 24,
          y: 72,
          text: 'wx.createOffscreenCanvas 不可用，当前宿主无法执行本地 image 资源 smoke。',
          fontSize: 14,
          fill: '#D92D20',
          maxLineWidth: width - 48
        })
      );
      return;
    }

    const containImage = createImage({
      x: 42,
      y: 60,
      width: 82,
      height: 82,
      image: imageA as any,
      imageMode: 'contain',
      cornerRadius: 12
    });
    const coverImage = createImage({
      x: 148,
      y: 70,
      width: 90,
      height: 62,
      image: imageB as any,
      imageMode: 'cover',
      cornerRadius: 12
    });
    const fillImage = createImage({
      x: width - 100,
      y: 60,
      width: 70,
      height: 96,
      image: imageA as any,
      imageMode: 'fill',
      cornerRadius: [18, 4, 18, 4]
    });
    [containImage, coverImage, fillImage].forEach((node, index) => {
      node.addEventListener('pointerdown', () => {
        node.setAttribute('opacity', node.attribute.opacity === 0.55 ? 1 : 0.55);
        this.setData({ actionStatus: `image ${index + 1} opacity toggled` });
        this.stage.render();
      });
      layer.add(node);
    });

    this.addSectionLabel('resource replace / pick', 22, 196);
    layer.add(
      createRect({
        x: 30,
        y: 228,
        width: width - 60,
        height: 76,
        fill: '#F8FAFC',
        stroke: '#CBD5E1',
        lineDash: [4, 4],
        cornerRadius: 14
      })
    );
    layer.add(
      createText({
        x: 46,
        y: 258,
        text: '点击顶部图片验证 image pick；底部按钮替换 image 资源。',
        fontSize: 14,
        fill: '#475467',
        maxLineWidth: width - 92
      })
    );

    layer.add(
      createText({
        x: 24,
        y: height - 58,
        text: 'object image 当前不参与 animate/state，避免触发 VRender wx image resource key 脱开问题。',
        fontSize: 13,
        fill: '#475467',
        maxLineWidth: width - 48
      })
    );

    this.resourceNodes = {
      imageA,
      imageB,
      containImage,
      coverImage,
      fillImage,
      alt: false
    };
  },

  drawComponentsScene(width: number, height: number) {
    const layer = this.stage.defaultLayer;
    this.addSectionLabel('Tag component / click state', 22, 30);

    const tag = new Tag({
      x: 24,
      y: 52,
      text: 'Tag Component',
      textStyle: {
        fontSize: 15,
        fill: '#ffffff'
      },
      shape: {
        visible: true,
        symbolType: 'circle',
        size: 9,
        fill: '#ffffff'
      },
      panel: {
        visible: true,
        fill: '#276EF1',
        stroke: '#173B83',
        lineWidth: 1,
        cornerRadius: 8
      },
      padding: [8, 12],
      space: 6,
      state: {
        panel: {
          selected: {
            fill: '#0F766E',
            stroke: '#064E3B'
          }
        },
        text: {
          selected: {
            fill: '#ffffff'
          }
        },
        shape: {
          selected: {
            fill: '#FDE68A'
          }
        }
      }
    });
    tag.addEventListener('pointerdown', () => this.toggleStateCircle());
    this.componentTag = tag;
    layer.add(tag);

    this.addSectionLabel('Segment component', 22, 112);
    layer.add(
      new Segment({
        points: [
          { x: 28, y: 148 },
          { x: width * 0.44, y: 122 },
          { x: width - 36, y: 164 }
        ],
        lineStyle: {
          stroke: '#7C3AED',
          lineWidth: 3,
          lineDash: [6, 4]
        },
        startSymbol: {
          visible: true,
          symbolType: 'circle',
          size: 12,
          style: {
            fill: '#7C3AED'
          }
        },
        endSymbol: {
          visible: true,
          symbolType: 'triangleRight',
          size: 16,
          style: {
            fill: '#7C3AED'
          }
        }
      })
    );
    layer.add(
      new ArcSegment({
        center: { x: width - 84, y: 158 },
        radius: 34,
        startAngle: -Math.PI * 0.65,
        endAngle: Math.PI * 0.7,
        lineStyle: {
          stroke: '#0F766E',
          lineWidth: 3
        },
        startSymbol: {
          visible: true,
          symbolType: 'circle',
          size: 10,
          style: { fill: '#0F766E' }
        },
        endSymbol: {
          visible: true,
          symbolType: 'triangleRight',
          size: 14,
          autoRotate: true,
          style: { fill: '#0F766E' }
        }
      })
    );

    this.addSectionLabel('clip group / transform / opacity', 22, 204);
    const clipGroup = createGroup({
      x: 24,
      y: 226,
      width: width - 48,
      height: 92,
      clip: true,
      cornerRadius: 10
    });
    clipGroup.add(
      createRect({
        x: 0,
        y: 0,
        width: width - 48,
        height: 92,
        fill: '#F2F4F7',
        stroke: '#CDD5DF',
        lineWidth: 1,
        cornerRadius: 10
      })
    );
    for (let i = 0; i < 7; i++) {
      clipGroup.add(
        createCircle({
          x: 18 + i * 48,
          y: 46 + (i % 2 === 0 ? -18 : 18),
          radius: 26,
          fill: i % 2 === 0 ? '#F79009' : '#2E90FA',
          fillOpacity: 0.58
        })
      );
    }
    const rotated = createGroup({
      x: width - 116,
      y: 252,
      angle: -0.24,
      opacity: 0.92
    });
    rotated.add(
      createRect({
        x: 0,
        y: 0,
        width: 76,
        height: 42,
        fill: '#FFF4D6',
        stroke: '#B7791F',
        lineWidth: 2,
        cornerRadius: 8
      })
    );
    rotated.add(
      createText({
        x: 14,
        y: 27,
        text: 'group',
        fontSize: 14,
        fill: '#3D2C00'
      })
    );
    layer.add(clipGroup);
    layer.add(rotated);
  },

  drawComponentAxesScene(width: number, height: number) {
    this.addSectionLabel('Axis / Grid', 22, 30);
    const xItems = axisItems(['A', 'B', 'C', 'D', 'E']);
    const yItems = axisItems(['0', '25', '50', '75', '100']);

    this.addComponentSmoke(
      'LineAxis',
      () =>
        new (componentCtor(LineAxis))({
          start: { x: 32, y: 120 },
          end: { x: width - 42, y: 120 },
          items: [xItems],
          line: { visible: true, stroke: '#344054' },
          tick: { visible: true },
          label: { visible: true, space: 6, style: { fontSize: 11, fill: '#475467' } },
          title: { visible: true, text: 'LineAxis', position: 'middle', space: 16, style: { fontSize: 12 } }
        }),
      32,
      120
    );
    this.addComponentSmoke(
      'LineAxisGrid',
      () =>
        new (componentCtor(LineAxisGrid))({
          start: { x: 32, y: 142 },
          end: { x: width - 42, y: 142 },
          items: [xItems],
          verticalFactor: 1,
          length: 58,
          style: { stroke: '#CBD5E1', lineDash: [4, 3] }
        }),
      32,
      142
    );
    this.addComponentSmoke(
      'CircleAxis',
      () =>
        new (componentCtor(CircleAxis))({
          center: { x: 90, y: 238 },
          radius: 46,
          startAngle: -Math.PI * 0.75,
          endAngle: Math.PI * 0.75,
          items: [yItems],
          line: { visible: true, stroke: '#7C3AED' },
          tick: { visible: true },
          label: { visible: true, space: 4, style: { fontSize: 10, fill: '#475467' } }
        }),
      90,
      238
    );
    this.addComponentSmoke(
      'CircleAxisGrid',
      () =>
        new (componentCtor(CircleAxisGrid))({
          center: { x: 90, y: 238 },
          radius: 46,
          items: [yItems],
          subGrid: { visible: false },
          style: { stroke: '#E4E7EC', lineDash: [3, 3] }
        }),
      90,
      238
    );

    this.addSectionLabel('Legend / ScrollBar', 176, 170);
    this.addComponentSmoke(
      'DiscreteLegend',
      () =>
        new (componentCtor(DiscreteLegend))({
          x: 168,
          y: 190,
          maxWidth: width - 190,
          maxRow: 2,
          title: { visible: true, text: 'DiscreteLegend' },
          item: { shape: { style: { size: 8 } }, label: { style: { fontSize: 11 } } },
          items: [
            { label: 'A', shape: { fill: '#276EF1', symbolType: 'circle' } },
            { label: 'B', shape: { fill: '#11A579', symbolType: 'square' } },
            { label: 'C', shape: { fill: '#F79009', symbolType: 'triangle' } },
            { label: 'D', shape: { fill: '#E64980', symbolType: 'diamond' } }
          ],
          allowAllCanceled: false
        }),
      168,
      190,
      ['legendItemClick', 'legendItemHover', 'legendItemUnHover']
    );
    this.addComponentSmoke(
      'ColorContinuousLegend',
      () =>
        new (componentCtor(ColorContinuousLegend))({
          x: 168,
          y: 256,
          title: { visible: true, text: 'ColorLegend' },
          colors: ['#E0EAFF', '#276EF1', '#173B83'],
          layout: 'horizontal',
          railWidth: 124,
          railHeight: 8,
          min: 0,
          max: 100,
          value: [20, 80]
        }),
      168,
      256,
      ['change', 'sliderTooltip']
    );
    this.addComponentSmoke(
      'SizeContinuousLegend',
      () =>
        new (componentCtor(SizeContinuousLegend))({
          x: width - 122,
          y: 256,
          title: { visible: true, text: 'SizeLegend' },
          layout: 'horizontal',
          railWidth: 92,
          railHeight: 24,
          min: 0,
          max: 100,
          value: [10, 70],
          sizeRange: [4, 16]
        }),
      width - 122,
      256,
      ['change', 'sliderTooltip']
    );
    this.addComponentSmoke(
      'ScrollBar',
      () =>
        new (componentCtor(ScrollBar))({
          x: 28,
          y: 318,
          width: width - 56,
          height: 10,
          range: [0.18, 0.62],
          railStyle: { fill: '#E4E7EC' },
          sliderStyle: { fill: '#667085' }
        }),
      28,
      318,
      ['scrollDown', 'scrollDrag', 'scrollUp']
    );

    this.stage.defaultLayer.add(
      createText({
        x: 24,
        y: height - 58,
        text: '覆盖 LineAxis/CircleAxis/Grid、Discrete/Color/Size Legend、ScrollBar。',
        fontSize: 13,
        fill: '#475467',
        maxLineWidth: width - 48
      })
    );
  },

  drawComponentMarksScene(width: number, height: number) {
    const layer = this.stage.defaultLayer;
    this.addSectionLabel('Marker components', 22, 30);
    this.addComponentSmoke(
      'MarkLine',
      () =>
        new (componentCtor(MarkLine))({
          points: [
            { x: 30, y: 74 },
            { x: width - 170, y: 74 }
          ],
          lineStyle: { stroke: '#D92D20', lineWidth: 2, lineDash: [5, 3] },
          endSymbol: { visible: true, size: 10 },
          label: [{ text: 'MarkLine', position: 'end', textStyle: { fontSize: 11, fill: '#D92D20' } }]
        }),
      30,
      74
    );
    this.addComponentSmoke(
      'MarkArea',
      () =>
        new (componentCtor(MarkArea))({
          points: [
            { x: 30, y: 104 },
            { x: width - 172, y: 104 },
            { x: width - 172, y: 154 },
            { x: 30, y: 154 }
          ],
          areaStyle: { fill: '#FEE4E2', fillOpacity: 0.6 },
          label: [{ text: 'MarkArea', position: 'insideTop', textStyle: { fontSize: 11 } }]
        }),
      30,
      104
    );
    this.addComponentSmoke(
      'MarkPoint',
      () =>
        new (componentCtor(MarkPoint))({
          position: { x: width - 112, y: 94 },
          itemContent: {
            type: 'text',
            position: 'end',
            style: {
              text: 'MarkPoint',
              textStyle: { fontSize: 11, fill: '#1D2939' },
              panel: { visible: true, fill: '#FFFFFF', stroke: '#CBD5E1', cornerRadius: 4 },
              padding: [4, 6]
            }
          },
          itemLine: { visible: true, lineStyle: { stroke: '#7C3AED' } },
          item: { visible: true, symbolStyle: { fill: '#7C3AED', size: 10 } }
        }),
      width - 112,
      94
    );
    this.addComponentSmoke(
      'MarkArcLine',
      () =>
        new (componentCtor(MarkArcLine))({
          center: { x: width - 88, y: 164 },
          radius: 34,
          startAngle: -Math.PI * 0.2,
          endAngle: Math.PI * 0.9,
          lineStyle: { stroke: '#0F766E', lineWidth: 2 },
          label: [{ text: 'ArcLine', position: 'end', textStyle: { fontSize: 10 } }]
        }),
      width - 88,
      164
    );
    this.addComponentSmoke(
      'MarkArcArea',
      () =>
        new (componentCtor(MarkArcArea))({
          center: { x: width - 88, y: 238 },
          innerRadius: 20,
          outerRadius: 44,
          startAngle: Math.PI * 0.2,
          endAngle: Math.PI * 1.25,
          areaStyle: { fill: '#D1FAE5', fillOpacity: 0.7 },
          label: [{ text: 'ArcArea', position: 'inside', textStyle: { fontSize: 10 } }]
        }),
      width - 88,
      238
    );

    this.addSectionLabel('Crosshair / Labels', 22, 188);
    [
      new (componentCtor(LineCrosshair))({
        start: { x: 28, y: 220 },
        end: { x: width - 170, y: 220 },
        lineStyle: { stroke: '#101828', lineDash: [4, 3] }
      }),
      new (componentCtor(RectCrosshair))({ start: { x: 34, y: 238 }, end: { x: 142, y: 278 } }),
      new (componentCtor(CircleCrosshair))({ center: { x: 192, y: 258 }, radius: 26 }),
      new (componentCtor(SectorCrosshair))({
        center: { x: 254, y: 258 },
        radius: 30,
        innerRadius: 10,
        startAngle: -Math.PI * 0.25,
        endAngle: Math.PI * 0.55
      }),
      new (componentCtor(PolygonCrosshair))({
        center: { x: 314, y: 258 },
        radius: 28,
        sides: 6
      }),
      new (componentCtor(PolygonSectorCrosshair))({
        center: { x: width - 52, y: 258 },
        radius: 30,
        innerRadius: 10,
        sides: 6,
        startAngle: 0,
        endAngle: Math.PI * 0.8
      })
    ].forEach(component => layer.add(component));

    const baseRect = createRect({ x: 30, y: 304, width: 46, height: 24, fill: '#E0EAFF' });
    const baseSymbol = createSymbol({ x: 118, y: 316, size: 26, symbolType: 'circle', fill: '#F79009' });
    const baseLine = createLine({
      points: [
        { x: 156, y: 318 },
        { x: 216, y: 300 }
      ],
      stroke: '#0F766E',
      lineWidth: 2
    });
    const baseArc = createArc({
      x: 258,
      y: 316,
      innerRadius: 8,
      outerRadius: 18,
      startAngle: 0,
      endAngle: Math.PI * 1.5,
      fill: '#FEE4E2'
    });
    const basePolygon = createPolygon({
      points: [
        { x: 304, y: 304 },
        { x: 338, y: 312 },
        { x: 326, y: 336 },
        { x: 296, y: 330 }
      ],
      fill: '#D1FAE5'
    });
    [baseRect, baseSymbol, baseLine, baseArc, basePolygon].forEach(mark => layer.add(mark));
    const labelData = [
      { text: 'RectLabel', graphic: baseRect },
      { text: 'SymbolLabel', graphic: baseSymbol },
      { text: 'LineLabel', graphic: baseLine },
      { text: 'ArcLabel', graphic: baseArc },
      { text: 'Polygon data', graphic: basePolygon }
    ];
    const labelFactory = (type: string, label: string, graphic: any, Ctor: any, extra: Record<string, any> = {}) =>
      new (componentCtor(Ctor))({
        type,
        baseMarkGroupName: `${type}-base`,
        data: [{ text: label, textType: 'text', data: { graphic } }],
        getBaseMarks: () => [graphic],
        textStyle: { fontSize: 10, fill: '#344054' },
        overlap: false,
        animation: false,
        ...extra
      });
    [
      labelFactory('rect', 'R', baseRect, RectLabel, { position: 'top' }),
      labelFactory('symbol', 'S', baseSymbol, SymbolLabel, { position: 'top' }),
      labelFactory('line', 'L', baseLine, LineLabel, { position: 'end' }),
      labelFactory('arc', 'A', baseArc, ArcLabel, { position: 'outside' }),
      labelFactory('rect', 'P', basePolygon, RectLabel, { position: 'top' })
    ].forEach(label => layer.add(label));
    layer.add(
      new (componentCtor(DataLabel))({
        dataLabels: [
          {
            type: 'rect',
            baseMarkGroupName: 'data-label-rect',
            data: [{ text: 'DataLabel', data: { graphic: baseRect } }],
            getBaseMarks: () => [baseRect],
            textStyle: { fontSize: 10, fill: '#D92D20' },
            overlap: false,
            animation: false
          }
        ],
        size: { width, height }
      })
    );

    layer.add(
      createText({
        x: 24,
        y: height - 58,
        text: '覆盖 MarkLine/Area/Point/Arc、6 类 Crosshair、5 类 Label 和 DataLabel。',
        fontSize: 13,
        fill: '#475467',
        maxLineWidth: width - 48
      })
    );
  },

  drawComponentControlsScene(width: number, height: number) {
    const layer = this.stage.defaultLayer;
    this.addSectionLabel('Slider / DataZoom / Pager / Brush', 22, 30);
    const controls: any[] = [];
    const slider = this.addComponentSmoke(
      'Slider',
      () =>
        new (componentCtor(Slider))({
          x: 28,
          y: 58,
          layout: 'horizontal',
          railWidth: 130,
          railHeight: 8,
          min: 0,
          max: 100,
          value: [20, 72],
          range: { draggableTrack: true },
          startText: { visible: true, text: 'L', space: 6 },
          endText: { visible: true, text: 'H', space: 6 }
        }),
      28,
      58,
      ['change', 'sliderTooltip']
    );
    const dataZoom = this.addComponentSmoke(
      'DataZoom',
      () =>
        new (componentCtor(DataZoom))({
          start: 0.18,
          end: 0.62,
          position: { x: width - 178, y: 54 },
          size: { width: 144, height: 28 },
          showDetail: 'auto',
          brushSelect: true,
          backgroundChartStyle: { line: { visible: false }, area: { visible: false } },
          middleHandlerStyle: { visible: true }
        }),
      width - 178,
      54,
      ['dataZoomChange']
    );
    const pager = this.addComponentSmoke(
      'Pager',
      () =>
        new (componentCtor(Pager))({
          x: 28,
          y: 112,
          total: 9,
          defaultCurrent: 2,
          handler: { preShape: 'triangleLeft', nextShape: 'triangleRight', style: { size: 14, fill: '#276EF1' } },
          textStyle: { fontSize: 12, fill: '#344054' }
        }),
      28,
      112,
      ['toPrev', 'toNext']
    );
    const brush = this.addComponentSmoke(
      'Brush',
      () =>
        new (componentCtor(Brush))({
          x: width - 178,
          y: 104,
          width: 144,
          height: 54,
          brushMode: 'single',
          brushType: 'rect',
          brushStyle: { fill: '#276EF1', fillOpacity: 0.18, stroke: '#276EF1', lineWidth: 1 }
        }),
      width - 178,
      104,
      ['drawStart', 'drawing', 'drawEnd', 'brushActive', 'brushClear']
    );
    controls.push(slider, dataZoom, pager, brush);

    this.addSectionLabel('Timeline / Player / Inputs', 22, 176);
    const timeline = this.addComponentSmoke(
      'Timeline',
      () =>
        new (componentCtor(Timeline))({
          x: 28,
          y: 204,
          width: width - 60,
          clipRange: 0.5,
          times: [
            { label: 'T1', desc: '' },
            { label: 'T2', desc: '' },
            { label: 'T3', desc: '' },
            { label: 'T4', desc: '' }
          ]
        }),
      28,
      204
    );
    const discretePlayer = this.addComponentSmoke(
      'DiscretePlayer',
      () => {
        const player = new (componentCtor(DiscretePlayer))({
          type: 'discrete',
          x: 28,
          y: 250,
          data: [1, 2, 3],
          interval: 1000,
          visible: true,
          orient: 'bottom',
          size: { width: 152, height: 38 },
          disableTriggerEvent: true
        });
        player.addEventListener?.('pointerdown', () => {
          player.forward?.();
          this.stage?.render?.();
        });
        return player;
      },
      28,
      250,
      ['play', 'pause', 'change', 'forward', 'backward', 'end']
    );
    const continuousPlayer = this.addComponentSmoke(
      'ContinuousPlayer',
      () => {
        const player = new (componentCtor(ContinuousPlayer))({
          type: 'continuous',
          x: width - 184,
          y: 250,
          data: [0, 25, 50, 75, 100],
          min: 0,
          max: 100,
          value: 30,
          visible: true,
          orient: 'bottom',
          size: { width: 152, height: 38 },
          disableTriggerEvent: true
        });
        player.addEventListener?.('pointerdown', () => {
          player.__playing = !player.__playing;
          if (player.__playing) {
            player.play?.();
          } else {
            player.pause?.();
          }
          this.stage?.render?.();
        });
        return player;
      },
      width - 184,
      250,
      ['play', 'pause', 'change', 'forward', 'backward', 'end']
    );
    controls.push(timeline, discretePlayer, continuousPlayer);

    const checkbox = this.addComponentSmoke(
      'CheckBox',
      () => new (componentCtor(CheckBox))({ x: 28, y: 318, text: { text: 'CheckBox' }, checked: false }),
      28,
      318,
      ['checkbox_state_change']
    );
    const radio = this.addComponentSmoke(
      'Radio',
      () => new (componentCtor(Radio))({ x: 138, y: 318, text: { text: 'Radio' }, checked: true }),
      138,
      318,
      ['radio_checked']
    );
    const switchNode = this.addComponentSmoke(
      'Switch',
      () =>
        new (componentCtor(Switch))({
          x: 240,
          y: 312,
          checked: false,
          text: { checkedText: 'on', uncheckedText: 'off', fill: '#fff', fontSize: 10 }
        }),
      240,
      312,
      ['switch_state_change']
    );
    controls.push(checkbox, radio, switchNode);
    this.componentControls = controls.filter(Boolean);
    this.componentInteractive = [checkbox, radio, switchNode].filter(Boolean);

    layer.add(
      createText({
        x: 24,
        y: height - 58,
        text: '点击“切换图元颜色”会更新控件值；点击 Checkbox/Radio/Switch 验证交互拾取。',
        fontSize: 13,
        fill: '#475467',
        maxLineWidth: width - 48
      })
    );
  },

  drawComponentMiscScene(width: number, height: number) {
    const layer = this.stage.defaultLayer;
    this.addSectionLabel('Title / Indicator / Tooltip / PopTip', 22, 30);
    this.addComponentSmoke(
      'Title',
      () =>
        new (componentCtor(Title))({
          x: 24,
          y: 52,
          width: 150,
          maxWidth: 150,
          text: 'Title',
          subtext: 'sub title',
          textStyle: { fontSize: 16, fill: '#1D2939' },
          subtextStyle: { fontSize: 11, fill: '#667085' }
        }),
      24,
      52
    );
    this.addComponentSmoke(
      'Indicator',
      () =>
        new (componentCtor(Indicator))({
          x: 206,
          y: 52,
          size: { width: 96, height: 64 },
          title: { visible: true, text: '68%', style: { fontSize: 18, fill: '#276EF1' } },
          content: { visible: true, text: 'Indicator', style: { fontSize: 11, fill: '#475467' } }
        }),
      206,
      52
    );
    this.addComponentSmoke(
      'Tooltip',
      () =>
        new (componentCtor(Tooltip))({
          x: width - 128,
          y: 50,
          title: { visible: true, value: 'Tooltip' },
          content: [
            { key: 'A', value: '12', shape: { visible: true, fill: '#276EF1' } },
            { key: 'B', value: '26', shape: { visible: true, fill: '#11A579' } }
          ],
          panel: { visible: true, fill: '#fff', stroke: '#CBD5E1', cornerRadius: 6 }
        }),
      width - 128,
      50
    );
    this.addComponentSmoke(
      'PopTip',
      () =>
        new (componentCtor(PopTip))({
          x: 24,
          y: 126,
          title: 'PopTip',
          content: 'content',
          position: 'rt',
          panel: { visible: true, fill: '#101828', cornerRadius: 6 },
          titleStyle: { fill: '#fff', fontSize: 12 },
          contentStyle: { fill: '#E4E7EC', fontSize: 11 }
        }),
      24,
      126
    );

    this.addSectionLabel('Empty / Link / LabelItem / Weather / Table', 22, 176);
    this.addComponentSmoke(
      'EmptyTip',
      () =>
        new (componentCtor(EmptyTip))({
          x: 22,
          y: 198,
          width: 78,
          height: 58,
          text: { text: 'Empty', fontSize: 12, fill: '#667085' },
          icon: { visible: false },
          spaceBetweenTextAndIcon: 4
        }),
      22,
      198
    );
    this.addComponentSmoke(
      'LinkPath',
      () =>
        new (componentCtor(LinkPath))({
          x0: 114,
          y0: 218,
          x1: 198,
          y1: 246,
          thickness: 22,
          fill: '#E0EAFF',
          backgroudStyle: { fill: '#F2F4F7' },
          endArrow: true,
          startArrow: true
        }),
      114,
      218
    );
    this.addComponentSmoke(
      'StoryLabelItem',
      () =>
        new (componentCtor(StoryLabelItem))({
          x: 230,
          y: 230,
          contentOffsetX: 78,
          contentOffsetY: -34,
          titleTop: 'StoryLabel',
          titleBottom: 'item',
          titleTopStyle: { fontSize: 11, fill: '#1D2939' },
          titleBottomStyle: { fontSize: 10, fill: '#667085' }
        }),
      230,
      230
    );
    this.addComponentSmoke(
      'WeatherBox',
      () =>
        new (componentCtor(WeatherBox))({
          x: width - 78,
          y: 194,
          width: 54,
          height: 54,
          rainRatio: 0.7,
          snowRatio: 0.2,
          windRatio: 0.4,
          rainCountThreshold: 4,
          snowCountThreshold: 3,
          background: '#AEE2FF',
          windStyle: { stroke: 'rgba(255,255,255,0.8)' }
        }),
      width - 78,
      194
    );
    this.addComponentSmoke(
      'TableSeriesNumber',
      () =>
        new (componentCtor(TableSeriesNumber))(
          {
            x: 24,
            y: 282,
            rowCount: 6,
            colCount: 6,
            rowSeriesNumberWidth: 32,
            colSeriesNumberHeight: 24,
            hover: false,
            select: false
          },
          { initRenderAll: true }
        ),
      24,
      282
    );

    layer.add(
      createText({
        x: 24,
        y: height - 58,
        text: '覆盖 Title/Indicator/Tooltip/PopTip/EmptyTip/LinkPath/StoryLabelItem/WeatherBox/TableSeriesNumber。',
        fontSize: 13,
        fill: '#475467',
        maxLineWidth: width - 48
      })
    );
  },

  drawStressScene(width: number, height: number) {
    const layer = this.stage.defaultLayer;
    this.addSectionLabel('batch nodes / style update / picking', 22, 30);
    const cols = 8;
    const rows = 6;
    const startX = 24;
    const startY = 58;
    const gapX = Math.min(40, (width - 48) / cols);
    const gapY = 38;
    const palette = ['#276EF1', '#11A579', '#F79009', '#E64980', '#7C3AED'];

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const index = row * cols + col;
        const x = startX + col * gapX;
        const y = startY + row * gapY;
        const fill = palette[index % palette.length];
        const node =
          index % 3 === 0
            ? createSymbol({
                x: x + 13,
                y: y + 13,
                size: 22,
                symbolType: index % 2 === 0 ? 'diamond' : 'triangle',
                fill,
                stroke: '#1D2939',
                lineWidth: 1,
                opacity: 0.88
              })
            : createRect({
                x,
                y,
                width: 26,
                height: 26,
                fill,
                fillOpacity: 0.82,
                stroke: '#1D2939',
                strokeOpacity: 0.22,
                lineWidth: 1,
                cornerRadius: 6,
                lineDash: index % 4 === 0 ? [4, 2] : undefined
              });
        node.addEventListener('pointerdown', () => {
          node.setAttribute('fill', '#101828');
          this.setData({ actionStatus: `picked node ${index}` });
          this.stage.render();
        });
        this.stressNodes.push(node);
        layer.add(node);
      }
    }

    layer.add(
      createText({
        x: 24,
        y: height - 58,
        text: `${this.stressNodes.length} nodes. 点击任意节点验证 pick，点击“切换颜色”批量更新。texture 暂未放入 wx smoke。`,
        fontSize: 13,
        fill: '#475467',
        maxLineWidth: width - 48
      })
    );
  },

  drawStylesScene(width: number, height: number) {
    const layer = this.stage.defaultLayer;
    this.addSectionLabel('gradient / opacity / shadow', 22, 30);

    const gradientRect = createRect({
      x: 24,
      y: 54,
      width: 116,
      height: 70,
      fill: linearGradient('#276EF1', '#12B76A'),
      stroke: '#173B83',
      lineWidth: 3,
      fillOpacity: 0.92,
      cornerRadius: 12,
      shadowBlur: 10,
      shadowColor: 'rgba(39, 110, 241, 0.28)'
    });
    const radialCircle = createCircle({
      x: 206,
      y: 88,
      radius: 38,
      fill: {
        gradient: 'radial',
        x0: 0.5,
        y0: 0.5,
        r0: 0,
        x1: 0.5,
        y1: 0.5,
        r1: 0.5,
        stops: [
          { offset: 0, color: '#FDE68A' },
          { offset: 1, color: '#F79009' }
        ]
      } as any,
      stroke: '#8D5B00',
      lineWidth: 2,
      fillOpacity: 0.86
    });
    const dashedLine = createLine({
      points: [
        { x: 260, y: 62 },
        { x: width - 24, y: 116 }
      ],
      stroke: '#7C3AED',
      lineWidth: 5,
      lineDash: [10, 5],
      lineCap: 'round'
    });
    layer.add(gradientRect);
    layer.add(radialCircle);
    layer.add(dashedLine);

    this.addSectionLabel('stroke / dash / alpha update', 22, 154);
    const styleBars: any[] = [];
    ['#276EF1', '#11A579', '#F79009', '#E64980'].forEach((fill, index) => {
      const bar = createRect({
        x: 28 + index * 72,
        y: 236 - index * 24,
        width: 46,
        height: 50 + index * 24,
        fill,
        fillOpacity: 0.72,
        stroke: '#1D2939',
        strokeOpacity: 0.26,
        lineWidth: 2,
        cornerRadius: [8, 8, 0, 0],
        lineDash: index % 2 ? [5, 3] : undefined
      });
      styleBars.push(bar);
      layer.add(bar);
    });
    this.styleNodes = { gradientRect, radialCircle, dashedLine, styleBars };

    layer.add(
      createText({
        x: 24,
        y: height - 58,
        text: '点击“切换图元颜色”会更新渐变、透明度、虚线、描边和阴影样式。',
        fontSize: 13,
        fill: '#475467',
        maxLineWidth: width - 48
      })
    );
  },

  updateStylesScene() {
    const nodes = this.styleNodes;
    if (!nodes) {
      return;
    }

    this.styleAlt = !this.styleAlt;
    const alt = this.styleAlt;
    nodes.gradientRect.setAttributes({
      fill: alt ? linearGradient('#D92D20', '#F79009') : linearGradient('#276EF1', '#12B76A'),
      shadowColor: alt ? 'rgba(217, 45, 32, 0.3)' : 'rgba(39, 110, 241, 0.28)',
      fillOpacity: alt ? 0.78 : 0.92
    });
    nodes.radialCircle.setAttributes({
      radius: alt ? 44 : 38,
      stroke: alt ? '#7C2D12' : '#8D5B00',
      fillOpacity: alt ? 0.64 : 0.86
    });
    nodes.dashedLine.setAttributes({
      stroke: alt ? '#0F766E' : '#7C3AED',
      lineDash: alt ? [4, 3, 12, 3] : [10, 5],
      lineWidth: alt ? 3 : 5
    });
    nodes.styleBars.forEach((bar: any, index: number) => {
      bar.setAttributes({
        fillOpacity: alt ? 0.44 + index * 0.12 : 0.72,
        strokeOpacity: alt ? 0.54 : 0.26,
        lineDash: alt ? [3 + index, 3] : index % 2 ? [5, 3] : undefined
      });
    });
    this.setData({ actionStatus: `style update -> variant ${alt ? 'B' : 'A'}` });
  },

  drawTransformScene(width: number, height: number) {
    const layer = this.stage.defaultLayer;
    this.addSectionLabel('nested transform / clip', 22, 30);

    const rootGroup = createGroup({
      x: 26,
      y: 56,
      width: width - 52,
      height: 176,
      clip: true,
      cornerRadius: 12
    });
    rootGroup.add(
      createRect({
        x: 0,
        y: 0,
        width: width - 52,
        height: 176,
        fill: '#F8FAFC',
        stroke: '#CBD5E1',
        lineWidth: 1,
        cornerRadius: 12
      })
    );

    const transformed = createGroup({
      x: 90,
      y: 86,
      angle: -0.3,
      scaleX: 1,
      scaleY: 1
    });
    const panel = createRect({
      x: -52,
      y: -34,
      width: 104,
      height: 68,
      fill: '#E0EAFF',
      stroke: '#444CE7',
      lineWidth: 2,
      cornerRadius: 10
    });
    const dot = createCircle({
      x: 42,
      y: -26,
      radius: 16,
      fill: '#E64980',
      stroke: '#8A1248',
      lineWidth: 2,
      zIndex: 2
    });
    transformed.add(panel);
    transformed.add(dot);
    transformed.add(
      createText({
        x: -34,
        y: 6,
        text: 'group',
        fontSize: 14,
        fill: '#1D2939'
      })
    );
    rootGroup.add(transformed);

    const clippedLine = createLine({
      points: [
        { x: 0, y: 146 },
        { x: 90, y: 116 },
        { x: 180, y: 150 },
        { x: 270, y: 106 },
        { x: 360, y: 142 }
      ],
      stroke: '#0F766E',
      lineWidth: 5,
      lineCap: 'round',
      zIndex: 1
    });
    rootGroup.add(clippedLine);
    layer.add(rootGroup);

    panel.addEventListener('pointerdown', () => {
      panel.setAttribute('fill', '#C7D2FE');
      this.setData({ actionStatus: 'picked transformed rect' });
      this.stage.render();
    });
    dot.addEventListener('pointerdown', () => {
      dot.setAttribute('fill', '#101828');
      this.setData({ actionStatus: 'picked transformed zIndex dot' });
      this.stage.render();
    });
    this.transformNodes = { transformed, panel, dot, clippedLine };

    layer.add(
      createText({
        x: 24,
        y: height - 58,
        text: '点击“切换图元颜色”会更新 group angle/scale/position，点击组内元素验证 transform 后拾取。',
        fontSize: 13,
        fill: '#475467',
        maxLineWidth: width - 48
      })
    );
  },

  updateTransformScene() {
    const nodes = this.transformNodes;
    if (!nodes) {
      return;
    }
    this.transformAlt = !this.transformAlt;
    const alt = this.transformAlt;
    nodes.transformed.setAttributes({
      x: alt ? 210 : 90,
      y: alt ? 96 : 86,
      angle: alt ? 0.42 : -0.3,
      scaleX: alt ? 1.18 : 1,
      scaleY: alt ? 0.88 : 1
    });
    nodes.clippedLine.setAttribute(
      'points',
      alt
        ? [
            { x: 0, y: 118 },
            { x: 90, y: 152 },
            { x: 180, y: 112 },
            { x: 270, y: 148 },
            { x: 360, y: 118 }
          ]
        : [
            { x: 0, y: 146 },
            { x: 90, y: 116 },
            { x: 180, y: 150 },
            { x: 270, y: 106 },
            { x: 360, y: 142 }
          ]
    );
    this.setData({ actionStatus: `transform update -> variant ${alt ? 'B' : 'A'}` });
  },

  drawStatesScene(width: number, height: number) {
    const layer = this.stage.defaultLayer;
    this.addSectionLabel('setStates / same-state patch refresh', 22, 30);

    const rect = createRect({
      x: 28,
      y: 58,
      width: 112,
      height: 72,
      fill: '#276EF1',
      fillOpacity: 1,
      stroke: '#173B83',
      lineWidth: 2,
      cornerRadius: 10
    });
    rect.states = {
      custom1: {
        fillOpacity: 0.28,
        stroke: '#D92D20'
      }
    };
    rect.setStates(['custom1'], { animate: true, animateSameStatePatchChange: true });

    const circle = createCircle({
      x: 220,
      y: 94,
      radius: 34,
      fill: '#F2F4F7',
      stroke: '#475467',
      lineWidth: 2
    });
    circle.states = {
      active: {
        fill: '#D1FAE5',
        stroke: '#0F766E',
        radius: 42
      }
    };
    circle.setStates(['active'], { animate: true });

    const symbol = createSymbol({
      x: width - 72,
      y: 94,
      size: 64,
      symbolType: 'diamond',
      fill: '#F79009',
      stroke: '#8D5B00',
      lineWidth: 2
    });
    symbol.states = {
      selected: {
        fill: '#7C3AED',
        size: 86
      }
    };
    layer.add(rect);
    layer.add(circle);
    layer.add(symbol);
    this.stateNodes = { rect, circle, symbol };

    layer.add(
      createText({
        x: 24,
        y: 178,
        text: '点击状态按钮切换 circle/symbol；点击颜色按钮会保持 rect 状态集合不变但刷新 custom1 patch。',
        fontSize: 13,
        fill: '#475467',
        maxLineWidth: width - 48
      })
    );
    layer.add(
      createText({
        x: 24,
        y: height - 58,
        text: '期望：同状态 patch 刷新不回 normal，直接从旧状态样式过渡或同步到新状态样式。',
        fontSize: 13,
        fill: '#475467',
        maxLineWidth: width - 48
      })
    );
  },

  refreshStatePatchScene() {
    const nodes = this.stateNodes;
    if (!nodes) {
      return;
    }
    this.statePatchAlt = !this.statePatchAlt;
    nodes.rect.states = {
      custom1: {
        fillOpacity: this.statePatchAlt ? 0.58 : 0.28,
        stroke: this.statePatchAlt ? '#0F766E' : '#D92D20'
      }
    };
    nodes.rect.setStates(['custom1'], {
      animate: true,
      animateSameStatePatchChange: true
    });
    this.setData({ actionStatus: `same-state patch -> ${this.statePatchAlt ? '0.58' : '0.28'}` });
  },

  drawEventsScene(width: number, height: number) {
    const layer = this.stage.defaultLayer;
    this.addSectionLabel('overlap / zIndex pick', 22, 30);

    const backRect = createRect({
      x: 34,
      y: 58,
      width: 120,
      height: 82,
      fill: '#E7F0FF',
      stroke: '#276EF1',
      lineWidth: 2,
      cornerRadius: 10,
      zIndex: 1
    });
    backRect.addEventListener('pointerdown', () => {
      backRect.setAttribute('fill', '#DBEAFE');
      this.setData({ actionStatus: 'picked back rect' });
      this.stage.render();
    });
    layer.add(backRect);

    const frontCircle = createCircle({
      x: 138,
      y: 102,
      radius: 42,
      fill: '#FEE4E2',
      stroke: '#D92D20',
      lineWidth: 3,
      fillOpacity: 0.86,
      zIndex: 2
    });
    frontCircle.addEventListener('pointerdown', () => {
      frontCircle.setAttribute('fill', '#FECACA');
      this.setData({ actionStatus: 'picked front circle' });
      this.stage.render();
    });
    layer.add(frontCircle);

    this.addSectionLabel('rotated group / bubbling', width - 176, 30);
    const rotated = createGroup({
      x: width - 150,
      y: 82,
      angle: 0.28
    });
    const rotatedPanel = createRect({
      x: 0,
      y: 0,
      width: 112,
      height: 66,
      fill: '#ECFDF3',
      stroke: '#0F766E',
      lineWidth: 2,
      cornerRadius: 9
    });
    const rotatedText = createText({
      x: 20,
      y: 40,
      text: 'tap group',
      fontSize: 14,
      fill: '#064E3B'
    });
    rotated.addEventListener('pointerdown', () => {
      rotatedPanel.setAttribute('fill', '#A7F3D0');
      this.setData({ actionStatus: 'picked rotated group' });
      this.stage.render();
    });
    rotated.add(rotatedPanel);
    rotated.add(rotatedText);
    layer.add(rotated);

    this.addSectionLabel('clip group / child pick', 22, 184);
    const clipGroup = createGroup({
      x: 26,
      y: 210,
      width: width - 52,
      height: 92,
      clip: true,
      cornerRadius: 10
    });
    clipGroup.add(
      createRect({
        x: 0,
        y: 0,
        width: width - 52,
        height: 92,
        fill: '#F8FAFC',
        stroke: '#CBD5E1',
        lineWidth: 1,
        cornerRadius: 10
      })
    );
    [0, 1, 2, 3, 4].forEach(index => {
      const node = createCircle({
        x: 36 + index * 70,
        y: index % 2 === 0 ? 34 : 68,
        radius: 26,
        fill: index % 2 === 0 ? '#7C3AED' : '#F79009',
        fillOpacity: 0.72,
        stroke: '#1D2939',
        strokeOpacity: 0.22,
        lineWidth: 1
      });
      node.addEventListener('pointerdown', () => {
        node.setAttribute('radius', 30);
        this.setData({ actionStatus: `picked clipped child ${index}` });
        this.stage.render();
      });
      clipGroup.add(node);
    });
    layer.add(clipGroup);

    layer.add(
      createText({
        x: 24,
        y: height - 58,
        text: '点击重叠区域、旋转分组或裁剪区域内节点，确认 wx 事件转发、拾取顺序和 transform pick 正常。',
        fontSize: 13,
        fill: '#475467',
        maxLineWidth: width - 48
      })
    );
  },

  drawGeometryScene(width: number, height: number) {
    const layer = this.stage.defaultLayer;
    this.addSectionLabel('points / polygon / symbol', 22, 30);

    const line = createLine({
      points: [
        { x: 24, y: 96 },
        { x: 76, y: 58 },
        { x: 128, y: 102 },
        { x: 182, y: 70 }
      ],
      stroke: '#276EF1',
      lineWidth: 4,
      lineCap: 'round',
      lineJoin: 'round',
      curveType: 'monotoneX'
    });
    const area = createArea({
      points: [
        { x: 24, y: 154, y1: 190 },
        { x: 78, y: 124, y1: 190 },
        { x: 132, y: 146, y1: 190 },
        { x: 186, y: 112, y1: 190 }
      ],
      fill: 'rgba(39, 110, 241, 0.18)',
      stroke: '#276EF1',
      lineWidth: 2,
      curveType: 'monotoneX'
    });
    const polygon = createPolygon({
      points: [
        { x: width - 124, y: 56 },
        { x: width - 58, y: 64 },
        { x: width - 38, y: 124 },
        { x: width - 92, y: 158 },
        { x: width - 142, y: 118 }
      ],
      fill: '#FEE4E2',
      stroke: '#D92D20',
      lineWidth: 2,
      cornerRadius: 8
    });
    const symbol = createSymbol({
      x: width - 82,
      y: 210,
      size: 56,
      symbolType: 'star',
      fill: '#F79009',
      stroke: '#8D5B00',
      lineWidth: 2
    });

    layer.add(line);
    layer.add(area);
    layer.add(polygon);
    layer.add(symbol);

    this.addSectionLabel('arc / path geometry', 22, 214);
    const arc = createArc({
      x: 74,
      y: 278,
      innerRadius: 22,
      outerRadius: 42,
      startAngle: -Math.PI * 0.15,
      endAngle: Math.PI * 1.2,
      fill: '#11A579',
      stroke: '#064E3B',
      lineWidth: 2,
      cornerRadius: 6
    });
    const path = createPath({
      path: 'M142 264 C174 224 220 224 250 264 C222 306 172 306 142 264 Z',
      fill: '#E0EAFF',
      stroke: '#444CE7',
      lineWidth: 2
    });
    layer.add(arc);
    layer.add(path);

    this.geometryNodes = { line, area, polygon, symbol, arc, path };
    layer.add(
      createText({
        x: 24,
        y: height - 58,
        text: '点击“切换图元颜色”会更新 points/path/角度/symbolType，确认几何属性更新后 bounds 与重绘正常。',
        fontSize: 13,
        fill: '#475467',
        maxLineWidth: width - 48
      })
    );
  },

  updateGeometryScene(width: number) {
    const nodes = this.geometryNodes;
    if (!nodes) {
      return;
    }

    this.geometryAlt = !this.geometryAlt;
    const alt = this.geometryAlt;
    nodes.line.setAttribute(
      'points',
      alt
        ? [
            { x: 28, y: 70 },
            { x: 84, y: 110 },
            { x: 140, y: 58 },
            { x: 196, y: 116 }
          ]
        : [
            { x: 24, y: 96 },
            { x: 76, y: 58 },
            { x: 128, y: 102 },
            { x: 182, y: 70 }
          ]
    );
    nodes.area.setAttribute(
      'points',
      alt
        ? [
            { x: 24, y: 132, y1: 190 },
            { x: 78, y: 158, y1: 190 },
            { x: 132, y: 118, y1: 190 },
            { x: 186, y: 150, y1: 190 }
          ]
        : [
            { x: 24, y: 154, y1: 190 },
            { x: 78, y: 124, y1: 190 },
            { x: 132, y: 146, y1: 190 },
            { x: 186, y: 112, y1: 190 }
          ]
    );
    nodes.polygon.setAttribute(
      'points',
      alt
        ? [
            { x: width - 136, y: 72 },
            { x: width - 78, y: 42 },
            { x: width - 34, y: 102 },
            { x: width - 70, y: 170 },
            { x: width - 146, y: 146 }
          ]
        : [
            { x: width - 124, y: 56 },
            { x: width - 58, y: 64 },
            { x: width - 38, y: 124 },
            { x: width - 92, y: 158 },
            { x: width - 142, y: 118 }
          ]
    );
    nodes.symbol.setAttributes({
      symbolType: alt ? 'triangle' : 'star',
      size: alt ? 74 : 56,
      fill: alt ? '#7C3AED' : '#F79009'
    });
    nodes.arc.setAttributes({
      startAngle: alt ? Math.PI * 0.15 : -Math.PI * 0.15,
      endAngle: alt ? Math.PI * 1.75 : Math.PI * 1.2,
      outerRadius: alt ? 50 : 42,
      fill: alt ? '#0F766E' : '#11A579'
    });
    nodes.path.setAttribute(
      'path',
      alt
        ? 'M144 250 C184 226 232 240 260 280 C218 310 172 306 144 250 Z'
        : 'M142 264 C174 224 220 224 250 264 C222 306 172 306 142 264 Z'
    );
    this.setData({ actionStatus: `geometry update -> variant ${alt ? 'B' : 'A'}` });
  },

  drawLifecycleScene(width: number, height: number) {
    const layer = this.stage.defaultLayer;
    this.addSectionLabel('remove / recreate / cleanup', 22, 30);

    const group = createGroup({
      x: 24,
      y: 58,
      width: width - 48,
      height: 216
    });
    layer.add(group);
    this.lifecycleGroup = group;
    this.populateLifecycleGroup(false);

    layer.add(
      createText({
        x: 24,
        y: height - 72,
        text: '点击“切换图元颜色”会 removeAllChild(true) 后重建本组节点；切换场景会释放整层子树。',
        fontSize: 13,
        fill: '#475467',
        maxLineWidth: width - 48
      })
    );
  },

  populateLifecycleGroup(alt: boolean) {
    const group = this.lifecycleGroup;
    if (!group) {
      return;
    }

    group.removeAllChild?.(true);
    this.lifecycleNodes = [];

    const colors = alt ? ['#101828', '#D92D20', '#F79009'] : ['#276EF1', '#11A579', '#7C3AED'];
    for (let i = 0; i < 12; i++) {
      const col = i % 4;
      const row = Math.floor(i / 4);
      const node = createRect({
        x: col * 78,
        y: row * 56,
        width: 58,
        height: 38,
        fill: colors[i % colors.length],
        opacity: alt ? 0.72 + (i % 3) * 0.08 : 0.9,
        stroke: '#1D2939',
        strokeOpacity: 0.16,
        lineWidth: 1,
        cornerRadius: 8
      });
      node.addEventListener('pointerdown', () => {
        node.setAttribute('fill', '#0F172A');
        this.setData({ actionStatus: `picked recreated node ${i}` });
        this.stage.render();
      });
      this.lifecycleNodes.push(node);
      group.add(node);
    }

    group.add(
      createText({
        x: 0,
        y: 190,
        text: `${this.lifecycleNodes.length} recreated nodes / variant ${alt ? 'B' : 'A'}`,
        fontSize: 14,
        fill: '#475467'
      })
    );
  },

  updateGraphic() {
    const nextFill = this.data.fill === '#276EF1' ? '#D92D20' : '#276EF1';
    this.setData({ fill: nextFill });

    if (this.rect) {
      this.rect.setAttribute('fill', nextFill);
      this.setData({ actionStatus: `rect fill -> ${nextFill}` });
    } else if (this.stressNodes.length) {
      this.stressAlt = !this.stressAlt;
      const colors = this.stressAlt ? ['#101828', '#D92D20', '#F79009'] : ['#276EF1', '#11A579', '#7C3AED'];
      this.stressNodes.forEach((node, index) => {
        node.setAttribute('fill', colors[index % colors.length]);
        node.setAttribute('opacity', this.stressAlt ? 0.72 + (index % 3) * 0.1 : 0.86);
      });
      this.setData({ actionStatus: `batch update ${this.stressNodes.length} nodes` });
    } else if (this.animationControlNodes) {
      const paused = !this.animationControlNodes.paused;
      this.animationControlNodes.paused = paused;
      if (paused) {
        this.animationControlNodes.moverAnimate?.pause?.();
      } else {
        this.animationControlNodes.moverAnimate?.resume?.();
      }
      this.setData({ actionStatus: `mover animation -> ${paused ? 'paused' : 'resumed'}` });
    } else if (this.resourceNodes) {
      this.resourceNodes.alt = !this.resourceNodes.alt;
      const first = this.resourceNodes.alt ? this.resourceNodes.imageB : this.resourceNodes.imageA;
      const second = this.resourceNodes.alt ? this.resourceNodes.imageA : this.resourceNodes.imageB;
      this.resourceNodes.containImage?.setAttribute?.('image', first);
      this.resourceNodes.coverImage?.setAttribute?.('image', second);
      this.resourceNodes.fillImage?.setAttribute?.('image', first);
      this.setData({ actionStatus: `image resource -> variant ${this.resourceNodes.alt ? 'B' : 'A'}` });
    } else if (this.styleNodes) {
      this.updateStylesScene();
    } else if (this.transformNodes) {
      this.updateTransformScene();
    } else if (this.stateNodes) {
      this.refreshStatePatchScene();
    } else if (this.componentControls.length) {
      this.componentControlAlt = !this.componentControlAlt;
      this.componentControls.forEach((component: any, index: number) => {
        if (component?.setStartAndEnd) {
          component.setStartAndEnd(this.componentControlAlt ? 0.34 : 0.18, this.componentControlAlt ? 0.86 : 0.62);
        } else if (component?.setAttributes) {
          component.setAttributes({
            checked: index % 2 === 0 ? this.componentControlAlt : !this.componentControlAlt,
            value: this.componentControlAlt ? [32, 88] : [20, 72],
            defaultCurrent: this.componentControlAlt ? 4 : 2
          });
        }
      });
      this.setData({ actionStatus: `component controls -> variant ${this.componentControlAlt ? 'B' : 'A'}` });
    } else if (this.geometryNodes) {
      const width = this.canvasWidth || this.stage?.width || 351;
      this.updateGeometryScene(width);
    } else if (this.lifecycleGroup) {
      this.lifecycleAlt = !this.lifecycleAlt;
      this.populateLifecycleGroup(this.lifecycleAlt);
      this.setData({ actionStatus: `lifecycle recreate -> ${this.lifecycleNodes.length} nodes` });
    } else {
      this.setData({ actionStatus: '当前场景没有颜色切换目标' });
    }

    this.stage?.render();
  },

  toggleStateCircle() {
    let handled = false;

    if (this.stateCircle) {
      const nextSelected = !this.stateCircleSelected;
      this.stateCircleSelected = nextSelected;
      this.stateCircle.setStates(nextSelected ? ['selected'] : [], {
        animate: true,
        animateSameStatePatchChange: true
      });
      this.setData({ actionStatus: `circle state -> ${nextSelected ? 'selected' : 'normal'}` });
      handled = true;
    }

    if (this.componentTag) {
      const nextSelected = !this.componentTagSelected;
      this.componentTagSelected = nextSelected;
      if (nextSelected) {
        this.componentTag.addState('selected', false, false);
      } else {
        this.componentTag.removeState('selected', false);
      }
      this.setData({ actionStatus: `tag state -> ${nextSelected ? 'selected' : 'normal'}` });
      handled = true;
    }

    if (this.stateNodes) {
      const nextSelected = !this.stateAlt;
      this.stateAlt = nextSelected;
      this.stateNodes.circle.setStates(nextSelected ? [] : ['active'], { animate: true });
      this.stateNodes.symbol.setStates(nextSelected ? ['selected'] : [], {
        animate: true,
        animateSameStatePatchChange: true
      });
      this.setData({ actionStatus: `state scene toggle -> ${nextSelected ? 'symbol selected' : 'circle active'}` });
      handled = true;
    }

    if (this.componentInteractive.length) {
      const nextChecked = !this.componentControlAlt;
      this.componentControlAlt = nextChecked;
      this.componentInteractive.forEach((component: any, index: number) => {
        component?.setAttributes?.({ checked: index % 2 === 0 ? nextChecked : !nextChecked });
      });
      this.setData({ actionStatus: `component inputs -> ${nextChecked ? 'checked' : 'unchecked'}` });
      handled = true;
    }

    if (this.animationControlNodes) {
      this.animationControlNodes.stopAnimate?.stop?.('end');
      this.setData({ actionStatus: 'stop rect animation -> stop(end)' });
      handled = true;
    }

    if (!handled) {
      this.setData({ actionStatus: '当前场景没有状态切换目标' });
    }

    this.stage?.render();
  },

  forwardEvent(event: any) {
    this.stage?.window?.dispatchEvent?.(event);
  }
});
