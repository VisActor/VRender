import type { IAnimate, IGraphic } from '@visactor/vrender-core';
import { AttributeUpdateType } from '@visactor/vrender-core/event/constant';

export function buildAnimationStaticCommitAttrs(
  target: IGraphic,
  keys: string[],
  animate?: IAnimate,
  fallbackAttrs?: Record<string, any>
): Record<string, any> | null {
  const commitTarget = target as any;
  const contextFinalAttrs = commitTarget.context?.finalAttrs as Record<string, any> | undefined;
  const finalAttribute = commitTarget.getFinalAttribute() as Record<string, any> | undefined;
  let commitAttrs: Record<string, any> | null = null;

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    if (animate && !animate.validAttr(key)) {
      continue;
    }

    if (contextFinalAttrs && Object.prototype.hasOwnProperty.call(contextFinalAttrs, key)) {
      commitAttrs ?? (commitAttrs = {});
      commitAttrs[key] = contextFinalAttrs[key];
      continue;
    }

    if (finalAttribute && Object.prototype.hasOwnProperty.call(finalAttribute, key)) {
      commitAttrs ?? (commitAttrs = {});
      commitAttrs[key] = finalAttribute[key];
      continue;
    }

    if (fallbackAttrs && Object.prototype.hasOwnProperty.call(fallbackAttrs, key)) {
      commitAttrs ?? (commitAttrs = {});
      commitAttrs[key] = fallbackAttrs[key];
    }
  }

  return commitAttrs;
}

export function commitAnimationStaticAttrs(
  target: IGraphic,
  keys: string[],
  animate?: IAnimate,
  fallbackAttrs?: Record<string, any>
): boolean {
  const commitAttrs = buildAnimationStaticCommitAttrs(target, keys, animate, fallbackAttrs);
  if (!commitAttrs) {
    return false;
  }

  (target as any).setFinalAttributes(commitAttrs);
  target.setAttributes(commitAttrs as any, false, { type: AttributeUpdateType.ANIMATE_END });
  return true;
}
