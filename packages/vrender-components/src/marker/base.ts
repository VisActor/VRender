import type { IGroup } from '@visactor/vrender';
import { createGroup } from '@visactor/vrender';
import { isValid } from '@visactor/vutils';
import { AbstractComponent } from '../core/base';
import type { Tag } from '../tag';
import type { MarkerAttrs } from './type';

export abstract class Marker<T extends MarkerAttrs> extends AbstractComponent<Required<T>> {
  name = 'marker';
  private _containerClip!: IGroup;
  private _container!: IGroup;

  protected _label!: Tag;

  protected abstract setLabelPos(): any;
  protected abstract initMarker(container: IGroup): any;
  protected abstract updateMarker(): any;

  private _initContainer() {
    const { limitRect, clipInRange } = this.attribute;

    const group = createGroup({
      x: -(limitRect?.x ?? 0),
      y: -(limitRect?.y ?? 0)
    });
    group.name = 'marker-container';
    if (clipInRange) {
      // 如果用户配置了剪切
      const groupClip = createGroup({
        ...limitRect,
        clip: true,
        pickable: false
      });
      groupClip.add(group);
      this._containerClip = groupClip;
      this.add(groupClip);
    } else {
      this.add(group);
    }
    this._container = group;
  }

  private _updateContainer() {
    const { limitRect } = this.attribute;
    this._containerClip?.setAttributes({
      ...limitRect
    });
    this._container.setAttributes({
      x: -(limitRect?.x ?? 0),
      y: -(limitRect?.y ?? 0)
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
      if (!this._container) {
        this._initContainer();
        this.initMarker(this._container);
      } else {
        this._updateContainer();
        this.updateMarker();
      }
    }
  }
}
