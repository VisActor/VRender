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
import type { IPointLike, TextMeasure, ITextMeasureSpec, IMatrix, Matrix } from '@visactor/vutils';
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
  vec3,
  CustomPath2D
} from '@visactor/vrender-core';

/**
 * RoughContext2d serves as a proxy to the original context (BrowserContext2d)
 * while also updating a custom path for path-related operations
 */
export class RoughContext2d implements IContext2d {
  static env: EnvType = 'browser';
  originContext: IContext2d;
  customPath: CustomPath2D;

  constructor(originContext: IContext2d, customPath: CustomPath2D) {
    this.originContext = originContext;
    this.customPath = customPath;
  }

  reset(setTransform: boolean = true) {
    return this.originContext.reset(setTransform);
  }

  // Path-related methods that affect both the original context and the custom path
  beginPath(): void {
    this.originContext.beginPath();
    this.customPath.beginPath();
  }

  moveTo(x: number, y: number, z?: number): void {
    this.originContext.moveTo(x, y, z);
    this.customPath.moveTo(x, y);
  }

  lineTo(x: number, y: number, z?: number): void {
    this.originContext.lineTo(x, y, z);
    this.customPath.lineTo(x, y);
  }

  bezierCurveTo(cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number, z?: number): void {
    (this.originContext.bezierCurveTo as any)(cp1x, cp1y, cp2x, cp2y, x, y, z);
    this.customPath.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y);
  }

  quadraticCurveTo(cpx: number, cpy: number, x: number, y: number, z?: number): void {
    this.originContext.quadraticCurveTo(cpx, cpy, x, y, z);
    this.customPath.quadraticCurveTo(cpx, cpy, x, y);
  }

  arc(
    x: number,
    y: number,
    radius: number,
    startAngle: number,
    endAngle: number,
    anticlockwise?: boolean,
    z?: number
  ): void {
    this.originContext.arc(x, y, radius, startAngle, endAngle, anticlockwise, z);
    this.customPath.arc(x, y, radius, startAngle, endAngle, anticlockwise);
  }

  arcTo(x1: number, y1: number, x2: number, y2: number, radius: number): void {
    this.originContext.arcTo(x1, y1, x2, y2, radius);
    this.customPath.arcTo(x1, y1, x2, y2, radius);
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
  ): void {
    this.originContext.ellipse(x, y, radiusX, radiusY, rotation, startAngle, endAngle, anticlockwise);
    this.customPath.ellipse(x, y, radiusX, radiusY, rotation, startAngle, endAngle, anticlockwise);
  }

  rect(x: number, y: number, w: number, h: number, z?: number): void {
    this.originContext.rect(x, y, w, h, z);
    this.customPath.rect(x, y, w, h);
  }

  closePath(): void {
    this.originContext.closePath();
    this.customPath.closePath();
  }

  // Property forwarding using getters and setters
  // Define getters and setters for all properties to forward to originContext
  // Canvas
  get canvas(): ICanvas {
    return this.originContext.canvas;
  }
  set canvas(value: ICanvas) {
    this.originContext.canvas = value;
  }

  // Camera
  get camera(): ICamera | undefined {
    return this.originContext.camera;
  }
  set camera(value: ICamera | undefined) {
    this.originContext.camera = value;
  }

  // ModelMatrix
  get modelMatrix(): mat4 | undefined {
    return this.originContext.modelMatrix;
  }
  set modelMatrix(value: mat4 | undefined) {
    this.originContext.modelMatrix = value;
  }

  // NativeContext
  get nativeContext(): CanvasRenderingContext2D | any {
    return this.originContext.nativeContext;
  }
  set nativeContext(value: CanvasRenderingContext2D | any) {
    this.originContext.nativeContext = value;
  }

  // Inuse
  get _inuse(): boolean {
    return this.originContext._inuse;
  }
  set _inuse(value: boolean) {
    this.originContext._inuse = value;
  }

  get inuse(): boolean {
    return this.originContext.inuse;
  }
  set inuse(value: boolean) {
    this.originContext.inuse = value;
  }

  // Stack
  get stack(): Matrix[] {
    return this.originContext.stack;
  }
  set stack(value: Matrix[]) {
    this.originContext.stack = value;
  }

  // Disable flags
  get disableFill(): boolean | undefined {
    return this.originContext.disableFill;
  }
  set disableFill(value: boolean | undefined) {
    this.originContext.disableFill = value;
  }

  get disableStroke(): boolean | undefined {
    return this.originContext.disableStroke;
  }
  set disableStroke(value: boolean | undefined) {
    this.originContext.disableStroke = value;
  }

  get disableBeginPath(): boolean | undefined {
    return this.originContext.disableBeginPath;
  }
  set disableBeginPath(value: boolean | undefined) {
    this.originContext.disableBeginPath = value;
  }

  // Font properties
  get fontFamily(): string {
    return this.originContext.fontFamily;
  }
  set fontFamily(value: string) {
    this.originContext.fontFamily = value;
  }

  get fontSize(): number {
    return this.originContext.fontSize;
  }
  set fontSize(value: number) {
    this.originContext.fontSize = value;
  }

  // Matrix
  get _clearMatrix(): IMatrix {
    return this.originContext._clearMatrix;
  }
  set _clearMatrix(value: IMatrix) {
    this.originContext._clearMatrix = value;
  }

  // DPR
  get dpr(): number {
    return this.originContext.dpr;
  }
  set dpr(value: number) {
    this.originContext.dpr = value;
  }

  // Other properties
  get baseGlobalAlpha(): number {
    return this.originContext.baseGlobalAlpha;
  }
  set baseGlobalAlpha(value: number) {
    this.originContext.baseGlobalAlpha = value;
  }

  get drawPromise(): Promise<any> | undefined {
    return this.originContext.drawPromise;
  }
  set drawPromise(value: Promise<any> | undefined) {
    this.originContext.drawPromise = value;
  }

  get mathTextMeasure(): TextMeasure<ITextMeasureSpec> {
    return this.originContext.mathTextMeasure;
  }
  set mathTextMeasure(value: TextMeasure<ITextMeasureSpec>) {
    this.originContext.mathTextMeasure = value;
  }

  // Canvas context style properties
  get fillStyle(): string | CanvasGradient | CanvasPattern {
    return this.originContext.fillStyle;
  }
  set fillStyle(value: string | CanvasGradient | CanvasPattern) {
    this.originContext.fillStyle = value;
  }

  get font(): string {
    return this.originContext.font;
  }
  set font(value: string) {
    this.originContext.font = value;
  }

  get globalAlpha(): number {
    return this.originContext.globalAlpha;
  }
  set globalAlpha(value: number) {
    this.originContext.globalAlpha = value;
  }

  get lineCap(): CanvasLineCap {
    return this.originContext.lineCap as any;
  }
  set lineCap(value: CanvasLineCap) {
    this.originContext.lineCap = value;
  }

  get lineDashOffset(): number {
    return this.originContext.lineDashOffset;
  }
  set lineDashOffset(value: number) {
    this.originContext.lineDashOffset = value;
  }

  get lineJoin(): CanvasLineJoin {
    return this.originContext.lineJoin as any;
  }
  set lineJoin(value: CanvasLineJoin) {
    this.originContext.lineJoin = value;
  }

  get lineWidth(): number {
    return this.originContext.lineWidth;
  }
  set lineWidth(value: number) {
    this.originContext.lineWidth = value;
  }

  get miterLimit(): number {
    return this.originContext.miterLimit;
  }
  set miterLimit(value: number) {
    this.originContext.miterLimit = value;
  }

  get shadowBlur(): number {
    return this.originContext.shadowBlur;
  }
  set shadowBlur(value: number) {
    this.originContext.shadowBlur = value;
  }

  get shadowColor(): string {
    return this.originContext.shadowColor;
  }
  set shadowColor(value: string) {
    this.originContext.shadowColor = value;
  }

  get shadowOffsetX(): number {
    return this.originContext.shadowOffsetX;
  }
  set shadowOffsetX(value: number) {
    this.originContext.shadowOffsetX = value;
  }

  get shadowOffsetY(): number {
    return this.originContext.shadowOffsetY;
  }
  set shadowOffsetY(value: number) {
    this.originContext.shadowOffsetY = value;
  }

  get strokeStyle(): string | CanvasGradient | CanvasPattern {
    return this.originContext.strokeStyle;
  }
  set strokeStyle(value: string | CanvasGradient | CanvasPattern) {
    this.originContext.strokeStyle = value;
  }

  get textAlign(): CanvasTextAlign {
    return this.originContext.textAlign as any;
  }
  set textAlign(value: CanvasTextAlign) {
    this.originContext.textAlign = value as any;
  }

  get textBaseline(): CanvasTextBaseline {
    return this.originContext.textBaseline as any;
  }
  set textBaseline(value: CanvasTextBaseline) {
    this.originContext.textBaseline = value;
  }

  // Matrix-related getter
  get currentMatrix() {
    return this.originContext.currentMatrix;
  }

  // Forward all other methods to originContext
  // Transform methods
  save(): void {
    return this.originContext.save();
  }
  restore(): void {
    return this.originContext.restore();
  }
  highPerformanceSave(): void {
    return this.originContext.highPerformanceSave();
  }
  highPerformanceRestore(): void {
    return this.originContext.highPerformanceRestore();
  }
  rotate(rad: number, setTransform?: boolean): void {
    return this.originContext.rotate(rad, setTransform);
  }
  scale(sx: number, sy: number, setTransform?: boolean): void {
    return this.originContext.scale(sx, sy, setTransform);
  }
  setScale(sx: number, sy: number, setTransform?: boolean): void {
    return this.originContext.setScale(sx, sy, setTransform);
  }
  scalePoint(sx: number, sy: number, px: number, py: number, setTransform?: boolean): void {
    return this.originContext.scalePoint(sx, sy, px, py, setTransform);
  }
  setTransform(
    a: number,
    b: number,
    c: number,
    d: number,
    e: number,
    f: number,
    setTransform?: boolean,
    dpr?: number
  ): void {
    return this.originContext.setTransform(a, b, c, d, e, f, setTransform, dpr);
  }
  setTransformFromMatrix(matrix: Matrix, setTransform?: boolean, dpr?: number): void {
    return this.originContext.setTransformFromMatrix(matrix, setTransform, dpr);
  }
  resetTransform(setTransform?: boolean, dpr?: number): void {
    return this.originContext.resetTransform(setTransform, dpr);
  }
  transform(a: number, b: number, c: number, d: number, e: number, f: number, setTransform?: boolean): void {
    return this.originContext.transform(a, b, c, d, e, f, setTransform);
  }
  transformFromMatrix(matrix: Matrix, setTransform?: boolean): void {
    return this.originContext.transformFromMatrix(matrix, setTransform);
  }
  translate(x: number, y: number, setTransform?: boolean): void {
    return this.originContext.translate(x, y, setTransform);
  }
  rotateDegrees(deg: number, setTransform?: boolean): void {
    return this.originContext.rotateDegrees(deg, setTransform);
  }
  rotateAbout(rad: number, x: number, y: number, setTransform?: boolean): void {
    return this.originContext.rotateAbout(rad, x, y, setTransform);
  }
  rotateDegreesAbout(deg: number, x: number, y: number, setTransform?: boolean): void {
    return this.originContext.rotateDegreesAbout(deg, x, y, setTransform);
  }

  setTransformForCurrent(force: boolean = false) {
    return this.originContext.setTransformForCurrent(force);
  }

  // Drawing methods
  clip(fillRule?: CanvasFillRule): void;
  clip(path: Path2D, fillRule?: CanvasFillRule): void;
  clip(path?: Path2D | CanvasFillRule, fillRule?: CanvasFillRule): void {
    return (this.originContext.clip as any)(path, fillRule);
  }
  fill(path?: Path2D, fillRule?: CanvasFillRule): void {
    return this.originContext.fill(path, fillRule);
  }
  stroke(path?: Path2D): void {
    return this.originContext.stroke(path);
  }
  fillRect(x: number, y: number, width: number, height: number): void {
    return this.originContext.fillRect(x, y, width, height);
  }
  strokeRect(x: number, y: number, width: number, height: number): void {
    return this.originContext.strokeRect(x, y, width, height);
  }
  fillText(text: string, x: number, y: number, z?: number): void {
    return this.originContext.fillText(text, x, y, z);
  }
  strokeText(text: string, x: number, y: number, z?: number): void {
    return this.originContext.strokeText(text, x, y, z);
  }
  clearRect(x: number, y: number, w: number, h: number): void {
    return this.originContext.clearRect(x, y, w, h);
  }

  // Image methods
  drawImage(...args: any[]): void {
    return (this.originContext.drawImage as any)(...args);
  }
  createImageData(...args: any[]): ImageData {
    return (this.originContext.createImageData as any)(...args);
  }
  getImageData(sx: number, sy: number, sw: number, sh: number): ImageData {
    return this.originContext.getImageData(sx, sy, sw, sh);
  }
  putImageData(imagedata: ImageData, dx: number, dy: number): void {
    return this.originContext.putImageData(imagedata, dx, dy);
  }

  // Gradient/Pattern methods
  createLinearGradient(x0: number, y0: number, x1: number, y1: number): CanvasGradient {
    return this.originContext.createLinearGradient(x0, y0, x1, y1);
  }
  createRadialGradient(x0: number, y0: number, r0: number, x1: number, y1: number, r1: number): CanvasGradient {
    return this.originContext.createRadialGradient(x0, y0, r0, x1, y1, r1);
  }
  createConicGradient(x: number, y: number, startAngle: number, endAngle: number): IConicalGradientData {
    return this.originContext.createConicGradient(x, y, startAngle, endAngle);
  }
  createPattern(image: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement, repetition: string): CanvasPattern {
    return this.originContext.createPattern(image, repetition);
  }

  // Line style methods
  getLineDash(): number[] {
    return this.originContext.getLineDash();
  }
  setLineDash(segments: number[]): void {
    return this.originContext.setLineDash(segments);
  }

  // Utility methods
  clear(): void {
    return this.originContext.clear();
  }
  measureText(text: string, method?: 'native' | 'simple' | 'quick'): { width: number } {
    return this.originContext.measureText(text, method);
  }
  isPointInPath(x: number, y: number): boolean {
    return this.originContext.isPointInPath(x, y);
  }
  isPointInStroke(x: number, y: number): boolean {
    return this.originContext.isPointInStroke(x, y);
  }
  project(x: number, y: number, z?: number): IPointLike {
    return this.originContext.project(x, y, z);
  }
  view(x: number, y: number, z?: number): vec3 {
    return this.originContext.view(x, y, z);
  }

  // Helper methods
  getCanvas(): ICanvas {
    return this.originContext.getCanvas();
  }
  getContext(): CanvasRenderingContext2D | any {
    return this.originContext.getContext();
  }
  setCommonStyle(
    params: ISetCommonStyleParams,
    attribute: ICommonStyleParams,
    offsetX: number,
    offsetY: number,
    defaultParams?: ICommonStyleParams | Partial<ICommonStyleParams>[]
  ): void {
    return this.originContext.setCommonStyle(params, attribute, offsetX, offsetY, defaultParams);
  }
  setShadowBlendStyle(
    params: ISetCommonStyleParams,
    attribute: ICommonStyleParams,
    defaultParams?: ICommonStyleParams | Partial<ICommonStyleParams>[]
  ): void {
    return this.originContext.setShadowBlendStyle(params, attribute, defaultParams);
  }
  setStrokeStyle(
    params: ISetStrokeStyleParams,
    attribute: IStrokeStyleParams,
    offsetX: number,
    offsetY: number,
    defaultParams?: IStrokeStyleParams | any
  ): void {
    return this.originContext.setStrokeStyle(params, attribute, offsetX, offsetY, defaultParams);
  }
  setTextStyle(params: Partial<ITextStyleParams>, defaultParams?: ITextStyleParams, z?: number): void {
    return this.originContext.setTextStyle(params, defaultParams, z);
  }
  setTextStyleWithoutAlignBaseline(
    params: Partial<ITextStyleParams>,
    defaultParams?: ITextStyleParams,
    z?: number
  ): void {
    return this.originContext.setTextStyleWithoutAlignBaseline(params, defaultParams, z);
  }
  clearMatrix(setTransform?: boolean, dpr?: number): void {
    return this.originContext.clearMatrix(setTransform, dpr);
  }
  setClearMatrix(a: number, b: number, c: number, d: number, e: number, f: number): void {
    return this.originContext.setClearMatrix(a, b, c, d, e, f);
  }
  onlyTranslate(dpr?: number): boolean {
    return this.originContext.onlyTranslate(dpr);
  }
  cloneMatrix(m: Matrix): Matrix {
    return this.originContext.cloneMatrix(m);
  }
  draw(): void {
    return this.originContext.draw();
  }
  release(...params: any): void {
    return this.originContext.release(...params);
  }
}
