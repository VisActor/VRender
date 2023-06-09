import { injectable } from 'inversify';
import type { IPoint } from '@visactor/vutils';
import { TEXT_NUMBER_TYPE } from '../../../graphic/constants';
import type { IGraphicPicker, IPickParams, IText } from '../../../interface';

@injectable()
export class DefaultMathTextPicker implements IGraphicPicker {
  type: string = 'text';
  numberType: number = TEXT_NUMBER_TYPE;

  contains(text: IText, point: IPoint, params?: IPickParams): boolean {
    if (!text.AABBBounds.containsPoint(point)) {
      return false;
    }

    // const { pickContext } = params ?? {};
    // if (!pickContext) {
    //   return false;
    // }

    // TODO: 详细形状判断
    return true;
  }
}
