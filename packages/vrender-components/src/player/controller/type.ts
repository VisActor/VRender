import type { ISymbolGraphicAttribute } from '@visactor/vrender';
import type { BaseGraphicAttributes } from '../../core/type';

/**
 * 控制器属性
 */

export interface ControllerAttributes {
  visible?: boolean;
  layout?: LayoutType;
  start: BaseGraphicAttributes<ISymbolGraphicAttribute> & { visible: boolean };
  pause: BaseGraphicAttributes<ISymbolGraphicAttribute> & { visible: boolean };
  forward: BaseGraphicAttributes<ISymbolGraphicAttribute> & { visible: boolean };
  backward: BaseGraphicAttributes<ISymbolGraphicAttribute> & { visible: boolean };
}

export type LayoutType = 'horizontal' | 'vertical';
