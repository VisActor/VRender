import { Matrix } from '@visactor/vutils';
import { injectable } from 'inversify';
import {
  ICanvas,
  ICommonStyleParams,
  IContext2d,
  ISetCommonStyleParams,
  ISetStrokeStyleParams,
  IStrokeStyleParams,
  IConicalGradientData,
  ITextStyleParams
} from '../interface';
import { matrixAllocate } from '../modules';
import { contain, containStroke } from './util';
import { CustomPath2D } from '../common/custom-path2d';
import { getScaledStroke } from '../common/canvas-utils';
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

// https://github.com/konvajs/konva/blob/master/src/Context.ts
const initMatrix = new Matrix(1, 0, 0, 1, 0, 0);
const globalPoint = { x: 0, y: 0 };

@injectable()
export class EmptyContext2d implements IContext2d {
  path: CustomPath2D;
  canvas: null;
  stack: Matrix[];
  protected matrix: Matrix;
  protected applyedMatrix?: Matrix; // 被应用的matrix
  // 属性代理
  fillStyle: string | CanvasGradient | CanvasPattern;
  /**
   * @deprecated font方法不建议使用，请使用setTextStyle
   */
  font: string;
  globalAlpha: number;
  lineCap: string;
  lineDashOffset: number;
  lineJoin: string;
  lineWidth: number;
  miterLimit: number;
  shadowBlur: number;
  shadowColor: string;
  shadowOffsetX: number;
  shadowOffsetY: number;
  strokeStyle: string | CanvasGradient | CanvasPattern;
  textAlign: string;
  textBaseline: string;
  dpr: number;

  get nativeContext(): any {
    return this.path;
  }

  constructor(canvas: any, dpr: number) {
    this.matrix = new Matrix(1, 0, 0, 1, 0, 0);
    this.stack = [];
    this.dpr = dpr;
    this.applyedMatrix = new Matrix(1, 0, 0, 1, 0, 0);
    this.path = new CustomPath2D();
  }

  getCanvas(): ICanvas {
    throw new Error('不支持getCanvas');
  }

  getContext() {
    throw new Error('不支持getContext');
  }
  /**
   * 设置当前ctx 的transform信息
   */
  setTransformForCurrent(force: boolean = false) {
    // 只作简单判断
    if (!force && this.applyedMatrix.equalToMatrix(this.matrix)) {
      return;
    }

    this.applyedMatrix = this.cloneMatrix(this.matrix);
    return;
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
    this.restore();
  }

  restore() {
    if (this.stack.length > 0) {
      matrixAllocate.free(this.matrix);
      this.matrix = this.stack.pop() as Matrix;
      this.setTransformForCurrent();
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
    this.path.clear();
  }

  clip(fillRule?: CanvasFillRule): void;
  clip(path: Path2D, fillRule?: CanvasFillRule): void;
  clip(path?: Path2D | CanvasFillRule, fillRule?: CanvasFillRule) {
    return;
  }

  arc(x: number, y: number, radius: number, startAngle: number, endAngle: number, anticlockwise?: boolean) {
    this.path.arc(x, y, radius, startAngle, endAngle, anticlockwise);
  }

  arcTo(x1: number, y1: number, x2: number, y2: number, radius: number): void;
  arcTo(x1: number, y1: number, x2: number, y2: number, radiusX: number) {
    this.path.arcTo(x1, y1, x2, y2, radiusX);
  }

  bezierCurveTo(cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number) {
    this.path.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y);
  }

  closePath() {
    this.path.closePath();
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
    return;
  }
  lineTo(x: number, y: number) {
    this.path.lineTo(x, y);
  }

  moveTo(x: number, y: number) {
    this.path.moveTo(x, y);
  }

  quadraticCurveTo(cpx: number, cpy: number, x: number, y: number) {
    this.path.quadraticCurveTo(cpx, cpy, x, y);
  }

  rect(x: number, y: number, w: number, h: number) {
    this.path.rect(x, y, w, h);
  }

  createImageData(imageDataOrSw: number | ImageData, sh?: number): ImageData {
    return null;
  }

  createLinearGradient(x0: number, y0: number, x1: number, y1: number): CanvasGradient {
    throw new Error('不支持createLinearGradient');
  }

  createPattern(image: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement, repetition: string): CanvasPattern {
    throw new Error('不支持createPattern');
  }

  createRadialGradient(x0: number, y0: number, r0: number, x1: number, y1: number, r1: number): CanvasGradient {
    throw new Error('不支持createRadialGradient');
  }

  createConicGradient(x: number, y: number, startAngle: number, endAngle: number): IConicalGradientData {
    return null;
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
    return;
  }

  fillRect(x: number, y: number, width: number, height: number) {
    this.path.rect(x, y, width, height);
  }

  clearRect(x: number, y: number, w: number, h: number) {
    return;
  }

  fillText(text: string, x: number, y: number) {
    return;
  }

  getImageData(sx: number, sy: number, sw: number, sh: number): ImageData {
    return null;
  }

  getLineDash(): number[] {
    return [];
  }

  isPointInPath(x: number, y: number) {
    this.matrix.transformPoint({ x, y }, globalPoint);
    return contain(this.path.commandList, globalPoint.x, globalPoint.y);
  }

  isPointInStroke(x: number, y: number) {
    if (!this.lineWidth) {
      return false;
    }
    this.matrix.transformPoint({ x, y }, globalPoint);
    const lineWidth = getScaledStroke(this, this.lineWidth, this.dpr);
    return containStroke(this.path.commandList, lineWidth, globalPoint.x, globalPoint.y);
  }

  measureText(text: string): { width: number } {
    throw new Error('不支持measureText');
  }

  putImageData(imagedata: ImageData, dx: number, dy: number) {
    throw new Error('不支持measureText');
  }

  setLineDash(segments: number[]) {
    return;
  }

  stroke(path?: Path2D) {
    return;
  }

  strokeRect(x: number, y: number, width: number, height: number) {
    this.path.rect(x, y, width, height);
  }

  strokeText(text: string, x: number, y: number) {
    return;
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
    return;
  }

  setCommonStyle(
    params: ISetCommonStyleParams,
    attribute: ICommonStyleParams,
    offsetX: number,
    offsetY: number,
    defaultParams?: ICommonStyleParams | Partial<ICommonStyleParams>[]
  ) {
    return;
  }

  _setCommonStyle(params: ISetCommonStyleParams, offsetX: number, offsetY: number, defaultParams?: ICommonStyleParams) {
    return;
  }

  setStrokeStyle(
    params: ISetStrokeStyleParams,
    attribute: IStrokeStyleParams,
    offsetX: number,
    offsetY: number,
    defaultParams?: IStrokeStyleParams | IStrokeStyleParams[]
  ) {
    return;
  }
  _setStrokeStyle(params: ISetStrokeStyleParams, offsetX: number, offsetY: number, defaultParams?: IStrokeStyleParams) {
    return;
  }
  setTextStyleWithoutAlignBaseline(params: Partial<ITextStyleParams>, defaultParams?: ITextStyleParams) {
    return;
  }
  setTextStyle(params: Partial<ITextStyleParams>, defaultParams?: ITextStyleParams) {
    return;
  }

  draw() {
    return;
  }

  clearMatrix(setTransform: boolean = true, dpr: number = this.dpr) {
    this.setTransformFromMatrix(initMatrix, setTransform, dpr);
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
