import { type EasingType, type IAnimate, type IStep } from '@visactor/vrender-core';
import { ACustomAnimate } from './custom-animate';
import { applyAnimationFrameAttributes } from './transient';
import { commitAnimationStaticAttrs } from './static-truth';

const clipPathGeometryAttrs: Record<string, true> = {
  x: true,
  y: true,
  x1: true,
  y1: true,
  width: true,
  height: true
};

function includesChannel(channels: string[], key: string): boolean {
  for (let i = 0; i < channels.length; i++) {
    if (channels[i] === key) {
      return true;
    }
  }
  return false;
}

function filterExcludedChannels(diffAttrs: Record<string, any>, excludeChannels?: string[]): Record<string, any> {
  if (!excludeChannels?.length) {
    return diffAttrs;
  }

  const nextAttrs: Record<string, any> = {};
  for (const key in diffAttrs) {
    if (Object.prototype.hasOwnProperty.call(diffAttrs, key) && !includesChannel(excludeChannels, key)) {
      nextAttrs[key] = diffAttrs[key];
    }
  }
  return nextAttrs;
}

export interface IUpdateAnimationOptions {
  diffAttrs: Record<string, any>;
  animationState: string;
  diffState: string;
  data: Record<string, any>[];
}

/**
 * 文本输入动画，实现类似打字机的字符逐个显示效果
 * 支持通过beforeText和afterText参数添加前缀和后缀
 * 支持通过showCursor参数显示光标，cursorChar自定义光标字符
 */
export class Update extends ACustomAnimate<Record<string, number>> {
  declare valid: boolean;
  // params: IUpdateAnimationOptions;
  private clipPathSyncKeys: string[] | null = null;
  private clipPathSyncParent: any = null;
  private clipPathSyncChildIndex: number = -1;
  private clipPathSyncDisabled: boolean = false;

  constructor(from: null, to: null, duration: number, easing: EasingType, params?: IUpdateAnimationOptions) {
    super(from, to, duration, easing, params);
    // this.params = params;
  }

  onBind() {
    super.onBind();
    let { diffAttrs = {} } = this.target.context ?? ({} as any);
    const { options } = this.params as any;

    diffAttrs = filterExcludedChannels(diffAttrs, options?.excludeChannels);

    this.props = diffAttrs;
    this.clipPathSyncKeys = Object.keys(diffAttrs).filter(key => clipPathGeometryAttrs[key]);
    this.clipPathSyncDisabled = !this.clipPathSyncKeys.length;
    this.syncParentClipPathToTarget();
  }

  onEnd(cb?: (animate: IAnimate, step: IStep) => void): void {
    if (cb) {
      super.onEnd(cb);
      return;
    }

    if (this.props) {
      commitAnimationStaticAttrs(this.target, this.propKeys ?? Object.keys(this.props), this.animate, this.props);
    }
    this.syncParentClipPathToTarget();
    super.onEnd();
  }

  update(end: boolean, ratio: number, out: Record<string, any>): void {
    this.onStart();
    if (!this.props || !this.propKeys) {
      return;
    }
    // 应用缓动函数
    const easedRatio = this.easing(ratio);
    this.runInterpolateUpdate(this.fromProps, this.props, easedRatio);
    this.syncParentClipPathToTarget();
    this.onUpdate(end, easedRatio, out);
  }

  private syncParentClipPathToTarget(): void {
    if (this.clipPathSyncDisabled) {
      return;
    }

    const target = this.target as any;
    const parent = target.parent as any;
    const path = parent?.attribute?.path;
    if (!parent?.attribute?.clip || !Array.isArray(path) || !path.length) {
      return;
    }

    const childIndex = this.getClipPathSyncChildIndex(parent);
    if (childIndex < 0 || childIndex >= path.length) {
      return;
    }

    const clipGraphic = path[childIndex] as any;
    if (!clipGraphic?.attribute || clipGraphic.type !== target.type || !this.isClipPathStaticTarget(clipGraphic)) {
      return;
    }

    const syncAttrs = this.buildClipPathTransientAttrs(clipGraphic);
    if (syncAttrs) {
      applyAnimationFrameAttributes(clipGraphic, syncAttrs);
      clipGraphic.addUpdatePositionTag?.();
      clipGraphic.addUpdateShapeAndBoundsTag?.();
    }
  }

  private getClipPathSyncChildIndex(parent: any): number {
    if (this.clipPathSyncParent === parent && this.clipPathSyncChildIndex >= 0) {
      return this.clipPathSyncChildIndex;
    }

    const target = this.target as any;
    let childIndex = -1;
    parent.forEachChildren?.((child: unknown, index: number) => {
      if (child === target) {
        childIndex = index;
        return true;
      }
      return false;
    });

    this.clipPathSyncParent = parent;
    this.clipPathSyncChildIndex = childIndex;
    return childIndex;
  }

  private isClipPathStaticTarget(clipGraphic: any): boolean {
    const target = this.target as any;
    const targetFinalAttrs = this.getTargetFinalAttrs();
    const clipGraphicFinalAttrs =
      typeof clipGraphic.getFinalAttribute === 'function'
        ? clipGraphic.getFinalAttribute()
        : clipGraphic.finalAttribute;
    const clipFinalAttrs = clipGraphicFinalAttrs ?? clipGraphic.baseAttributes ?? clipGraphic.attribute;
    const keys = this.clipPathSyncKeys ?? [];
    if (!keys.length || !targetFinalAttrs || !clipFinalAttrs) {
      return false;
    }

    return keys.every(key =>
      this.isSameClipPathValue(clipFinalAttrs[key], targetFinalAttrs[key] ?? target.attribute?.[key])
    );
  }

  private getTargetFinalAttrs(): Record<string, any> | null {
    const target = this.target as any;
    return (
      target.context?.finalAttrs ??
      (typeof target.getFinalAttribute === 'function' ? target.getFinalAttribute() : target.finalAttribute) ??
      null
    );
  }

  private isSameClipPathValue(a: any, b: any): boolean {
    if (typeof a === 'number' && typeof b === 'number') {
      return Math.abs(a - b) < 1e-8;
    }
    return a === b;
  }

  private buildClipPathTransientAttrs(clipGraphic: any): Record<string, any> | null {
    const target = this.target as any;
    const attrs: Record<string, any> = {};
    (this.clipPathSyncKeys ?? []).forEach(key => {
      const nextValue = target.attribute?.[key];
      if (
        Object.prototype.hasOwnProperty.call(clipGraphic.attribute, key) &&
        nextValue !== undefined &&
        !this.isSameClipPathValue(clipGraphic.attribute[key], nextValue)
      ) {
        attrs[key] = nextValue;
      }
    });
    return Object.keys(attrs).length ? attrs : null;
  }
}
