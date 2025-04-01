// 导出接口
export * from './intreface/animate';
export * from './intreface/timeline';
export * from './intreface/easing';
export * from './intreface/type';

// 导出实现
export { Animate } from './animate';
export { DefaultTimeline } from './timeline';
export { ManualTicker } from './ticker/manual-ticker';
export { DefaultTicker } from './ticker/default-ticker';
export { Step } from './step';

// 导出工具函数
export * from './utils/easing-func';
export { registerAnimate } from './register';
export { ACustomAnimate } from './custom/custom-animate';
export { IncreaseCount } from './custom/number';
export { InputText } from './custom/input-text';
export { ClipGraphicAnimate, ClipAngleAnimate, ClipRadiusAnimate, ClipDirectionAnimate } from './custom/clip-graphic';
export { TagPointsUpdate } from './custom/tag-points';
export { GroupFadeIn, GroupFadeOut } from './custom/group-fade';
export { RotateBySphereAnimate } from './custom/sphere';
export { AnimateExecutor } from './executor/animate-executor';
export type { IAnimationConfig } from './executor/executor';
export { registerCustomAnimate } from './custom/register';
// Export animation state modules
export * from './state';
export { AnimationTransitionRegistry } from './state/animation-states-registry';
export { transitionRegistry } from './state/animation-states-registry';
export { AnimationStateManager } from './state/animation-state';
export { AnimationStateStore } from './state/animation-state';

// Export component animation modules
export * from './component';
