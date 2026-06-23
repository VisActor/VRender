import {
  PYRAMID3D_NUMBER_TYPE,
  type IPyramid3d,
  type IGraphicRender,
  type IGraphicPicker
} from '@visactor/vrender-core';
import { Base3dPicker } from '../common/base-3d-picker';

export class DefaultCanvasPyramid3dPicker extends Base3dPicker<IPyramid3d> implements IGraphicPicker {
  type: string = 'pyramid3d';
  numberType: number = PYRAMID3D_NUMBER_TYPE;

  themeType: string = 'polygon';

  constructor(public readonly canvasRenderer: IGraphicRender) {
    super();
  }
}
