import { createGroup, IGroup } from '@visactor/vrender';
import { AbstractComponent } from '../core/base';
import { Tag } from '../tag';
import { MarkerAttrs } from './type';

export abstract class Marker<T extends MarkerAttrs> extends AbstractComponent<Required<T>> {
  private _container!: IGroup;

  protected _label!: Tag;

  protected abstract setLabelPos(): any;
  protected abstract renderMarker(container: IGroup): any;

  protected render() {
    this.removeAllChild();
    const markerVisible = this.attribute.visible ?? true;

    const group = createGroup({
      pickable: false
    });
    group.name = 'marker-container';
    this.add(group);
    markerVisible && this.renderMarker(group);
  }
}
