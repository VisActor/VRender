import type { IPoint } from '@visactor/vutils';
import { inject, injectable } from 'inversify';
import type { IGraphicPicker, IGraphicRender, IPickParams, IGroup } from '../../../interface';
import { GROUP_NUMBER_TYPE } from '../../../graphic/constants';

@injectable()
export class DefaultCanvasGroupPicker implements IGraphicPicker {
  type: string = 'group';
  numberType: number = GROUP_NUMBER_TYPE;

  // constructor(@inject(RectRender) public readonly canvasRenderer: IGraphicRender) {}

  contains(group: IGroup, point: IPoint, params?: IPickParams): boolean {
    // Group作为特殊节点，本身不支持被pick
    // 存在shadowDOM的group，它的shadow可以被pick，但是不会冒泡到场景树中
    return false;
    // if (group.attribute.pickMode === 'imprecise') {
    //   return true;
    // }
  }
}
