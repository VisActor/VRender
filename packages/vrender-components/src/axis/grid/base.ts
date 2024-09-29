/**
 * @description 网格线
 */
import { isFunction, isArray, merge, PointService, abs, pi, isNumberClose } from '@visactor/vutils';
import type { IGraphic, IGroup, Path } from '@visactor/vrender-core';
import { graphicCreator } from '@visactor/vrender-core';
import { AbstractComponent } from '../../core/base';
import type { Point } from '../../core/type';
import type { GridItem, CircleGridAttributes, GridBaseAttributes, GridAttributes, LineGridAttributes } from './type';
import type { AxisItem, TransformedAxisItem } from '../type';
import { AXIS_ELEMENT_NAME } from '../constant';
import { getElMap, getPolygonPath, getVerticalCoord } from '../util';

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

    regionPath = getPolygonPath(from, !!closed);
    nextPath = getPolygonPath(reversePoints, !!closed);
    const toEndRadius = PointService.distancePP(toEnd, center);
    const fromStartRadius = PointService.distancePP(fromStart, center);
    regionPath += `A${toEndRadius},${toEndRadius},0,0,1,${toEnd.x},${toEnd.y}L${toEnd.x},${toEnd.y}`;
    nextPath += `A${fromStartRadius},${fromStartRadius},0,0,0,${fromStart.x},${fromStart.y}`;
  } else if (type === 'circle') {
    const { center } = attribute as CircleGridAttributes;
    regionPath = getArcPath(center, from, false, !!closed);
    nextPath = getArcPath(center, reversePoints, true, !!closed);
  } else if (type === 'line' || type === 'polygon') {
    regionPath = getPolygonPath(from, !!closed);
    nextPath = getPolygonPath(reversePoints, !!closed);
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

export abstract class BaseGrid<T extends GridBaseAttributes> extends AbstractComponent<Required<T>> {
  name = 'axis-grid';

  static defaultAttributes: Partial<GridBaseAttributes> = {
    style: {
      lineWidth: 1,
      stroke: '#999',
      strokeOpacity: 1,
      lineDash: [4, 4]
    },
    subGrid: {
      visible: false,
      style: {
        lineWidth: 1,
        stroke: '#999',
        strokeOpacity: 1,
        lineDash: [4, 4]
      }
    }
  };

  protected _innerView: IGroup;
  getInnerView() {
    return this._innerView;
  }

  protected _prevInnerView: { [key: string]: IGraphic }; // 缓存旧场景树，用于自定义动画
  /**
   * 获取更新前的旧场景树
   * @returns 返回更新前的旧场景树
   */
  getPrevInnerView() {
    return this._prevInnerView;
  }

  // 经过处理后的坐标轴点数据
  protected data: TransformedAxisItem[] = [];
  abstract getTickCoord(value: number): Point;
  abstract isInValidValue(value: number): boolean;
  abstract getVerticalVector(offset: number, inside: boolean, point: Point): [number, number];
  protected abstract getGridAttribute(isSubGrid: boolean): T;
  protected abstract getGridPointsByValue(value: number): Point[];

  protected render(): void {
    this._prevInnerView = this._innerView && getElMap(this._innerView);

    this.removeAllChild(true);
    this._innerView = graphicCreator.group({ x: 0, y: 0, pickable: false });
    this.add(this._innerView);

    const { items, visible } = this.attribute;
    if (items && items.length && visible !== false) {
      this.data = this._transformItems(items);
      this._renderGrid(this._innerView);
    }
  }

  protected getVerticalCoord(point: Point, offset: number, inside: boolean): Point {
    return getVerticalCoord(point, this.getVerticalVector(offset, inside, point));
  }

  private _transformItems(items: AxisItem[]) {
    const data: TransformedAxisItem[] = [];
    items.forEach((item: AxisItem) => {
      data.push({
        ...item,
        point: this.getTickCoord(item.value),
        id: item.id ?? item.label
      });
    });
    return data;
  }
  private _renderGrid(container: any) {
    // 渲染 subGrid
    const { visible } = this.attribute.subGrid || {};
    if (visible) {
      this._renderGridByType(true, container);
    }

    // 渲染 Grid，Grid 需要在 subGrid 上层渲染
    this._renderGridByType(false, container);
  }

  private _renderGridByType(isSubGrid: boolean, container: IGroup) {
    const gridAttrs = merge({}, this.attribute, this.getGridAttribute(isSubGrid));

    const { type, items, style, closed, alternateColor, depth = 0 } = gridAttrs;
    const name = isSubGrid ? `${AXIS_ELEMENT_NAME.grid}-sub` : `${AXIS_ELEMENT_NAME.grid}`;

    // 绘制网格线
    items.forEach((item: GridItem, index: number) => {
      const { id, points } = item;
      let path = '';
      if (type === 'line' || type === 'polygon') {
        path = getPolygonPath(points, !!closed);
      } else if (type === 'circle') {
        const { center } = this.attribute as unknown as CircleGridAttributes;
        path = getArcPath(center, points, false, !!closed);
      }
      const shape = graphicCreator.path({
        path,
        z: depth,
        ...(isFunction(style)
          ? merge({}, this.skipDefault ? null : BaseGrid.defaultAttributes.style, style(item, index))
          : style)
      }) as Path;
      shape.name = `${name}-line`;
      shape.id = this._getNodeId(`${name}-path-${id}`);
      container.add(shape);
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
        const path = getPolygonPath(nextPoints, !!closed);
        const deltaX = abs(nextPoints[0].x - nextPoints[1].x);
        const deltaY = abs(nextPoints[0].y - nextPoints[1].y);
        const shape = graphicCreator.path({
          path,
          z: 0,
          alpha: deltaX > deltaY ? ((points[1].x - points[0].x > 0 ? -1 : 1) * pi) / 2 : 0,
          beta: deltaX < deltaY ? -pi / 2 : 0,
          anchor3d: deltaX > deltaY ? [nextPoints[0].x, 0] : [0, nextPoints[0].y],
          ...(isFunction(style)
            ? merge({}, this.skipDefault ? null : BaseGrid.defaultAttributes.style, style(item, index))
            : style)
        }) as Path;
        shape.name = `${name}-line`;
        shape.id = this._getNodeId(`${name}-path-${id}`);
        container.add(shape);
      });
    }

    // 绘制填充区域
    if (items.length > 1 && alternateColor) {
      const colors: string[] = isArray(alternateColor)
        ? (alternateColor as string[])
        : [alternateColor as string, 'transparent'];
      const getColor = (index: number) => colors[index % colors.length];
      const originalItems = this.attribute.items;
      const firstItem = originalItems[0];
      const lastItem = originalItems[originalItems.length - 1];
      const noZero = !isNumberClose(firstItem.value, 0) && !isNumberClose(lastItem.value, 0);
      const noOne = !isNumberClose(firstItem.value, 1) && !isNumberClose(lastItem.value, 1);
      const allPoints = [];
      const isDesc = firstItem.value > lastItem.value;

      if ((isDesc && noOne) || (!isDesc && noZero)) {
        allPoints.push(this.getGridPointsByValue(isDesc ? 1 : 0));
      }
      items.forEach((item: any) => {
        allPoints.push(item.points as Point[]);
      });

      if ((isDesc && noZero) || (!isDesc && noOne)) {
        allPoints.push(this.getGridPointsByValue(isDesc ? 0 : 1));
      }

      for (let index = 0; index < allPoints.length - 1; index++) {
        const prev = allPoints[index];
        const curr = allPoints[index + 1];
        const path = getRegionPath(prev, curr, gridAttrs);
        const shape = graphicCreator.path({
          path,
          fill: getColor(index)
        }) as Path;
        shape.name = `${name}-region`;
        shape.id = this._getNodeId(`${name}-region-${index}`);
        container.add(shape);
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

  protected _parseTickSegment() {
    let tickSegment = 1;
    const count = this.data.length;
    if (count >= 2) {
      tickSegment = this.data[1].value - this.data[0].value;
    }

    return tickSegment;
  }

  protected _getPointsOfSubGrid(tickSegment: number, alignWithLabel: boolean) {
    const tickLineCount = this.data.length;
    // 刻度线的数量大于 2 时，才绘制子刻度
    const points: { value: number }[] = [];
    if (tickLineCount >= 2) {
      this.data.forEach((item: TransformedAxisItem) => {
        let tickValue = item.value;
        if (!alignWithLabel) {
          // tickLine 不同 tick 对齐时需要调整 point
          const value = item.value - tickSegment / 2;
          if (this.isInValidValue(value)) {
            return;
          }
          tickValue = value;
        }
        points.push({
          value: tickValue
        });
      });
    }

    return points;
  }

  release(): void {
    super.release();
    this._prevInnerView = null;
    this._innerView = null;
  }
}
