/**
 * @description Crosshair 基类
 */
import type { IGroup } from '@visactor/vrender-core';
import { AbstractComponent } from '../core/base';
import type { LocationCfg } from '../core/type';
import type { BaseCrosshairAttrs } from './type';

export abstract class CrosshairBase<T extends BaseCrosshairAttrs> extends AbstractComponent<Required<T>> {
  name = 'crosshair';

  protected abstract renderCrosshair(container: IGroup): any;
  /**
   * 更新位置
   * @param location 位置信息
   */
  abstract setLocation(location: LocationCfg): void;

  protected render() {
    this.renderCrosshair(this as unknown as IGroup);
  }
}
