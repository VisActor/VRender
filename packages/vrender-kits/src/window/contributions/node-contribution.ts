// import { inject, injectable } from 'inversify';
// import type {
//   EnvType,
//   IGlobal,
//   IWindowHandlerContribution,
//   IWindowParams,
//   IContext2d,
//   ICanvas,
//   IDomRectLike
// } from '@visactor/vrender';
// import { Generator, Global, BaseWindowHandlerContribution } from '@visactor/vrender';
// import { NodeCanvas } from '../../canvas/contributions/node/canvas';
// import type { IBoundsLike } from '@visactor/vutils';

// @injectable()
// export class NodeWindowHandlerContribution extends BaseWindowHandlerContribution implements IWindowHandlerContribution {
//   type: EnvType = 'node';

//   canvas: ICanvas;
//   get container(): HTMLElement | null {
//     return null;
//   }

//   constructor(@inject(Global) private readonly global: IGlobal) {
//     super();
//   }

//   getTitle(): string {
//     return '';
//   }

//   getWH(): { width: number; height: number } {
//     return {
//       width: this.canvas.displayWidth,
//       height: this.canvas.displayHeight
//     };
//   }

//   getXY(): { x: number; y: number } {
//     return { x: 0, y: 0 };
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
//       id: Generator.GenAutoIncrementId().toString(),
//       canvasControled: true
//     };
//     this.canvas = new NodeCanvas(options);
//   }
//   private createWindowByCanvas(params: IWindowParams) {
//     // 获取canvas
//     const canvas = params!.canvas as HTMLCanvasElement | null;

//     // 如果没有传入wh，或者是不受控制的canvas，那就用canvas的原始wh
//     let width = params.width;
//     let height = params.height;
//     if (width == null || height == null || !params.canvasControled) {
//       width = canvas.width;
//       height = canvas.height;
//     }

//     this.canvas = new NodeCanvas({
//       width: width,
//       height: height,
//       dpr: 1,
//       nativeCanvas: canvas,
//       canvasControled: params.canvasControled
//     });
//   }
//   releaseWindow(): void {
//     this.canvas.release();
//   }
//   resizeWindow(width: number, height: number): void {
//     this.canvas.resize(width, height);
//   }
//   setDpr(dpr: number): void {
//     this.canvas.dpr = dpr;
//   }

//   getContext(): IContext2d {
//     return this.canvas.getContext();
//   }
//   getNativeHandler(): ICanvas {
//     return this.canvas;
//   }
//   getDpr(): number {
//     return this.canvas.dpr;
//   }

//   getImageBuffer(type: string = 'image/png'): any {
//     const canvas = this.canvas.nativeCanvas;
//     return canvas.toBuffer(type);
//   }

//   addEventListener<K extends keyof DocumentEventMap>(
//     type: K,
//     listener: (this: Document, ev: DocumentEventMap[K]) => any,
//     options?: boolean | AddEventListenerOptions
//   ): void;
//   addEventListener(
//     type: string,
//     listener: EventListenerOrEventListenerObject,
//     options?: boolean | AddEventListenerOptions
//   ): void;
//   addEventListener(type: unknown, listener: unknown, options?: unknown): void {
//     return;
//   }

//   dispatchEvent(event: any): boolean {
//     return true;
//   }

//   removeEventListener<K extends keyof DocumentEventMap>(
//     type: K,
//     listener: (this: Document, ev: DocumentEventMap[K]) => any,
//     options?: boolean | EventListenerOptions
//   ): void;
//   removeEventListener(
//     type: string,
//     listener: EventListenerOrEventListenerObject,
//     options?: boolean | EventListenerOptions
//   ): void;
//   removeEventListener(type: unknown, listener: unknown, options?: unknown): void {
//     return;
//   }

//   getStyle(): CSSStyleDeclaration | Record<string, any> {
//     return;
//   }
//   setStyle(style: CSSStyleDeclaration | Record<string, any>): void {
//     return;
//   }

//   getBoundingClientRect(): IDomRectLike {
//     return null;
//   }

//   clearViewBox(vb: IBoundsLike, color?: string): void {
//     return;
//   }
// }
