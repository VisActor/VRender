import { isValidNumber, merge } from '@visactor/vutils';
import type { IGraphic, INode } from '@visactor/vrender-core';
import { AbstractComponent } from '../core/base';
import type { PointLocationCfg } from '../core/type';
import { bitmapTool } from './overlap';
import type { DataLabelAttrs } from './type';
import type { LabelBase } from './base';
import { LabelBase as PointLabel } from './base';
import type { ComponentOptions } from '../interface';
import { getLabelComponent } from './data-label-register';

export class DataLabel extends AbstractComponent<DataLabelAttrs> {
  name = 'data-label';

  private _componentMap: Map<string, LabelBase<any>>;

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
