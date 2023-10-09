import type { ISymbolGraphicAttribute } from '@visactor/vrender-core';
import type { BaseGraphicAttributes } from '../../core/type';

/**
 * 控制器属性
 */

export interface ControllerAttributes {
  visible?: boolean;
  layout?: LayoutType;
  start: BaseGraphicAttributes<ISymbolGraphicAttribute> & { visible?: boolean };
  pause: BaseGraphicAttributes<ISymbolGraphicAttribute> & { visible?: boolean };
  forward: BaseGraphicAttributes<ISymbolGraphicAttribute> & { visible?: boolean };
  backward: BaseGraphicAttributes<ISymbolGraphicAttribute> & { visible?: boolean };
  /**
   * 关闭交互效果
   * @default false
   */
  disableActiveEffect?: boolean;
}

export type LayoutType = 'horizontal' | 'vertical';
