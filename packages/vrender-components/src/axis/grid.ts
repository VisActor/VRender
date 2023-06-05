/**
 * @description 网格线
 */
import { isFunction, isArray, isEmpty, merge, PointService, abs, pi } from '@visactor/vutils';
import { createPath, Path } from '@visactor/vrender';
import { AbstractComponent } from '../core/base';
import { Point } from '../core/type';
import { LineGridAttributes, GridItem, GridAttributes, CircleGridAttributes } from './type';

function getLinePath(points: Point[], closed: boolean) {
  let path = '';
  if (points.length === 0) {
    return path;
  }
  points.forEach((point, index) => {
    if (index === 0) {
      path = `M${point.x},${point.y}`;
    } else {
      path += `L${point.x},${point.y}`;
    }
  });
  if (closed) {
    path += 'Z';
  }

  return path;
}

function getArcPath(center: Point, points: Point[], reverse: boolean, closed: boolean) {
  let path = '';
  if (!center || points.length === 0) {
    return path;
  }
  const firstPoint = points[0];
  const radius = PointService.distancePP(center, firstPoint);
  const sweepFlag = reverse ? 0 : 1; // 顺时针还是逆时针
  if (closed) {
    // 封闭时，绘制整个圆
    path += `M${center.x},${center.y - radius}A${radius},${radius},0,0,${sweepFlag},${center.x},${
      center.y + radius
    }A${radius},${radius},0,0,${sweepFlag},${center.x},${center.y - radius}Z`;
  } else {
    points.forEach((point, index) => {
      if (index === 0) {
        path = `M${point.x},${point.y}`;
      } else {
        path += `A${radius},${radius},0,0,${sweepFlag},${point.x},${point.y}`;
      }
    });
  }

  return path;
}

function getRegionPath(from: Point[], to: Point[], attribute: GridAttributes) {
  const { type, closed } = attribute;
  const reversePoints = to.slice(0).reverse();

  let regionPath = '';
  let nextPath = '';

  if (type === 'line' && (attribute as LineGridAttributes).smoothLink && (attribute as LineGridAttributes).center) {
    const fromStart = from[0];
    const toEnd = reversePoints[0];
    const center = (attribute as LineGridAttributes).center as Point;

    regionPath = getLinePath(from, !!closed);
    nextPath = getLinePath(reversePoints, !!closed);
    const toEndRadius = PointService.distancePP(toEnd, center);
    const fromStartRadius = PointService.distancePP(fromStart, center);
    regionPath += `A${toEndRadius},${toEndRadius},0,0,1,${toEnd.x},${toEnd.y}L${toEnd.x},${toEnd.y}`;
    nextPath += `A${fromStartRadius},${fromStartRadius},0,0,0,${fromStart.x},${fromStart.y}`;
  } else if (type === 'circle') {
    const { center } = attribute as CircleGridAttributes;
    regionPath = getArcPath(center, from, false, !!closed);
    nextPath = getArcPath(center, reversePoints, true, !!closed);
  } else if (type === 'line' || type === 'polygon') {
    regionPath = getLinePath(from, !!closed);
    nextPath = getLinePath(reversePoints, !!closed);
  }

  if (closed) {
    regionPath += nextPath;
  } else {
    nextPath = 'L' + nextPath.substring(1); // 更新第一个节点
    regionPath += nextPath;
    regionPath += 'Z';
  }
  return regionPath;
}

export class Grid extends AbstractComponent<Required<GridAttributes>> {
  name = 'grid';

  static defaultAttributes: Partial<GridAttributes> = {
    style: {
      lineWidth: 1,
      stroke: true,
      strokeColor: '#416180'
    },
    zIndex: 0
  };

  constructor(attributes: GridAttributes) {
    super(merge({}, Grid.defaultAttributes, attributes));
  }

  protected render(): void {
    this.removeAllChild();
    const {
      type,
      items,
      style,
      closed,
      alternateColor,
      // zIndex = 0,
      depth = 0
    } = this.attribute as GridAttributes & { depth?: number };

    if (isEmpty(items)) {
      return;
    }
    // 绘制网格线
    items.forEach((item: GridItem, index: number) => {
      const { id, points } = item;
      let path = '';
      if (type === 'line' || type === 'polygon') {
        path = getLinePath(points, !!closed);
      } else if (type === 'circle') {
        const { center } = this.attribute as CircleGridAttributes;
        path = getArcPath(center, points, false, !!closed);
      }
      const shape = createPath({
        path,
        z: depth,
        ...(isFunction(style) ? merge({}, Grid.defaultAttributes.style, style(item, index)) : style)
      }) as Path;
      shape.name = `${this.name}-line`;
      shape.id = this._getNodeId(`path-${id}`);
      this.add(shape);
    });

    // 添加额外的3d线段
    if (depth && type === 'line') {
      items.forEach((item: GridItem, index: number) => {
        const { id, points } = item;
        // 重新计算points，使其长度为depth
        const nextPoints = [];
        nextPoints.push(points[0]);
        const dir = { x: points[1].x - points[0].x, y: points[1].y - points[0].y };
        const dirLen = Math.sqrt(dir.x * dir.x + dir.y * dir.y);
        const ratio = depth / dirLen;
        nextPoints.push({ x: points[0].x + dir.x * ratio, y: points[0].y + dir.y * ratio });
        const path = getLinePath(nextPoints, !!closed);
        const deltaX = abs(nextPoints[0].x - nextPoints[1].x);
        const deltaY = abs(nextPoints[0].y - nextPoints[1].y);
        const shape = createPath({
          path,
          z: 0,
          alpha: deltaX > deltaY ? ((points[1].x - points[0].x > 0 ? -1 : 1) * pi) / 2 : 0,
          beta: deltaX < deltaY ? -pi / 2 : 0,
          anchor3d: deltaX > deltaY ? [nextPoints[0].x, 0] : [0, nextPoints[0].y],
          ...(isFunction(style) ? merge({}, Grid.defaultAttributes.style, style(item, index)) : style)
        }) as Path;
        shape.name = `${this.name}-line`;
        shape.id = this._getNodeId(`path-${id}`);
        this.add(shape);
      });
    }

    // 绘制填充区域
    if (items.length > 1 && alternateColor) {
      const colors: string[] = isArray(alternateColor)
        ? (alternateColor as string[])
        : [alternateColor as string, 'transparent'];
      const getColor = (index: number) => colors[index % colors.length];

      // const regions: any[] = [];
      for (let index = 0; index < items.length - 1; index++) {
        const [prev, curr] = [items[index].points, items[index + 1].points];
        const path = getRegionPath(prev, curr, this.attribute as GridAttributes);
        const shape = createPath({
          path,
          fill: true,
          fillColor: getColor(index)
        }) as Path;
        shape.name = `${this.name}-region`;
        shape.id = this._getNodeId(`region-${index}`);
        this.add(shape);
      }
    }
  }

  /**
   * @override 覆写
   * @param id
   * @returns
   */
  protected _getNodeId(id: string) {
    return `${this.id}-${id}`;
  }
}
