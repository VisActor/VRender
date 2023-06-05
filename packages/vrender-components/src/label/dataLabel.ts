import { isValidNumber, merge } from '@visactor/vutils';
import { IGraphic, INode } from '@visactor/vrender';
import { AbstractComponent } from '../core/base';
import type { PointLocationCfg } from '../core/type';
import { bitmapTool } from './overlap';
import { RectLabel } from './rect';
import { SymbolLabel } from './symbol';
import type { DataLabelAttrs } from './type';
import { LabelBase } from './base';

const labelComponentMap = {
  rect: RectLabel,
  symbol: SymbolLabel
};

export class DataLabel extends AbstractComponent<DataLabelAttrs> {
  name = 'data-label';

  private _componentMap: Map<string, LabelBase<any>>;

  private static defaultAttributes: Partial<DataLabelAttrs> = {
    pickable: false
  };

  constructor(attributes: DataLabelAttrs) {
    super(merge({}, DataLabel.defaultAttributes, attributes));
  }

  protected render(): void {
    const { dataLabels, size } = this.attribute;
    if (!dataLabels || dataLabels.length === 0) {
      return;
    }
    const { width = 0, height = 0 } = size || {};

    if (!width || !height || !isValidNumber(height * width)) {
      return;
    }

    if (!this._componentMap) {
      this._componentMap = new Map();
    }
    const tool = bitmapTool(width, height);
    const bitmap = tool.bitmap();

    const currentComponentMap = new Map();
    const prevComponentMap = this._componentMap;

    for (let i = 0; i < dataLabels.length; i++) {
      const dataLabel = dataLabels[i];
      if (labelComponentMap[dataLabel.type]) {
        const { baseMarkGroupName } = dataLabel;
        let component = this._componentMap.get(baseMarkGroupName);
        if (component) {
          component.setBitmapTool(tool);
          component.setBitmap(bitmap);
          component.setAttributes(dataLabel);
          currentComponentMap.set(baseMarkGroupName, component);
        } else {
          component = new labelComponentMap[dataLabel.type](dataLabel as any);
          component.setBitmap(bitmap);
          component.setBitmapTool(tool);
          this.add(component as unknown as INode);
          currentComponentMap.set(baseMarkGroupName, component);
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
