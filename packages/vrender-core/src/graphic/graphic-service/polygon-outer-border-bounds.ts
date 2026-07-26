import type { IAABBBounds, IMatrixLike } from '@visactor/vutils';
import { getScaledStrokeWithMatrix } from '../../common/canvas-utils';
import { offsetPolygonPoints } from '../../common/polygon';
import type { IPolygon, IPolygonGraphicAttribute } from '../../interface';
import { boundStroke } from '../tools';

type BoundsScaleMatrix = Pick<IMatrixLike, 'a' | 'b' | 'c' | 'd'>;

const getBoundsScaleMatrix = (polygon: IPolygon): BoundsScaleMatrix => {
  const globalMatrix = polygon.globalTransMatrix;
  const viewBoxMatrix = polygon.stage?.window.getViewBoxTransform();
  if (!viewBoxMatrix) {
    return globalMatrix;
  }
  return {
    a: viewBoxMatrix.a * globalMatrix.a + viewBoxMatrix.c * globalMatrix.b,
    b: viewBoxMatrix.b * globalMatrix.a + viewBoxMatrix.d * globalMatrix.b,
    c: viewBoxMatrix.a * globalMatrix.c + viewBoxMatrix.c * globalMatrix.d,
    d: viewBoxMatrix.b * globalMatrix.c + viewBoxMatrix.d * globalMatrix.d
  };
};

export const getPolygonBoundsScale = (polygon: IPolygon): number =>
  getScaledStrokeWithMatrix(getBoundsScaleMatrix(polygon), 1, 1);

export const updateBoundsOfPolygonOuterBorder = (
  attribute: IPolygonGraphicAttribute,
  polygonTheme: Required<IPolygonGraphicAttribute>,
  aabbBounds: IAABBBounds,
  polygon: IPolygon
): IAABBBounds => {
  const {
    outerBorder,
    points = polygonTheme.points,
    closePath = polygonTheme.closePath,
    shadowBlur = polygonTheme.shadowBlur,
    keepStrokeScale = polygonTheme.keepStrokeScale
  } = attribute;

  if (outerBorder && outerBorder.visible !== false) {
    const defaultOuterBorder = polygonTheme.outerBorder;
    const {
      distance = defaultOuterBorder.distance,
      lineWidth = defaultOuterBorder.lineWidth,
      lineJoin = defaultOuterBorder.lineJoin,
      strokeBoundsBuffer = defaultOuterBorder.strokeBoundsBuffer
    } = outerBorder;

    const boundsScale = getPolygonBoundsScale(polygon);
    let scaledDistance = distance as number;
    if (!keepStrokeScale) {
      scaledDistance *= boundsScale;
    }
    offsetPolygonPoints(points, scaledDistance, closePath).forEach(point => {
      aabbBounds.add(point.x, point.y);
    });
    const scaledLineWidth = lineWidth * boundsScale;
    const scaledShadowBlur = shadowBlur * boundsScale;
    boundStroke(aabbBounds, (scaledShadowBlur + scaledLineWidth) / 2, lineJoin === 'miter', strokeBoundsBuffer);
  }

  return aabbBounds;
};
