import { injectable } from 'inversify';
import { IPoint } from '@visactor/vutils';
import { IMAGE_NUMBER_TYPE } from '../../../graphic';
import { IImage, IContext2d } from '../../../interface';
import { IGraphicPicker, IPickParams } from '../../picker-service';

@injectable()
export class DefaultCanvasImagePicker implements IGraphicPicker {
  type: string = 'image';
  numberType: number = IMAGE_NUMBER_TYPE;

  contains(image: IImage, point: IPoint, params?: IPickParams): boolean {
    // const { imageAttribute } = graphicService.themeService.getCurrentTheme();
    // const {
    //   x = imageAttribute.x,
    //   y = imageAttribute.y,
    // } = image.attribute;

    const { pickContext } = params ?? {};
    if (!pickContext) {
      return false;
    }

    if (!image.AABBBounds.containsPoint(point)) {
      return false;
    }

    // TODO: 详细形状判断
    return true;
  }
}
