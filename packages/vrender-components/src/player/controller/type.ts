import { ISymbolGraphicAttribute } from '@visactor/vrender';
import { BaseGraphicAttributes } from '../../core/type';

/**
 * 控制器属性
 */

export interface ControllerAttributes {
  visible?: boolean;
  layout?: LayoutType;
  start: BaseGraphicAttributes<ISymbolGraphicAttribute>;
  pause: BaseGraphicAttributes<ISymbolGraphicAttribute>;
  forward: BaseGraphicAttributes<ISymbolGraphicAttribute>;
  backward: BaseGraphicAttributes<ISymbolGraphicAttribute>;
}

export type LayoutType = 'horizontal' | 'vertical';
