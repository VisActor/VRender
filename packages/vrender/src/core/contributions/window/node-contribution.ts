// import { createCanvas, createImageData, loadImage } from 'canvas';
// import { inject, injectable } from 'inversify';
// import { Canvas } from '../../../canvas';
// import { Generator } from '../../../common';
// import { Global, IWindow, EnvType, IGlobal, IWindowHandlerContribution, IWindowParams } from '../..';
// import { BaseWindowHandlerContribution } from './base-contribution';
// import { ICanvas } from '../../../interface/canvas';

// type NodePkg = {
//   createCanvas: typeof createCanvas;
//   createImageData: typeof createImageData;
//   loadImage: typeof loadImage;
// };

// @injectable()
// export class NodeWindowHandlerContribution extends BaseWindowHandlerContribution implements IWindowHandlerContribution {
//   type: EnvType = 'node';

//   pkg: NodePkg;

//   configure(window: IWindow, global: IGlobal) {
//     if (global.env === this.type) {
//       window.setWindowHandler(this);
//       this.pkg = global.envParams;
//     }
//   }

//   canvas: Canvas;
//   get container(): HTMLElement | null {
//     return this.canvas.nativeCanvas.parentElement;
//   }

//   constructor(@inject(Global) private readonly global: IGlobal) {
//     super();
//   }

//   createWindow(params: IWindowParams): void {
//     // 如果没有传入canvas，那么就创建一个canvas
//     if (!params.canvas) {
//       this.createWindowByConfig(params);
//     } else {
//       this.createWindowByCanvas(params);
//     }
//   }
//   private createWindowByConfig(params: IWindowParams) {
//     // 创建canvas
//     const nativeCanvas = this.global.createCanvas({ width: params.width, height: params.height });

//     // 绑定
//     const options = {
//       width: params.width,
//       height: params.height,
//       dpr: params.dpr,
//       nativeCanvas,
//       id: Generator.GenAutoIncrementId().toString()
//     };
//     this.canvas = new Canvas(options);
//   }
//   private createWindowByCanvas(params: IWindowParams) {
//     // 获取canvas
//     let canvas: HTMLCanvasElement | null;
//     if (typeof params.canvas === 'string') {
//       throw new Error('node环境不允许传入canvasId获取canvas');
//     } else {
//       canvas = params!.canvas as HTMLCanvasElement | null;
//     }
//     if (!canvas) {
//       throw new Error('发生错误，传入的canvas不正确');
//     }

//     this.canvas = new Canvas({
//       width: params.width,
//       height: params.height,
//       dpr: params.dpr,
//       nativeCanvas: canvas
//     });
//   }
//   destroyWindow(): void {
//     this.canvas.destroy();
//   }
//   resizeWindow(width: number, height: number): void {
//     this.canvas.resize(width, height);
//   }
//   setDpr(dpr: number): void {
//     this.canvas.dpr = dpr;
//   }

//   getNativeHandler(): ICanvas {
//     return this.canvas;
//   }
//   getDpr(): number {
//     return this.canvas.dpr;
//   }
//   getContext(): any {
//     throw new Error('暂不支持');
//   }
//   getTitle(): string {
//     throw new Error('暂不支持');
//   }
//   getWH(): { width: number; height: number } {
//     throw new Error('暂不支持');
//   }
//   getXY(): { x: number; y: number } {
//     throw new Error('暂不支持');
//   }
// }
