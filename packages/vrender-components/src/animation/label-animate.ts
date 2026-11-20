import type { IGraphic, ILineGraphicAttribute, ITicker, Line } from '@visactor/vrender-core';
import { AttributeUpdateType } from '@visactor/vrender-core/event/constant';
import type { IPointLike } from '@visactor/vutils';
import { createComponentAnimator } from '@visactor/vrender-animate/component';
import { AComponentAnimate, ACustomAnimate } from '@visactor/vrender-animate/custom/custom-animate';
import { IncreaseCount } from '@visactor/vrender-animate/custom/number';
import { AnimateExecutor } from '@visactor/vrender-animate/executor/animate-executor';

const animationFrame = { type: AttributeUpdateType.ANIMATE_UPDATE };
const animationEnd = { type: AttributeUpdateType.ANIMATE_END };

// Batch restored lines per ticker so listener removal stays constant-time as label counts grow.
const restoredLineFrames = new WeakMap<ITicker, { lines: Set<RestoreLabelLine>; flush: () => void }>();

class RestoreLabelLine extends ACustomAnimate<ILineGraphicAttribute> {
  declare params: { getPoints: () => IPointLike[] | undefined; relatedGraphic?: IGraphic };
  private pendingTicker?: ITicker;
  private pendingEnd = false;

  private updateAfterTick(): void {
    this.pendingTicker = undefined;
    const end = this.pendingEnd;
    this.pendingEnd = false;
    if (end) {
      this.finishLine();
    } else if (this.animate.validAttr('points') || this.animate.validAttr('visible')) {
      this.updateLine(this.params.getPoints());
    }
  }

  onBind(): void {
    this.updateLine(this.params.getPoints());
  }

  onUpdate(end: boolean): void {
    if (!this.animate.validAttr('points') && !this.animate.validAttr('visible')) {
      return;
    }
    this.clearPendingTick();
    this.pendingEnd = end;
    if (this.target.stage?.ticker) {
      // Marks may be animated after labels; both must finish this frame before reading their bounds.
      this.pendingTicker = this.target.stage.ticker;
      const ticker = this.pendingTicker;
      let frame = restoredLineFrames.get(ticker);
      if (!frame) {
        const lines = new Set<RestoreLabelLine>();
        const flush = () => {
          ticker.removeListener('tick', flush);
          for (const line of lines) {
            lines.delete(line);
            line.updateAfterTick();
          }
        };
        frame = { lines, flush };
        restoredLineFrames.set(ticker, frame);
      }
      if (!frame.lines.size) {
        ticker.on('tick', frame.flush);
      }
      frame.lines.add(this);
    } else {
      this.updateAfterTick();
    }
  }

  private updateLine(points?: IPointLike[]): void {
    const attrs: Partial<ILineGraphicAttribute> = {};
    if (this.animate.validAttr('points')) {
      attrs.points = points ?? this.to.points;
    }
    if (this.animate.validAttr('visible')) {
      attrs.visible = !!points && this.to.visible;
    }
    (this.target as Line).applyAnimationTransientAttributes(attrs, false, animationFrame);
  }

  private finishLine(): void {
    const line = this.target as Line;
    if (this.animate.validAttr('visible')) {
      // A jump straight to completion skips start props, so a later animation may not invalidate us.
      let afterCurrent = false;
      for (const animate of (line as any).getTrackedAnimates().values()) {
        if (animate === this.animate) {
          afterCurrent = true;
        } else if (afterCurrent && animate.validAttr('visible') && 'visible' in animate.getEndProps()) {
          return;
        }
      }
      // Completion must survive static restoration, including marks updated later in the same tick.
      const attrs = { visible: this.to.visible !== false && this.params.relatedGraphic?.attribute.visible !== false };
      (line as any).setFinalAttributes(attrs);
      (line as any)._commitAnimationStaticAttributes(attrs, animationEnd);
    }
  }

  private clearPendingTick(): void {
    if (this.pendingTicker) {
      const frame = restoredLineFrames.get(this.pendingTicker);
      frame.lines.delete(this);
      if (!frame.lines.size) {
        this.pendingTicker.removeListener('tick', frame.flush);
      }
    }
    this.pendingTicker = undefined;
    this.pendingEnd = false;
  }

  stop(): void {
    this.clearPendingTick();
  }

  release(): void {
    this.clearPendingTick();
  }
}

/**
 * LabelUpdate class handles the update animation for Label components
 */
export class LabelUpdate extends AComponentAnimate<any> {
  onBind(): void {
    const animator = createComponentAnimator(this.target);
    this._animator = animator;
    const duration = this.duration;
    const easing = this.easing;

    const {
      prevText,
      curText,
      prevLabelLine,
      curLabelLine,
      getRestoredLinePoints,
      relatedGraphic,
      increaseEffect = true
    } = this.params;
    const diff: Record<string, any> = {};

    for (const key in curText.attribute) {
      if (prevText.attribute[key] !== curText.attribute[key]) {
        diff[key] = curText.attribute[key];
      }
    }

    const rest = { ...diff };
    delete rest.text;

    animator.animate(prevText, {
      type: 'to',
      to: rest,
      duration,
      easing
    });

    if (increaseEffect !== false) {
      animator.animate(prevText, {
        type: 'increaseCount',
        to: {
          text: curText.attribute.text
        },
        duration,
        easing
      });
    }

    if (getRestoredLinePoints) {
      // Run after the text animations so the line reads the bounds of the current frame.
      animator.animate(prevLabelLine ?? curLabelLine, {
        custom: RestoreLabelLine,
        customParameters: { getPoints: getRestoredLinePoints, relatedGraphic },
        to: { points: curLabelLine.attribute.points, visible: curLabelLine.attribute.visible ?? true },
        duration,
        easing
      });
    } else if (prevLabelLine && curLabelLine) {
      animator.animate(prevLabelLine, {
        type: 'to',
        to: curLabelLine.attribute,
        duration,
        easing
      });
    }

    this.completeBind(animator);
  }

  // 标签动画本身没有逻辑，具体通过animator中执行，所以本身不需要屏蔽冲突
  protected tryPreventConflict(): void {
    return;
  }
}

export class LabelEnter extends AComponentAnimate<any> {
  onBind(): void {
    const animator = createComponentAnimator(this.target);
    this._animator = animator;
    const duration = this.duration;
    const easing = this.easing;

    const { relatedGraphic, relatedGraphics, config } = this.params;
    const { mode, type = 'fadeIn' } = config;

    const target = this.target;

    let startTime = 0;

    if (mode === 'after') {
      relatedGraphic.animates &&
        relatedGraphic.animates.forEach((animate: any) => {
          startTime = Math.max(startTime, animate.getStartTime() + animate.getTotalDuration());
        });
    } else if (mode === 'after-all') {
      relatedGraphics &&
        relatedGraphics.forEach((graphic: any) => {
          graphic.animates &&
            graphic.animates.forEach((animate: any) => {
              startTime = Math.max(startTime, animate.getStartTime() + animate.getTotalDuration());
            });
        });
    } else {
      // 'same-time'
      relatedGraphic.animates &&
        relatedGraphic.animates.forEach((animate: any) => {
          startTime = Math.max(startTime, animate.getStartTime());
        });
    }

    animator.animate(target, {
      ...config,
      duration,
      easing,
      startTime,
      type
    });

    this.completeBind(animator);
  }

  // 标签动画本身没有逻辑，具体通过animator中执行，所以本身不需要屏蔽冲突
  protected tryPreventConflict(): void {
    return;
  }
}

export function registerLabelAnimate() {
  AnimateExecutor.registerBuiltInAnimate('increaseCount', IncreaseCount);
  // Label update animation
  AnimateExecutor.registerBuiltInAnimate('labelUpdate', LabelUpdate);
  AnimateExecutor.registerBuiltInAnimate('labelEnter', LabelEnter);
}
