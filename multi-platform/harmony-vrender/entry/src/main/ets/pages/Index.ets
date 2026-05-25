import {
  dispatchHarmonyVRenderEvent,
  getHarmonyVRenderSceneMeta,
  getHarmonyVRenderScenes,
  getHarmonyVRenderVersion,
  mountHarmonyVRenderSmoke,
  recreateHarmonyVRenderStage,
  redrawHarmonyVRenderSmoke,
  releaseHarmonyVRenderStage,
  renderHarmonyVRenderScene,
  runHarmonyVRenderAction,
  releaseHarmonyVRenderSmoke
} from '../vrender-smoke/index.js';

class VRenderCanvasStyle {}

interface VRenderBounds {
  x: number;
  y: number;
  width: number;
  height: number;
  left: number;
  top: number;
  right: number;
  bottom: number;
}

interface VRenderTouchPoint {
  identifier: number;
  x: number;
  y: number;
  offsetX: number;
  offsetY: number;
  clientX: number;
  clientY: number;
  pageX: number;
  pageY: number;
}

interface VRenderTouchEvent {
  type: string;
  x?: number;
  y?: number;
  offsetX?: number;
  offsetY?: number;
  clientX?: number;
  clientY?: number;
  pageX?: number;
  pageY?: number;
  changedTouches: VRenderTouchPoint[];
  touches: VRenderTouchPoint[];
  target: VRenderCanvasBridge;
  currentTarget: VRenderCanvasBridge;
  preventDefault: () => void;
  stopPropagation: () => void;
}

interface VRenderCanvasBridge {
  id: string;
  width: number;
  height: number;
  style: VRenderCanvasStyle;
  getContext: (type?: string) => CanvasRenderingContext2D;
  getBoundingClientRect: () => VRenderBounds;
  addEventListener: () => void;
  removeEventListener: () => void;
  dispatchEvent: () => boolean;
}

interface HarmonyVRenderMountOptions {
  canvasId: string;
  width: number;
  height: number;
  pixelRatio: number;
  canvasBridge: VRenderCanvasBridge;
  onEvent: (message: string) => void;
}

interface HarmonySceneInfo {
  key: string;
  label: string;
  title: string;
  hint: string;
}

interface HarmonySceneMeta {
  title: string;
  hint: string;
}

@Entry
@Component
struct Index {
  private readonly settings: RenderingContextSettings = new RenderingContextSettings(true);
  private readonly context: CanvasRenderingContext2D = new CanvasRenderingContext2D(this.settings);
  private readonly vrenderSettings: RenderingContextSettings = new RenderingContextSettings(true);
  private readonly vrenderContext: CanvasRenderingContext2D = new CanvasRenderingContext2D(this.vrenderSettings);
  private readonly scenes: HarmonySceneInfo[] = getHarmonyVRenderScenes() as HarmonySceneInfo[];
  private readonly canvasWidth: number = 360;
  private readonly nativeCanvasHeight: number = 300;
  private readonly vrenderCanvasHeight: number = 420;
  private readonly vrenderCanvasId: string = 'harmony-vrender-main';
  private vrenderCanvasBridge: VRenderCanvasBridge | undefined = undefined;
  private vrenderMounted: boolean = false;

  @State private status: string = 'waiting for Canvas.onReady';
  @State private vrenderStatus: string = 'waiting for VRender Canvas.onReady';
  @State private vrenderEventStatus: string = 'tap VRender shapes';
  @State private sceneKey: string = 'primitives';
  @State private sceneTitle: string = (getHarmonyVRenderSceneMeta('primitives') as HarmonySceneMeta).title;
  @State private sceneHint: string = (getHarmonyVRenderSceneMeta('primitives') as HarmonySceneMeta).hint;
  @State private eventCount: number = 0;

  private drawScene(label: string): void {
    const ctx = this.context;
    ctx.clearRect(0, 0, this.canvasWidth, this.nativeCanvasHeight);

    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, this.canvasWidth, this.nativeCanvasHeight);

    const gradient = ctx.createLinearGradient(24, 64, 156, 64);
    gradient.addColorStop(0, '#2563eb');
    gradient.addColorStop(1, '#22c55e');
    ctx.fillStyle = gradient;
    ctx.fillRect(24, 64, 132, 74);

    ctx.lineWidth = 4;
    ctx.strokeStyle = '#0f172a';
    ctx.strokeRect(24, 64, 132, 74);

    ctx.beginPath();
    ctx.fillStyle = '#14b8a6';
    ctx.arc(238, 101, 43, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#f97316';
    ctx.arc(238, 101, 56, 0, Math.PI * 1.45);
    ctx.stroke();

    ctx.beginPath();
    ctx.setLineDash([8, 6]);
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#7c3aed';
    ctx.moveTo(28, 184);
    ctx.lineTo(332, 184);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.beginPath();
    ctx.fillStyle = '#f59e0b';
    ctx.moveTo(44, 250);
    ctx.lineTo(96, 214);
    ctx.lineTo(148, 250);
    ctx.lineTo(124, 292);
    ctx.lineTo(68, 292);
    ctx.closePath();
    ctx.fill();

    ctx.font = '20vp sans-serif';
    ctx.fillStyle = '#111827';
    ctx.fillText('VRender Harmony Smoke', 20, 34);
    ctx.font = '14vp sans-serif';
    ctx.fillStyle = '#475569';
    ctx.fillText(label, 20, 168);
    ctx.fillText('touch / move / up will mark coordinates', 20, 286);
  }

  private drawTouchPoint(x: number, y: number, typeName: string): void {
    const ctx = this.context;
    ctx.beginPath();
    ctx.fillStyle = typeName === 'up' ? '#ef4444' : '#0ea5e9';
    ctx.arc(x, y, 9, 0, Math.PI * 2);
    ctx.fill();

    ctx.font = '12vp sans-serif';
    ctx.fillStyle = '#0f172a';
    ctx.fillText(typeName, x + 12, y + 4);
  }

  private getTouchTypeName(type: TouchType): string {
    switch (type) {
      case TouchType.Down:
        return 'down';
      case TouchType.Move:
        return 'move';
      case TouchType.Up:
        return 'up';
      case TouchType.Cancel:
        return 'cancel';
      default:
        return 'unknown';
    }
  }

  private getPrimaryTouch(event: TouchEvent): TouchObject | undefined {
    if (event.changedTouches.length > 0) {
      return event.changedTouches[0];
    }
    if (event.touches.length > 0) {
      return event.touches[0];
    }
    return undefined;
  }

  private handleTouch(event: TouchEvent): void {
    const point = this.getPrimaryTouch(event);
    const typeName = this.getTouchTypeName(event.type);
    this.eventCount += 1;

    if (!point) {
      this.status = `${typeName} #${this.eventCount}: no touch point`;
      console.info(`[harmony-vrender] touch ${this.status}`);
      return;
    }

    this.status = `${typeName} #${this.eventCount}: x=${point.x.toFixed(1)} y=${point.y.toFixed(1)}`;
    console.info(`[harmony-vrender] touch ${this.status}`);
    this.drawTouchPoint(point.x, point.y, typeName);
  }

  private getVRenderCanvasBridge(): VRenderCanvasBridge {
    if (this.vrenderCanvasBridge) {
      return this.vrenderCanvasBridge;
    }

    this.vrenderCanvasBridge = {
      id: this.vrenderCanvasId,
      width: this.canvasWidth,
      height: this.vrenderCanvasHeight,
      style: new VRenderCanvasStyle(),
      getContext: (_type?: string): CanvasRenderingContext2D => this.vrenderContext,
      getBoundingClientRect: (): VRenderBounds => ({
        x: 0,
        y: 0,
        width: this.canvasWidth,
        height: this.vrenderCanvasHeight,
        left: 0,
        top: 0,
        right: this.canvasWidth,
        bottom: this.vrenderCanvasHeight
      }),
      addEventListener: (): void => {
        return;
      },
      removeEventListener: (): void => {
        return;
      },
      dispatchEvent: (): boolean => true
    };

    return this.vrenderCanvasBridge;
  }

  private mountVRenderSmoke(): void {
    try {
      this.releaseVRenderSmoke();
      const options: HarmonyVRenderMountOptions = {
        canvasId: this.vrenderCanvasId,
        width: this.canvasWidth,
        height: this.vrenderCanvasHeight,
        pixelRatio: 1,
        canvasBridge: this.getVRenderCanvasBridge(),
        onEvent: (message: string): void => {
          this.vrenderEventStatus = message;
        }
      };

      this.vrenderMounted = mountHarmonyVRenderSmoke(options, this.sceneKey) === true;
      this.vrenderStatus = `VRender ${getHarmonyVRenderVersion()}: ${this.sceneTitle}`;
    } catch (err) {
      this.vrenderStatus = err instanceof Error ? err.message : String(err);
      console.error('[harmony-vrender] VRender mount failed', err);
    }
  }

  private releaseVRenderSmoke(): void {
    releaseHarmonyVRenderSmoke();
    this.vrenderMounted = false;
  }

  private updateSceneMeta(sceneKey: string): void {
    const meta = getHarmonyVRenderSceneMeta(sceneKey) as HarmonySceneMeta;
    this.sceneKey = sceneKey;
    this.sceneTitle = meta.title;
    this.sceneHint = meta.hint;
  }

  private switchVRenderScene(sceneKey: string): void {
    this.updateSceneMeta(sceneKey);
    if (!this.vrenderMounted) {
      this.mountVRenderSmoke();
      return;
    }
    if (renderHarmonyVRenderScene(sceneKey) === true) {
      this.vrenderStatus = `VRender ${getHarmonyVRenderVersion()}: ${this.sceneTitle}`;
    }
  }

  private renderVRenderScene(): void {
    if (!this.vrenderMounted) {
      this.vrenderStatus = 'VRender stage is not ready';
      return;
    }

    if (redrawHarmonyVRenderSmoke() === true) {
      this.vrenderStatus = `VRender ${this.sceneTitle}: redrawn`;
    }
  }

  private runVRenderAction(action: string): void {
    if (!this.vrenderMounted) {
      this.mountVRenderSmoke();
      return;
    }
    if (runHarmonyVRenderAction(action) === true) {
      this.vrenderStatus = `VRender ${this.sceneTitle}: action ${action}`;
    }
  }

  private recreateVRenderStage(): void {
    if (recreateHarmonyVRenderStage() === true) {
      this.vrenderMounted = true;
      this.vrenderStatus = `VRender ${this.sceneTitle}: stage recreated`;
      return;
    }
    this.mountVRenderSmoke();
  }

  private releaseVRenderStageOnly(): void {
    releaseHarmonyVRenderStage();
    this.vrenderMounted = false;
    this.vrenderStatus = 'VRender stage released; app handle retained';
    this.vrenderEventStatus = 'tap Recreate Stage or Render VRender';
  }

  private toVRenderTouchEvent(type: string, event: TouchEvent): VRenderTouchEvent {
    const point = this.getPrimaryTouch(event);
    let x: number | undefined = undefined;
    let y: number | undefined = undefined;
    let changedTouches: VRenderTouchPoint[] = [];
    let touches: VRenderTouchPoint[] = [];

    if (point) {
      x = point.x;
      y = point.y;
      const touch: VRenderTouchPoint = {
        identifier: 0,
        x: point.x,
        y: point.y,
        offsetX: point.x,
        offsetY: point.y,
        clientX: point.x,
        clientY: point.y,
        pageX: point.x,
        pageY: point.y
      };
      changedTouches = [touch];
      touches = type === 'touchend' || type === 'touchcancel' ? [] : [touch];
    }

    return {
      type,
      x,
      y,
      offsetX: x,
      offsetY: y,
      clientX: x,
      clientY: y,
      pageX: x,
      pageY: y,
      changedTouches,
      touches,
      target: this.getVRenderCanvasBridge(),
      currentTarget: this.getVRenderCanvasBridge(),
      preventDefault: (): void => {
        return;
      },
      stopPropagation: (): void => {
        return;
      }
    };
  }

  private getVRenderTouchEventType(type: TouchType): string {
    if (type === TouchType.Down) {
      return 'touchstart';
    }
    if (type === TouchType.Move) {
      return 'touchmove';
    }
    if (type === TouchType.Up) {
      return 'touchend';
    }
    return 'touchcancel';
  }

  private formatCoordinate(value: number | undefined): string {
    return typeof value === 'number' && Number.isFinite(value) ? Math.round(value).toString() : '?';
  }

  private handleVRenderTouch(event: TouchEvent): void {
    const typeName = this.getTouchTypeName(event.type);
    const eventType = this.getVRenderTouchEventType(event.type);
    const normalized = this.toVRenderTouchEvent(eventType, event);
    const x = this.formatCoordinate(normalized.x);
    const y = this.formatCoordinate(normalized.y);
    this.vrenderEventStatus = `${typeName} x=${x} y=${y} forwarding`;
    const dispatched = this.vrenderMounted ? dispatchHarmonyVRenderEvent(normalized) === true : false;
    if (!dispatched) {
      this.vrenderEventStatus = `${typeName} x=${x} y=${y} dispatch=false`;
    }
    console.info(`[harmony-vrender] ${this.vrenderEventStatus}`);
  }

  aboutToDisappear(): void {
    this.releaseVRenderSmoke();
  }

  build() {
    Scroll() {
      Column({ space: 12 }) {
        Text('VRender Harmony Smoke')
          .fontSize(22)
          .fontWeight(FontWeight.Bold)
          .fontColor('#111827')

        Text(`VRender bundle ${getHarmonyVRenderVersion()}`)
          .fontSize(12)
          .fontColor('#64748b')

        Text(this.status)
          .fontSize(14)
          .fontColor('#334155')

        Canvas(this.context)
          .width(this.canvasWidth)
          .height(this.nativeCanvasHeight)
          .backgroundColor('#ffffff')
          .onReady(() => {
            this.status = 'Canvas.onReady: native 2D context is available';
            this.drawScene(this.status);
            console.info('[harmony-vrender] Canvas.onReady');
          })
          .onTouch((event: TouchEvent) => {
            this.handleTouch(event);
          })

        Row({ space: 10 }) {
          Button('Redraw')
            .onClick(() => {
              this.drawScene('manual redraw');
              this.status = 'manual redraw';
            })

          Button('Reset Count')
            .onClick(() => {
              this.eventCount = 0;
              this.drawScene('event counter reset');
              this.status = 'event counter reset';
            })
        }

        Text(this.vrenderStatus)
          .fontSize(14)
          .fontColor('#334155')

        Text(this.sceneTitle)
          .fontSize(18)
          .fontWeight(FontWeight.Bold)
          .fontColor('#111827')

        Text(this.sceneHint)
          .fontSize(12)
          .fontColor('#475569')

        Flex({ wrap: FlexWrap.Wrap }) {
          ForEach(this.scenes, (scene: HarmonySceneInfo) => {
            Button(scene.label)
              .height(30)
              .fontSize(12)
              .fontColor(this.sceneKey === scene.key ? '#ffffff' : '#111827')
              .backgroundColor(this.sceneKey === scene.key ? '#2563eb' : '#e5e7eb')
              .margin({ right: 6, bottom: 6 })
              .onClick(() => {
                this.switchVRenderScene(scene.key);
              })
          }, (scene: HarmonySceneInfo) => scene.key)
        }
        .width('100%')

        Text(this.vrenderEventStatus)
          .fontSize(13)
          .fontColor('#475569')

        Canvas(this.vrenderContext)
          .width(this.canvasWidth)
          .height(this.vrenderCanvasHeight)
          .backgroundColor('#ffffff')
          .onReady(() => {
            this.mountVRenderSmoke();
          })
          .onTouch((event: TouchEvent) => {
            this.handleVRenderTouch(event);
          })

        Row({ space: 10 }) {
          Button('主操作')
            .onClick(() => {
              this.runVRenderAction('primary');
            })

          Button('次操作')
            .onClick(() => {
              this.runVRenderAction('secondary');
            })
        }

        Row({ space: 10 }) {
          Button('重绘')
            .onClick(() => {
              if (!this.vrenderMounted) {
                this.mountVRenderSmoke();
                return;
              }
              this.renderVRenderScene();
              this.vrenderStatus = 'VRender scene redrawn';
            })

          Button('重建Stage')
            .onClick(() => {
              this.recreateVRenderStage();
            })

          Button('释放Stage')
            .onClick(() => {
              this.releaseVRenderStageOnly();
            })
        }
      }
      .width('100%')
      .padding(18)
    }
    .width('100%')
    .height('100%')
    .backgroundColor('#eef2f7')
  }
}
