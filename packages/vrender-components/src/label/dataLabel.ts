import { isValidNumber, merge } from '@visactor/vutils';
import type { IGraphic, INode } from '@visactor/vrender-core';
import { AbstractComponent } from '../core/base';
import type { ComponentExitReleaseOptions, PointLocationCfg } from '../core/type';
import { bitmapTool } from './overlap';
import type { DataLabelAttrs } from './type';
import { LabelBase as PointLabel, type LabelBase } from './base';
import type { ComponentOptions } from '../interface';
import { getLabelComponent } from './data-label-register';

type DataLabelExitReleaseState = {
  pendingCount: number;
  finalized: boolean;
  removeFromParent: boolean;
  onComplete: (() => void)[];
};

export class DataLabel extends AbstractComponent<DataLabelAttrs> {
  name = 'data-label';

  private _componentMap: Map<string, LabelBase<any>>;
  private _exitReleaseState?: DataLabelExitReleaseState;

  private static defaultAttributes: Partial<DataLabelAttrs> = {
    pickable: false
  };

  constructor(attributes: DataLabelAttrs, options?: ComponentOptions) {
    const { dataLabels, ...restAttributes } = attributes;
    super(
      options?.skipDefault ? attributes : { dataLabels, ...merge({}, DataLabel.defaultAttributes, restAttributes) }
    );
  }

  protected render(): void {
    if (this._exitReleaseState) {
      return;
    }

    const { dataLabels, size } = this.attribute;
    if (!dataLabels || dataLabels.length === 0) {
      return;
    }
    const { width = 0, height = 0, padding } = size || {};

    if (!width || !height || !isValidNumber(height * width)) {
      return;
    }

    if (!this._componentMap) {
      this._componentMap = new Map();
    }
    const tool = bitmapTool(width, height, padding);
    const bitmap = tool.bitmap();

    const currentComponentMap = new Map();
    const prevComponentMap = this._componentMap;

    for (let i = 0; i < dataLabels.length; i++) {
      const dataLabel = dataLabels[i];
      const labelComponent = getLabelComponent(dataLabel.type) || PointLabel;
      if (labelComponent) {
        const { baseMarkGroupName, type } = dataLabel;
        const id = dataLabel.id ?? `${baseMarkGroupName}-${type}-${i}`;

        if (dataLabel.type === 'arc') {
          dataLabel.width = size.width;
          dataLabel.height = size.height;
        }

        let component = this._componentMap.get(id);
        if (component) {
          component.setBitmapTool(tool);
          component.setBitmap(bitmap);
          component.setAttributes(dataLabel);
          currentComponentMap.set(id, component);
        } else {
          component = new labelComponent(dataLabel as any);
          component.setBitmap(bitmap);
          component.setBitmapTool(tool);
          this.add(component as unknown as INode);
          currentComponentMap.set(id, component);
        }
      }
    }

    prevComponentMap.forEach((cp, key) => {
      if (!currentComponentMap.get(key)) {
        this.removeChild(cp as unknown as IGraphic);
      }
    });

    this._componentMap = currentComponentMap;
  }

  private _appendExitReleaseCallback(callback?: () => void) {
    if (callback) {
      this._exitReleaseState?.onComplete.push(callback);
    }
  }

  private _finalizeExitRelease() {
    const state = this._exitReleaseState;
    if (state?.finalized) {
      return;
    }

    if (state) {
      state.finalized = true;
    }

    const parent = this.parent;
    const removeFromParent = !!state?.removeFromParent;
    const callbacks = state?.onComplete ?? [];

    this._exitReleaseState = undefined;
    this._componentMap?.clear();
    this.removeAllChild(true);
    super.release(true);
    if (removeFromParent) {
      (parent ?? this.parent)?.removeChild(this);
    }

    callbacks.forEach(callback => {
      callback();
    });
  }

  releaseWithExitAnimation(options: ComponentExitReleaseOptions = {}): boolean {
    if (this.releaseStatus === 'released') {
      return false;
    }

    if (this._exitReleaseState && !this._exitReleaseState.finalized) {
      this._exitReleaseState.removeFromParent = this._exitReleaseState.removeFromParent || !!options.removeFromParent;
      this._appendExitReleaseCallback(options.onComplete);
      return true;
    }

    if (!this.stage || !this._componentMap?.size) {
      return false;
    }

    const state: DataLabelExitReleaseState = {
      pendingCount: 0,
      finalized: false,
      removeFromParent: !!options.removeFromParent,
      onComplete: options.onComplete ? [options.onComplete] : []
    };
    const exitingComponents: LabelBase<any>[] = [];
    const fallbackComponents: LabelBase<any>[] = [];
    let initializing = true;
    const finish = () => {
      if (state.finalized) {
        return;
      }

      state.pendingCount -= 1;
      if (state.pendingCount <= 0 && !initializing) {
        this._finalizeExitRelease();
      }
    };

    this._exitReleaseState = state;

    this._componentMap.forEach(component => {
      state.pendingCount += 1;
      const releasedWithExit = component.releaseWithExitAnimation({
        removeFromParent: false,
        onComplete: finish
      });

      if (releasedWithExit) {
        exitingComponents.push(component);
      } else {
        state.pendingCount -= 1;
        fallbackComponents.push(component);
      }
    });

    if (!exitingComponents.length) {
      this._exitReleaseState = undefined;
      return false;
    }

    fallbackComponents.forEach(component => {
      component.release(true);
      this.removeChild(component as any);
    });

    this.setAttribute('childrenPickable', false);
    this.releaseStatus = 'willRelease';
    initializing = false;
    if (state.pendingCount <= 0) {
      this._finalizeExitRelease();
    }

    return true;
  }

  release(all?: boolean): void {
    if (this._exitReleaseState) {
      this._finalizeExitRelease();
      return;
    }

    if (all) {
      this.removeAllChild(true);
    }
    super.release(all);
    this._componentMap?.clear();
  }

  setLocation(point: PointLocationCfg) {
    this.translateTo(point.x, point.y);
  }

  disableAnimation() {
    this._componentMap.forEach(component => {
      component.disableAnimation();
    });
  }

  enableAnimation() {
    this._componentMap.forEach(component => {
      component.enableAnimation();
    });
  }
}
