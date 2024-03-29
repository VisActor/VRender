import type { FederatedPointerEvent, IGraphic, IGroup } from '@visactor/vrender-core';
// eslint-disable-next-line no-duplicate-imports
import { graphicCreator } from '@visactor/vrender-core';
import { AbstractComponent } from '../core/base';
import type { Tag } from '../tag';
import type { MarkerAttrs } from './type';
import { StateValue } from '../constant';
import { traverseGroup } from '../util';
import { isEmpty } from '@visactor/vutils';

export abstract class Marker<T extends MarkerAttrs> extends AbstractComponent<Required<T>> {
  name = 'marker';
  private _containerClip!: IGroup;
  private _container!: IGroup;

  protected _label!: Tag;
  private _lastHover: IGraphic;
  private _lastSelect: IGraphic;

  protected abstract setLabelPos(): any;
  protected abstract initMarker(container: IGroup): any;
  protected abstract updateMarker(): any;
  protected abstract isValidPoints(): any;

  setAttribute(key: string, value: any, forceUpdateTag?: boolean | undefined): void {
    super.setAttribute(key, value, forceUpdateTag);
    if (key === 'visible') {
      this.render();
    }
  }

  private _bindEvent() {
    if (!this.attribute.interactive) {
      return;
    }
    const { hover, select } = this.attribute;

    if (hover) {
      this._container?.addEventListener('pointermove', this._onHover as EventListenerOrEventListenerObject);
      this._container?.addEventListener('pointerout', this._onUnHover as EventListenerOrEventListenerObject);
    }

    if (select) {
      this._container?.addEventListener('pointerdown', this._onClick as EventListenerOrEventListenerObject);
    }
  }

  private _onHover = (e: FederatedPointerEvent) => {
    const target = e.target as unknown as IGraphic;
    if (target !== this._lastHover && target.name && !isEmpty(target.states)) {
      target.addState(StateValue.hover, true);
      traverseGroup(this._container, (node: IGraphic) => {
        if (node !== target && node.name && !isEmpty(node.states)) {
          node.addState(StateValue.hoverReverse, true);
        }
      });
      this._lastHover = target;
    }
  };

  private _onUnHover = (e: FederatedPointerEvent) => {
    if (this._lastHover) {
      traverseGroup(this._container, (node: IGraphic) => {
        if (node.name && !isEmpty(node.states)) {
          node.removeState(StateValue.hoverReverse);
          node.removeState(StateValue.hover);
        }
      });
      this._lastHover = null;
    }
  };

  private _onClick = (e: FederatedPointerEvent) => {
    const target = e.target as unknown as IGraphic;
    if (this._lastSelect === target && target.hasState(StateValue.selected)) {
      // 取消选中
      this._lastSelect = null;
      traverseGroup(this._container, (node: IGraphic) => {
        if (node.name && !isEmpty(node.states)) {
          node.removeState(StateValue.selectedReverse);
          node.removeState(StateValue.selected);
        }
      });
      return;
    }

    if (target.name && !isEmpty(target.states)) {
      target.addState(StateValue.selected, true);
      traverseGroup(this._container, (node: IGraphic) => {
        if (node !== target && node.name && !isEmpty(node.states)) {
          node.addState(StateValue.selectedReverse, true);
        }
      });
      this._lastSelect = target;
    }
  };

  private _initContainer() {
    const { limitRect = {} as T['limitRect'], clipInRange } = this.attribute;
    let group;
    if (clipInRange) {
      // 如果用户配置了剪切
      const groupClip = graphicCreator.group({
        ...limitRect,
        clip: true,
        pickable: false
      });
      group = graphicCreator.group({
        x: -(limitRect.x ?? 0),
        y: -(limitRect.y ?? 0),
        pickable: false
      });
      groupClip.add(group);
      this._containerClip = groupClip;
      this.add(groupClip);
    } else {
      group = graphicCreator.group({
        x: 0,
        y: 0,
        pickable: false
      });
      this.add(group);
    }
    group.name = 'marker-container';
    this._container = group;
  }

  private _updateContainer() {
    const { limitRect = {} as T['limitRect'], clipInRange } = this.attribute;
    if (this._containerClip) {
      this._containerClip.setAttributes({
        ...limitRect
      });
    }

    this._container.setAttributes({
      x: clipInRange ? -(limitRect.x ?? 0) : 0,
      y: clipInRange ? -(limitRect.y ?? 0) : 0
    });
  }

  protected render() {
    // 因为标注本身不规则，所以默认将组件的 group 设置为不可拾取
    this.setAttribute('pickable', false);

    const markerVisible = this.attribute.visible ?? true;
    if (this.attribute.interactive === false) {
      this.setAttribute('childrenPickable', false);
    }

    if (markerVisible && this.isValidPoints()) {
      if (!this._container) {
        this._initContainer();
        this.initMarker(this._container);
      } else {
        this._updateContainer();
        this.updateMarker();
      }
    } else {
      this._container = null;
      this.removeAllChild(true);
    }

    this._bindEvent();
  }

  release(): void {
    super.release();
    this._container?.removeEventListener('pointermove', this._onHover as EventListenerOrEventListenerObject);
    this._container?.removeEventListener('pointerout', this._onUnHover as EventListenerOrEventListenerObject);
    this._container?.removeEventListener('pointerdown', this._onClick as EventListenerOrEventListenerObject);
    this._container = null;
  }
}
