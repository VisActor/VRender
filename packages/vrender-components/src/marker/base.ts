import type { FederatedPointerEvent, IGraphic, IGroup, IImage, IRichText, ISymbol } from '@visactor/vrender-core';
// eslint-disable-next-line no-duplicate-imports
import { graphicCreator } from '@visactor/vrender-core';
import { AbstractComponent } from '../core/base';
import type { Tag } from '../tag';
import type { MarkerAnimationState, MarkerAttrs, MarkerExitAnimation, MarkerUpdateAnimation } from './type';
import { dispatchClickState, dispatchHoverState, dispatchUnHoverState } from '../util/interaction';
import { isObject, merge } from '@visactor/vutils';

export abstract class Marker<T extends MarkerAttrs<AnimationAttr>, AnimationAttr> extends AbstractComponent<
  Required<T>
> {
  name = 'marker';

  private _containerClip!: IGroup;
  protected _container!: IGroup;

  protected _label!: Tag;

  /** animate */
  static _animate?: (
    marker: any,
    label: Tag | IRichText | ISymbol | IImage,
    animationConfig: any,
    state: MarkerAnimationState
  ) => void;

  defaultUpdateAnimation!: MarkerUpdateAnimation<AnimationAttr>;
  defaultExitAnimation!: MarkerExitAnimation;

  protected _animationConfig?: {
    enter: MarkerUpdateAnimation<AnimationAttr>;
    exit: MarkerExitAnimation;
    update: MarkerUpdateAnimation<AnimationAttr>;
  };

  private _lastHover: IGraphic;
  private _lastSelect: IGraphic;

  protected abstract setLabelPos(): any;
  protected abstract initMarker(container: IGroup): any;
  protected abstract updateMarker(): any;
  protected abstract isValidPoints(): any;
  protected abstract markerAnimate(state: MarkerAnimationState): void;

  private transAnimationConfig(): void {
    if (this.attribute.animation !== false) {
      const animation = isObject(this.attribute.animation) ? this.attribute.animation : {};
      this._animationConfig = {
        enter: merge(
          {},
          this.defaultUpdateAnimation,
          animation,
          this.attribute.animationEnter ?? {}
        ) as MarkerUpdateAnimation<AnimationAttr>,
        exit: merge({}, this.defaultExitAnimation, animation, this.attribute.animationExit ?? {}),
        update: merge(
          {},
          this.defaultUpdateAnimation,
          animation,
          this.attribute.animationUpdate ?? {}
        ) as MarkerUpdateAnimation<AnimationAttr>
      };
    }
  }
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

  private _releaseEvent() {
    this._container?.removeEventListener('pointermove', this._onHover as EventListenerOrEventListenerObject);
    this._container?.removeEventListener('pointerout', this._onUnHover as EventListenerOrEventListenerObject);
    this._container?.removeEventListener('pointerdown', this._onClick as EventListenerOrEventListenerObject);
  }

  private _onHover = (e: FederatedPointerEvent) => {
    this._lastHover = dispatchHoverState(e, this._container, this._lastHover);
  };

  private _onUnHover = (e: FederatedPointerEvent) => {
    this._lastHover = dispatchUnHoverState(e, this._container, this._lastHover);
  };

  private _onClick = (e: FederatedPointerEvent) => {
    this._lastSelect = dispatchClickState(e, this._container, this._lastSelect);
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
    this.transAnimationConfig();

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
        this.markerAnimate('enter');
      } else {
        this._updateContainer();
        this.updateMarker();
        this.markerAnimate('update');
      }
    } else {
      this.markerAnimate('exit');
      this._container = null;
      this.removeAllChild(true);
    }

    // 先把之前的event都release掉，否则会重复触发
    this._releaseEvent();
    this._bindEvent();
  }

  release(): void {
    this.markerAnimate('exit');
    super.release();
    this._releaseEvent();
    this._container = null;
  }
}
