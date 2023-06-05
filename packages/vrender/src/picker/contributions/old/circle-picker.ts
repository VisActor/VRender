// import { tau } from '@visactor/vutils';
// import { injectable } from 'inversify';
// import { PointService, IPoint } from '../../../vutils';
// import { ICircle } from '../../../export';
// import { CIRCLE_NUMBER_TYPE } from '../../../graphic';
// import { graphicService } from '../../../modules';
// import { IGraphicPicker, IPickParams } from '../../picker-service';

// export const CanvasCirclePicker = Symbol.for('CanvasCirclePicker');

// @injectable()
// export class DefaultCanvasCirclePicker implements IGraphicPicker {
//   type: string = 'circle';
//   numberType?: number = CIRCLE_NUMBER_TYPE;

//   contains(circle: ICircle, point: IPoint, params?: IPickParams): boolean {
//     const { circleAttribute } = graphicService.themeService.getCurrentTheme();
//     const {
//       x = circleAttribute.x,
//       y = circleAttribute.y,
//       startAngle = circleAttribute.startAngle,
//       endAngle = circleAttribute.endAngle,
//       lineWidth = circleAttribute.lineWidth,
//       stroke = circleAttribute.stroke
//     } = circle.attribute;
//     let { radius = circleAttribute.radius } = circle.attribute;

//     if (!stroke || (Array.isArray(stroke) && stroke.every(item => !item))) {
//       radius += lineWidth;
//     }

//     if (PointService.distancePN(point, x, y) > radius * radius) {
//       return false;
//     }

//     if (!circle.AABBBounds.contains(point.x, point.y)) {
//       return false;
//     }

//     if (endAngle - startAngle >= tau) {
//       return true;
//     }
//     // TODO: 判断不规范的圆形
//     return true;
//   }
// }
