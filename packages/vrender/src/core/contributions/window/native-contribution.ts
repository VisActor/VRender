// import { createCanvas, createImageData, loadImage } from 'canvas';
// import { inject, injectable } from 'inversify';
// import { Global, IWindow, EnvType, IGlobal, IWindowHandlerContribution, IWindowParams } from '../..';
// import { BaseWindowHandlerContribution } from './base-contribution';

// type NodePkg = {
//   createCanvas: typeof createCanvas;
//   createImageData: typeof createImageData;
//   loadImage: typeof loadImage;
// };

// @injectable()
// export class NodeWindowHandlerContribution extends BaseWindowHandlerContribution implements IWindowHandlerContribution {
//   type: EnvType = 'native';

//   pkg: NodePkg;

//   configure(window: IWindow, global: IGlobal) {
//     if (global.env === this.type) {
//       window.setWindowHandler(this);
//       this.pkg = global.envParams;
//     }
//   }

//   get container(): HTMLElement | null {
//     // return this.canvas.nativeCanvas.parentElement;
//     return null;
//   }

//   constructor(@inject(Global) private readonly global: IGlobal) {
//     super();
//   }

//   createWindow(params: IWindowParams): void {
//     // 如果没有传入canvas，那么就创建一个canvas
//     params.CreateWindow && params.CreateWindow(params.width, params.height, params.title);
//   }

//   destroyWindow(): void {
//     return;
//   }
//   resizeWindow(width: number, height: number): void {
//     return;
//   }
//   setDpr(dpr: number): void {
//     return;
//   }

//   getContext(): any {
//     throw new Error('暂不支持');
//   }

//   getWH(): { width: number; height: number } {
//     throw new Error('暂不支持');
//   }
//   getTitle(): string {
//     throw new Error('暂不支持');
//   }
//   getXY(): { x: number; y: number } {
//     throw new Error('暂不支持');
//   }
// }
