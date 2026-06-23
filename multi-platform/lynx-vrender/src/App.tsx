import { useEffect, useState } from '@byted-lynx/react';
import {
  BACKUP_CANVAS_ID,
  CAPABILITY_CHIPS,
  MAIN_CANVAS_ID,
  SCENES,
  SCENE_META,
  type SceneKey,
  type SmokeAction,
  dispatchVRenderStageEvent,
  mountVRenderSmoke
} from './smoke-scenes.js';
import './styles.css';

declare const lynx: any;
declare const SystemInfo: {
  pixelRatio?: number;
  enableKrypton?: boolean;
};

const MISSING_CANVAS_MESSAGE = 'host canvas bridge missing';
const URL_ONLY_CANVAS_MESSAGE = 'check host Canvas/Krypton capability';

type LifecycleMode = 'reuse-stage' | 'recreate-stage' | 'recreate-app';

const LIFECYCLE_MODES: Array<{ key: LifecycleMode; label: string }> = [
  { key: 'reuse-stage', label: '复用Stage' },
  { key: 'recreate-stage', label: '重建Stage' },
  { key: 'recreate-app', label: '重建App' }
];

let activeController: ReturnType<typeof mountVRenderSmoke> | null = null;
let activeControllerSceneKey: SceneKey | null = null;
let requestedSceneKey: SceneKey = 'primitives';
let lastCanvasTouchAt = 0;
let canvasTouchActive = false;
let canvasMouseActive = false;
let lastForwardedEventKey = '';
let lastForwardedEventAt = 0;
let lastMoveLogAt = 0;

function getScopedLynxRuntime(): any {
  try {
    return typeof lynx !== 'undefined' ? lynx : undefined;
  } catch (err) {
    return undefined;
  }
}

function getLynxRuntime(): any {
  return getScopedLynxRuntime() ?? (globalThis as any).lynx;
}

function getLynxSystemInfo(): any {
  try {
    return typeof SystemInfo !== 'undefined'
      ? SystemInfo
      : (globalThis as any).SystemInfo;
  } catch (err) {
    return (globalThis as any).SystemInfo;
  }
}

function getLynxCanvasFactory(): any {
  return (globalThis as any).__VRENDER_LYNX_CANVAS_FACTORY__;
}

function safeObjectKeys(value: any): string[] {
  if (!value || typeof value !== 'object') {
    return [];
  }

  try {
    return Object.keys(value).sort();
  } catch (err) {
    return [];
  }
}

function compactKeys(keys: string[]): string {
  return keys.slice(0, 24).join(', ') || 'none';
}

function getCanvasRuntimeDiagnostics(): string[] {
  const runtime = getLynxRuntime();
  const scopedRuntime = getScopedLynxRuntime();
  const systemInfo = getLynxSystemInfo();
  const globalKeys = safeObjectKeys(globalThis).filter((key) =>
    /canvas|krypton|lynx|napi/i.test(key)
  );
  const runtimeKeys = safeObjectKeys(runtime).filter((key) =>
    /canvas|krypton|napi|global|preset|target/i.test(key)
  );
  const kryptonKeys = safeObjectKeys(runtime?.krypton);
  const globalPropsKeys = safeObjectKeys(runtime?.__globalProps);
  const presetDataKeys = safeObjectKeys(runtime?.__presetData);
  const napiLoader = (globalThis as any).getNapiLoader?.();
  const napiLoaderKeys = safeObjectKeys(napiLoader);

  return [
    `lynx runtime: ${runtime ? 'present' : 'missing'}`,
    `scope lynx: ${scopedRuntime ? 'present' : 'missing'}`,
    `SystemInfo: ${systemInfo ? 'present' : 'missing'}`,
    `enableKrypton: ${systemInfo?.enableKrypton ? 'true' : 'false'}`,
    `global canvas keys: ${compactKeys(globalKeys)}`,
    `lynx keys: ${compactKeys(runtimeKeys)}`,
    `lynx.krypton keys: ${compactKeys(kryptonKeys)}`,
    `globalProps keys: ${compactKeys(globalPropsKeys)}`,
    `presetData keys: ${compactKeys(presetDataKeys)}`,
    `getNapiLoader keys: ${compactKeys(napiLoaderKeys)}`
  ];
}

function getCanvasBridgeInfo() {
  const runtime = getLynxRuntime();
  const canvasFactory = getLynxCanvasFactory();
  const hasCanvasFactory = typeof canvasFactory === 'function';
  const hasCreateCanvasNG = typeof runtime?.createCanvasNG === 'function';
  const hasCreateCanvas = typeof runtime?.createCanvas === 'function';
  const hasCreateOffscreenCanvas =
    typeof runtime?.createOffscreenCanvas === 'function';
  const hasCreateImage = typeof runtime?.createImage === 'function';
  const hasKryptonCreateCanvas =
    typeof runtime?.krypton?.createCanvas === 'function';
  const hasKryptonCreateCanvasNG =
    typeof runtime?.krypton?.createCanvasNG === 'function';
  const hasKryptonCanvasElement =
    typeof runtime?.krypton?.CanvasElement === 'function';
  const hasKryptonEnabled = Boolean(getLynxSystemInfo()?.enableKrypton);
  const hasViewCanvasBridge =
    hasCanvasFactory ||
    hasCreateCanvasNG ||
    hasKryptonCreateCanvas ||
    hasKryptonCreateCanvasNG ||
    hasKryptonCanvasElement ||
    hasCreateCanvas;

  return {
    runtime,
    canvasFactory,
    hasCanvasFactory,
    hasCreateCanvasNG,
    hasCreateCanvas,
    hasCreateOffscreenCanvas,
    hasCreateImage,
    hasKryptonCreateCanvas,
    hasKryptonCreateCanvasNG,
    hasKryptonCanvasElement,
    hasKryptonEnabled,
    supported: hasViewCanvasBridge
  };
}

function getLynxPixelRatio(): number {
  return getLynxSystemInfo()?.pixelRatio ?? 1;
}

function pickCoordinate(...values: unknown[]): number | undefined {
  for (const value of values) {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }
  }
  return undefined;
}

function normalizeTouch(touch: any) {
  if (!touch || typeof touch !== 'object') {
    return touch;
  }
  const x = pickCoordinate(touch.x, touch.offsetX, touch.clientX, touch.pageX);
  const y = pickCoordinate(touch.y, touch.offsetY, touch.clientY, touch.pageY);
  return {
    ...touch,
    x,
    y,
    offsetX: touch.offsetX ?? x,
    offsetY: touch.offsetY ?? y,
    clientX: touch.clientX ?? x,
    clientY: touch.clientY ?? y
  };
}

function normalizeTouchList(touches: any) {
  if (!touches) {
    return touches;
  }
  return Array.isArray(touches) ? touches.map(normalizeTouch) : touches;
}

function getFirstTouch(touches: any) {
  return Array.isArray(touches) ? touches[0] : undefined;
}

function makeSyntheticTouch(x: number | undefined, y: number | undefined) {
  if (x == null || y == null) {
    return undefined;
  }
  return {
    identifier: 0,
    x,
    y,
    offsetX: x,
    offsetY: y,
    clientX: x,
    clientY: y,
    pageX: x,
    pageY: y
  };
}

function toLynxCanvasEvent(type: string, event: any) {
  const eventObject = event && typeof event === 'object' ? event : {};
  const eventDetail =
    eventObject.detail && typeof eventObject.detail === 'object'
      ? eventObject.detail
      : {};
  const source = { ...eventObject, ...eventDetail };
  let changedTouches = normalizeTouchList(
    source.changedTouches ?? event?.changedTouches
  );
  let touches = normalizeTouchList(source.touches ?? event?.touches);
  const primaryTouch = getFirstTouch(changedTouches) ?? getFirstTouch(touches);
  const x = pickCoordinate(
    source.x,
    source.offsetX,
    source.clientX,
    source.pageX,
    primaryTouch?.x,
    primaryTouch?.offsetX,
    primaryTouch?.clientX,
    primaryTouch?.pageX
  );
  const y = pickCoordinate(
    source.y,
    source.offsetY,
    source.clientY,
    source.pageY,
    primaryTouch?.y,
    primaryTouch?.offsetY,
    primaryTouch?.clientY,
    primaryTouch?.pageY
  );
  const syntheticTouch = makeSyntheticTouch(x, y);
  if (!changedTouches && syntheticTouch) {
    changedTouches = [syntheticTouch];
  }
  if (!touches && changedTouches) {
    touches =
      type === 'touchend' || type === 'touchcancel' ? [] : changedTouches;
  }

  return {
    ...source,
    type,
    x,
    y,
    offsetX: source.offsetX ?? x,
    offsetY: source.offsetY ?? y,
    clientX: source.clientX ?? x,
    clientY: source.clientY ?? y,
    pageX: source.pageX ?? x,
    pageY: source.pageY ?? y,
    changedTouches,
    touches,
    target: source.target ?? event?.target,
    currentTarget: source.currentTarget ?? event?.currentTarget
  };
}

function describeCanvasEvent(source: string, type: string, event: any) {
  const x = Number.isFinite(event?.x) ? Math.round(event.x) : '?';
  const y = Number.isFinite(event?.y) ? Math.round(event.y) : '?';
  return `${source} ${type} x=${x} y=${y}`;
}

function getCanvasEventKey(type: string, event: any) {
  const x = Number.isFinite(event?.x) ? Math.round(event.x) : '?';
  const y = Number.isFinite(event?.y) ? Math.round(event.y) : '?';
  return `${type}:${x}:${y}`;
}

function getLifecycleModeLabel(mode: LifecycleMode) {
  return LIFECYCLE_MODES.find((item) => item.key === mode)?.label ?? mode;
}

export function App() {
  const [sceneKey, setSceneKey] = useState<SceneKey>('primitives');
  const [lifecycleMode, setLifecycleMode] =
    useState<LifecycleMode>('reuse-stage');
  const [hasCanvasBridge, setHasCanvasBridge] = useState(
    () => getCanvasBridgeInfo().supported
  );
  const [status, setStatus] = useState(
    hasCanvasBridge ? 'waiting' : 'missing canvas bridge'
  );
  const [eventStatus, setEventStatus] = useState(
    hasCanvasBridge ? 'select a scene or tap shapes' : MISSING_CANVAS_MESSAGE
  );
  const [diagnostics, setDiagnostics] = useState(() =>
    getCanvasRuntimeDiagnostics()
  );
  const renderBridgeInfo = getCanvasBridgeInfo();
  const selectedMeta = SCENE_META[sceneKey];

  useEffect(() => {
    let controller: ReturnType<typeof mountVRenderSmoke> | undefined;
    let cancelled = false;
    let frame: number | undefined;
    const scheduleFrame =
      getLynxRuntime()?.requestAnimationFrame ??
      ((callback: FrameRequestCallback) => setTimeout(callback, 0));
    const cancelFrame = getLynxRuntime()?.cancelAnimationFrame ?? clearTimeout;

    try {
      const bridgeInfo = getCanvasBridgeInfo();
      setDiagnostics(getCanvasRuntimeDiagnostics());
      if (!bridgeInfo.supported) {
        setHasCanvasBridge(false);
        console.warn('[lynx-vrender] missing Lynx canvas bridge', {
          hasCanvasFactory: bridgeInfo.hasCanvasFactory,
          hasCreateCanvasNG: bridgeInfo.hasCreateCanvasNG,
          hasCreateCanvas: bridgeInfo.hasCreateCanvas,
          hasCreateOffscreenCanvas: bridgeInfo.hasCreateOffscreenCanvas,
          hasKryptonCreateCanvas: bridgeInfo.hasKryptonCreateCanvas,
          hasKryptonCreateCanvasNG: bridgeInfo.hasKryptonCreateCanvasNG,
          hasKryptonCanvasElement: bridgeInfo.hasKryptonCanvasElement
        });
        setStatus('missing canvas bridge');
        setEventStatus(MISSING_CANVAS_MESSAGE);
        activeController = null;
        activeControllerSceneKey = null;
        return;
      }

      setHasCanvasBridge(true);
      setStatus('mounting');
      frame = scheduleFrame(() => {
        if (cancelled) {
          return;
        }
        try {
          const initialSceneKey = requestedSceneKey;
          controller = mountVRenderSmoke({
            sceneKey: initialSceneKey,
            dpr: getLynxPixelRatio(),
            runtime: bridgeInfo.runtime,
            canvasFactory: bridgeInfo.canvasFactory,
            onEvent: setEventStatus
          });
          activeController = controller;
          activeControllerSceneKey = initialSceneKey;
          setStatus('rendered');
        } catch (err) {
          console.error('[lynx-vrender] mount failed', err);
          setStatus(err instanceof Error ? err.message : 'failed');
          setEventStatus('mount failed; check console');
        }
      });
    } catch (err) {
      console.error('[lynx-vrender] mount failed', err);
      setStatus(err instanceof Error ? err.message : 'failed');
    }

    return () => {
      cancelled = true;
      if (frame != null) {
        cancelFrame(frame);
      }
      if (activeController === controller) {
        activeController = null;
        activeControllerSceneKey = null;
      }
      controller?.release();
    };
  }, []);

  const switchScene = (nextSceneKey: SceneKey, mode: LifecycleMode) => {
    requestedSceneKey = nextSceneKey;
    const bridgeInfo = getCanvasBridgeInfo();
    if (!bridgeInfo.supported) {
      setHasCanvasBridge(false);
      setStatus('missing canvas bridge');
      setEventStatus(MISSING_CANVAS_MESSAGE);
      return;
    }

    if (!activeController) {
      setEventStatus(`${SCENE_META[nextSceneKey].title} queued before mount`);
      return;
    }

    const startedAt = Date.now();
    const previousSceneKey = activeControllerSceneKey;
    setStatus('switching');

    try {
      let controller = activeController;
      if (mode === 'reuse-stage') {
        controller.renderScene(nextSceneKey);
      } else if (mode === 'recreate-stage') {
        const app = controller.getApp();
        controller.releaseStageOnly();
        controller = mountVRenderSmoke({
          app,
          sceneKey: nextSceneKey,
          dpr: getLynxPixelRatio(),
          runtime: bridgeInfo.runtime,
          canvasFactory: bridgeInfo.canvasFactory,
          onEvent: setEventStatus
        });
        activeController = controller;
      } else {
        controller.release();
        controller = mountVRenderSmoke({
          sceneKey: nextSceneKey,
          dpr: getLynxPixelRatio(),
          runtime: bridgeInfo.runtime,
          canvasFactory: bridgeInfo.canvasFactory,
          onEvent: setEventStatus
        });
        activeController = controller;
      }

      activeControllerSceneKey = nextSceneKey;
      setHasCanvasBridge(true);
      setStatus('rendered');
      const message = `scene switch [${getLifecycleModeLabel(mode)}] ${
        previousSceneKey ?? 'none'
      } -> ${nextSceneKey} in ${Date.now() - startedAt}ms`;
      setEventStatus(message);
      console.info?.(`[lynx-vrender] ${message}`);
    } catch (err) {
      console.error('[lynx-vrender] scene switch failed', err);
      setStatus(err instanceof Error ? err.message : 'failed');
      setEventStatus(
        `${SCENE_META[nextSceneKey].title} switch failed; check console`
      );
    }
  };

  const useKryptonCanvas =
    renderBridgeInfo.hasKryptonEnabled ||
    renderBridgeInfo.hasKryptonCreateCanvas ||
    renderBridgeInfo.hasKryptonCreateCanvasNG ||
    renderBridgeInfo.hasKryptonCanvasElement;

  const bridgeSummary = `krypton:${useKryptonCanvas ? 'yes' : 'no'} image:${renderBridgeInfo.hasCreateImage ? 'yes' : 'no'} offscreen:${
    renderBridgeInfo.hasCreateOffscreenCanvas ? 'yes' : 'no'
  }`;

  const runAction = (action: SmokeAction) => {
    if (!activeController) {
      setEventStatus('stage not ready');
      return;
    }
    activeController.runAction(action);
  };

  const forwardCanvasEvent = (type: string, event: any, source = 'touch') => {
    const normalized = toLynxCanvasEvent(type, event);
    if (source === 'global-touch' && !canvasTouchActive) {
      return;
    }
    if (source === 'global-mouse' && !canvasMouseActive) {
      return;
    }

    const now = Date.now();
    const eventKey = getCanvasEventKey(type, normalized);
    if (eventKey === lastForwardedEventKey && now - lastForwardedEventAt < 24) {
      return;
    }
    lastForwardedEventKey = eventKey;
    lastForwardedEventAt = now;

    if (type === 'touchstart') {
      canvasTouchActive = true;
    }
    if (source === 'touch' || source === 'mouse') {
      lastCanvasTouchAt = now;
    }
    setEventStatus(describeCanvasEvent(source, type, normalized));
    const dispatched = dispatchVRenderStageEvent(normalized);
    const shouldLogMove = type === 'touchmove' && now - lastMoveLogAt > 120;
    const shouldLogMouseEdge =
      (source === 'mouse' || source === 'global-mouse') && type !== 'touchmove';
    if (shouldLogMove || shouldLogMouseEdge) {
      if (type === 'touchmove') {
        lastMoveLogAt = now;
      }
      console.info?.(
        `[lynx-vrender] ${describeCanvasEvent(source, type, normalized)} dispatch=${String(dispatched)}`
      );
    }
    if (!dispatched) {
      setEventStatus(
        `${describeCanvasEvent(source, type, normalized)} dispatch=false`
      );
    }
    if (type === 'touchend' || type === 'touchcancel') {
      canvasTouchActive = false;
      canvasMouseActive = false;
    }
  };

  const forwardCanvasMouseEvent = (
    mouseType: 'mousedown' | 'mousemove' | 'mouseup',
    event: any,
    source = 'mouse'
  ) => {
    if (mouseType === 'mousedown') {
      canvasMouseActive = true;
      forwardCanvasEvent('touchstart', event, source);
    } else if (mouseType === 'mousemove') {
      if (!canvasMouseActive) {
        return;
      }
      forwardCanvasEvent('touchmove', event, source);
    } else {
      if (!canvasMouseActive) {
        return;
      }
      forwardCanvasEvent('touchend', event, source);
    }
  };

  const forwardCanvasTap = (event: any) => {
    if (Date.now() - lastCanvasTouchAt < 180) {
      return;
    }
    const downEvent = toLynxCanvasEvent('touchstart', event);
    const upEvent = toLynxCanvasEvent('touchend', event);
    setEventStatus(
      describeCanvasEvent('tap-fallback', 'touchstart', downEvent)
    );
    const downDispatched = dispatchVRenderStageEvent(downEvent);
    const upDispatched = dispatchVRenderStageEvent(upEvent);
    if (!downDispatched && !upDispatched) {
      setEventStatus(
        `${describeCanvasEvent('tap-fallback', 'touchstart', downEvent)} dispatch=false`
      );
    }
  };

  const selectScene = (key: SceneKey) => {
    requestedSceneKey = key;
    setSceneKey(key);
    switchScene(key, lifecycleMode);
  };

  const selectLifecycleMode = (mode: LifecycleMode) => {
    setLifecycleMode(mode);
    setEventStatus(`scene switch mode -> ${getLifecycleModeLabel(mode)}`);
  };

  const globalCanvasTouchHandlers = {
    'global-bindtouchmove': (event: any) =>
      forwardCanvasEvent('touchmove', event, 'global-touch'),
    'global-bindtouchend': (event: any) =>
      forwardCanvasEvent('touchend', event, 'global-touch'),
    'global-bindtouchcancel': (event: any) =>
      forwardCanvasEvent('touchcancel', event, 'global-touch'),
    'global-bindmousemove': (event: any) =>
      forwardCanvasMouseEvent('mousemove', event, 'global-mouse'),
    'global-bindmouseup': (event: any) =>
      forwardCanvasMouseEvent('mouseup', event, 'global-mouse')
  };

  return (
    <view className="Page">
      <view className="Header">
        <view>
          <text className="Title">VRender Lynx Smoke</text>
          <text className="BridgeSummary">{bridgeSummary}</text>
        </view>
        <text className="Status">{status}</text>
      </view>

      <view className="SceneTabs">
        {SCENES.map((scene) => (
          <view
            key={scene.key}
            className={`SceneTab ${sceneKey === scene.key ? 'SceneTabActive' : ''}`}
            bindtap={() => selectScene(scene.key)}
          >
            <text
              className={`SceneTabText ${sceneKey === scene.key ? 'SceneTabTextActive' : ''}`}
            >
              {scene.label}
            </text>
          </view>
        ))}
      </view>

      <view className="LifecycleModes">
        {LIFECYCLE_MODES.map((mode) => (
          <view
            key={mode.key}
            className={`LifecycleMode ${lifecycleMode === mode.key ? 'LifecycleModeActive' : ''}`}
            bindtap={() => selectLifecycleMode(mode.key)}
          >
            <text
              className={`LifecycleModeText ${lifecycleMode === mode.key ? 'LifecycleModeTextActive' : ''}`}
            >
              {mode.label}
            </text>
          </view>
        ))}
      </view>

      <view className="SceneCopy">
        <text className="SceneTitle">{selectedMeta.title}</text>
        <text className="SceneHint">{selectedMeta.hint}</text>
      </view>

      <view className="CanvasPanel">
        {hasCanvasBridge ? (
          <view className="CanvasEventBox">
            {useKryptonCanvas ? (
              <canvas-ng name={MAIN_CANVAS_ID} className="VRenderCanvas" />
            ) : (
              <canvas name={MAIN_CANVAS_ID} className="VRenderCanvas" />
            )}
            {useKryptonCanvas ? (
              <canvas-ng name={BACKUP_CANVAS_ID} className="BackupCanvas" />
            ) : (
              <canvas name={BACKUP_CANVAS_ID} className="BackupCanvas" />
            )}
            <view
              className="CanvasEventLayer"
              bindtouchstart={(event: any) =>
                forwardCanvasEvent('touchstart', event)
              }
              bindtouchmove={(event: any) =>
                forwardCanvasEvent('touchmove', event)
              }
              bindtouchend={(event: any) =>
                forwardCanvasEvent('touchend', event)
              }
              bindtouchcancel={(event: any) =>
                forwardCanvasEvent('touchcancel', event)
              }
              bindmousedown={(event: any) =>
                forwardCanvasMouseEvent('mousedown', event)
              }
              bindmousemove={(event: any) =>
                forwardCanvasMouseEvent('mousemove', event)
              }
              bindmouseup={(event: any) =>
                forwardCanvasMouseEvent('mouseup', event)
              }
              bindtap={forwardCanvasTap}
              {...globalCanvasTouchHandlers}
            />
          </view>
        ) : (
          <view className="CanvasFallback">
            <text className="FallbackTitle">Canvas disabled</text>
            <text className="FallbackText">{URL_ONLY_CANVAS_MESSAGE}</text>
            {diagnostics.map((item) => (
              <text key={item} className="DiagnosticText">
                {item}
              </text>
            ))}
          </view>
        )}
      </view>

      <view className="Capabilities">
        {CAPABILITY_CHIPS.map((item) => (
          <text key={item} className="Capability">
            {item}
          </text>
        ))}
      </view>

      <view className="ActionBar">
        <view className="ActionButton" bindtap={() => runAction('primary')}>
          <text className="ActionText">更新</text>
        </view>
        <view
          className="ActionButton SecondaryButton"
          bindtap={() => runAction('secondary')}
        >
          <text className="ActionText">状态/控制</text>
        </view>
        <view
          className="ActionButton GhostButton"
          bindtap={() => runAction('rerender')}
        >
          <text className="GhostActionText">重绘</text>
        </view>
      </view>

      <text className="Hint">{eventStatus}</text>
    </view>
  );
}
