import { DefaultStateAnimateConfig } from '../../animate/config';
import { AttributeUpdateType } from '../../common/enums';
import type { IAnimateConfig } from '../../interface/graphic';

export interface IStateTransitionPlan<T> {
  stateNames?: string[];
  targetAttrs: Partial<T>;
  animateAttrs: Partial<T>;
  jumpAttrs: Partial<T>;
  noAnimateAttrs: Partial<T>;
}

export interface IStateTransitionAnalysisOptions {
  noWorkAnimateAttr?: Record<string, number>;
  isClear?: boolean;
  getDefaultAttribute?: (key: string) => unknown;
  animateConfig?: IAnimateConfig;
}

export interface IStateTransitionApplyOptions {
  animateConfig?: IAnimateConfig;
}

export interface IStateTransitionGraphic<T> {
  finalAttribute?: Record<string, any>;
  applyAnimationState?: (state: string[], animations: Array<Record<string, any>>) => void;
  setAttributesAndPreventAnimate: (
    attrs: Partial<T>,
    forceUpdateTag?: boolean,
    context?: { type: AttributeUpdateType }
  ) => void;
  stopStateAnimates: () => void;
  _emitCustomEvent: (type: string, context?: { type: AttributeUpdateType }) => void;
  getNoWorkAnimateAttr?: () => Record<string, number>;
  getDefaultAttribute?: (key: string) => unknown;
}

export interface IStateTransitionOrchestrator<T> {
  analyzeTransition: (
    currentAttrs: Partial<T>,
    targetAttrs: Partial<T>,
    stateNames?: string[],
    hasAnimation?: boolean,
    options?: IStateTransitionAnalysisOptions
  ) => IStateTransitionPlan<T>;
  applyTransition: (
    graphic: IStateTransitionGraphic<T>,
    plan: IStateTransitionPlan<T>,
    hasAnimation?: boolean,
    options?: IStateTransitionApplyOptions
  ) => IStateTransitionPlan<T>;
  applyClearTransition: (
    graphic: IStateTransitionGraphic<T>,
    targetAttrs: Partial<T>,
    hasAnimation?: boolean,
    stateNames?: string[],
    options?: IStateTransitionApplyOptions
  ) => IStateTransitionPlan<T>;
}

function hasOwnKeys(value: object): boolean {
  return Object.keys(value).length > 0;
}

function normalizeNoAnimateAttrConfig(config?: IAnimateConfig['noAnimateAttrs']): Record<string, number> {
  if (!config) {
    return {};
  }

  if (Array.isArray(config)) {
    return config.reduce<Record<string, number>>((acc, key) => {
      acc[key] = 1;
      return acc;
    }, {});
  }

  return Object.keys(config).reduce<Record<string, number>>((acc, key) => {
    if ((config as Record<string, boolean | number>)[key]) {
      acc[key] = 1;
    }
    return acc;
  }, {});
}

export class StateTransitionOrchestrator<T extends Record<string, any> = Record<string, any>>
  implements IStateTransitionOrchestrator<T>
{
  analyzeTransition(
    _currentAttrs: Partial<T>,
    targetAttrs: Partial<T>,
    stateNames?: string[],
    hasAnimation?: boolean,
    options: IStateTransitionAnalysisOptions = {}
  ): IStateTransitionPlan<T> {
    const plan: IStateTransitionPlan<T> = {
      stateNames,
      targetAttrs: { ...targetAttrs },
      animateAttrs: {},
      jumpAttrs: {},
      noAnimateAttrs: {}
    };

    if (!hasAnimation) {
      return plan;
    }

    const noWorkAnimateAttr = {
      ...(options.noWorkAnimateAttr ?? {}),
      ...normalizeNoAnimateAttrConfig(options.animateConfig?.noAnimateAttrs)
    };
    const isClear = options.isClear === true;
    const getDefaultAttribute = options.getDefaultAttribute;

    for (const key in targetAttrs) {
      if (!Object.prototype.hasOwnProperty.call(targetAttrs, key)) {
        continue;
      }

      const value = (targetAttrs as Record<string, any>)[key];

      if (noWorkAnimateAttr[key]) {
        (plan.jumpAttrs as Record<string, any>)[key] = value;
        (plan.noAnimateAttrs as Record<string, any>)[key] = value;
        continue;
      }

      (plan.animateAttrs as Record<string, any>)[key] =
        isClear && value === undefined && getDefaultAttribute ? getDefaultAttribute(key) : value;
    }

    return plan;
  }

  applyTransition(
    graphic: IStateTransitionGraphic<T>,
    plan: IStateTransitionPlan<T>,
    hasAnimation?: boolean,
    options: IStateTransitionApplyOptions = {}
  ): IStateTransitionPlan<T> {
    if (hasAnimation) {
      const stateAnimateConfig = options.animateConfig ?? DefaultStateAnimateConfig;
      graphic.applyAnimationState?.(
        ['state'],
        [
          {
            name: 'state',
            animation: {
              type: 'state',
              to: plan.animateAttrs,
              duration: stateAnimateConfig.duration,
              easing: stateAnimateConfig.easing
            }
          }
        ]
      );

      if (hasOwnKeys(plan.noAnimateAttrs)) {
        graphic.setAttributesAndPreventAnimate(plan.noAnimateAttrs, false, { type: AttributeUpdateType.STATE });
      }
    } else {
      graphic.stopStateAnimates();
      graphic.setAttributesAndPreventAnimate(plan.targetAttrs, false, { type: AttributeUpdateType.STATE });
    }

    if (graphic.finalAttribute) {
      Object.assign(graphic.finalAttribute, plan.targetAttrs);
    }

    graphic._emitCustomEvent('afterStateUpdate', { type: AttributeUpdateType.STATE });

    return plan;
  }

  applyClearTransition(
    graphic: IStateTransitionGraphic<T>,
    targetAttrs: Partial<T>,
    hasAnimation?: boolean,
    stateNames?: string[],
    options: IStateTransitionApplyOptions = {}
  ): IStateTransitionPlan<T> {
    const plan = this.analyzeTransition({}, targetAttrs, stateNames, hasAnimation, {
      noWorkAnimateAttr: graphic.getNoWorkAnimateAttr?.(),
      isClear: true,
      getDefaultAttribute: graphic.getDefaultAttribute?.bind(graphic),
      animateConfig: options.animateConfig
    });

    return this.applyTransition(graphic, plan, hasAnimation, options);
  }
}
