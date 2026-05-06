import { AttributeUpdateType, type EasingType, type IAnimate, type IStep } from '@visactor/vrender-core';
import { ACustomAnimate } from './custom-animate';
import { applyAnimationTransientAttributes } from './transient';

const clipPathGeometryAttrs: Record<string, true> = {
  x: true,
  y: true,
  x1: true,
  y1: true,
  width: true,
  height: true
};

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

    diffAttrs = { ...diffAttrs };
    if (options?.excludeChannels?.length) {
      options.excludeChannels.forEach((channel: string) => {
        delete diffAttrs[channel];
      });
    }

    this.props = diffAttrs;
    this.clipPathSyncKeys = Object.keys(diffAttrs).filter(key => clipPathGeometryAttrs[key]);
    this.clipPathSyncDisabled = !this.clipPathSyncKeys.length;
    this.syncParentClipPathToTarget();
  }

  private getStaticCommitAttrs(): Record<string, any> | null {
    if (!this.props) {
      return null;
    }

    const target = this.target as any;
    const contextFinalAttrs = target.context?.finalAttrs as Record<string, any> | undefined;
    const finalAttribute = (
      typeof target.getFinalAttribute === 'function' ? target.getFinalAttribute() : target.finalAttribute
    ) as Record<string, any> | undefined;
    const commitAttrs: Record<string, any> = {};

    Object.keys(this.props).forEach(key => {
      if (contextFinalAttrs && Object.prototype.hasOwnProperty.call(contextFinalAttrs, key)) {
        commitAttrs[key] = contextFinalAttrs[key];
        return;
      }

      if (finalAttribute && Object.prototype.hasOwnProperty.call(finalAttribute, key)) {
        commitAttrs[key] = finalAttribute[key];
        return;
      }

      if (this.animate.validAttr(key)) {
        commitAttrs[key] = (this.props as Record<string, any>)[key];
      }
    });

    return Object.keys(commitAttrs).length ? commitAttrs : null;
  }

  onEnd(cb?: (animate: IAnimate, step: IStep) => void): void {
    if (cb) {
      super.onEnd(cb);
      return;
    }

    const commitAttrs = this.getStaticCommitAttrs();
    if (commitAttrs) {
      this.target.setAttributes(commitAttrs, false, { type: AttributeUpdateType.ANIMATE_END });
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
    this.animate.interpolateUpdateFunction
      ? this.animate.interpolateUpdateFunction(this.fromProps, this.props, easedRatio, this, this.target)
      : this.interpolateUpdateFunctions.forEach((func, index) => {
          // 如果这个属性被屏蔽了，直接跳过
          if (!this.animate.validAttr(this.propKeys[index])) {
            return;
          }
          const key = this.propKeys[index];
          const fromValue = this.fromProps[key];
          const toValue = this.props[key];
          func(key, fromValue, toValue, easedRatio, this, this.target);
        });
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
      applyAnimationTransientAttributes(clipGraphic, syncAttrs, AttributeUpdateType.ANIMATE_UPDATE);
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
