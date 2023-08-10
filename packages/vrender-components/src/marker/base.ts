import type { IGroup } from '@visactor/vrender';
import { createGroup } from '@visactor/vrender';
import { isValid } from '@visactor/vutils';
import { AbstractComponent } from '../core/base';
import type { Tag } from '../tag';
import type { MarkerAttrs } from './type';

export abstract class Marker<T extends MarkerAttrs> extends AbstractComponent<Required<T>> {
  private _container!: IGroup;

  protected _label!: Tag;

  protected abstract setLabelPos(): any;
  protected abstract initMarker(container: IGroup): any;
  protected abstract updateMarker(): any;

  protected render() {
    const markerVisible = this.attribute.visible ?? true;
    const markerInteractive = this.attribute.interactive ?? false;

    if (!markerInteractive) {
      this.setAttribute('pickable', false);
      this.setAttribute('childrenPickable', false);
    }

    if (markerVisible) {
      if (!this._container) {
        const group = createGroup({
          ...this.attribute?.clipRange,
          clip: isValid(this.attribute?.clipRange) ?? false
        });
        group.name = 'marker-container';
        this.add(group);
        this._container = group;
        this.initMarker(group);
      } else {
        this._container.setAttributes({
          ...this.attribute?.clipRange,
          clip: isValid(this.attribute?.clipRange) ?? false
        });
        this.updateMarker();
      }
    }
  }
}
