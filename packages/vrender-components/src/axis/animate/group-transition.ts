import type { EasingType, IGraphic, IGroup } from '@visactor/vrender-core';
import { ACustomAnimate, AnimateMode } from '@visactor/vrender-core';
import type { Dict } from '@visactor/vutils';
import { cloneDeep, interpolateString, isEqual, isValidNumber } from '@visactor/vutils';
import { traverseGroup } from '../../util';

export class GroupTransition extends ACustomAnimate<any> {
  declare target: IGroup;

  private _newElementAttrMap: Dict<any>;
  mode = AnimateMode.NORMAL; // 组件的群组动画不需要设置走 AnimateMode.SET_ATTR_IMMEDIATELY

  onBind(): void {
    // @ts-ignore
    const currentInnerView = this.target.getInnerView();
    // @ts-ignore
    const prevInnerView = this.target.getPrevInnerView();
    if (!prevInnerView) {
      return;
    }

    this._newElementAttrMap = {};

    // 遍历新的场景树，将新节点属性更新为旧节点
    // TODO: 目前只处理更新场景
    traverseGroup(currentInnerView, (el: IGraphic) => {
      if ((el as IGraphic).type !== 'group' && el.id) {
        const oldEl = prevInnerView[el.id];
        if (oldEl) {
          if (!isEqual((el as IGraphic).attribute, (oldEl as IGraphic).attribute)) {
            // 更新
            const newProps = cloneDeep((el as IGraphic).attribute);
            this._newElementAttrMap[el.id] = {
              state: 'update',
              node: el,
              attrs: {
                ...newProps,
                opacity: newProps.opacity ?? 1,
                fillOpacity: newProps.fillOpacity ?? 1,
                strokeOpacity: newProps.strokeOpacity ?? 1
              }
            };

            (el as IGraphic).setAttributes((oldEl as IGraphic).attribute);
          }
        } else {
          // 新入场元素，进行 fadeIn 动画
          const finalOpacityAttrs = {
            opacity: el.attribute.opacity ?? 1,
            fillOpacity: el.attribute.fillOpacity ?? 1,
            strokeOpacity: el.attribute.strokeOpacity ?? 1
          };
          this._newElementAttrMap[el.id] = {
            state: 'enter',
            node: el,
            attrs: finalOpacityAttrs
          };
          (el as IGraphic).setAttributes({
            opacity: 0,
            fillOpacity: 0,
            strokeOpacity: 0
          });
        }
      }
    });
  }

  onStart(): void {
    let duration = this.duration;
    let easing = this.easing;

    // 新的场景树
    this._newElementAttrMap &&
      Object.keys(this._newElementAttrMap).forEach(id => {
        const { node, attrs, state } = this._newElementAttrMap[id];
        if (state === 'enter') {
          const { enter = {} } = this.params ?? {};
          duration = isValidNumber(enter.duration) ? enter.duration : duration;
          easing = enter.easing ? enter.easing : easing;
        }
        if ((node as IGraphic).type === 'path') {
          (node as IGraphic)
            .animate({
              interpolate(key: string, ratio: number, from: any, to: any, nextAttributes: any) {
                if (key === 'path') {
                  nextAttributes.path = interpolateString(from, to)(ratio);
                  return true;
                }

                return false;
              }
            })
            // .wait(delay)
            .to(attrs, duration, easing as EasingType);
        } else {
          (node as IGraphic)
            .animate()
            // .wait(delay)
            .to(attrs, duration, easing as EasingType);
        }
      });
  }

  onUpdate(end: boolean, ratio: number, out: Record<string, any>): void {
    // do nothing
  }
}
