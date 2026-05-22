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
  createArc,
  createArea,
  createCircle,
  createGroup,
  createImage,
  createLine,
  createLynxVRenderApp,
  createPath,
  createPolygon,
  createRect,
  createRichText,
  createSymbol,
  createText,
  createWrapText
} from '@visactor/vrender';

export const CANVAS_WIDTH = 360;
export const CANVAS_HEIGHT = 420;
export const MAIN_CANVAS_ID = 'vrender-canvas';
export const BACKUP_CANVAS_ID = 'vrender-backup';

export const SCENES = [
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
] as const;

export type SceneKey = (typeof SCENES)[number]['key'];
export type SmokeAction = 'primary' | 'secondary' | 'rerender';

export const SCENE_META: Record<SceneKey, { title: string; hint: string }> = {
  primitives: {
    title: '基础图元与样式',
    hint: 'rect/circle/symbol/line/area/arc/path/polygon，覆盖渐变、阴影、透明度、虚线和点击拾取。'
  },
  text: {
    title: '文本排版',
    hint: '普通文本、多行文本、wrap text、rich text、underline 和 lineThrough。'
  },
  resources: {
    title: '图片与资源',
    hint: '探测 Lynx image/offscreen bridge；支持时用 offscreen canvas 作为 image 资源，否则显示 fallback。'
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
    hint: '首屏挂载 Tag、Segment、Axis、Legend、Slider、DataZoom、ScrollBar 和输入控件，失败组件显示 fallback。'
  },
  events: {
    title: '事件拾取边界',
    hint: 'touch 转发到 stage.window.dispatchEvent 后，验证重叠、zIndex、旋转组和裁剪子节点拾取。'
  },
  stress: {
    title: '批量图元更新',
    hint: '批量节点创建、批量 setAttribute、透明度/描边样式和节点拾取稳定性。'
  },
  geometry: {
    title: '几何属性更新',
    hint: 'line/area/polygon/path/arc/symbol 几何属性更新后的 bounds 和重绘。'
  },
  lifecycle: {
    title: '生命周期与重建',
    hint: 'removeAllChild(true)、节点重建、scene switch 清理和 React unmount release；普通切页复用同一个 stage。'
  }
};

export const CAPABILITY_CHIPS = [
  'graphics',
  'text',
  'resource',
  'animation',
  'state',
  'transform',
  'components',
  'events',
  'batch',
  'geometry',
  'lifecycle'
];

type MountOptions = {
  sceneKey: SceneKey;
  dpr: number;
  runtime: any;
  canvasFactory?: any;
  app?: any;
  onEvent: (message: string) => void;
};

type ComponentFactory<T = any> = new (...args: any[]) => T;

let activeStage: any = null;

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

const radialGradient = (from: string, to: string): any => ({
  gradient: 'radial',
  x0: 0.5,
  y0: 0.5,
  r0: 0,
  x1: 0.5,
  y1: 0.5,
  r1: 0.58,
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

const componentCtor = <T extends ComponentFactory>(Ctor: T) => Ctor as any;

function compactError(err: unknown) {
  return err instanceof Error ? err.message : String(err);
}

function clampUnit(value: number) {
  return Math.min(1, Math.max(0, value));
}

function formatRatio(value: number) {
  return Math.round(value * 100) / 100;
}

function addTapListener(node: any, handler: () => void) {
  let lastTime = 0;
  const guarded = () => {
    const now = Date.now();
    if (now - lastTime < 32) {
      return;
    }
    lastTime = now;
    handler();
  };
  node.addEventListener?.('tap', guarded);
  node.addEventListener?.('pointerdown', guarded);
}

function collectComponentTargets(component: any, names: string[]) {
  const targets = new Set<any>();
  if (component) {
    targets.add(component);
  }
  for (const name of names) {
    const target = component?.find?.((node: any) => node?.name === name, true);
    if (target) {
      targets.add(target);
    }
  }
  return [...targets];
}

function addSharedTapListener(nodes: any[], handler: () => void) {
  let lastTime = 0;
  const guarded = () => {
    const now = Date.now();
    if (now - lastTime < 48) {
      return;
    }
    lastTime = now;
    handler();
  };
  for (const node of nodes) {
    node?.addEventListener?.('tap', guarded);
    node?.addEventListener?.('pointerdown', guarded);
  }
}

export function dispatchVRenderStageEvent(event: any) {
  return activeStage?.window?.dispatchEvent?.(event) === true;
}

function createSmokeApp(
  options: Pick<MountOptions, 'dpr' | 'runtime' | 'canvasFactory'>
) {
  return createLynxVRenderApp({
    envParams: {
      pixelRatio: options.dpr,
      lynx: options.runtime,
      canvasFactory: options.canvasFactory
    } as any
  });
}

function createSmokeStage(app: any, dpr: number) {
  return app.createStage({
    canvas: MAIN_CANVAS_ID,
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
    dpr,
    autoRender: true,
    canvasControled: false,
    interactiveLayer: false
  });
}

export function mountVRenderSmoke(options: MountOptions) {
  const app =
    options.app ??
    createSmokeApp({
      dpr: options.dpr,
      runtime: options.runtime,
      canvasFactory: options.canvasFactory
    });
  const stage = createSmokeStage(app, options.dpr);

  const controller = new LynxSmokeController({
    app,
    stage,
    runtime: options.runtime,
    onEvent: options.onEvent
  });
  activeStage = stage;
  controller.renderScene(options.sceneKey);
  return controller;
}

class LynxSmokeController {
  private readonly app: any;
  private readonly stage: any;
  private readonly runtime: any;
  private readonly onEvent: (message: string) => void;
  private sceneKey: SceneKey = 'primitives';
  private stageReleased = false;
  private appReleased = false;
  private sceneAnimates: any[] = [];
  private timers: ReturnType<typeof setTimeout>[] = [];
  private dataZoomDragCleanup?: () => void;
  private rect: any;
  private stateCircle: any;
  private styleNodes: any;
  private resourceNodes: any;
  private animationNodes: any;
  private stateNodes: any;
  private transformNodes: any;
  private componentNodes: any;
  private stressNodes: any[] = [];
  private geometryNodes: any;
  private lifecycleGroup: any;
  private lifecycleNodes: any[] = [];
  private primitiveAlt = false;
  private resourceAlt = false;
  private animationPaused = false;
  private stateAlt = false;
  private statePatchAlt = false;
  private transformAlt = false;
  private componentAlt = false;
  private stressAlt = false;
  private geometryAlt = false;
  private lifecycleAlt = false;

  constructor(options: {
    app: any;
    stage: any;
    runtime: any;
    onEvent: (message: string) => void;
  }) {
    this.app = options.app;
    this.stage = options.stage;
    this.runtime = options.runtime;
    this.onEvent = options.onEvent;
  }

  getApp() {
    return this.app;
  }

  renderScene(sceneKey: SceneKey) {
    this.sceneKey = sceneKey;
    const startedAt = Date.now();
    this.clearScene();
    this.drawSceneFrame();

    try {
      if (sceneKey === 'primitives') {
        this.drawPrimitivesScene();
      } else if (sceneKey === 'text') {
        this.drawTextScene();
      } else if (sceneKey === 'resources') {
        this.drawResourceScene();
      } else if (sceneKey === 'animation') {
        this.drawAnimationScene();
      } else if (sceneKey === 'states') {
        this.drawStatesScene();
      } else if (sceneKey === 'transform') {
        this.drawTransformScene();
      } else if (sceneKey === 'components') {
        this.drawComponentsScene();
      } else if (sceneKey === 'events') {
        this.drawEventsScene();
      } else if (sceneKey === 'stress') {
        this.drawStressScene();
      } else if (sceneKey === 'geometry') {
        this.drawGeometryScene();
      } else {
        this.drawLifecycleScene();
      }

      this.stage.render();
      this.onEvent(
        `${SCENE_META[sceneKey].title} rendered in ${Date.now() - startedAt}ms`
      );
    } catch (err) {
      console.error(`[lynx-vrender] render scene failed: ${sceneKey}`, err);
      this.onEvent(
        `${SCENE_META[sceneKey].title} failed: ${compactError(err)}`
      );
    }
  }

  runAction(action: SmokeAction) {
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
      this.onEvent('当前场景无按钮动作，直接点击图元验证事件。');
    }

    this.requestRender();
  }

  release() {
    this.releaseStageOnly();
    if (this.appReleased) {
      return;
    }
    this.appReleased = true;
    this.app?.release?.();
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

  private requestRender() {
    if (this.stage?.renderNextFrame) {
      this.stage.renderNextFrame();
    } else {
      this.stage?.render?.();
    }
  }

  private recordAnimate(animate: any) {
    if (animate) {
      this.sceneAnimates.push(animate);
    }
    return animate;
  }

  private recordTimer(callback: () => void, delay: number) {
    const timer = setTimeout(callback, delay);
    this.timers.push(timer);
  }

  private clearScene() {
    this.dataZoomDragCleanup?.();
    this.dataZoomDragCleanup = undefined;
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

  private drawSceneFrame() {
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

  private addSectionLabel(text: string, x: number, y: number) {
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

  private addNotice(text: string, y: number, fill = '#475467') {
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

  private addComponentSmoke(
    name: string,
    factory: () => any,
    x: number,
    y: number,
    events: string[] = []
  ) {
    try {
      const component = factory();
      this.stage.defaultLayer.add(component);
      if (!events.length) {
        addTapListener(component, () => {
          this.onEvent(`${name} picked`);
        });
      }
      for (const eventName of events) {
        component?.addEventListener?.(eventName, (event: any) => {
          const detail = event?.detail ?? {};
          const values = [
            'value',
            'start',
            'end',
            'current',
            'checked',
            'index'
          ]
            .filter((key) => detail[key] !== undefined)
            .map(
              (key) =>
                `${key}=${Array.isArray(detail[key]) ? detail[key].join(',') : detail[key]}`
            );
          const message = `${name} ${eventName}${values.length ? ` (${values.join(' ')})` : ''}`;
          if (name === 'DataZoom') {
            console.info?.(`[lynx-vrender] ${message}`);
          }
          this.onEvent(message);
        });
      }
      return component;
    } catch (err) {
      console.error(`[lynx-vrender] component smoke failed: ${name}`, err);
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

  private bindTagInteraction(tag: any) {
    const targets = collectComponentTargets(tag, [
      'tag-content',
      'tag-panel',
      'tag-text',
      'tag-shape'
    ]);
    addSharedTapListener(targets, () => {
      const selected = tag?.currentStates?.includes?.('selected');
      if (selected) {
        tag?.removeState?.('selected', false);
      } else {
        tag?.addState?.('selected', false, false);
      }
      this.onEvent(`Tag ${selected ? 'normal' : 'selected'}`);
      this.requestRender();
    });
  }

  private bindDataZoomDiagnostics(dataZoom: any) {
    dataZoom?.addEventListener?.('pointerdown', (event: any) => {
      if (event?.__lynxDataZoomSmokeHandled) {
        return;
      }
      this.handleDataZoomPointerDown(
        dataZoom,
        `root:${event?.target?.name ?? 'unknown'}`,
        event?.target?.name ?? 'background',
        event
      );
    });

    const targets = [
      ['background', 'background'],
      ['selectedBackground', 'selected'],
      ['startHandler', 'start-symbol'],
      ['startHandlerMask', 'start'],
      ['endHandler', 'end-symbol'],
      ['endHandlerMask', 'end'],
      ['middleHandlerRect', 'middle'],
      ['middleHandlerSymbol', 'middle-icon'],
      ['previewGroup', 'preview'],
      ['selectedPreviewGroup', 'selected-preview']
    ] as const;

    for (const [nodeName, label] of targets) {
      const target = dataZoom?.find?.(
        (node: any) => node?.name === nodeName,
        true
      );
      target?.addEventListener?.(
        'pointerdown',
        (event: any) => {
          if (event?.target && event.target !== target) {
            return;
          }
          this.handleDataZoomPointerDown(dataZoom, label, nodeName, event);
        },
        { capture: true }
      );
    }
  }

  private handleDataZoomPointerDown(
    dataZoom: any,
    label: string,
    nodeName: string,
    event: any
  ) {
    event.__lynxDataZoomSmokeHandled = true;
    const message = `DataZoom ${label} pointerdown`;
    console.info?.(`[lynx-vrender] ${message}`);
    this.onEvent(message);
    this.startDataZoomSmokeDrag(dataZoom, nodeName, event);
  }

  private getStageEventPoint(event: any) {
    const transformed = this.stage?.eventPointTransform?.(event);
    const x =
      transformed?.x ??
      event?.canvasX ??
      event?.x ??
      event?.global?.x ??
      event?.offsetX;
    const y =
      transformed?.y ??
      event?.canvasY ??
      event?.y ??
      event?.global?.y ??
      event?.offsetY;
    return typeof x === 'number' && typeof y === 'number' ? { x, y } : null;
  }

  private getDataZoomRange(dataZoom: any, background: any) {
    const selected = dataZoom?.find?.(
      (node: any) => node?.name === 'selectedBackground',
      true
    );
    const bgAttr = background?.attribute ?? {};
    const selectedAttr = selected?.attribute ?? {};
    const width = bgAttr.width || 1;
    const start =
      typeof selectedAttr.x === 'number'
        ? clampUnit((selectedAttr.x - (bgAttr.x ?? 0)) / width)
        : (dataZoom?.attribute?.start ?? 0);
    const end =
      typeof selectedAttr.x === 'number' &&
      typeof selectedAttr.width === 'number'
        ? clampUnit(
            (selectedAttr.x + selectedAttr.width - (bgAttr.x ?? 0)) / width
          )
        : (dataZoom?.attribute?.end ?? 1);
    return start <= end ? { start, end } : { start: end, end: start };
  }

  private startDataZoomSmokeDrag(dataZoom: any, nodeName: string, event: any) {
    const background = dataZoom?.find?.(
      (node: any) => node?.name === 'background',
      true
    );
    const bgAttr = background?.attribute ?? {};
    const width = bgAttr.width || 0;
    if (!width) {
      return;
    }

    this.dataZoomDragCleanup?.();
    const startPoint = this.getStageEventPoint(event);
    if (!startPoint) {
      return;
    }

    const initial = this.getDataZoomRange(dataZoom, background);
    const downRatio = clampUnit((startPoint.x - (bgAttr.x ?? 0)) / width);
    const minSpan = Math.max(dataZoom?.attribute?.minSpan ?? 0.04, 0.04);
    const mode =
      nodeName === 'startHandler' || nodeName === 'startHandlerMask'
        ? 'start'
        : nodeName === 'endHandler' || nodeName === 'endHandlerMask'
          ? 'end'
          : nodeName === 'middleHandlerRect' ||
              nodeName === 'middleHandlerSymbol' ||
              nodeName === 'selectedBackground'
            ? 'move'
            : 'brush';

    const updateRange = (nextStart: number, nextEnd: number) => {
      let start = clampUnit(nextStart);
      let end = clampUnit(nextEnd);
      if (start > end) {
        [start, end] = [end, start];
      }
      if (end - start < minSpan) {
        if (mode === 'start') {
          start = Math.max(0, end - minSpan);
        } else {
          end = Math.min(1, start + minSpan);
        }
      }
      dataZoom?.setStartAndEnd?.(start, end);
      const message = `DataZoom lynx drag (${mode}) start=${formatRatio(start)} end=${formatRatio(end)}`;
      console.info?.(`[lynx-vrender] ${message}`);
      this.onEvent(message);
      this.requestRender();
    };

    const onMove = (moveEvent: any) => {
      const point = this.getStageEventPoint(moveEvent);
      if (!point) {
        return;
      }
      const ratio = clampUnit((point.x - (bgAttr.x ?? 0)) / width);
      if (mode === 'start') {
        updateRange(Math.min(ratio, initial.end - minSpan), initial.end);
      } else if (mode === 'end') {
        updateRange(initial.start, Math.max(ratio, initial.start + minSpan));
      } else if (mode === 'move') {
        const span = initial.end - initial.start;
        const nextStart = clampUnit(initial.start + ratio - downRatio);
        const boundedStart = Math.min(1 - span, Math.max(0, nextStart));
        updateRange(boundedStart, boundedStart + span);
      } else {
        updateRange(downRatio, ratio);
      }
    };

    const cleanup = () => {
      this.stage?.removeEventListener?.('pointermove', onMove, {
        capture: true
      });
      this.stage?.removeEventListener?.('pointerup', cleanup);
      this.stage?.removeEventListener?.('pointerupoutside', cleanup);
      this.stage?.removeEventListener?.('pointerleave', cleanup);
      if (this.dataZoomDragCleanup === cleanup) {
        this.dataZoomDragCleanup = undefined;
      }
    };

    this.stage?.addEventListener?.('pointermove', onMove, { capture: true });
    this.stage?.addEventListener?.('pointerup', cleanup);
    this.stage?.addEventListener?.('pointerupoutside', cleanup);
    this.stage?.addEventListener?.('pointerleave', cleanup);
    this.dataZoomDragCleanup = cleanup;

    if (mode === 'brush') {
      const span = Math.max(initial.end - initial.start, minSpan, 0.18);
      const start = Math.min(1 - span, Math.max(0, downRatio - span / 2));
      updateRange(start, start + span);
    }
  }

  private drawPrimitivesScene() {
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
      this.onEvent(
        rect.currentStates?.includes('selected')
          ? 'rect selected'
          : 'rect normal'
      );
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
      this.onEvent(
        circle.currentStates?.includes('selected')
          ? 'circle selected'
          : 'circle normal'
      );
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
      symbol.setAttributes({ size: 62, angle: Math.PI * 0.12 });
      this.onEvent('delayed symbol attribute update');
      this.requestRender();
    }, 900);
  }

  private updatePrimitives(action: SmokeAction) {
    if (action === 'secondary') {
      this.stateCircle?.toggleState?.('selected', true);
      this.rect?.toggleState?.('selected', true);
      this.onEvent('primitive state toggled');
      return;
    }

    this.primitiveAlt = !this.primitiveAlt;
    const alt = this.primitiveAlt;
    this.rect?.setAttributes?.({
      fill: alt
        ? linearGradient('#D92D20', '#F79009')
        : linearGradient('#276EF1', '#12B76A'),
      shadowColor: alt ? 'rgba(217, 45, 32, 0.3)' : 'rgba(39, 110, 241, 0.25)',
      cornerRadius: alt ? 22 : 10
    });
    this.styleNodes?.circle?.setAttributes?.({
      radius: alt ? 36 : 30,
      fillOpacity: alt ? 0.62 : 0.86
    });
    this.styleNodes?.symbol?.setAttributes?.({
      symbolType: alt ? 'diamond' : 'star',
      fill: alt ? '#7C3AED' : '#E64980'
    });
    this.onEvent(`primitive style -> variant ${alt ? 'B' : 'A'}`);
  }

  private drawTextScene() {
    const layer = this.stage.defaultLayer;
    this.addSectionLabel('plain / multiline', 22, 30);
    layer.add(
      createText({
        x: 24,
        y: 56,
        text: 'Hello VRender Lynx',
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
        text: 'WrapText: Lynx Canvas 下的自动换行、ellipsis、lineClamp smoke。用于确认端侧文字测量和绘制路径。',
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
          {
            text: 'RichText ',
            fontSize: 18,
            fill: '#276EF1',
            fontWeight: 'bold'
          },
          { text: 'mixed ', fontSize: 16, fill: '#344054' },
          {
            text: 'colors',
            fontSize: 16,
            fill: '#11A579',
            background: '#D1FAE5'
          },
          { text: ' / baseline / wrapping', fontSize: 16, fill: '#344054' }
        ],
        textAlign: 'left',
        textBaseline: 'top',
        wordBreak: 'break-word'
      })
    );
  }

  private createResourceCanvas(alt: boolean, size: number) {
    const createOffscreenCanvas = this.runtime?.createOffscreenCanvas;
    if (typeof createOffscreenCanvas !== 'function') {
      return null;
    }

    try {
      let canvas: any;
      try {
        canvas = createOffscreenCanvas({ width: size, height: size });
      } catch {
        canvas = createOffscreenCanvas();
      }
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext?.('2d');
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
    } catch (err) {
      console.warn('[lynx-vrender] create resource canvas failed', err);
      return null;
    }
  }

  private drawResourceScene() {
    const layer = this.stage.defaultLayer;
    const hasCreateImage = typeof this.runtime?.createImage === 'function';
    const hasOffscreen =
      typeof this.runtime?.createOffscreenCanvas === 'function';
    this.addSectionLabel('bridge capability', 22, 30);
    this.addNotice(
      `createImage: ${hasCreateImage ? 'available' : 'missing'} / offscreenCanvas: ${hasOffscreen ? 'available' : 'missing'}`,
      58
    );

    const imageA = this.createResourceCanvas(false, 96);
    const imageB = this.createResourceCanvas(true, 96);
    if (!imageA || !imageB) {
      this.addNotice(
        '当前宿主未暴露可绘制的 offscreen canvas。本场景只记录 image bridge 能力，不强行创建远程图片，避免把网络/宿主资源问题误判为 VRender 渲染问题。',
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
      image: imageA as any,
      imageMode: 'contain',
      cornerRadius: 12
    });
    const coverImage = createImage({
      x: 148,
      y: 164,
      width: 90,
      height: 62,
      image: imageB as any,
      imageMode: 'cover',
      cornerRadius: 12
    });
    const fillImage = createImage({
      x: 266,
      y: 148,
      width: 70,
      height: 96,
      image: imageA as any,
      imageMode: 'fill',
      cornerRadius: [18, 4, 18, 4]
    });
    for (const [index, node] of [
      containImage,
      coverImage,
      fillImage
    ].entries()) {
      addTapListener(node, () => {
        node.setAttribute(
          'opacity',
          node.attribute.opacity === 0.55 ? 1 : 0.55
        );
        this.onEvent(`image ${index + 1} opacity toggled`);
        this.requestRender();
      });
      layer.add(node);
    }
    this.addNotice('点击图片验证 image pick；主按钮替换 image 资源。', 276);
    this.resourceNodes = {
      imageA,
      imageB,
      containImage,
      coverImage,
      fillImage
    };
  }

  private updateResourceScene() {
    const nodes = this.resourceNodes;
    if (!nodes) {
      this.onEvent('当前宿主没有可替换的 image canvas resource');
      return;
    }
    this.resourceAlt = !this.resourceAlt;
    const first = this.resourceAlt ? nodes.imageB : nodes.imageA;
    const second = this.resourceAlt ? nodes.imageA : nodes.imageB;
    nodes.containImage.setAttribute('image', first);
    nodes.coverImage.setAttribute('image', second);
    nodes.fillImage.setAttribute('image', first);
    this.onEvent(`image resource -> variant ${this.resourceAlt ? 'B' : 'A'}`);
  }

  private drawAnimationScene() {
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
        .to(
          { x: CANVAS_WIDTH - 88, width: 64, fill: '#7C3AED' },
          1800,
          'cubicInOut'
        )
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
    this.addNotice(
      '主按钮 pause/resume 往返动画；次按钮 stop(end) 橙色矩形。',
      360
    );
    this.animationNodes = { moverAnimate, stopAnimate };
  }

  private updateAnimationScene(action: SmokeAction) {
    if (!this.animationNodes) {
      return;
    }
    if (action === 'secondary') {
      this.animationNodes.stopAnimate?.stop?.('end');
      this.onEvent('stop rect animation -> stop(end)');
      return;
    }
    this.animationPaused = !this.animationPaused;
    if (this.animationPaused) {
      this.animationNodes.moverAnimate?.pause?.();
    } else {
      this.animationNodes.moverAnimate?.resume?.();
    }
    this.onEvent(
      `mover animation -> ${this.animationPaused ? 'paused' : 'resumed'}`
    );
  }

  private drawStatesScene() {
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
      this.onEvent(
        symbol.currentStates?.includes('selected')
          ? 'symbol selected'
          : 'symbol normal'
      );
      this.requestRender();
    });
    layer.add(rect);
    layer.add(circle);
    layer.add(symbol);
    this.addNotice(
      '主按钮刷新 rect 同状态 patch；次按钮 addState/removeState circle；点击 diamond 走 toggleState。',
      172
    );
    this.addNotice(
      '期望：动画不是新的静态真值源，状态清除后不污染 base attribute。',
      250
    );
    this.stateNodes = { rect, circle, symbol };
  }

  private updateStatesScene(action: SmokeAction) {
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
      this.onEvent(`circle state -> ${this.stateAlt ? 'removed' : 'active'}`);
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
    this.onEvent(`same-state patch -> ${this.statePatchAlt ? '0.58' : '0.28'}`);
  }

  private drawTransformScene() {
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
    transformed.add(
      createText({
        x: -34,
        y: 6,
        text: 'group',
        fontSize: 14,
        fill: '#1D2939'
      })
    );
    addTapListener(transformed, () => {
      panel.setAttribute('fill', '#D1FAE5');
      this.onEvent('transformed group picked');
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
    this.addNotice(
      '主按钮更新 group angle/scale/opacity；点击裁剪区域内 group 验证 transform pick。',
      356
    );
    this.transformNodes = { transformed, clippedLine, foreground, background };
  }

  private updateTransformScene() {
    const nodes = this.transformNodes;
    if (!nodes) {
      return;
    }
    this.transformAlt = !this.transformAlt;
    const alt = this.transformAlt;
    nodes.transformed.setAttributes({
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
    nodes.foreground.setAttributes({
      zIndex: alt ? 2 : 4,
      fillOpacity: alt ? 0.55 : 1
    });
    this.onEvent(`transform update -> variant ${alt ? 'B' : 'A'}`);
  }

  private drawComponentsScene() {
    this.addSectionLabel('tag / segment / axis / legend', 22, 30);
    const tag = this.addComponentSmoke(
      'Tag',
      () =>
        new (componentCtor(Tag))({
          x: 24,
          y: 52,
          text: 'Tag',
          textStyle: { fontSize: 14, fill: '#ffffff' },
          shape: {
            visible: true,
            symbolType: 'circle',
            size: 8,
            fill: '#ffffff'
          },
          panel: {
            visible: true,
            fill: '#276EF1',
            stroke: '#173B83',
            cornerRadius: 8
          },
          padding: [8, 12],
          state: {
            panel: {
              selected: { fill: '#0F766E', stroke: '#064E3B' }
            },
            text: {
              selected: { fill: '#ffffff' }
            },
            shape: {
              selected: { fill: '#FDE68A' }
            }
          }
        }),
      24,
      52
    );
    this.bindTagInteraction(tag);
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
          startSymbol: {
            visible: true,
            symbolType: 'circle',
            size: 10,
            style: { fill: '#7C3AED' }
          },
          endSymbol: {
            visible: true,
            symbolType: 'triangleRight',
            size: 14,
            style: { fill: '#7C3AED' }
          }
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
          endSymbol: {
            visible: true,
            symbolType: 'triangleRight',
            size: 12,
            autoRotate: true,
            style: { fill: '#0F766E' }
          }
        }),
      304,
      78
    );

    const items = axisItems(['A', 'B', 'C', 'D']);
    this.addComponentSmoke(
      'LineAxis',
      () =>
        new (componentCtor(LineAxis))({
          start: { x: 28, y: 136 },
          end: { x: 190, y: 136 },
          items: [items],
          line: { visible: true, stroke: '#344054' },
          tick: { visible: true },
          label: {
            visible: true,
            space: 6,
            style: { fontSize: 11, fill: '#475467' }
          }
        }),
      28,
      136
    );
    this.addComponentSmoke(
      'CircleAxis',
      () =>
        new (componentCtor(CircleAxis))({
          center: { x: 282, y: 136 },
          radius: 34,
          startAngle: -Math.PI * 0.7,
          endAngle: Math.PI * 0.7,
          items: [axisItems(['0', '50', '100'])],
          line: { visible: true, stroke: '#7C3AED' },
          tick: { visible: true },
          label: {
            visible: true,
            space: 4,
            style: { fontSize: 10, fill: '#475467' }
          }
        }),
      282,
      136
    );
    this.addComponentSmoke(
      'DiscreteLegend',
      () =>
        new (componentCtor(DiscreteLegend))({
          x: 26,
          y: 166,
          maxWidth: 162,
          maxRow: 2,
          item: {
            shape: { style: { size: 8 } },
            label: { style: { fontSize: 11 } }
          },
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
        new (componentCtor(Slider))({
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
    this.stage.defaultLayer.add(
      createWrapText({
        x: 192,
        y: 224,
        text: '更新: update DataZoom / ScrollBar',
        fontSize: 11,
        fill: '#475467',
        maxLineWidth: 130,
        lineHeight: 15
      })
    );
    const checkbox = this.addComponentSmoke(
      'CheckBox',
      () =>
        new (componentCtor(CheckBox))({
          x: 184,
          y: 296,
          text: { text: 'Check' },
          checked: false
        }),
      184,
      296,
      ['checkbox_state_change']
    );
    const radio = this.addComponentSmoke(
      'Radio',
      () =>
        new (componentCtor(Radio))({
          x: 270,
          y: 296,
          text: { text: 'Radio' },
          checked: true
        }),
      270,
      296,
      ['radio_checked']
    );
    const switchNode = this.addComponentSmoke(
      'Switch',
      () =>
        new (componentCtor(Switch))({
          x: 28,
          y: 340,
          checked: false,
          text: {
            checkedText: 'on',
            uncheckedText: 'off',
            fill: '#fff',
            fontSize: 10
          }
        }),
      28,
      340,
      ['switch_state_change']
    );
    this.addComponentSmoke(
      'Title',
      () =>
        new (componentCtor(Title))({
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
        new (componentCtor(Indicator))({
          x: 214,
          y: 334,
          size: { width: 70, height: 42 },
          title: {
            visible: true,
            text: '68%',
            style: { fontSize: 16, fill: '#276EF1' }
          },
          content: {
            visible: true,
            text: 'Indicator',
            style: { fontSize: 10, fill: '#475467' }
          }
        }),
      214,
      334
    );
    this.addComponentSmoke(
      'Tooltip',
      () =>
        new (componentCtor(Tooltip))({
          x: 286,
          y: 330,
          title: { visible: true, value: 'Tip' },
          content: [
            { key: 'A', value: '12', shape: { visible: true, fill: '#276EF1' } }
          ],
          panel: {
            visible: true,
            fill: '#fff',
            stroke: '#CBD5E1',
            cornerRadius: 6
          }
        }),
      286,
      330
    );
    this.componentNodes = {
      tag,
      segment,
      arcSegment,
      slider,
      dataZoom: null,
      dataZoomHitArea: null,
      scrollBar: null,
      checkbox,
      radio,
      switchNode,
      deferredControlsMounted: false
    };
    this.mountDeferredComponentControls();
  }

  private mountDeferredComponentControls() {
    const nodes = this.componentNodes;
    if (!nodes || nodes.deferredControlsMounted) {
      return 0;
    }

    const startedAt = Date.now();
    const dataZoomHitArea = createRect({
      x: 184,
      y: 238,
      width: 160,
      height: 48,
      fill: '#ffffff',
      fillOpacity: 0.001,
      pickable: true
    });
    this.stage.defaultLayer.add(dataZoomHitArea);
    nodes.dataZoomHitArea = dataZoomHitArea;

    nodes.dataZoom = this.addComponentSmoke(
      'DataZoom',
      () =>
        new (componentCtor(DataZoom))({
          start: 0.18,
          end: 0.62,
          position: { x: 190, y: 246 },
          size: { width: 146, height: 30 },
          showDetail: 'auto',
          brushSelect: true,
          backgroundStyle: {
            fill: '#F8FAFC',
            stroke: '#98A2B3',
            cornerRadius: 4
          },
          selectedBackgroundStyle: {
            fill: '#B2DDFF',
            fillOpacity: 0.78
          },
          dragMaskStyle: {
            fill: '#276EF1',
            fillOpacity: 0.18
          },
          backgroundChartStyle: {
            line: { visible: false },
            area: { visible: false }
          },
          startHandlerStyle: { triggerMinSize: 44 },
          endHandlerStyle: { triggerMinSize: 44 },
          middleHandlerStyle: {
            visible: true,
            background: {
              size: 12,
              style: {
                fill: '#ffffff',
                stroke: '#276EF1',
                cornerRadius: 3
              }
            },
            icon: {
              size: 8,
              fill: '#276EF1',
              stroke: '#276EF1'
            }
          }
        }),
      190,
      246,
      ['dataZoomChange']
    );
    this.bindDataZoomDiagnostics(nodes.dataZoom);
    dataZoomHitArea.addEventListener?.(
      'pointerdown',
      (event: any) => {
        this.handleDataZoomPointerDown(
          nodes.dataZoom,
          'smoke-hit-area',
          'background',
          event
        );
      },
      { capture: true }
    );
    nodes.scrollBar = this.addComponentSmoke(
      'ScrollBar',
      () =>
        new (componentCtor(ScrollBar))({
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
    nodes.deferredControlsMounted = true;
    return Date.now() - startedAt;
  }

  private updateComponentsScene(action: SmokeAction) {
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
      nodes.checkbox?.setAttributes?.({ checked: alt });
      nodes.radio?.setAttributes?.({ checked: !alt });
      nodes.switchNode?.setAttributes?.({ checked: alt });
      this.onEvent(`component states -> ${alt ? 'selected' : 'normal'}`);
      return;
    }
    const deferredDuration = this.mountDeferredComponentControls();
    nodes.slider?.setAttributes?.({ value: alt ? [32, 88] : [20, 72] });
    nodes.dataZoom?.setStartAndEnd?.(alt ? 0.34 : 0.18, alt ? 0.86 : 0.62);
    nodes.scrollBar?.setAttributes?.({
      range: alt ? [0.34, 0.82] : [0.18, 0.62]
    });
    this.onEvent(
      `component controls -> variant ${alt ? 'B' : 'A'}${
        deferredDuration ? `, deferred ${deferredDuration}ms` : ''
      }`
    );
  }

  private drawEventsScene() {
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
      this.onEvent('picked back rect');
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
      this.onEvent('picked front circle');
      this.requestRender();
    });
    layer.add(frontCircle);

    this.addSectionLabel('rotated group', 202, 30);
    const rotated = createGroup({
      x: 216,
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
    rotated.add(rotatedPanel);
    rotated.add(
      createText({
        x: 20,
        y: 40,
        text: 'tap group',
        fontSize: 14,
        fill: '#064E3B'
      })
    );
    addTapListener(rotated, () => {
      rotatedPanel.setAttribute('fill', '#A7F3D0');
      this.onEvent('picked rotated group');
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
        this.onEvent(`picked clipped child ${index}`);
        this.requestRender();
      });
      clipGroup.add(node);
    }
    layer.add(clipGroup);
    this.addNotice(
      '点击重叠区域、旋转分组或裁剪区域内节点，确认 Lynx touch 转发、拾取顺序和 transform pick。',
      330
    );
  }

  private drawStressScene() {
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
          this.onEvent(`picked node ${index}`);
          this.requestRender();
        });
        this.stressNodes.push(node);
        layer.add(node);
      }
    }

    this.addNotice(
      `${this.stressNodes.length} nodes. 点击任意节点验证 pick；主按钮批量更新 fill/opacity/stroke。`,
      320
    );
  }

  private updateStressScene() {
    this.stressAlt = !this.stressAlt;
    const colors = this.stressAlt
      ? ['#101828', '#D92D20', '#F79009']
      : ['#276EF1', '#11A579', '#7C3AED'];
    for (const [index, node] of this.stressNodes.entries()) {
      node.setAttribute('fill', colors[index % colors.length]);
      node.setAttribute(
        'opacity',
        this.stressAlt ? 0.72 + (index % 3) * 0.1 : 0.86
      );
      node.setAttribute('strokeOpacity', this.stressAlt ? 0.5 : 0.22);
    }
    this.onEvent(`batch update ${this.stressNodes.length} nodes`);
  }

  private drawGeometryScene() {
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
    this.addNotice(
      '主按钮更新 points/path/角度/symbolType，确认 bounds 与重绘。',
      344
    );
    this.geometryNodes = { line, area, polygon, symbol, arc, path };
  }

  private updateGeometryScene() {
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
    this.onEvent(`geometry update -> variant ${alt ? 'B' : 'A'}`);
  }

  private drawLifecycleScene() {
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
    this.addNotice(
      '主按钮 removeAllChild(true) 后重建本组节点；切换任意场景会 release 当前 stage 并重新创建。',
      326
    );
  }

  private populateLifecycleGroup(alt: boolean) {
    const group = this.lifecycleGroup;
    if (!group) {
      return;
    }
    group.removeAllChild?.(true);
    this.lifecycleNodes = [];
    const colors = alt
      ? ['#101828', '#D92D20', '#F79009']
      : ['#276EF1', '#11A579', '#7C3AED'];
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
        this.onEvent(`picked recreated node ${i}`);
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

  private updateLifecycleScene() {
    this.lifecycleAlt = !this.lifecycleAlt;
    this.populateLifecycleGroup(this.lifecycleAlt);
    this.onEvent(`lifecycle recreate -> ${this.lifecycleNodes.length} nodes`);
  }
}
