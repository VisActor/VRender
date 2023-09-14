// // import { IMatrix, IMatrixLike, Matrix } from '@visactor/vutils';
// import { IAllocate } from './interface';
// import {
//   IArc,
//   IArcGraphicAttribute,
//   IArea,
//   IAreaGraphicAttribute,
//   ICircle,
//   ICircleGraphicAttribute,
//   IGraphic,
//   ILine,
//   ILineGraphicAttribute,
//   IPath,
//   IPathGraphicAttribute,
//   IRect,
//   IRectGraphicAttribute,
//   ISymbol,
//   ISymbolGraphicAttribute,
//   IText,
//   ITextGraphicAttribute,
//   Releaseable
// } from '../interface';
// import { application } from '../application';

// @injectable()
// export abstract class DefaultGraphicAllocate<T extends IGraphic, IGraphicAttribute>
//   implements IAllocate<T>, Releaseable
// {
//   protected pools: T[] = [];
//   abstract allocate(attribute: IGraphicAttribute): T;
//   abstract allocateByObj(g: T): T;
//   free(d: T) {
//     this.pools.push(d);
//   }
//   get length(): number {
//     return this.pools.length;
//   }
//   release(...params: any): void {
//     this.pools = [];
//   }
// }

// @injectable()
// export class DefaultRectAllocate extends DefaultGraphicAllocate<IRect, IRectGraphicAttribute> {
//   allocate(attribute: IRectGraphicAttribute): IRect {
//     if (!this.pools.length) {
//       return application.graphicService.creator.rect(attribute);
//     }
//     const g = this.pools.pop();
//     g.initAttributes(attribute);
//     return g;
//   }

//   allocateByObj(rect: IRect): IRect {
//     if (!this.pools.length) {
//       return application.graphicService.creator.rect(rect.attribute);
//     }
//     const g = this.pools.pop();
//     g.initAttributes(rect.attribute);
//     return g;
//   }
// }

// @injectable()
// export class DefaultArcAllocate extends DefaultGraphicAllocate<IArc, IArcGraphicAttribute> {
//   allocate(attribute: IArcGraphicAttribute): IArc {
//     if (!this.pools.length) {
//       return application.graphicService.creator.arc(attribute);
//     }
//     const g = this.pools.pop();
//     g.initAttributes(attribute);
//     return g;
//   }

//   allocateByObj(arc: IArc): IArc {
//     if (!this.pools.length) {
//       return application.graphicService.creator.arc(arc.attribute);
//     }
//     const g = this.pools.pop();
//     g.initAttributes(arc.attribute);
//     return g;
//   }
// }

// @injectable()
// export class DefaultAreaAllocate extends DefaultGraphicAllocate<IArea, IAreaGraphicAttribute> {
//   allocate(attribute: IAreaGraphicAttribute): IArea {
//     if (!this.pools.length) {
//       return application.graphicService.creator.area(attribute);
//     }
//     const g = this.pools.pop();
//     g.initAttributes(attribute);
//     return g;
//   }

//   allocateByObj(area: IArea): IArea {
//     if (!this.pools.length) {
//       return application.graphicService.creator.area(area.attribute);
//     }
//     const g = this.pools.pop();
//     g.initAttributes(area.attribute);
//     return g;
//   }
// }

// @injectable()
// export class DefaultCircleAllocate extends DefaultGraphicAllocate<ICircle, ICircleGraphicAttribute> {
//   allocate(attribute: ICircleGraphicAttribute): ICircle {
//     if (!this.pools.length) {
//       return application.graphicService.creator.circle(attribute);
//     }
//     const g = this.pools.pop();
//     g.initAttributes(attribute);
//     return g;
//   }

//   allocateByObj(area: ICircle): ICircle {
//     if (!this.pools.length) {
//       return application.graphicService.creator.circle(area.attribute);
//     }
//     const g = this.pools.pop();
//     g.initAttributes(area.attribute);
//     return g;
//   }
// }

// @injectable()
// export class DefaultLineAllocate extends DefaultGraphicAllocate<ILine, ILineGraphicAttribute> {
//   allocate(attribute: ILineGraphicAttribute): ILine {
//     if (!this.pools.length) {
//       return application.graphicService.creator.line(attribute);
//     }
//     const g = this.pools.pop();
//     g.initAttributes(attribute);
//     return g;
//   }

//   allocateByObj(line: ILine): ILine {
//     if (!this.pools.length) {
//       return application.graphicService.creator.line(line.attribute);
//     }
//     const g = this.pools.pop();
//     g.initAttributes(line.attribute);
//     return g;
//   }
// }

// @injectable()
// export class DefaultPathAllocate extends DefaultGraphicAllocate<IPath, IPathGraphicAttribute> {
//   allocate(attribute: IPathGraphicAttribute): IPath {
//     if (!this.pools.length) {
//       return application.graphicService.creator.path(attribute);
//     }
//     const g = this.pools.pop();
//     g.initAttributes(attribute);
//     return g;
//   }

//   allocateByObj(path: IPath): IPath {
//     if (!this.pools.length) {
//       return application.graphicService.creator.path(path.attribute);
//     }
//     const g = this.pools.pop();
//     g.initAttributes(path.attribute);
//     return g;
//   }
// }

// @injectable()
// export class DefaultSymbolAllocate extends DefaultGraphicAllocate<ISymbol, ISymbolGraphicAttribute> {
//   allocate(attribute: ISymbolGraphicAttribute): ISymbol {
//     if (!this.pools.length) {
//       return application.graphicService.creator.symbol(attribute);
//     }
//     const g = this.pools.pop();
//     g.initAttributes(attribute);
//     return g;
//   }

//   allocateByObj(symbol: ISymbol): ISymbol {
//     if (!this.pools.length) {
//       return application.graphicService.creator.symbol(symbol.attribute);
//     }
//     const g = this.pools.pop();
//     g.initAttributes(symbol.attribute);
//     return g;
//   }
// }

// @injectable()
// export class DefaultTextAllocate extends DefaultGraphicAllocate<IText, ITextGraphicAttribute> {
//   allocate(attribute: ITextGraphicAttribute): IText {
//     if (!this.pools.length) {
//       return application.graphicService.creator.text(attribute);
//     }
//     const g = this.pools.pop();
//     g.initAttributes(attribute);
//     return g;
//   }

//   allocateByObj(text: IText): IText {
//     if (!this.pools.length) {
//       return application.graphicService.creator.text(text.attribute);
//     }
//     const g = this.pools.pop();
//     g.initAttributes(text.attribute);
//     return g;
//   }
// }
