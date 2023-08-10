import type { IGroup } from '@visactor/vrender';
import { createGroup } from '@visactor/vrender';
import { isValid } from '@visactor/vutils';
import { AbstractComponent } from '../core/base';
import type { Tag } from '../tag';
import type { MarkerAttrs } from './type';

export abstract class Marker<T extends MarkerAttrs> extends AbstractComponent<Required<T>> {
  private _containerClip!: IGroup;
  private _container!: IGroup;

  protected _label!: Tag;

  protected abstract setLabelPos(): any;
  protected abstract initMarker(container: IGroup): any;
  protected abstract updateMarker(): any;

  private _initContainer() {
    const groupClip = createGroup({
      ...this.attribute?.clipRange,
      clip: isValid(this.attribute?.clipRange) ?? false
    });
    groupClip.name = 'marker-container';
    const group = createGroup({
      x: -(this.attribute?.clipRange?.x ?? 0),
      y: -(this.attribute?.clipRange?.y ?? 0)
    });
    groupClip.add(group);
    this._containerClip = groupClip;
    this.add(groupClip);
    this._container = group;
  }

  private _updateContainer() {
    this._containerClip.setAttributes({
      ...this.attribute?.clipRange,
      clip: isValid(this.attribute?.clipRange) ?? false
    });
    this._container.setAttributes({
      x: -(this.attribute?.clipRange?.x ?? 0),
      y: -(this.attribute?.clipRange?.y ?? 0)
    });
  }

  protected render() {
    const markerVisible = this.attribute.visible ?? true;
    const markerInteractive = this.attribute.interactive ?? false;

    if (!markerInteractive) {
      this.setAttribute('pickable', false);
      this.setAttribute('childrenPickable', false);
    }

    if (markerVisible) {
      if (!this._containerClip) {
        this._initContainer();
        this.initMarker(this._container);
      } else {
        this._updateContainer();
        this.updateMarker();
      }
    }
  }
}
