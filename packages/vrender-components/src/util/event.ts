import { vglobal } from '@visactor/vrender-core/global';

export function getEndTriggersOfDrag() {
  // 绑定到 canvas 上
  if (vglobal.env === 'browser') {
    return ['pointerup', 'pointerleave', 'pointercancel'];
  }

  // 绑定到stage节点上
  return ['pointerup', 'pointerleave', 'pointerupoutside'];
}
