import type { IAnimate } from '../intreface/animate';
import type { IGraphic } from '@visactor/vrender-core';
import { AnimateExecutor } from '../executor/animate-executor';
import type { IAnimationConfig, IAnimationTypeConfig, IAnimationTimeline } from '../executor/executor';

/**
 * Animation task that contains information about a scheduled animation
 */
interface IAnimationTask {
  graphic: IGraphic;
  config: IAnimationConfig;
  animate?: IAnimate;
}

/**
 * ComponentAnimator provides a way to orchestrate animations across child elements
 * with centralized lifecycle management
 */
export class ComponentAnimator {
  private component: IGraphic;
  private tasks: IAnimationTask[] = [];
  private started: boolean = false;
  private completed: number = 0;
  private totalDuration: number = 0;
  private onStartCallbacks: (() => void)[] = [];
  private onEndCallbacks: (() => void)[] = [];
  private onUpdateCallbacks: ((progress: number) => void)[] = [];

  /**
   * Creates a new ComponentAnimator
   * @param component The component or group containing elements to animate
   */
  constructor(component: IGraphic) {
    this.component = component;
  }

  /**
   * Add animation for a specific graphic element
   * @param graphic The graphic element to animate
   * @param config Animation configuration
   * @param delay Optional delay before starting this animation (in ms)
   * @returns This ComponentAnimator for chaining
   */
  animate(graphic: IGraphic, config: IAnimationConfig): ComponentAnimator {
    if (this.started) {
      console.warn('Cannot add animations after animation has started');
      return this;
    }

    this.tasks.push({
      graphic,
      config
    });

    return this;
  }

  /**
   * Add a callback to be called when animation starts
   * @param callback Function to call when animation starts
   * @returns This ComponentAnimator for chaining
   */
  onStart(callback: () => void): ComponentAnimator {
    this.onStartCallbacks.push(callback);
    return this;
  }

  /**
   * Add a callback to be called when animation ends
   * @param callback Function to call when animation ends
   * @returns This ComponentAnimator for chaining
   */
  onEnd(callback: () => void): ComponentAnimator {
    this.onEndCallbacks.push(callback);
    return this;
  }

  /**
   * Add a callback to be called when animation updates
   * @param callback Function to call when animation updates (receives progress from 0 to 1)
   * @returns This ComponentAnimator for chaining
   */
  onUpdate(callback: (progress: number) => void): ComponentAnimator {
    this.onUpdateCallbacks.push(callback);
    return this;
  }

  /**
   * Start all animations in this component animation
   * @returns This ComponentAnimator
   */
  start(): ComponentAnimator {
    if (this.started) {
      console.warn('Animation has already started');
      return this;
    }

    this.started = true;
    this.completed = 0;

    // Call onStart callbacks
    this.onStartCallbacks.forEach(callback => callback());

    // Empty animation case
    if (this.tasks.length === 0) {
      setTimeout(() => {
        this.onEndCallbacks.forEach(callback => callback());
      }, 0);
      return this;
    }

    // Start all animations with their specified delays
    this.tasks.forEach(task => {
      const executor = new AnimateExecutor(task.graphic);

      // Set up callbacks to track completion
      executor.onEnd(() => {
        this.completed++;
        if (this.completed === this.tasks.length) {
          this.onEndCallbacks.forEach(callback => callback());
        }
      });

      const animate = executor.executeItem(task.config, task.graphic);
      task.animate = animate;
      this.totalDuration = Math.max(this.totalDuration, animate.getStartTime() + animate.getDuration());
    });

    return this;
  }

  deleteSelfAttr(key: string): void {
    this.tasks.forEach(task => {
      if (task.animate) {
        task.animate.preventAttr(key);
      }
    });
  }

  /**
   * Stop all animations in this component animation
   * @param type Whether to jump to the end state or start state
   * @returns This ComponentAnimator
   */
  stop(type?: 'start' | 'end'): ComponentAnimator {
    this.tasks.forEach(task => {
      if (task.animate) {
        task.animate.stop(type);
      }
    });

    // If not already completed, call end callbacks
    if (this.started && this.completed !== this.tasks.length) {
      this.onEndCallbacks.forEach(callback => callback());
      this.completed = this.tasks.length;
    }

    return this;
  }

  /**
   * Get total duration of all animations including delays
   * @returns Total duration in milliseconds
   */
  getDuration(): number {
    return this.totalDuration;
  }
}

/**
 * Factory function to create a ComponentAnimator for a component
 * @param component The component or group to animate
 * @returns A new ComponentAnimator instance
 */
export function createComponentAnimator(component: IGraphic): ComponentAnimator {
  return new ComponentAnimator(component);
}
