import type {
  EasingType,
  IArea,
  IAreaCacheItem,
  ICubicBezierCurve,
  ICurve,
  ICustomPath2D,
  IGraphic,
  ILine,
  ILineAttribute,
  IRect,
  IRectAttribute
} from '@visactor/vrender-core';
import { application, AttributeUpdateType, CustomPath2D, divideCubic } from '@visactor/vrender-core';
import { ACustomAnimate } from './custom-animate';
import type { IPoint } from '@visactor/vutils';
import { PointService } from '@visactor/vutils';

export class StreamLight extends ACustomAnimate<any> {
  declare valid: boolean;
  declare target: IGraphic;

  declare rect: IRect;
  declare line: ILine;
  declare area: IArea;
  constructor(
    from: any,
    to: any,
    duration: number,
    easing: EasingType,
    params?: { attribute?: Partial<IRectAttribute | ILineAttribute>; streamLength?: number; isHorizontal?: boolean }
  ) {
    super(from, to, duration, easing, params);
  }

  getEndProps(): Record<string, any> {
    return {};
  }

  onStart(): void {
    if (!this.target) {
      return;
    }
    if (this.target.type === 'rect') {
      this.onStartRect();
    } else if (this.target.type === 'line') {
      this.onStartLineOrArea('line');
    } else if (this.target.type === 'area') {
      this.onStartLineOrArea('area');
    }
  }

  onStartLineOrArea(type: 'line' | 'area') {
    const root = this.target.attachShadow();
    const line = application.graphicService.creator[type]({
      ...this.params?.attribute
    });
    this[type] = line;
    line.pathProxy = new CustomPath2D();
    root.add(line);
  }

  onStartRect(): void {
    const root = this.target.attachShadow();

    const isHorizontal = this.params?.isHorizontal ?? true;
    const sizeAttr = isHorizontal ? 'height' : 'width';
    const otherSizeAttr = isHorizontal ? 'width' : 'height';
    const size = this.target.AABBBounds[sizeAttr]();
    const y = isHorizontal ? 0 : this.target.AABBBounds.y1;

    const rect = application.graphicService.creator.rect({
      [sizeAttr]: size,
      fill: '#bcdeff',
      shadowBlur: 30,
      shadowColor: '#bcdeff',
      ...this.params?.attribute,
      x: 0,
      y,
      [otherSizeAttr]: 0
    });
    this.rect = rect;
    root.add(rect);
  }

  onBind(): void {
    return;
  }

  onEnd(): void {
    this.target.detachShadow();
  }

  onUpdate(end: boolean, ratio: number, out: Record<string, any>): void {
    if (this.rect) {
      return this.onUpdateRect(end, ratio, out);
    } else if (this.line || this.area) {
      return this.onUpdateLineOrArea(end, ratio, out);
    }
  }

  protected onUpdateRect(end: boolean, ratio: number, out: Record<string, any>): void {
    const isHorizontal = this.params?.isHorizontal ?? true;
    const parentAttr = (this.target as any).attribute;
    if (isHorizontal) {
      const parentWidth = parentAttr.width ?? Math.abs(parentAttr.x1 - parentAttr.x) ?? 250;
      const streamLength = this.params?.streamLength ?? parentWidth;
      const maxLength = this.params?.attribute?.width ?? 60;
      // 起点，rect x右端点 对齐 parent左端点
      // 如果parent.x1 < parent.x, 需要把rect属性移到parent x1的位置上, 因为初始 rect.x = parent.x
      const startX = -maxLength;
      // 插值
      const currentX = startX + (streamLength - startX) * ratio;
      // 位置限定 > 0
      const x = Math.max(currentX, 0);
      // 宽度计算
      const w = Math.min(Math.min(currentX + maxLength, maxLength), streamLength - currentX);
      // 如果 rect右端点 超出 parent右端点, 宽度动态调整
      const width = w + x > parentWidth ? Math.max(parentWidth - x, 0) : w;
      this.rect.setAttributes(
        {
          x: x + Math.min(parentAttr.x1 - parentAttr.x, 0),
          width
        } as any,
        false,
        {
          type: AttributeUpdateType.ANIMATE_PLAY,
          animationState: {
            ratio,
            end
          }
        }
      );
    } else {
      const parentHeight = parentAttr.height ?? Math.abs(parentAttr.y1 - parentAttr.y) ?? 250;
      const streamLength = this.params?.streamLength ?? parentHeight;
      const maxLength = this.params?.attribute?.height ?? 60;
      // 起点，y上端点 对齐 parent下端点
      const startY = parentHeight;
      // 插值
      const currentY = startY - (streamLength + maxLength) * ratio;
      // 位置限定 < parentHeight
      let y = Math.min(currentY, parentHeight);
      // 高度最小值
      const h = Math.min(parentHeight - currentY, maxLength);
      // 如果 rect上端点=y 超出 parent上端点 = 0, 则高度不断变小
      let height;
      if (y <= 0) {
        // 必须先得到高度再将y置为0, 顺序很重要
        height = Math.max(y + h, 0);
        y = 0;
      } else {
        height = h;
      }
      this.rect.setAttributes(
        {
          y: y + Math.min(parentAttr.y1 - parentAttr.y, 0),
          height
        } as any,
        false,
        {
          type: AttributeUpdateType.ANIMATE_PLAY,
          animationState: {
            ratio,
            end
          }
        }
      );
    }
  }

  protected onUpdateLineOrArea(end: boolean, ratio: number, out: Record<string, any>) {
    const target = this.line || this.area;
    if (!target) {
      return;
    }
    const customPath = target.pathProxy as ICustomPath2D;
    const targetLine = this.target as ILine | IArea;
    if (targetLine.cache || targetLine.cacheArea) {
      this._onUpdateLineOrAreaWithCache(customPath, targetLine, end, ratio, out);
    } else {
      this._onUpdateLineWithoutCache(customPath, targetLine, end, ratio, out);
    }
    const targetAttrs = targetLine.attribute;
    target.setAttributes({
      stroke: targetAttrs.stroke,
      ...target.attribute
    });
    target.addUpdateBoundTag();
  }

  // 针对有cache的linear
  protected _onUpdateLineOrAreaWithCache(
    customPath: ICustomPath2D,
    g: ILine | IArea,
    end: boolean,
    ratio: number,
    out: Record<string, any>
  ) {
    customPath.clear();
    if (g.type === 'line') {
      let cache = g.cache;
      if (!Array.isArray(cache)) {
        cache = [cache];
      }
      const totalLen = cache.reduce((l: any, c: any) => l + c.getLength(), 0);
      const curves: ICurve<IPoint>[] = [];
      cache.forEach((c: any) => {
        c.curves.forEach((ci: any) => curves.push(ci));
      });
      return this._updateCurves(customPath, curves, totalLen, ratio);
    } else if (g.type === 'area' && g.cacheArea?.top?.curves) {
      const cache = g.cacheArea as IAreaCacheItem;
      const totalLen = cache.top.curves.reduce((a, b) => a + b.getLength(), 0);
      return this._updateCurves(customPath, cache.top.curves, totalLen, ratio);
    }
  }

  protected _updateCurves(customPath: ICustomPath2D, curves: ICurve<IPoint>[], totalLen: number, ratio: number) {
    const startLen = totalLen * ratio;
    const endLen = Math.min(startLen + (this.params?.streamLength ?? 10), totalLen);
    let lastLen = 0;
    let start = false;
    for (let i = 0; i < curves.length; i++) {
      if (curves[i].defined !== false) {
        const curveItem = curves[i];
        const len = curveItem.getLength();
        const startPercent = 1 - (lastLen + len - startLen) / len;
        let endPercent = 1 - (lastLen + len - endLen) / len;
        let curveForStart: ICubicBezierCurve;
        if (lastLen < startLen && lastLen + len > startLen) {
          start = true;
          if (curveItem.p2 && curveItem.p3) {
            const [_, curve2] = divideCubic(curveItem as ICubicBezierCurve, startPercent);
            customPath.moveTo(curve2.p0.x, curve2.p0.y);
            curveForStart = curve2;
            // console.log(curve2.p0.x, curve2.p0.y);
          } else {
            const p = curveItem.getPointAt(startPercent);
            customPath.moveTo(p.x, p.y);
          }
        }
        if (lastLen < endLen && lastLen + len > endLen) {
          if (curveItem.p2 && curveItem.p3) {
            if (curveForStart) {
              endPercent = (endLen - startLen) / curveForStart.getLength();
            }
            const [curve1] = divideCubic(curveForStart || (curveItem as ICubicBezierCurve), endPercent);
            customPath.bezierCurveTo(curve1.p1.x, curve1.p1.y, curve1.p2.x, curve1.p2.y, curve1.p3.x, curve1.p3.y);
          } else {
            const p = curveItem.getPointAt(endPercent);
            customPath.lineTo(p.x, p.y);
          }
          break;
        } else if (start) {
          if (curveItem.p2 && curveItem.p3) {
            const curve = curveForStart || curveItem;
            customPath.bezierCurveTo(curve.p1.x, curve.p1.y, curve.p2.x, curve.p2.y, curve.p3.x, curve.p3.y);
          } else {
            customPath.lineTo(curveItem.p1.x, curveItem.p1.y);
          }
        }
        lastLen += len;
      }
    }
  }

  // 只针对最简单的linear
  protected _onUpdateLineWithoutCache(
    customPath: ICustomPath2D,
    line: ILine,
    end: boolean,
    ratio: number,
    out: Record<string, any>
  ) {
    const { points, curveType } = line.attribute;
    if (!points || points.length < 2 || curveType !== 'linear') {
      return;
    }
    let totalLen = 0;
    for (let i = 1; i < points.length; i++) {
      totalLen += PointService.distancePP(points[i], points[i - 1]);
    }
    const startLen = totalLen * ratio;
    const endLen = Math.min(startLen + (this.params?.streamLength ?? 10), totalLen);
    const nextPoints = [];
    let lastLen = 0;
    for (let i = 1; i < points.length; i++) {
      const len = PointService.distancePP(points[i], points[i - 1]);
      if (lastLen < startLen && lastLen + len > startLen) {
        nextPoints.push(PointService.pointAtPP(points[i - 1], points[i], 1 - (lastLen + len - startLen) / len));
      }
      if (lastLen < endLen && lastLen + len > endLen) {
        nextPoints.push(PointService.pointAtPP(points[i - 1], points[i], 1 - (lastLen + len - endLen) / len));
        break;
      } else if (nextPoints.length) {
        nextPoints.push(points[i]);
      }
      lastLen += len;
    }

    if (!nextPoints.length || nextPoints.length < 2) {
      return;
    }
    customPath.clear();
    customPath.moveTo(nextPoints[0].x, nextPoints[0].y);
    for (let i = 1; i < nextPoints.length; i++) {
      customPath.lineTo(nextPoints[i].x, nextPoints[i].y);
    }
  }
}
