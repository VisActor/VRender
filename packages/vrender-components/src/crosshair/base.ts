/**
 * @description Crosshair 基类
 */
import { IGroup } from '@visactor/vrender';
import { AbstractComponent } from '../core/base';
import { LocationCfg } from '../core/type';
import { BaseCrosshairAttrs } from './type';

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
