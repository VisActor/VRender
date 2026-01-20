import type { ComponentAnimator } from '../component';
import {
  AnimateStatus,
  type EasingType,
  type IAnimateStepType,
  type ICustomAnimate,
  type Stage
} from '@visactor/vrender-core';
import { Step } from '../step';

export abstract class ACustomAnimate<T> extends Step implements ICustomAnimate {
  type: IAnimateStepType = 'customAnimate';
  declare customFrom: T;
  declare params?: any;
  declare props?: T;
  declare from?: T;
  declare to?: T;

  // 为了兼容旧的api，from和to是可选的，且尽量不需要From，因为为了避免突变，From都应该从当前位置开始
  // 所以From并不会真正设置到fromProps中，而是作为customFrom参数
  constructor(customFrom: T, customTo: T, duration: number, easing: EasingType, params?: any) {
    super('customAnimate', customTo, duration, easing);
    this.customFrom = customFrom;
    this.params = params;
    this.from = customFrom;
    this.to = customTo;
  }

  update(end: boolean, ratio: number, out: Record<string, any>): void {
    // TODO 需要修复，只有在开始的时候才调用
    this.onStart();
    if (!this.props || !this.propKeys) {
      return;
    }
    // 应用缓动函数
    const easedRatio = this.easing(ratio);
    this.onUpdate(end, easedRatio, out);
    this.syncAttributeUpdate();
  }

  protected setProps(props: T) {
    this.props = props;
    this.propKeys = Object.keys(props);
    this.animate.reSyncProps();
  }
}

export abstract class AComponentAnimate<T> extends ACustomAnimate<T> {
  protected _animator: ComponentAnimator;

  completeBind(animator: ComponentAnimator): void {
    this.setStartTime(0);
    this._animator && this._animator.start();
    this.setDuration(animator.getDuration());
  }

  stop(): void {
    this._animator && this._animator.stop();
  }
}

export abstract class AStageAnimate<T> extends ACustomAnimate<T> {
  willCallBeforeStageRender: boolean = true;
  willCallAfterStageRender: boolean = true;
  checkStatusAfterRender: boolean = true;
  constructor(customFrom: T, customTo: T, duration: number, easing: EasingType, params?: any) {
    super(customFrom, customTo, duration, easing, params);
    this.props = {} as T;
  }

  // 用户重载
  protected beforeStageRender(stage: Stage, canvas: HTMLCanvasElement): HTMLCanvasElement | void | null | false {
    return false;
  }

  // 用户重载
  protected afterStageRender(stage: Stage, canvas: HTMLCanvasElement): HTMLCanvasElement | void | null | false {
    return false;
  }

  onFirstRun(): void {
    super.onFirstRun();
    this.target.stage.setBeforeRender(this._beforeStageRender);
    this.target.stage.setAfterRender(this._afterStageRender);
    // 禁用脏矩形，因为stage动画可能会批量修改整体画面
    this.target.stage.disableDirtyBounds();
  }

  stop() {
    super.stop();
    this.target.stage.removeBeforeRender(this._beforeStageRender);
    this.target.stage.removeAfterRender(this._afterStageRender);
  }
  onUpdate(end: boolean, ratio: number, out: Record<string, any>): void {
    super.onUpdate(end, ratio, out);
    this.willCallBeforeStageRender = true;
    this.willCallAfterStageRender = true;
  }

  protected _beforeStageRender = () => {
    if (!this.willCallBeforeStageRender) {
      return;
    }
    this.willCallBeforeStageRender = false;
    const stage = this.target.stage as any;
    const canvas = stage.window.getContext().canvas.nativeCanvas;
    const outputCanvas = this.beforeStageRender(stage, canvas);
    if (outputCanvas) {
      this.renderToStage(stage, outputCanvas);
    }
  };

  protected _afterStageRender = () => {
    if (!this.willCallAfterStageRender) {
      return;
    }
    this.willCallAfterStageRender = false;
    const stage = this.target.stage as any;
    const canvas = stage.window.getContext().canvas.nativeCanvas;
    const outputCanvas = this.afterStageRender(stage, canvas);
    if (outputCanvas) {
      this.renderToStage(stage, outputCanvas);
    }
    // 检查是否需要移除动画
    if (this.checkStatusAfterRender && this.animate.status === AnimateStatus.END) {
      this.animate.timeline.removeAnimate(this.animate);
    }
  };

  protected renderToStage(stage: Stage, canvas: HTMLCanvasElement): HTMLCanvasElement | void | null | false {
    const stageCanvas = stage.window.getContext().canvas.nativeCanvas;
    const ctx = stageCanvas.getContext('2d');
    if (!ctx) {
      return false;
    }
    ctx.clearRect(0, 0, stageCanvas.width, stageCanvas.height);
    ctx.drawImage(canvas, 0, 0);
    return stageCanvas;
  }
}
