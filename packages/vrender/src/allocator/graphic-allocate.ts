import { injectable } from 'inversify';
// import { IMatrix, IMatrixLike, Matrix } from '@visactor/vutils';
import type { IAllocate } from './interface';
import type {
  IArc,
  IArcGraphicAttribute,
  IArea,
  IAreaGraphicAttribute,
  ICircle,
  ICircleGraphicAttribute,
  IGraphic,
  ILine,
  ILineGraphicAttribute,
  IPath,
  IPathGraphicAttribute,
  IRect,
  IRectGraphicAttribute,
  ISymbol,
  ISymbolGraphicAttribute,
  IText,
  ITextGraphicAttribute,
  Releaseable
} from '../interface';
import { Arc } from '../graphic/arc';
import { Rect } from '../graphic/rect';
import { Area } from '../graphic/area';
import { Circle } from '../graphic/circle';
import { Line } from '../graphic/line';
import { Path } from '../graphic/path';
import { Symbol as SymbolGraphic } from '../graphic/symbol';
import { Text } from '../graphic/text';

@injectable()
export abstract class DefaultGraphicAllocate<T extends IGraphic, IGraphicAttribute>
  implements IAllocate<T>, Releaseable
{
  protected pools: T[] = [];
  abstract allocate(attribute: IGraphicAttribute): T;
  abstract allocateByObj(g: T): T;
  free(d: T) {
    this.pools.push(d);
  }
  get length(): number {
    return this.pools.length;
  }
  release(...params: any): void {
    this.pools = [];
  }
}

@injectable()
export class DefaultRectAllocate extends DefaultGraphicAllocate<IRect, IRectGraphicAttribute> {
  allocate(attribute: IRectGraphicAttribute): IRect {
    if (!this.pools.length) {
      return new Rect(attribute);
    }
    const g = this.pools.pop();
    g.initAttributes(attribute);
    return g;
  }

  allocateByObj(rect: IRect): IRect {
    if (!this.pools.length) {
      return new Rect(rect.attribute);
    }
    const g = this.pools.pop();
    g.initAttributes(rect.attribute);
    return g;
  }
}

@injectable()
export class DefaultArcAllocate extends DefaultGraphicAllocate<IArc, IArcGraphicAttribute> {
  allocate(attribute: IArcGraphicAttribute): IArc {
    if (!this.pools.length) {
      return new Arc(attribute);
    }
    const g = this.pools.pop();
    g.initAttributes(attribute);
    return g;
  }

  allocateByObj(arc: IArc): IArc {
    if (!this.pools.length) {
      return new Arc(arc.attribute);
    }
    const g = this.pools.pop();
    g.initAttributes(arc.attribute);
    return g;
  }
}

@injectable()
export class DefaultAreaAllocate extends DefaultGraphicAllocate<IArea, IAreaGraphicAttribute> {
  allocate(attribute: IAreaGraphicAttribute): IArea {
    if (!this.pools.length) {
      return new Area(attribute);
    }
    const g = this.pools.pop();
    g.initAttributes(attribute);
    return g;
  }

  allocateByObj(area: IArea): IArea {
    if (!this.pools.length) {
      return new Area(area.attribute);
    }
    const g = this.pools.pop();
    g.initAttributes(area.attribute);
    return g;
  }
}

@injectable()
export class DefaultCircleAllocate extends DefaultGraphicAllocate<ICircle, ICircleGraphicAttribute> {
  allocate(attribute: ICircleGraphicAttribute): ICircle {
    if (!this.pools.length) {
      return new Circle(attribute);
    }
    const g = this.pools.pop();
    g.initAttributes(attribute);
    return g;
  }

  allocateByObj(area: ICircle): ICircle {
    if (!this.pools.length) {
      return new Circle(area.attribute);
    }
    const g = this.pools.pop();
    g.initAttributes(area.attribute);
    return g;
  }
}

@injectable()
export class DefaultLineAllocate extends DefaultGraphicAllocate<ILine, ILineGraphicAttribute> {
  allocate(attribute: ILineGraphicAttribute): ILine {
    if (!this.pools.length) {
      return new Line(attribute);
    }
    const g = this.pools.pop();
    g.initAttributes(attribute);
    return g;
  }

  allocateByObj(line: ILine): ILine {
    if (!this.pools.length) {
      return new Line(line.attribute);
    }
    const g = this.pools.pop();
    g.initAttributes(line.attribute);
    return g;
  }
}

@injectable()
export class DefaultPathAllocate extends DefaultGraphicAllocate<IPath, IPathGraphicAttribute> {
  allocate(attribute: IPathGraphicAttribute): IPath {
    if (!this.pools.length) {
      return new Path(attribute);
    }
    const g = this.pools.pop();
    g.initAttributes(attribute);
    return g;
  }

  allocateByObj(path: IPath): IPath {
    if (!this.pools.length) {
      return new Path(path.attribute);
    }
    const g = this.pools.pop();
    g.initAttributes(path.attribute);
    return g;
  }
}

@injectable()
export class DefaultSymbolAllocate extends DefaultGraphicAllocate<ISymbol, ISymbolGraphicAttribute> {
  allocate(attribute: ISymbolGraphicAttribute): ISymbol {
    if (!this.pools.length) {
      return new SymbolGraphic(attribute);
    }
    const g = this.pools.pop();
    g.initAttributes(attribute);
    return g;
  }

  allocateByObj(symbol: ISymbol): ISymbol {
    if (!this.pools.length) {
      return new SymbolGraphic(symbol.attribute);
    }
    const g = this.pools.pop();
    g.initAttributes(symbol.attribute);
    return g;
  }
}

@injectable()
export class DefaultTextAllocate extends DefaultGraphicAllocate<IText, ITextGraphicAttribute> {
  allocate(attribute: ITextGraphicAttribute): IText {
    if (!this.pools.length) {
      return new Text(attribute);
    }
    const g = this.pools.pop();
    g.initAttributes(attribute);
    return g;
  }

  allocateByObj(text: IText): IText {
    if (!this.pools.length) {
      return new Text(text.attribute);
    }
    const g = this.pools.pop();
    g.initAttributes(text.attribute);
    return g;
  }
}
