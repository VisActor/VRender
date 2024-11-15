/**
 * 部分源码参考konva
 * MIT License

  Original work Copyright (C) 2011 - 2013 by Eric Rowell (KineticJS)
  Modified work Copyright (C) 2014 - present by Anton Lavrenov (Konva)

  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in all
  copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  SOFTWARE.
 */
import type { IPointLike, TextMeasure, ITextMeasureSpec, IMatrix } from '@visactor/vutils';
import { Matrix, pi, pi2, Logger, getContextFont } from '@visactor/vutils';
import {
  injectable,
  DefaultFillStyle,
  DefaultStrokeStyle,
  DefaultTextStyle,
  createColor,
  getScaledStroke,
  application,
  matrixAllocate,
  transformMat4,
  createConicalGradient
} from '@visactor/vrender-core';
import type {
  ICamera,
  ICanvas,
  ICommonStyleParams,
  IConicalGradientData,
  IContext2d,
  ISetCommonStyleParams,
  ISetStrokeStyleParams,
  IStrokeStyleParams,
  ITextStyleParams,
  mat4,
  EnvType,
  vec3
} from '@visactor/vrender-core';

const outP: [number, number, number] = [0, 0, 0];

// https://github.com/konvajs/konva/blob/master/src/Context.ts

const addArcToBezierPath = (
  bezierPath: Array<number[]>,
  startAngle: number,
  endAngle: number,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  clockwise: boolean
) => {
  if (clockwise) {
    while (endAngle > startAngle) {
      endAngle -= pi2;
    }
  } else {
    while (endAngle < startAngle) {
      endAngle += pi2;
    }
  }
  // https://stackoverflow.com/questions/1734745/how-to-create-circle-with-b%C3%A9zier-curves
  const step = (pi / 3) * (endAngle > startAngle ? 1 : -1);
  let sa = startAngle;
  let ea = sa;
  while (ea !== endAngle) {
    ea = step > 0 ? Math.min(ea + step, endAngle) : Math.max(ea + step, endAngle);
    const delta = Math.abs(ea - sa);
    const len = (Math.tan(delta / 4) * 4) / 3;
    const dir = ea < sa ? -1 : 1;

    const c1 = Math.cos(sa);
    const s1 = Math.sin(sa);
    const c2 = Math.cos(ea);
    const s2 = Math.sin(ea);

    const x1 = c1 * rx + cx;
    const y1 = s1 * ry + cy;

    const x4 = c2 * rx + cx;
    const y4 = s2 * ry + cy;

    const hx = rx * len * dir;
    const hy = ry * len * dir;

    bezierPath.push([x1 - hx * s1, y1 + hy * c1, x4 + hx * s2, y4 - hy * c2, x4, y4]);
    sa = ea;
  }
};

@injectable()
export class BrowserContext2d implements IContext2d {
  static env: EnvType = 'browser';
  baseGlobalAlpha: number;
  drawPromise?: Promise<any>;
  declare mathTextMeasure: TextMeasure<ITextMeasureSpec>;

  declare canvas: ICanvas;
  declare camera?: ICamera;
  modelMatrix?: mat4;
  declare nativeContext: CanvasRenderingContext2D | any;
  declare _inuse: boolean;
  declare stack: Matrix[];
  declare disableFill?: boolean;
  declare disableStroke?: boolean;
  declare disableBeginPath?: boolean;
  protected matrix: Matrix;
  protected applyedMatrix?: Matrix; // 被应用的matrix
  declare fontFamily: string;
  declare fontSize: number;
  declare _clearMatrix: IMatrix;
  // 属性代理
  set fillStyle(d: string | CanvasGradient | CanvasPattern) {
    this.nativeContext.fillStyle = d;
  }
  get fillStyle(): string | CanvasGradient | CanvasPattern {
    return this.nativeContext.fillStyle;
  }
  set font(d: string) {
    this.nativeContext.font = d;
  }
  get font(): string {
    return this.nativeContext.font;
  }
  set globalAlpha(d: number) {
    this.nativeContext.globalAlpha = d * this.baseGlobalAlpha;
  }
  get globalAlpha(): number {
    return this.nativeContext.globalAlpha;
  }
  set lineCap(d: CanvasLineCap) {
    this.nativeContext.lineCap = d;
  }
  get lineCap(): CanvasLineCap {
    return this.nativeContext.lineCap;
  }
  set lineDashOffset(d: number) {
    this.nativeContext.lineDashOffset = d;
  }
  get lineDashOffset(): number {
    return this.nativeContext.lineDashOffset;
  }
  set lineJoin(d: CanvasLineJoin) {
    this.nativeContext.lineJoin = d;
  }
  get lineJoin(): CanvasLineJoin {
    return this.nativeContext.lineJoin;
  }
  set lineWidth(d: number) {
    this.nativeContext.lineWidth = d;
  }
  get lineWidth(): number {
    return this.nativeContext.lineWidth;
  }
  set miterLimit(d: number) {
    this.nativeContext.miterLimit = d;
  }
  get miterLimit(): number {
    return this.nativeContext.miterLimit;
  }
  set shadowBlur(d: number) {
    this.nativeContext.shadowBlur = d;
  }
  get shadowBlur(): number {
    return this.nativeContext.shadowBlur;
  }
  set shadowColor(d: string) {
    this.nativeContext.shadowColor = d;
  }
  get shadowColor(): string {
    return this.nativeContext.shadowColor;
  }
  set shadowOffsetX(d: number) {
    this.nativeContext.shadowOffsetX = d;
  }
  get shadowOffsetX(): number {
    return this.nativeContext.shadowOffsetX;
  }
  set shadowOffsetY(d: number) {
    this.nativeContext.shadowOffsetY = d;
  }
  get shadowOffsetY(): number {
    return this.nativeContext.shadowOffsetY;
  }
  set strokeStyle(d: string | CanvasGradient | CanvasPattern) {
    this.nativeContext.strokeStyle = d;
  }
  get strokeStyle(): string | CanvasGradient | CanvasPattern {
    return this.nativeContext.strokeStyle;
  }
  set textAlign(d: CanvasTextAlign) {
    this.nativeContext.textAlign = d;
  }
  get textAlign(): CanvasTextAlign {
    return this.nativeContext.textAlign;
  }
  set textBaseline(d: CanvasTextBaseline) {
    this.nativeContext.textBaseline = d;
  }
  get textBaseline(): CanvasTextBaseline {
    return this.nativeContext.textBaseline;
  }

  get inuse(): boolean {
    return !!this._inuse;
  }

  set inuse(use: boolean) {
    if (use === !!this._inuse) {
      return;
    }
    this._inuse = use;
    if (use) {
      this.nativeContext.save();
      this.reset();
    } else {
      this.nativeContext.restore();
    }
  }

  dpr: number;

  constructor(canvas: ICanvas, dpr: number) {
    const context = canvas.nativeCanvas.getContext('2d');
    if (!context) {
      throw new Error('发生错误，获取2d上下文失败');
    }
    this.nativeContext = context;
    this.canvas = canvas;
    this.matrix = new Matrix(1, 0, 0, 1, 0, 0);
    this.stack = [];
    this.dpr = dpr;
    this.applyedMatrix = new Matrix(1, 0, 0, 1, 0, 0);
    this._clearMatrix = new Matrix(1, 0, 0, 1, 0, 0);
    this.baseGlobalAlpha = 1;
  }

  reset() {
    if (this.stack.length) {
      Logger.getInstance().warn('可能存在bug，matrix没有清空');
    }
    this.matrix.setValue(1, 0, 0, 1, 0, 0);
    this.applyedMatrix = new Matrix(1, 0, 0, 1, 0, 0);
    this.stack.length = 0;
    this.nativeContext.setTransform(1, 0, 0, 1, 0, 0);
  }

  getCanvas() {
    return this.canvas;
  }

  getContext() {
    return this.nativeContext;
  }
  /**
   * 设置当前ctx 的transform信息
   */
  setTransformForCurrent(force: boolean = false) {
    // 只作简单判断
    // 增加判断，可以降低80%setTransform调用，降低50%setTransformForCurrent执行时间
    if (!force && this.applyedMatrix.equalToMatrix(this.matrix)) {
      return;
    }

    // this.applyedMatrix = this.cloneMatrix(this.matrix);
    // 避免直接使用cloneMatrix，重复创建Matrix，优化GC
    this.applyedMatrix.setValue(
      this.matrix.a,
      this.matrix.b,
      this.matrix.c,
      this.matrix.d,
      this.matrix.e,
      this.matrix.f
    );
    this.nativeContext.setTransform(
      this.matrix.a,
      this.matrix.b,
      this.matrix.c,
      this.matrix.d,
      this.matrix.e,
      this.matrix.f
    );
  }
  /**
   * 获取当前矩阵信息
   */
  get currentMatrix() {
    return this.matrix;
  }

  cloneMatrix(m: Matrix) {
    return matrixAllocate.allocateByObj(m);
  }

  /**
   * 清空画布
   */
  clear() {
    this.save();
    this.resetTransform();
    this.nativeContext.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.restore();
  }

  restore() {
    this.nativeContext.restore();
    if (this.stack.length > 0) {
      matrixAllocate.free(this.matrix);
      this.matrix = this.stack.pop() as Matrix;
      this.setTransformForCurrent(true);
    }
  }
  highPerformanceRestore() {
    if (this.stack.length > 0) {
      matrixAllocate.free(this.matrix);
      this.matrix = this.stack.pop() as Matrix;
    }
  }

  /**
   *
   * @param angle 弧度数
   */
  rotate(rad: number, setTransform: boolean = true) {
    this.matrix.rotate(rad);
    setTransform && this.setTransformForCurrent();
  }

  save() {
    const matrix = this.cloneMatrix(this.matrix);
    this.stack.push(matrix);
    this.nativeContext.save();
  }
  highPerformanceSave() {
    const matrix = this.cloneMatrix(this.matrix);
    this.stack.push(matrix);
  }

  /**
   * 基于当前matrix再次scale
   * @param sx
   * @param sy
   * @param setTransform 是否设置transform到context中
   */
  scale(sx: number, sy: number, setTransform: boolean = true) {
    this.matrix.scale(sx, sy);
    setTransform && this.setTransformForCurrent();
  }
  setScale(sx: number, sy: number, setTransform: boolean = true): void {
    this.matrix.setScale(sx, sy);
    setTransform && this.setTransformForCurrent();
  }
  /**
   * 基于某个点进行缩放
   * @param sx
   * @param sy
   * @param px
   * @param py
   */
  scalePoint(sx: number, sy: number, px: number, py: number, setTransform: boolean = true) {
    this.translate(px, py, false);
    this.scale(sx, sy, false);
    this.translate(-px, -py, false);
    setTransform && this.setTransformForCurrent();
  }
  /**
   *
   * @param a
   * @param b
   * @param c
   * @param d
   * @param e
   * @param f
   * @param setTransform
   */
  setTransform(
    a: number,
    b: number,
    c: number,
    d: number,
    e: number,
    f: number,
    setTransform: boolean = true,
    dpr: number = this.dpr
  ) {
    this.matrix.setValue(dpr * a, dpr * b, dpr * c, dpr * d, dpr * e, dpr * f);
    setTransform && this.setTransformForCurrent();
  }

  setTransformFromMatrix(matrix: Matrix, setTransform: boolean = true, dpr: number = this.dpr) {
    this.matrix.setValue(
      matrix.a * dpr,
      matrix.b * dpr,
      matrix.c * dpr,
      matrix.d * dpr,
      matrix.e * dpr,
      matrix.f * dpr
    );
    setTransform && this.setTransformForCurrent();
  }

  resetTransform(setTransform: boolean = true, dpr: number = this.dpr) {
    this.setTransform(dpr, 0, 0, dpr, 0, 0);
    setTransform && this.setTransformForCurrent();
  }

  // transform(m11: number, m12: number, m21: number, m22: number, dx: number, dy: number): void;
  transform(a: number, b: number, c: number, d: number, e: number, f: number, setTransform: boolean = true) {
    this.matrix.multiply(a, b, c, d, e, f);
    setTransform && this.setTransformForCurrent();
  }
  transformFromMatrix(matrix: Matrix, setTransform?: boolean): void {
    this.matrix.multiply(matrix.a, matrix.b, matrix.c, matrix.d, matrix.e, matrix.f);
    setTransform && this.setTransformForCurrent();
  }

  translate(x: number, y: number, setTransform: boolean = true) {
    this.matrix.translate(x, y);
    setTransform && this.setTransformForCurrent();
  }
  /**
   * 旋转角度，自动转换为弧度
   * @param deg 角度数
   */
  rotateDegrees(deg: number, setTransform: boolean = true) {
    const rad = (deg * Math.PI) / 180;
    this.rotate(rad, setTransform);
  }

  /**
   * 绕点旋转
   * @param rad 弧度
   * @param x 旋转中心点x
   * @param y 旋转中心点y
   */
  rotateAbout(rad: number, x: number, y: number, setTransform: boolean = true) {
    this.translate(x, y, false);
    this.rotate(rad, false);
    this.translate(-x, -y, false);
    setTransform && this.setTransformForCurrent();
  }

  /**
   * 绕点旋转
   * @param deg 旋转角度
   * @param x 旋转中心点x
   * @param y 旋转中心点y
   */
  rotateDegreesAbout(deg: number, x: number, y: number, setTransform: boolean = true) {
    this.translate(x, y, false);
    this.rotateDegrees(deg, false);
    this.translate(-x, -y, false);
    setTransform && this.setTransformForCurrent();
  }

  // /**
  //  * 全局坐标 -> 当前矩阵的局部坐标
  //  * @param x x
  //  * @param y y
  //  */
  // transformPoint(x: number, y: number): Point {
  //   const inverseMatrix = this.matrix.getInverse();
  //   // dpr
  //   x = x * this.dpr;
  //   y = y * this.dpr;
  //   return new Point(
  //     x * inverseMatrix.a + y * inverseMatrix.c + inverseMatrix.e,
  //     x * inverseMatrix.b + y * inverseMatrix.d + inverseMatrix.f
  //   );
  // }

  // /**
  //  * 坐标转换
  //  * @param x x
  //  * @param y y
  //  */
  // transformPoint2(x: number, y: number): Point {
  //   const inverseMatrix = this.matrix;
  //   return new Point(
  //     x * inverseMatrix.a + y * inverseMatrix.c + inverseMatrix.e,
  //     x * inverseMatrix.b + y * inverseMatrix.d + inverseMatrix.f
  //   );
  // }

  // transformPoint3(x: number, y: number, matrix: Matrix): Point {
  //   // dpr
  //   x = x * this.dpr;
  //   y = y * this.dpr;
  //   return new Point(x * matrix.a + y * matrix.c + matrix.e, x * matrix.b + y * matrix.d + matrix.f);
  // }

  //////// 代理方法
  // isPointInStroke ,drawFocusIfNeeded 方法没有代理，如有需要再添加

  beginPath() {
    if (this.disableBeginPath) {
      return;
    }
    this.nativeContext.beginPath();
  }

  clip(fillRule?: CanvasFillRule): void;
  clip(path: Path2D, fillRule?: CanvasFillRule): void;
  clip(path?: Path2D | CanvasFillRule, fillRule?: CanvasFillRule) {
    if (path) {
      if (typeof path === 'string') {
        this.nativeContext.clip(path);
      } else {
        this.nativeContext.clip(path, fillRule);
      }
    } else {
      this.nativeContext.clip();
    }
  }

  arc(x: number, y: number, radius: number, startAngle: number, endAngle: number, anticlockwise?: boolean, z?: number) {
    z = z || 0;
    if (this.camera) {
      const arr = [] as any;
      addArcToBezierPath(arr, startAngle, endAngle, x, y, radius, radius, anticlockwise);
      for (let i = 0; i < arr.length; ++i) {
        const bez = arr[i];
        this.bezierCurveTo(bez[0], bez[1], bez[2], bez[3], bez[4], bez[5], z);
      }
    } else {
      this.nativeContext.arc(x, y, Math.max(0, radius), startAngle, endAngle, anticlockwise);
    }
  }

  arcTo(x1: number, y1: number, x2: number, y2: number, radius: number): void;
  arcTo(x1: number, y1: number, x2: number, y2: number, radiusX: number) {
    this.nativeContext.arcTo(x1, y1, x2, y2, radiusX);
  }

  bezierCurveTo(cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number, z?: number) {
    z = z || 0;
    if (this.camera) {
      let cp1z = z;
      let cp2z = z;
      if (this.modelMatrix) {
        transformMat4(outP, [cp1x, cp1y, z], this.modelMatrix);
        cp1x = outP[0];
        cp1y = outP[1];
        cp1z = outP[2];

        transformMat4(outP, [cp2x, cp2y, z], this.modelMatrix);
        cp2x = outP[0];
        cp2y = outP[1];
        cp2z = outP[2];

        transformMat4(outP, [x, y, z], this.modelMatrix);
        x = outP[0];
        y = outP[1];
        z = outP[2];
      }
      let data = this.camera.vp(x, y, z);
      x = data.x;
      y = data.y;
      data = this.camera.vp(cp1x, cp1y, cp1z);
      cp1x = data.x;
      cp1y = data.y;
      data = this.camera.vp(cp2x, cp2y, cp2z);
      cp2x = data.x;
      cp2y = data.y;
    }
    this.nativeContext.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y);
  }

  closePath() {
    this.nativeContext.closePath();
  }

  ellipse(
    x: number,
    y: number,
    radiusX: number,
    radiusY: number,
    rotation: number,
    startAngle: number,
    endAngle: number,
    anticlockwise?: boolean
  ) {
    if (anticlockwise == null) {
      this.nativeContext.ellipse(x, y, radiusX, radiusY, rotation, startAngle, endAngle);
    } else {
      this.nativeContext.ellipse(x, y, radiusX, radiusY, rotation, startAngle, endAngle, anticlockwise);
    }
  }
  lineTo(x: number, y: number, z: number) {
    z = z || 0;
    if (this.camera) {
      if (this.modelMatrix) {
        transformMat4(outP, [x, y, z], this.modelMatrix);
        x = outP[0];
        y = outP[1];
        z = outP[2];
      }
      const data = this.camera.vp(x, y, z);
      x = data.x;
      y = data.y;
    }
    this.nativeContext.lineTo(x, y);
  }

  moveTo(x: number, y: number, z: number) {
    z = z || 0;
    if (this.camera) {
      if (this.modelMatrix) {
        transformMat4(outP, [x, y, z], this.modelMatrix);
        x = outP[0];
        y = outP[1];
        z = outP[2];
      }
      const data = this.camera.vp(x, y, z);
      x = data.x;
      y = data.y;
    }
    this.nativeContext.moveTo(x, y);
  }

  quadraticCurveTo(cpx: number, cpy: number, x: number, y: number, z: number) {
    z = z || 0;
    if (this.camera) {
      let cpz = z;
      if (this.modelMatrix) {
        transformMat4(outP, [cpx, cpy, z], this.modelMatrix);
        cpx = outP[0];
        cpy = outP[1];
        cpz = outP[2];

        transformMat4(outP, [x, y, z], this.modelMatrix);
        x = outP[0];
        y = outP[1];
        z = outP[2];
      }
      let data = this.camera.vp(x, y, z);
      x = data.x;
      y = data.y;
      data = this.camera.vp(cpx, cpy, cpz);
      cpx = data.x;
      cpy = data.y;
    }
    this.nativeContext.quadraticCurveTo(cpx, cpy, x, y);
  }

  rect(x: number, y: number, w: number, h: number, z: number) {
    z = z || 0;
    if (this.camera) {
      this.moveTo(x, y, z);
      this.lineTo(x + w, y, z);
      this.lineTo(x + w, y + h, z);
      this.lineTo(x, y + h, z);
      this.closePath();
    } else {
      this.nativeContext.rect(x, y, w, h);
    }
  }

  createImageData(imageDataOrSw: number | ImageData, sh?: number): ImageData;
  createImageData() {
    const a = arguments;
    if (a.length === 2) {
      return this.nativeContext.createImageData(a[0], a[1]);
    } else if (a.length === 1) {
      return this.nativeContext.createImageData(a[0]);
    }
    return null;
  }

  createLinearGradient(x0: number, y0: number, x1: number, y1: number) {
    if (!isFinite(x0 + y0 + x1 + y1)) {
      x0 = 0;
      y0 = 0;
      x1 = 0;
      y1 = 0;
    }

    return this.nativeContext.createLinearGradient(x0, y0, x1, y1);
  }

  createPattern(image: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement, repetition: string): CanvasPattern {
    if (image.width === 0 || image.height === 0) {
      return null;
    } // 宽高为0时createPattern会报错
    return this.nativeContext.createPattern(image, repetition);
  }

  createRadialGradient(x0: number, y0: number, r0: number, x1: number, y1: number, r1: number): CanvasGradient {
    return this.nativeContext.createRadialGradient(x0, y0, r0, x1, y1, r1);
  }

  createConicGradient(x: number, y: number, startAngle: number, endAngle: number): IConicalGradientData {
    let edit = false;
    let pattern: CanvasPattern | null;
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const ctx = this;
    const obj: IConicalGradientData = {
      stops: [],
      addColorStop(offset: number, color: string) {
        this.stops.push([offset, color]);
        edit = true;
      },
      GetPattern(minW: number, minH: number, deltaAngle?: number): CanvasPattern | null {
        if (edit) {
          if (!deltaAngle) {
            deltaAngle = endAngle - startAngle;
          }
          pattern = createConicalGradient(
            ctx as IContext2d,
            this.stops,
            x,
            y,
            deltaAngle,
            startAngle,
            endAngle,
            minW,
            minH
          );
          edit = false;
        }
        return pattern;
      }
    };
    return obj;
  }

  // createConicGradient(x: number, y: number, startAngle: number, endAngle: number): IConicalGradient | null {
  //   // let edit = false;
  //   // let pattern: CanvasPattern | null;
  //   // // eslint-disable-next-line @typescript-eslint/no-this-alias
  //   // const ctx = this;
  //   // const obj: IConicalGradient = {
  //   //   stops: [],
  //   //   addColorStop(offset: number, color: string) {
  //   //     this.stops.push([offset, color]);
  //   //     edit = true;
  //   //   },
  //   //   GetPattern(minW: number, minH: number, deltaAngle?: number): CanvasPattern | null {
  //   //     if (edit) {
  //   //       if (!deltaAngle) deltaAngle = endAngle - startAngle;
  //   //       pattern = createConicalGradient(ctx, this.stops, x, y, deltaAngle, startAngle, endAngle, minW, minH);
  //   //       edit = false;
  //   //     }
  //   //     return pattern;
  //   //   }
  //   // };
  //   // return obj;
  // }

  // fill(fillRule?: CanvasFillRule): void;
  // fill(path?: Path2D, fillRule?: CanvasFillRule): void;
  fill(path?: Path2D, fillRule?: CanvasFillRule) {
    if (this.disableFill) {
      return;
    }
    path ? this.nativeContext.fill(path) : this.nativeContext.fill();
  }

  fillRect(x: number, y: number, width: number, height: number) {
    this.nativeContext.fillRect(x, y, width, height);
  }

  clearRect(x: number, y: number, w: number, h: number) {
    this.nativeContext.clearRect(x, y, w, h);
  }

  project(x: number, y: number, z: number): IPointLike {
    z = z || 0;
    if (this.camera) {
      if (this.modelMatrix) {
        transformMat4(outP, [x, y, z], this.modelMatrix);
        x = outP[0];
        y = outP[1];
        z = outP[2];
      }
      const data = this.camera.vp(x, y, z);
      x = data.x;
      y = data.y;
    }
    return { x, y };
  }

  view(x: number, y: number, z: number): vec3 {
    z = z || 0;
    if (this.camera) {
      if (this.modelMatrix) {
        transformMat4(outP, [x, y, z], this.modelMatrix);
        x = outP[0];
        y = outP[1];
        z = outP[2];
      }
      return this.camera.view(x, y, z);
    }
    return [x, y, z];
  }

  fillText(text: string, x: number, y: number, z: number) {
    z = z || 0;
    if (this.camera) {
      if (this.modelMatrix) {
        transformMat4(outP, [x, y, z], this.modelMatrix);
        x = outP[0];
        y = outP[1];
        z = outP[2];
      }
      const data = this.camera.vp(x, y, z);
      x = data.x;
      y = data.y;
    }
    this.nativeContext.fillText(text, x, y);
  }

  getImageData(sx: number, sy: number, sw: number, sh: number): ImageData {
    return this.nativeContext.getImageData(sx, sy, sw, sh);
  }

  getLineDash(): number[] {
    return this.nativeContext.getLineDash();
  }

  isPointInPath(x: number, y: number) {
    return this.nativeContext.isPointInPath(x, y);
  }

  isPointInStroke(x: number, y: number) {
    return this.nativeContext.isPointInStroke(x, y);
  }

  measureText(
    text: string,
    method: 'native' | 'simple' | 'quick' = application.global.measureTextMethod
  ): { width: number } {
    if (!method || method === 'native') {
      return this.nativeContext.measureText(text);
    }
    if (!this.mathTextMeasure) {
      this.mathTextMeasure = application.graphicUtil.createTextMeasureInstance({}, {}, () => this.canvas.nativeCanvas);
    }

    const fontFamily = this.fontFamily ?? DefaultTextStyle.fontFamily;
    const fontSize = this.fontSize ?? DefaultTextStyle.fontSize;
    if (
      this.mathTextMeasure.textSpec.fontFamily !== fontFamily ||
      this.mathTextMeasure.textSpec.fontSize !== fontSize
    ) {
      this.mathTextMeasure.textSpec.fontFamily = fontFamily;
      this.mathTextMeasure.textSpec.fontSize = fontSize;
      this.mathTextMeasure._numberCharSize = null;
      this.mathTextMeasure._fullCharSize = null;
      this.mathTextMeasure._letterCharSize = null;
      this.mathTextMeasure._specialCharSizeMap = {};
    }
    return this.mathTextMeasure.measure(text, method);
  }

  putImageData(imagedata: ImageData, dx: number, dy: number) {
    this.nativeContext.putImageData(imagedata, dx, dy);
  }

  setLineDash(segments: number[]) {
    const a = arguments;
    const _context = this.nativeContext;

    // works for Chrome and IE11
    if (!!this.nativeContext.setLineDash) {
      a[0] && _context.setLineDash(a[0]);
    } else if ('mozDash' in _context) {
      // verified that this works in firefox
      (_context as any).mozDash = a[0];
    } else if ('webkitLineDash' in _context) {
      // does not currently work for Safari
      (_context as any).webkitLineDash = a[0];
    }

    // no support for IE9 and IE10
  }

  stroke(path?: Path2D) {
    if (this.disableStroke) {
      return;
    }
    path ? this.nativeContext.stroke(path) : this.nativeContext.stroke();
  }

  strokeRect(x: number, y: number, width: number, height: number) {
    this.nativeContext.strokeRect(x, y, width, height);
  }

  strokeText(text: string, x: number, y: number, z: number) {
    z = z || 0;
    if (this.camera) {
      if (this.modelMatrix) {
        transformMat4(outP, [x, y, z], this.modelMatrix);
        x = outP[0];
        y = outP[1];
        z = outP[2];
      }
      const data = this.camera.vp(x, y, z);
      x = data.x;
      y = data.y;
    }
    this.nativeContext.strokeText(text, x, y);
  }

  drawImage(
    image: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement | ImageBitmap,
    dstX: number,
    dstY: number
  ): void;
  drawImage(
    image: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement | ImageBitmap,
    dstX: number,
    dstY: number,
    dstW: number,
    dstH: number
  ): void;
  drawImage(
    image: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement | ImageBitmap,
    srcX: number,
    srcY: number,
    srcW: number,
    srcH: number,
    dstX: number,
    dstY: number,
    dstW: number,
    dstH: number
  ): void;

  drawImage() {
    const _context = this.nativeContext;
    const a = arguments;
    if (a.length === 3) {
      _context.drawImage(a[0], a[1], a[2]);
    } else if (a.length === 5) {
      _context.drawImage(a[0], a[1], a[2], a[3], a[4]);
    } else if (a.length === 9) {
      _context.drawImage(a[0], a[1], a[2], a[3], a[4], a[5], a[6], a[7], a[8]);
    }
  }

  protected fillAttributes = { ...DefaultFillStyle, opacity: 1 };
  protected strokeAttributes = { ...DefaultStrokeStyle, opacity: 1 };
  protected textAttributes = { ...DefaultTextStyle, opacity: 1 };

  setCommonStyle(
    params: ISetCommonStyleParams,
    attribute: ICommonStyleParams,
    // 用于渐变色
    offsetX: number,
    offsetY: number,
    defaultParams?: ICommonStyleParams | Partial<ICommonStyleParams>[]
  ) {
    if (Array.isArray(defaultParams)) {
      if (defaultParams.length <= 1) {
        return this._setCommonStyle(params, attribute, offsetX, offsetY, defaultParams[0]);
      }
      // TODO 是否存在性能问题？
      // TODO 默认第一个是theme
      const dp = Object.create(defaultParams[0]);
      defaultParams.forEach((p, i) => {
        if (i === 0) {
          return;
        }
        Object.assign(dp, p);
      });
      return this._setCommonStyle(params, attribute, offsetX, offsetY, dp as Required<ICommonStyleParams>);
    }
    return this._setCommonStyle(params, attribute, offsetX, offsetY, defaultParams);
  }

  protected _setCommonStyle(
    params: ISetCommonStyleParams,
    attribute: ICommonStyleParams,
    // 用于渐变色
    offsetX: number,
    offsetY: number,
    defaultParams?: ICommonStyleParams
  ) {
    const _context = this.nativeContext;
    if (!defaultParams) {
      defaultParams = this.fillAttributes;
    }
    const {
      fillOpacity = defaultParams.fillOpacity,
      opacity = defaultParams.opacity,
      fill = defaultParams.fill
    } = attribute;
    _context.globalAlpha = fillOpacity * opacity * this.baseGlobalAlpha;

    if (fillOpacity > 1e-12 && opacity > 1e-12) {
      _context.fillStyle = createColor(this, fill, params, offsetX, offsetY);
      // todo 小程序
    }
  }

  setShadowBlendStyle(
    params: ISetCommonStyleParams,
    attribute: ICommonStyleParams,
    defaultParams?: ICommonStyleParams | Partial<ICommonStyleParams>[]
  ) {
    if (Array.isArray(defaultParams)) {
      if (defaultParams.length <= 1) {
        return this._setShadowBlendStyle(params, defaultParams[0]);
      }
      // TODO 是否存在性能问题？
      // TODO 默认第一个是theme
      const dp = Object.create(defaultParams[0]);
      defaultParams.forEach((p, i) => {
        if (i === 0) {
          return;
        }
        Object.assign(dp, p);
      });
      return this._setShadowBlendStyle(params, attribute, dp as Required<ICommonStyleParams>);
    }
    return this._setShadowBlendStyle(params, attribute, defaultParams);
  }

  protected _clearShadowStyle = false;
  protected _clearFilterStyle = false;
  protected _clearGlobalCompositeOperationStyle = false;

  protected _setShadowBlendStyle(
    params: ISetCommonStyleParams,
    attribute: ICommonStyleParams,
    defaultParams?: ICommonStyleParams
  ) {
    const _context = this.nativeContext;
    if (!defaultParams) {
      defaultParams = this.fillAttributes;
    }
    const {
      opacity = defaultParams.opacity,
      shadowBlur = defaultParams.shadowBlur,
      shadowColor = defaultParams.shadowColor,
      shadowOffsetX = defaultParams.shadowOffsetX,
      shadowOffsetY = defaultParams.shadowOffsetY,
      blur = defaultParams.blur,
      globalCompositeOperation = defaultParams.globalCompositeOperation
    } = attribute;
    if (opacity <= 1e-12) {
      return;
    }
    if (shadowBlur || shadowOffsetX || shadowOffsetY) {
      // canvas的shadow不支持dpr，这里手动设置
      _context.shadowBlur = shadowBlur * this.dpr;
      _context.shadowColor = shadowColor;
      _context.shadowOffsetX = shadowOffsetX * this.dpr;
      _context.shadowOffsetY = shadowOffsetY * this.dpr;
      this._clearShadowStyle = true;
      // todo 小程序
    } else if (this._clearShadowStyle) {
      _context.shadowBlur = 0;
      _context.shadowOffsetX = 0;
      _context.shadowOffsetY = 0;
    }

    if (blur) {
      _context.filter = `blur(${blur}px)`;
      this._clearFilterStyle = true;
    } else if (this._clearFilterStyle) {
      _context.filter = 'blur(0px)';
      this._clearFilterStyle = false;
    }

    if (globalCompositeOperation) {
      _context.globalCompositeOperation = globalCompositeOperation;
      this._clearGlobalCompositeOperationStyle = true;
    } else if (this._clearGlobalCompositeOperationStyle) {
      _context.globalCompositeOperation = 'source-over';
      this._clearGlobalCompositeOperationStyle = false;
    }
  }

  setStrokeStyle(
    params: ISetStrokeStyleParams,
    attribute: IStrokeStyleParams,
    // 用于渐变色
    offsetX: number,
    offsetY: number,
    defaultParams?: IStrokeStyleParams | IStrokeStyleParams[]
  ) {
    if (Array.isArray(defaultParams)) {
      if (defaultParams.length <= 1) {
        return this._setStrokeStyle(params, attribute, offsetX, offsetY, defaultParams[0]);
      }
      // TODO 是否存在性能问题？
      // TODO 默认第一个是theme
      const dp = Object.create(defaultParams[0]);
      defaultParams.forEach((p, i) => {
        if (i === 0) {
          return;
        }
        Object.assign(dp, p);
      });
      return this._setStrokeStyle(params, attribute, offsetX, offsetY, dp as IStrokeStyleParams);
    }
    return this._setStrokeStyle(params, attribute, offsetX, offsetY, defaultParams);
  }
  protected _setStrokeStyle(
    params: ISetStrokeStyleParams,
    attribute: IStrokeStyleParams,
    // 用于渐变色
    offsetX: number,
    offsetY: number,
    defaultParams?: IStrokeStyleParams
  ) {
    const _context = this.nativeContext;
    if (!defaultParams) {
      defaultParams = this.strokeAttributes;
    }
    const { strokeOpacity = defaultParams.strokeOpacity, opacity = defaultParams.opacity } = attribute;

    _context.globalAlpha = strokeOpacity * opacity * this.baseGlobalAlpha;

    if (strokeOpacity > 1e-12 && opacity > 1e-12) {
      const {
        lineWidth = defaultParams.lineWidth,
        stroke = defaultParams.stroke,
        lineJoin = defaultParams.lineJoin,
        lineDash = defaultParams.lineDash,
        lineCap = defaultParams.lineCap,
        miterLimit = defaultParams.miterLimit,
        keepStrokeScale = defaultParams.keepStrokeScale
      } = attribute;
      _context.lineWidth = keepStrokeScale ? lineWidth : getScaledStroke(this, lineWidth, this.dpr);
      _context.strokeStyle = createColor(this, stroke as any, params, offsetX, offsetY);
      _context.lineJoin = lineJoin;
      lineDash && _context.setLineDash(lineDash);
      _context.lineCap = lineCap;
      _context.miterLimit = miterLimit;
    }
  }
  setTextStyleWithoutAlignBaseline(params: Partial<ITextStyleParams>, defaultParams?: ITextStyleParams, z?: number) {
    const _context = this.nativeContext;
    if (!defaultParams) {
      defaultParams = this.textAttributes;
    }
    const { scaleIn3d = defaultParams.scaleIn3d } = params;
    if (params.font) {
      _context.font = params.font;
    } else {
      _context.font = getContextFont(
        params,
        defaultParams,
        scaleIn3d && this.camera && this.camera.getProjectionScale(z)
      );
    }
    const { fontFamily = defaultParams.fontFamily, fontSize = defaultParams.fontSize } = params;
    this.fontFamily = fontFamily;
    this.fontSize = fontSize;
    _context.textAlign = 'left';
    _context.textBaseline = 'alphabetic';
    // // 这里不使用defaultParams
    // _context.textAlign = params.textAlign || 'left';
    // _context.textBaseline = params.textBaseline || 'alphabetic';
  }
  setTextStyle(params: Partial<ITextStyleParams>, defaultParams?: ITextStyleParams, z?: number) {
    const _context = this.nativeContext;
    if (!defaultParams) {
      defaultParams = this.textAttributes;
    }
    if (params.font) {
      _context.font = params.font;
    } else {
      _context.font = getContextFont(params, defaultParams, this.camera && this.camera.getProjectionScale(z));
    }
    const { fontFamily = defaultParams.fontFamily, fontSize = defaultParams.fontSize } = params;
    this.fontFamily = fontFamily;
    this.fontSize = fontSize;
    _context.textAlign = params.textAlign ?? defaultParams.textAlign;
    _context.textBaseline = params.textBaseline ?? defaultParams.textBaseline;
  }

  draw() {
    return;
  }

  clearMatrix(setTransform: boolean = true, dpr: number = this.dpr) {
    this.setTransformFromMatrix(this._clearMatrix, setTransform, dpr);
  }

  setClearMatrix(a: number, b: number, c: number, d: number, e: number, f: number) {
    this._clearMatrix.setValue(a, b, c, d, e, f);
  }

  onlyTranslate(dpr: number = this.dpr): boolean {
    return this.matrix.a === dpr && this.matrix.b === 0 && this.matrix.c === 0 && this.matrix.d === dpr;
  }

  release(...params: any): void {
    this.stack.forEach(m => matrixAllocate.free(m));
    this.stack.length = 0;
    return;
  }
}
