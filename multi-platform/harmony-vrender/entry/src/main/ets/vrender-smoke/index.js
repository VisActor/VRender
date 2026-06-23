import {
  ArcSegment,
  CheckBox,
  CircleAxis,
  DataZoom,
  DiscreteLegend,
  Indicator,
  LineAxis,
  Radio,
  ScrollBar,
  Segment,
  Slider,
  Switch,
  Tag,
  Title,
  Tooltip,
  acquireSharedVRenderApp,
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
  version
} from '../vendor/vrender/index.js';

const CANVAS_WIDTH = 360;
const CANVAS_HEIGHT = 420;

const SCENES = [
  { key: 'primitives', label: '图元' },
  { key: 'text', label: '文本' },
  { key: 'resources', label: '资源' },
  { key: 'animation', label: '动画' },
  { key: 'states', label: '状态' },
  { key: 'transform', label: '变换' },
  { key: 'components', label: '组件' },
  { key: 'events', label: '事件' },
  { key: 'stress', label: '批量' },
  { key: 'geometry', label: '几何' },
  { key: 'lifecycle', label: '生命周期' }
];

const SCENE_META = {
  primitives: {
    title: '基础图元与样式',
    hint: 'rect/circle/symbol/line/area/arc/path/polygon，覆盖渐变、阴影、透明度、虚线和点击拾取。'
  },
  text: {
    title: '文本排版',
    hint: '普通 text、多行、wrap text、rich text、underline 和 lineThrough。'
  },
  resources: {
    title: '图片与资源',
    hint: '探测 Harmony image/offscreen 能力；端能力不足时显示明确 fallback。'
  },
  animation: {
    title: '动画与控制',
    hint: 'from/to/wait/loop/bounce、颜色/位置/尺寸/透明度动画，按钮可 pause/resume 和 stop(end)。'
  },
  states: {
    title: '状态系统',
    hint: 'setStates/addState/removeState/toggleState，同状态 patch 刷新和点击切换。'
  },
  transform: {
    title: 'Group / Clip / Transform',
    hint: '嵌套 group、clip、opacity、zIndex、旋转/缩放/位移，以及 transform 后拾取。'
  },
  components: {
    title: 'VRender Components',
    hint: '覆盖 Tag、Segment、Axis、Legend、Slider、DataZoom、ScrollBar 和输入控件；失败组件显示 fallback。'
  },
  events: {
    title: '事件拾取边界',
    hint: 'touch 转发到 stage.window.dispatchEvent 后，验证重叠、zIndex、旋转组和裁剪子节点拾取。'
  },
  stress: {
    title: '批量图元更新',
    hint: '批量节点创建、批量 setAttribute、基础性能和拾取稳定性。'
  },
  geometry: {
    title: '几何属性更新',
    hint: 'line/area/polygon/path/arc/symbol 几何属性更新后的 bounds 和重绘。'
  },
  lifecycle: {
    title: '生命周期与重建',
    hint: 'removeAllChild(true)、节点重建、scene switch 清理和 stage/app release。'
  }
};

let appHandle = null;
let activeController = null;
let activeStage = null;
let lastOptions = null;
let activeSceneKey = 'primitives';

const linearGradient = (from, to) => ({
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

const radialGradient = (from, to) => ({
  gradient: 'radial',
  x0: 0.5,
  y0: 0.5,
  r0: 0,
  x1: 0.5,
  y1: 0.5,
  r1: 0.6,
  stops: [
    { offset: 0, color: from },
    { offset: 1, color: to }
  ]
});

const axisItems = labels =>
  labels.map((label, index) => ({
    id: label,
    label,
    value: labels.length <= 1 ? 0 : index / (labels.length - 1),
    rawValue: label
  }));

function compactError(err) {
  return err instanceof Error ? err.message : String(err);
}

function clampUnit(value) {
  return Math.min(1, Math.max(0, value));
}

function formatRatio(value) {
  return Math.round(value * 100) / 100;
}

function addTapListener(node, handler) {
  let lastTime = 0;
  const guarded = () => {
    const now = Date.now();
    if (now - lastTime < 32) {
      return;
    }
    lastTime = now;
    handler();
  };
  node?.addEventListener?.('tap', guarded);
  node?.addEventListener?.('pointerdown', guarded);
  node?.addEventListener?.('touchstart', guarded);
}

function safeSetAttributes(node, attrs) {
  if (node?.setAttributes) {
    node.setAttributes(attrs);
    return;
  }
  for (const key of Object.keys(attrs)) {
    node?.setAttribute?.(key, attrs[key]);
  }
}

function emit(message) {
  console.info(`[harmony-vrender] ${message}`);
  activeController?.emit(message);
}

function ensureAppHandle(options) {
  if (appHandle) {
    return appHandle;
  }

  const canvasFactory = canvasOptions => {
    console.info(`[harmony-vrender] canvasFactory id=${canvasOptions?.id ?? 'unknown'}`);
    return options.canvasBridge;
  };

  appHandle = acquireSharedVRenderApp({
    env: 'harmony',
    key: 'harmony-vrender-smoke',
    envParams: {
      pixelRatio: options.pixelRatio,
      canvasFactory
    }
  });
  return appHandle;
}

function createStage(options) {
  const handle = ensureAppHandle(options);
  return handle.app.createStage({
    canvas: options.canvasId,
    width: options.width,
    height: options.height,
    dpr: options.pixelRatio,
    autoRender: true,
    canvasControled: false,
    interactiveLayer: false
  });
}

export function getHarmonyVRenderVersion() {
  return version;
}

export function getHarmonyVRenderScenes() {
  return SCENES.map(scene => ({
    ...scene,
    title: SCENE_META[scene.key].title,
    hint: SCENE_META[scene.key].hint
  }));
}

export function getHarmonyVRenderSceneMeta(sceneKey) {
  return SCENE_META[sceneKey] ?? SCENE_META.primitives;
}

export function mountHarmonyVRenderSmoke(options, sceneKey = activeSceneKey) {
  lastOptions = options;
  activeSceneKey = sceneKey || 'primitives';
  activeController?.releaseStageOnly();

  const stage = createStage(options);
  activeController = new HarmonySmokeController({
    stage,
    onEvent: options.onEvent
  });
  activeStage = stage;
  activeController.renderScene(activeSceneKey);
  return true;
}

export function renderHarmonyVRenderScene(sceneKey) {
  activeSceneKey = sceneKey || activeSceneKey;
  if (!activeController) {
    if (!lastOptions) {
      return false;
    }
    return mountHarmonyVRenderSmoke(lastOptions, activeSceneKey);
  }
  activeController.renderScene(activeSceneKey);
  return true;
}

export function runHarmonyVRenderAction(action) {
  if (!activeController) {
    return false;
  }
  activeController.runAction(action);
  return true;
}

export function redrawHarmonyVRenderSmoke() {
  return renderHarmonyVRenderScene(activeSceneKey);
}

export function dispatchHarmonyVRenderEvent(event) {
  return activeStage?.window?.dispatchEvent?.(event) === true;
}

export function releaseHarmonyVRenderStage() {
  activeController?.releaseStageOnly();
  activeController = null;
  activeStage = null;
}

export function releaseHarmonyVRenderSmoke() {
  releaseHarmonyVRenderStage();
  appHandle?.release?.();
  appHandle = null;
}

export function recreateHarmonyVRenderStage() {
  if (!lastOptions) {
    return false;
  }
  releaseHarmonyVRenderStage();
  return mountHarmonyVRenderSmoke(lastOptions, activeSceneKey);
}

class HarmonySmokeController {
  constructor(options) {
    this.stage = options.stage;
    this.onEvent = options.onEvent;
    this.sceneKey = 'primitives';
    this.stageReleased = false;
    this.sceneAnimates = [];
    this.timers = [];
    this.primitiveAlt = false;
    this.resourceAlt = false;
    this.animationPaused = false;
    this.stateAlt = false;
    this.statePatchAlt = false;
    this.transformAlt = false;
    this.componentAlt = false;
    this.stressAlt = false;
    this.geometryAlt = false;
    this.lifecycleAlt = false;
    this.stressNodes = [];
    this.lifecycleNodes = [];
  }

  emit(message) {
    this.onEvent?.(message);
  }

  renderScene(sceneKey) {
    this.sceneKey = sceneKey || 'primitives';
    const startedAt = Date.now();
    this.clearScene();
    this.drawSceneFrame();

    try {
      if (this.sceneKey === 'primitives') {
        this.drawPrimitivesScene();
      } else if (this.sceneKey === 'text') {
        this.drawTextScene();
      } else if (this.sceneKey === 'resources') {
        this.drawResourceScene();
      } else if (this.sceneKey === 'animation') {
        this.drawAnimationScene();
      } else if (this.sceneKey === 'states') {
        this.drawStatesScene();
      } else if (this.sceneKey === 'transform') {
        this.drawTransformScene();
      } else if (this.sceneKey === 'components') {
        this.drawComponentsScene();
      } else if (this.sceneKey === 'events') {
        this.drawEventsScene();
      } else if (this.sceneKey === 'stress') {
        this.drawStressScene();
      } else if (this.sceneKey === 'geometry') {
        this.drawGeometryScene();
      } else {
        this.drawLifecycleScene();
      }

      this.stage.render();
      this.emit(`${SCENE_META[this.sceneKey].title} rendered in ${Date.now() - startedAt}ms`);
    } catch (err) {
      console.error(`[harmony-vrender] render scene failed: ${this.sceneKey}`, err);
      this.emit(`${SCENE_META[this.sceneKey].title} failed: ${compactError(err)}`);
    }
  }

  runAction(action) {
    if (action === 'rerender') {
      this.renderScene(this.sceneKey);
      return;
    }

    if (this.sceneKey === 'primitives') {
      this.updatePrimitives(action);
    } else if (this.sceneKey === 'resources') {
      this.updateResourceScene();
    } else if (this.sceneKey === 'animation') {
      this.updateAnimationScene(action);
    } else if (this.sceneKey === 'states') {
      this.updateStatesScene(action);
    } else if (this.sceneKey === 'transform') {
      this.updateTransformScene();
    } else if (this.sceneKey === 'components') {
      this.updateComponentsScene(action);
    } else if (this.sceneKey === 'stress') {
      this.updateStressScene();
    } else if (this.sceneKey === 'geometry') {
      this.updateGeometryScene();
    } else if (this.sceneKey === 'lifecycle') {
      this.updateLifecycleScene();
    } else {
      this.emit('当前场景无按钮动作，直接点击图元验证事件。');
    }
    this.requestRender();
  }

  releaseStageOnly() {
    if (this.stageReleased) {
      return;
    }
    this.stageReleased = true;
    this.clearScene();
    if (activeStage === this.stage) {
      activeStage = null;
    }
    this.stage?.release?.();
  }

  requestRender() {
    if (this.stage?.renderNextFrame) {
      this.stage.renderNextFrame();
    } else {
      this.stage?.render?.();
    }
  }

  recordAnimate(animate) {
    if (animate) {
      this.sceneAnimates.push(animate);
    }
    return animate;
  }

  recordTimer(callback, delay) {
    const timer = setTimeout(callback, delay);
    this.timers.push(timer);
  }

  clearScene() {
    for (const timer of this.timers) {
      clearTimeout(timer);
    }
    this.timers = [];
    for (const animate of this.sceneAnimates) {
      animate?.stop?.();
    }
    this.sceneAnimates = [];
    this.stage?.defaultLayer?.removeAllChild?.(true);
    this.rect = undefined;
    this.stateCircle = undefined;
    this.styleNodes = undefined;
    this.resourceNodes = undefined;
    this.animationNodes = undefined;
    this.stateNodes = undefined;
    this.transformNodes = undefined;
    this.componentNodes = undefined;
    this.stressNodes = [];
    this.geometryNodes = undefined;
    this.lifecycleGroup = undefined;
    this.lifecycleNodes = [];
    this.primitiveAlt = false;
    this.resourceAlt = false;
    this.animationPaused = false;
    this.stateAlt = false;
    this.statePatchAlt = false;
    this.transformAlt = false;
    this.componentAlt = false;
    this.stressAlt = false;
    this.geometryAlt = false;
    this.lifecycleAlt = false;
  }

  drawSceneFrame() {
    const layer = this.stage.defaultLayer;
    layer.add(
      createRect({
        x: 8,
        y: 8,
        width: CANVAS_WIDTH - 16,
        height: CANVAS_HEIGHT - 16,
        fill: '#ffffff',
        stroke: '#D8DEEA',
        lineWidth: 1,
        cornerRadius: 10
      })
    );
    layer.add(
      createText({
        x: 20,
        y: CANVAS_HEIGHT - 20,
        text: SCENE_META[this.sceneKey].title,
        fontSize: 12,
        fill: '#667085'
      })
    );
  }

  addSectionLabel(text, x, y) {
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
  }

  addNotice(text, y, fill = '#475467') {
    this.stage.defaultLayer.add(
      createWrapText({
        x: 24,
        y,
        text,
        fontSize: 13,
        fill,
        maxLineWidth: CANVAS_WIDTH - 48,
        lineHeight: 18
      })
    );
  }

  addComponentSmoke(name, factory, x, y, events = []) {
    try {
      const component = factory();
      this.stage.defaultLayer.add(component);
      if (!events.length) {
        addTapListener(component, () => this.emit(`${name} picked`));
      }
      for (const eventName of events) {
        component?.addEventListener?.(eventName, event => {
          const detail = event?.detail ?? {};
          const values = ['value', 'start', 'end', 'current', 'checked', 'index']
            .filter(key => detail[key] !== undefined)
            .map(key => `${key}=${Array.isArray(detail[key]) ? detail[key].join(',') : detail[key]}`);
          this.emit(`${name} ${eventName}${values.length ? ` (${values.join(' ')})` : ''}`);
        });
      }
      return component;
    } catch (err) {
      console.error(`[harmony-vrender] component smoke failed: ${name}`, err);
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
  }

  drawPrimitivesScene() {
    const layer = this.stage.defaultLayer;
    this.addSectionLabel('shape / style / state', 22, 30);

    const rect = createRect({
      x: 22,
      y: 52,
      width: 90,
      height: 58,
      fill: linearGradient('#276EF1', '#12B76A'),
      stroke: '#173B83',
      lineWidth: 3,
      cornerRadius: 10,
      shadowBlur: 8,
      shadowColor: 'rgba(39, 110, 241, 0.25)'
    });
    rect.states = {
      selected: {
        fill: '#0F766E',
        stroke: '#064E3B',
        lineWidth: 5
      }
    };
    addTapListener(rect, () => {
      rect.toggleState('selected', true);
      this.emit(rect.currentStates?.includes('selected') ? 'rect selected' : 'rect normal');
      this.requestRender();
    });
    this.rect = rect;
    layer.add(rect);

    const circle = createCircle({
      x: 156,
      y: 82,
      radius: 30,
      fill: radialGradient('#FDE68A', '#F79009'),
      stroke: '#8D5B00',
      lineWidth: 2,
      fillOpacity: 0.86
    });
    circle.states = {
      selected: {
        fill: '#D1FAE5',
        stroke: '#087F5B',
        radius: 36
      }
    };
    addTapListener(circle, () => {
      circle.toggleState('selected', true);
      this.emit(circle.currentStates?.includes('selected') ? 'circle selected' : 'circle normal');
      this.requestRender();
    });
    this.stateCircle = circle;
    layer.add(circle);

    const symbol = createSymbol({
      x: 232,
      y: 82,
      size: 52,
      symbolType: 'star',
      fill: '#E64980',
      stroke: '#8A1248',
      lineWidth: 2
    });
    layer.add(symbol);

    layer.add(
      createPolygon({
        points: [
          { x: 302, y: 48 },
          { x: 336, y: 78 },
          { x: 318, y: 118 },
          { x: 276, y: 104 },
          { x: 274, y: 62 }
        ],
        fill: '#E0EAFF',
        stroke: '#444CE7',
        lineWidth: 2,
        cornerRadius: 6,
        opacity: 0.92
      })
    );

    this.addSectionLabel('line / area / arc / path', 22, 142);
    layer.add(
      createLine({
        points: [
          { x: 24, y: 180 },
          { x: 72, y: 152 },
          { x: 120, y: 178 },
          { x: 170, y: 150 },
          { x: 220, y: 174 }
        ],
        stroke: '#7C3AED',
        lineWidth: 4,
        lineDash: [10, 5],
        lineCap: 'round',
        lineJoin: 'round',
        curveType: 'monotoneX'
      })
    );
    layer.add(
      createArea({
        points: [
          { x: 24, y: 248, y1: 292 },
          { x: 80, y: 214, y1: 292 },
          { x: 136, y: 236, y1: 292 },
          { x: 192, y: 202, y1: 292 },
          { x: 248, y: 232, y1: 292 }
        ],
        fill: 'rgba(39, 110, 241, 0.18)',
        stroke: '#276EF1',
        lineWidth: 2,
        curveType: 'monotoneX'
      })
    );
    layer.add(
      createArc({
        x: 288,
        y: 214,
        innerRadius: 22,
        outerRadius: 42,
        startAngle: -Math.PI * 0.2,
        endAngle: Math.PI * 1.4,
        fill: '#11A579',
        stroke: '#075E54',
        lineWidth: 2,
        cornerRadius: 6
      })
    );
    layer.add(
      createPath({
        path: 'M252 312 C256 276 314 276 318 312 C314 348 256 350 252 312 Z',
        fill: '#FEE4E2',
        stroke: '#D92D20',
        lineWidth: 2,
        fillOpacity: 0.9
      })
    );

    this.styleNodes = { rect, circle, symbol };
    this.recordTimer(() => {
      safeSetAttributes(symbol, { size: 62, angle: Math.PI * 0.12 });
      this.emit('delayed symbol attribute update');
      this.requestRender();
    }, 900);
  }

  updatePrimitives(action) {
    if (action === 'secondary') {
      this.stateCircle?.toggleState?.('selected', true);
      this.rect?.toggleState?.('selected', true);
      this.emit('primitive state toggled');
      return;
    }

    this.primitiveAlt = !this.primitiveAlt;
    const alt = this.primitiveAlt;
    safeSetAttributes(this.rect, {
      fill: alt ? linearGradient('#D92D20', '#F79009') : linearGradient('#276EF1', '#12B76A'),
      shadowColor: alt ? 'rgba(217, 45, 32, 0.3)' : 'rgba(39, 110, 241, 0.25)',
      cornerRadius: alt ? 22 : 10
    });
    safeSetAttributes(this.styleNodes?.circle, {
      radius: alt ? 36 : 30,
      fillOpacity: alt ? 0.62 : 0.86
    });
    safeSetAttributes(this.styleNodes?.symbol, {
      symbolType: alt ? 'diamond' : 'star',
      fill: alt ? '#7C3AED' : '#E64980'
    });
    this.emit(`primitive style -> variant ${alt ? 'B' : 'A'}`);
  }

  drawTextScene() {
    const layer = this.stage.defaultLayer;
    this.addSectionLabel('plain / multiline', 22, 30);
    layer.add(
      createText({
        x: 24,
        y: 56,
        text: 'Hello VRender Harmony',
        fontSize: 24,
        fontWeight: 700,
        fill: '#1D2939'
      })
    );
    layer.add(
      createText({
        x: CANVAS_WIDTH - 24,
        y: 62,
        text: ['right aligned', 'multi line'],
        fontSize: 13,
        fill: '#475467',
        textAlign: 'right',
        lineHeight: 18
      })
    );

    this.addSectionLabel('wrap / decoration', 22, 118);
    layer.add(
      createWrapText({
        x: 24,
        y: 144,
        text: 'WrapText: Harmony Canvas 下的自动换行、ellipsis、lineClamp smoke。用于确认端侧文字测量和绘制路径。',
        fontSize: 15,
        fill: '#344054',
        maxLineWidth: CANVAS_WIDTH - 52,
        lineClamp: 2,
        ellipsis: true,
        lineHeight: 22
      })
    );
    layer.add(
      createText({
        x: 24,
        y: 214,
        text: 'underline + lineThrough',
        fontSize: 16,
        fill: '#D92D20',
        underline: 1,
        lineThrough: 1
      })
    );

    this.addSectionLabel('rich text', 22, 260);
    layer.add(
      createRichText({
        x: 24,
        y: 286,
        width: CANVAS_WIDTH - 48,
        height: 82,
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
  }

  createResourceCanvas(alt, size) {
    const resourceFactory = lastOptions?.resourceCanvasFactory;
    if (typeof resourceFactory !== 'function') {
      return null;
    }

    const resource = resourceFactory({ width: size, height: size, variant: alt ? 'B' : 'A' });
    const ctx = resource?.getContext?.('2d');
    if (!resource || !ctx || typeof ctx.createLinearGradient !== 'function') {
      return null;
    }

    try {
      const x = 0;
      const y = 0;
      const gradient = ctx.createLinearGradient(x, y, x + size, y + size);
      gradient.addColorStop(0, alt ? '#FEE4E2' : '#E0EAFF');
      gradient.addColorStop(1, alt ? '#D92D20' : '#276EF1');
      ctx.save?.();
      ctx.fillStyle = gradient;
      ctx.fillRect(x, y, size, size);
      ctx.fillStyle = alt ? '#101828' : '#11A579';
      ctx.beginPath();
      ctx.arc(x + size * 0.68, y + size * 0.36, size * 0.18, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = `${Math.round(size * 0.22)}px sans-serif`;
      ctx.fillText(alt ? 'B' : 'A', x + size * 0.16, y + size * 0.76);
      ctx.restore?.();
      return typeof resource.transferToImageBitmap === 'function' ? resource.transferToImageBitmap() : resource;
    } catch (err) {
      console.warn('[harmony-vrender] create resource canvas failed', err);
      return null;
    }
  }

  drawResourceScene() {
    const layer = this.stage.defaultLayer;
    const hasCanvasImage = typeof lastOptions?.resourceCanvasFactory === 'function';
    this.addSectionLabel('bridge capability', 22, 30);
    this.addNotice(`offscreen image resource: ${hasCanvasImage ? 'available' : 'missing'} / remote image: not exercised`, 58);

    const imageA = this.createResourceCanvas(false, 72);
    const imageB = this.createResourceCanvas(true, 72);
    if (!imageA || !imageB) {
      this.addNotice(
        '当前 Harmony smoke 未拿到可作为 image 资源的 canvas bridge。本场景只记录资源能力，不强行创建远程图片，避免把网络/宿主资源问题误判为 VRender 渲染问题。',
        118,
        '#D92D20'
      );
      return;
    }

    this.addSectionLabel('image graphic / canvas resource', 22, 122);
    const containImage = createImage({
      x: 42,
      y: 154,
      width: 82,
      height: 82,
      image: imageA,
      imageMode: 'contain',
      cornerRadius: 12
    });
    const coverImage = createImage({
      x: 148,
      y: 164,
      width: 90,
      height: 62,
      image: imageB,
      imageMode: 'cover',
      cornerRadius: 12
    });
    const fillImage = createImage({
      x: 266,
      y: 148,
      width: 70,
      height: 96,
      image: imageA,
      imageMode: 'fill',
      cornerRadius: [18, 4, 18, 4]
    });
    for (const [index, node] of [containImage, coverImage, fillImage].entries()) {
      addTapListener(node, () => {
        node.setAttribute('opacity', node.attribute.opacity === 0.55 ? 1 : 0.55);
        this.emit(`image ${index + 1} opacity toggled`);
        this.requestRender();
      });
      layer.add(node);
    }
    this.addNotice('点击图片验证 image pick；主按钮替换 image 资源。', 276);
    this.resourceNodes = { imageA, imageB, containImage, coverImage, fillImage };
  }

  updateResourceScene() {
    const nodes = this.resourceNodes;
    if (!nodes) {
      this.emit('当前宿主没有可替换的 image canvas resource');
      return;
    }
    this.resourceAlt = !this.resourceAlt;
    const first = this.resourceAlt ? nodes.imageB : nodes.imageA;
    const second = this.resourceAlt ? nodes.imageA : nodes.imageB;
    nodes.containImage.setAttribute('image', first);
    nodes.coverImage.setAttribute('image', second);
    nodes.fillImage.setAttribute('image', first);
    this.emit(`image resource -> variant ${this.resourceAlt ? 'B' : 'A'}`);
  }

  drawAnimationScene() {
    const layer = this.stage.defaultLayer;
    this.addSectionLabel('loop / bounce / from / wait', 22, 30);
    const pulse = createCircle({
      x: 70,
      y: 92,
      radius: 22,
      fill: '#276EF1',
      fillOpacity: 0.78,
      stroke: '#173B83',
      lineWidth: 3
    });
    layer.add(pulse);
    this.recordAnimate(
      pulse
        .animate?.({ onFrame: () => this.requestRender() })
        .to({ radius: 38, fillOpacity: 0.28 }, 850, 'cubicInOut')
        .to({ radius: 22, fillOpacity: 0.78 }, 850, 'cubicInOut')
        .loop(true)
    );

    const mover = createRect({
      x: 26,
      y: 152,
      width: 42,
      height: 30,
      fill: '#0F766E',
      cornerRadius: 8
    });
    layer.add(mover);
    const moverAnimate = this.recordAnimate(
      mover
        .animate?.({ onFrame: () => this.requestRender() })
        .to({ x: CANVAS_WIDTH - 82, fill: '#D92D20' }, 1300, 'cubicInOut')
        .loop(true)
        .bounce(true)
    );

    const stopRect = createRect({
      x: 26,
      y: 214,
      width: 48,
      height: 28,
      fill: '#F79009',
      cornerRadius: 8
    });
    layer.add(stopRect);
    const stopAnimate = this.recordAnimate(
      stopRect
        .animate?.({ onFrame: () => this.requestRender() })
        .to({ x: CANVAS_WIDTH - 88, width: 64, fill: '#7C3AED' }, 1800, 'cubicInOut')
    );

    const star = createSymbol({
      x: CANVAS_WIDTH - 72,
      y: 92,
      size: 58,
      symbolType: 'star',
      fill: '#F5A623',
      stroke: '#8D5B00',
      lineWidth: 2
    });
    layer.add(star);
    this.recordAnimate(
      star
        .animate?.({ onFrame: () => this.requestRender() })
        .wait(260)
        .from({ y: 122, opacity: 0 }, 720, 'cubicOut')
        .to({ angle: Math.PI * 2 }, 1800, 'linear')
        .loop(true)
    );

    for (const index of [0, 1, 2, 3]) {
      const targetHeight = 40 + index * 20;
      const bar = createRect({
        x: 40 + index * 54,
        y: 338 - targetHeight,
        width: 34,
        height: targetHeight,
        fill: ['#276EF1', '#11A579', '#F79009', '#E64980'][index],
        opacity: 1,
        cornerRadius: [6, 6, 0, 0]
      });
      layer.add(bar);
      this.recordAnimate(
        bar
          .animate?.({ onFrame: () => this.requestRender() })
          .wait(index * 120)
          .from({ y: 338, height: 0, opacity: 0 }, 760, 'cubicOut')
      );
    }
    this.addNotice('主按钮 pause/resume 往返动画；次按钮 stop(end) 橙色矩形。', 360);
    this.animationNodes = { moverAnimate, stopAnimate };
  }

  updateAnimationScene(action) {
    if (!this.animationNodes) {
      return;
    }
    if (action === 'secondary') {
      this.animationNodes.stopAnimate?.stop?.('end');
      this.emit('stop rect animation -> stop(end)');
      return;
    }
    this.animationPaused = !this.animationPaused;
    if (this.animationPaused) {
      this.animationNodes.moverAnimate?.pause?.();
    } else {
      this.animationNodes.moverAnimate?.resume?.();
    }
    this.emit(`mover animation -> ${this.animationPaused ? 'paused' : 'resumed'}`);
  }

  drawStatesScene() {
    const layer = this.stage.defaultLayer;
    this.addSectionLabel('setStates / same-state patch', 22, 30);
    const rect = createRect({
      x: 28,
      y: 58,
      width: 112,
      height: 70,
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
    rect.setStates(['custom1'], {
      animate: true,
      animateSameStatePatchChange: true
    });

    const circle = createCircle({
      x: 220,
      y: 92,
      radius: 32,
      fill: '#F2F4F7',
      stroke: '#475467',
      lineWidth: 2
    });
    circle.states = {
      active: {
        fill: '#D1FAE5',
        stroke: '#0F766E',
        radius: 40
      }
    };
    circle.addState('active', true, false);

    const symbol = createSymbol({
      x: CANVAS_WIDTH - 68,
      y: 92,
      size: 60,
      symbolType: 'diamond',
      fill: '#F79009',
      stroke: '#8D5B00',
      lineWidth: 2
    });
    symbol.states = {
      selected: {
        fill: '#7C3AED',
        size: 82
      }
    };
    addTapListener(symbol, () => {
      symbol.toggleState('selected', true);
      this.emit(symbol.currentStates?.includes('selected') ? 'symbol selected' : 'symbol normal');
      this.requestRender();
    });
    layer.add(rect);
    layer.add(circle);
    layer.add(symbol);
    this.addNotice('主按钮刷新 rect 同状态 patch；次按钮 addState/removeState circle；点击 diamond 走 toggleState。', 172);
    this.addNotice('期望：动画不是新的静态真值源，状态清除后不污染 base attribute。', 250);
    this.stateNodes = { rect, circle, symbol };
  }

  updateStatesScene(action) {
    const nodes = this.stateNodes;
    if (!nodes) {
      return;
    }
    if (action === 'secondary') {
      this.stateAlt = !this.stateAlt;
      if (this.stateAlt) {
        nodes.circle.removeState('active', false);
      } else {
        nodes.circle.addState('active', true, false);
      }
      this.emit(`circle state -> ${this.stateAlt ? 'removed' : 'active'}`);
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
    this.emit(`same-state patch -> ${this.statePatchAlt ? '0.58' : '0.28'}`);
  }

  drawTransformScene() {
    const layer = this.stage.defaultLayer;
    this.addSectionLabel('nested group / clip / opacity', 22, 30);
    const rootGroup = createGroup({
      x: 26,
      y: 58,
      width: CANVAS_WIDTH - 52,
      height: 176,
      clip: true,
      cornerRadius: 12
    });
    rootGroup.add(
      createRect({
        x: 0,
        y: 0,
        width: CANVAS_WIDTH - 52,
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
      scaleY: 1,
      opacity: 0.92
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
    transformed.add(createText({ x: -34, y: 6, text: 'group', fontSize: 14, fill: '#1D2939' }));
    addTapListener(transformed, () => {
      panel.setAttribute('fill', '#D1FAE5');
      this.emit('transformed group picked');
      this.requestRender();
    });
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

    const foreground = createRect({
      x: 210,
      y: 250,
      width: 98,
      height: 68,
      fill: '#FEE4E2',
      stroke: '#D92D20',
      lineWidth: 2,
      cornerRadius: 10,
      zIndex: 4
    });
    const background = createRect({
      x: 160,
      y: 286,
      width: 98,
      height: 68,
      fill: '#E0EAFF',
      stroke: '#276EF1',
      lineWidth: 2,
      cornerRadius: 10,
      zIndex: 3
    });
    layer.add(background);
    layer.add(foreground);
    this.addNotice('主按钮更新 group angle/scale/opacity；点击裁剪区域内 group 验证 transform pick。', 356);
    this.transformNodes = { transformed, clippedLine, foreground };
  }

  updateTransformScene() {
    const nodes = this.transformNodes;
    if (!nodes) {
      return;
    }
    this.transformAlt = !this.transformAlt;
    const alt = this.transformAlt;
    safeSetAttributes(nodes.transformed, {
      angle: alt ? 0.34 : -0.3,
      scaleX: alt ? 1.14 : 1,
      scaleY: alt ? 0.88 : 1,
      opacity: alt ? 0.68 : 0.92
    });
    nodes.clippedLine.setAttribute(
      'points',
      alt
        ? [
            { x: -20, y: 128 },
            { x: 70, y: 154 },
            { x: 168, y: 112 },
            { x: 262, y: 148 },
            { x: 380, y: 118 }
          ]
        : [
            { x: 0, y: 146 },
            { x: 90, y: 116 },
            { x: 180, y: 150 },
            { x: 270, y: 106 },
            { x: 360, y: 142 }
          ]
    );
    safeSetAttributes(nodes.foreground, {
      zIndex: alt ? 2 : 4,
      fillOpacity: alt ? 0.55 : 1
    });
    this.emit(`transform update -> variant ${alt ? 'B' : 'A'}`);
  }

  drawComponentsScene() {
    this.addSectionLabel('tag / segment / axis / legend', 22, 30);
    const tag = this.addComponentSmoke(
      'Tag',
      () =>
        new Tag({
          x: 24,
          y: 52,
          text: 'Tag',
          textStyle: { fontSize: 14, fill: '#ffffff' },
          panel: { visible: true, fill: '#276EF1', stroke: '#173B83', cornerRadius: 8 },
          padding: [8, 12],
          state: {
            panel: { selected: { fill: '#0F766E', stroke: '#064E3B' } },
            text: { selected: { fill: '#ffffff' } }
          }
        }),
      24,
      52
    );
    addTapListener(tag, () => {
      const selected = tag?.currentStates?.includes?.('selected');
      if (selected) {
        tag?.removeState?.('selected', false);
      } else {
        tag?.addState?.('selected', false, false);
      }
      this.emit(`Tag ${selected ? 'normal' : 'selected'}`);
      this.requestRender();
    });

    const segment = this.addComponentSmoke(
      'Segment',
      () =>
        new Segment({
          points: [
            { x: 114, y: 66 },
            { x: 190, y: 46 },
            { x: 260, y: 78 }
          ],
          lineStyle: { stroke: '#7C3AED', lineWidth: 3, lineDash: [6, 4] },
          startSymbol: { visible: true, symbolType: 'circle', size: 10, style: { fill: '#7C3AED' } },
          endSymbol: { visible: true, symbolType: 'triangleRight', size: 14, style: { fill: '#7C3AED' } }
        }),
      114,
      66
    );
    const arcSegment = this.addComponentSmoke(
      'ArcSegment',
      () =>
        new ArcSegment({
          center: { x: 304, y: 78 },
          radius: 28,
          startAngle: -Math.PI * 0.65,
          endAngle: Math.PI * 0.7,
          lineStyle: { stroke: '#0F766E', lineWidth: 3 },
          endSymbol: { visible: true, symbolType: 'triangleRight', size: 12, autoRotate: true, style: { fill: '#0F766E' } }
        }),
      304,
      78
    );

    this.addComponentSmoke(
      'LineAxis',
      () =>
        new LineAxis({
          start: { x: 28, y: 136 },
          end: { x: 190, y: 136 },
          items: [axisItems(['A', 'B', 'C', 'D'])],
          line: { visible: true, stroke: '#344054' },
          tick: { visible: true },
          label: { visible: true, space: 6, style: { fontSize: 11, fill: '#475467' } }
        }),
      28,
      136
    );
    this.addComponentSmoke(
      'CircleAxis',
      () =>
        new CircleAxis({
          center: { x: 282, y: 136 },
          radius: 34,
          startAngle: -Math.PI * 0.7,
          endAngle: Math.PI * 0.7,
          items: [axisItems(['0', '50', '100'])],
          line: { visible: true, stroke: '#7C3AED' },
          tick: { visible: true },
          label: { visible: true, space: 4, style: { fontSize: 10, fill: '#475467' } }
        }),
      282,
      136
    );
    this.addComponentSmoke(
      'DiscreteLegend',
      () =>
        new DiscreteLegend({
          x: 26,
          y: 166,
          maxWidth: 162,
          maxRow: 2,
          item: { shape: { style: { size: 8 } }, label: { style: { fontSize: 11 } } },
          items: [
            { label: 'A', shape: { fill: '#276EF1', symbolType: 'circle' } },
            { label: 'B', shape: { fill: '#11A579', symbolType: 'square' } },
            { label: 'C', shape: { fill: '#F79009', symbolType: 'triangle' } }
          ],
          allowAllCanceled: false
        }),
      26,
      166,
      ['legendItemClick', 'legendItemHover', 'legendItemUnHover']
    );

    this.addSectionLabel('controls / misc', 22, 226);
    const slider = this.addComponentSmoke(
      'Slider',
      () =>
        new Slider({
          x: 28,
          y: 254,
          layout: 'horizontal',
          railWidth: 118,
          railHeight: 8,
          min: 0,
          max: 100,
          value: [20, 72],
          range: { draggableTrack: true },
          startText: { visible: true, text: 'L', space: 6 },
          endText: { visible: true, text: 'H', space: 6 }
        }),
      28,
      254,
      ['change', 'sliderTooltip']
    );
    const dataZoom = this.addComponentSmoke(
      'DataZoom',
      () =>
        new DataZoom({
          start: 0.18,
          end: 0.62,
          position: { x: 190, y: 246 },
          size: { width: 146, height: 30 },
          showDetail: 'auto',
          brushSelect: true,
          backgroundStyle: { fill: '#F8FAFC', stroke: '#98A2B3', cornerRadius: 4 },
          selectedBackgroundStyle: { fill: '#B2DDFF', fillOpacity: 0.78 },
          backgroundChartStyle: { line: { visible: false }, area: { visible: false } },
          startHandlerStyle: { triggerMinSize: 44 },
          endHandlerStyle: { triggerMinSize: 44 }
        }),
      190,
      246,
      ['dataZoomChange']
    );
    const scrollBar = this.addComponentSmoke(
      'ScrollBar',
      () =>
        new ScrollBar({
          x: 28,
          y: 302,
          width: 128,
          height: 10,
          range: [0.18, 0.62],
          railStyle: { fill: '#E4E7EC' },
          sliderStyle: { fill: '#667085' }
        }),
      28,
      302,
      ['scrollDown', 'scrollDrag', 'scrollUp']
    );
    const checkbox = this.addComponentSmoke('CheckBox', () => new CheckBox({ x: 184, y: 296, text: { text: 'Check' }, checked: false }), 184, 296, [
      'checkbox_state_change'
    ]);
    const radio = this.addComponentSmoke('Radio', () => new Radio({ x: 270, y: 296, text: { text: 'Radio' }, checked: true }), 270, 296, [
      'radio_checked'
    ]);
    const switchNode = this.addComponentSmoke(
      'Switch',
      () => new Switch({ x: 28, y: 340, checked: false, text: { checkedText: 'on', uncheckedText: 'off', fill: '#fff', fontSize: 10 } }),
      28,
      340,
      ['switch_state_change']
    );
    this.addComponentSmoke(
      'Title',
      () =>
        new Title({
          x: 116,
          y: 338,
          width: 92,
          maxWidth: 92,
          text: 'Title',
          subtext: 'sub',
          textStyle: { fontSize: 14, fill: '#1D2939' },
          subtextStyle: { fontSize: 10, fill: '#667085' }
        }),
      116,
      338
    );
    this.addComponentSmoke(
      'Indicator',
      () =>
        new Indicator({
          x: 214,
          y: 334,
          size: { width: 70, height: 42 },
          title: { visible: true, text: '68%', style: { fontSize: 16, fill: '#276EF1' } },
          content: { visible: true, text: 'Indicator', style: { fontSize: 10, fill: '#475467' } }
        }),
      214,
      334
    );
    this.addComponentSmoke(
      'Tooltip',
      () =>
        new Tooltip({
          x: 286,
          y: 330,
          title: { visible: true, value: 'Tip' },
          content: [{ key: 'A', value: '12', shape: { visible: true, fill: '#276EF1' } }],
          panel: { visible: true, fill: '#fff', stroke: '#CBD5E1', cornerRadius: 6 }
        }),
      286,
      330
    );
    this.componentNodes = { tag, segment, arcSegment, slider, dataZoom, scrollBar, checkbox, radio, switchNode };
  }

  updateComponentsScene(action) {
    const nodes = this.componentNodes;
    if (!nodes) {
      return;
    }
    this.componentAlt = !this.componentAlt;
    const alt = this.componentAlt;
    if (action === 'secondary') {
      if (alt) {
        nodes.tag?.addState?.('selected', false, false);
      } else {
        nodes.tag?.removeState?.('selected', false);
      }
      safeSetAttributes(nodes.checkbox, { checked: alt });
      safeSetAttributes(nodes.radio, { checked: !alt });
      safeSetAttributes(nodes.switchNode, { checked: alt });
      this.emit(`component states -> ${alt ? 'selected' : 'normal'}`);
      return;
    }
    safeSetAttributes(nodes.slider, { value: alt ? [32, 88] : [20, 72] });
    nodes.dataZoom?.setStartAndEnd?.(alt ? 0.34 : 0.18, alt ? 0.86 : 0.62);
    safeSetAttributes(nodes.scrollBar, { range: alt ? [0.34, 0.82] : [0.18, 0.62] });
    this.emit(`component controls -> variant ${alt ? 'B' : 'A'}`);
  }

  drawEventsScene() {
    const layer = this.stage.defaultLayer;
    this.addSectionLabel('overlap / zIndex', 22, 30);
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
    addTapListener(backRect, () => {
      backRect.setAttribute('fill', '#DBEAFE');
      this.emit('picked back rect');
      this.requestRender();
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
    addTapListener(frontCircle, () => {
      frontCircle.setAttribute('fill', '#FECACA');
      this.emit('picked front circle');
      this.requestRender();
    });
    layer.add(frontCircle);

    this.addSectionLabel('rotated group', 202, 30);
    const rotated = createGroup({ x: 216, y: 82, angle: 0.28 });
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
    rotated.add(rotatedPanel);
    rotated.add(createText({ x: 20, y: 40, text: 'tap group', fontSize: 14, fill: '#064E3B' }));
    addTapListener(rotated, () => {
      rotatedPanel.setAttribute('fill', '#A7F3D0');
      this.emit('picked rotated group');
      this.requestRender();
    });
    layer.add(rotated);

    this.addSectionLabel('clip group / child pick', 22, 184);
    const clipGroup = createGroup({
      x: 26,
      y: 210,
      width: CANVAS_WIDTH - 52,
      height: 92,
      clip: true,
      cornerRadius: 10
    });
    clipGroup.add(
      createRect({
        x: 0,
        y: 0,
        width: CANVAS_WIDTH - 52,
        height: 92,
        fill: '#F8FAFC',
        stroke: '#CBD5E1',
        lineWidth: 1,
        cornerRadius: 10
      })
    );
    for (const index of [0, 1, 2, 3, 4]) {
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
      addTapListener(node, () => {
        node.setAttribute('radius', 30);
        this.emit(`picked clipped child ${index}`);
        this.requestRender();
      });
      clipGroup.add(node);
    }
    layer.add(clipGroup);
    this.addNotice('点击重叠区域、旋转分组或裁剪区域内节点，确认 Harmony touch 转发、拾取顺序和 transform pick。', 330);
  }

  drawStressScene() {
    const layer = this.stage.defaultLayer;
    this.addSectionLabel('batch nodes / style update / picking', 22, 30);
    const cols = 8;
    const rows = 6;
    const startX = 24;
    const startY = 58;
    const gapX = 40;
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
        addTapListener(node, () => {
          node.setAttribute('fill', '#101828');
          this.emit(`picked node ${index}`);
          this.requestRender();
        });
        this.stressNodes.push(node);
        layer.add(node);
      }
    }
    this.addNotice(`${this.stressNodes.length} nodes. 点击任意节点验证 pick；主按钮批量更新 fill/opacity/stroke。`, 320);
  }

  updateStressScene() {
    this.stressAlt = !this.stressAlt;
    const colors = this.stressAlt ? ['#101828', '#D92D20', '#F79009'] : ['#276EF1', '#11A579', '#7C3AED'];
    for (const [index, node] of this.stressNodes.entries()) {
      node.setAttribute('fill', colors[index % colors.length]);
      node.setAttribute('opacity', this.stressAlt ? 0.72 + (index % 3) * 0.1 : 0.86);
      node.setAttribute('strokeOpacity', this.stressAlt ? 0.5 : 0.22);
    }
    this.emit(`batch update ${this.stressNodes.length} nodes`);
  }

  drawGeometryScene() {
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
        { x: 236, y: 56 },
        { x: 302, y: 64 },
        { x: 322, y: 124 },
        { x: 268, y: 158 },
        { x: 218, y: 118 }
      ],
      fill: '#FEE4E2',
      stroke: '#D92D20',
      lineWidth: 2,
      cornerRadius: 8
    });
    const symbol = createSymbol({
      x: 278,
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
    this.addNotice('主按钮更新 points/path/角度/symbolType，确认 bounds 与重绘。', 344);
    this.geometryNodes = { line, area, polygon, symbol, arc, path };
  }

  updateGeometryScene() {
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
            { x: 224, y: 72 },
            { x: 282, y: 42 },
            { x: 326, y: 102 },
            { x: 290, y: 170 },
            { x: 214, y: 146 }
          ]
        : [
            { x: 236, y: 56 },
            { x: 302, y: 64 },
            { x: 322, y: 124 },
            { x: 268, y: 158 },
            { x: 218, y: 118 }
          ]
    );
    safeSetAttributes(nodes.symbol, {
      symbolType: alt ? 'triangle' : 'star',
      size: alt ? 74 : 56,
      fill: alt ? '#7C3AED' : '#F79009'
    });
    safeSetAttributes(nodes.arc, {
      startAngle: alt ? Math.PI * 0.15 : -Math.PI * 0.15,
      endAngle: alt ? Math.PI * 1.75 : Math.PI * 1.2,
      outerRadius: alt ? 50 : 42,
      fill: alt ? '#0F766E' : '#11A579'
    });
    nodes.path.setAttribute(
      'path',
      alt ? 'M144 250 C184 226 232 240 260 280 C218 310 172 306 144 250 Z' : 'M142 264 C174 224 220 224 250 264 C222 306 172 306 142 264 Z'
    );
    this.emit(`geometry update -> variant ${alt ? 'B' : 'A'}`);
  }

  drawLifecycleScene() {
    const layer = this.stage.defaultLayer;
    this.addSectionLabel('remove / recreate / cleanup', 22, 30);
    const group = createGroup({
      x: 24,
      y: 58,
      width: CANVAS_WIDTH - 48,
      height: 230
    });
    layer.add(group);
    this.lifecycleGroup = group;
    this.populateLifecycleGroup(false);
    this.addNotice('主按钮 removeAllChild(true) 后重建本组节点；切换任意场景会清理旧场景。底部按钮可释放/重建 stage。', 326);
  }

  populateLifecycleGroup(alt) {
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
      addTapListener(node, () => {
        node.setAttribute('fill', '#0F172A');
        this.emit(`picked recreated node ${i}`);
        this.requestRender();
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
  }

  updateLifecycleScene() {
    this.lifecycleAlt = !this.lifecycleAlt;
    this.populateLifecycleGroup(this.lifecycleAlt);
    this.emit(`lifecycle recreate -> ${this.lifecycleNodes.length} nodes`);
  }
}
