import type { IPoint } from '@visactor/vutils';
import { injectable, GROUP_NUMBER_TYPE } from '@visactor/vrender-core';
import type { IGraphicPicker, IPickParams, IGroup } from '@visactor/vrender-core';

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
