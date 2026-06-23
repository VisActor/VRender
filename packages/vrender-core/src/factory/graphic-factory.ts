import type { IGraphic, IGraphicAttribute } from '../interface/graphic';
import type { IGraphicConstructor, IGraphicFactory } from './types';

export class GraphicFactory implements IGraphicFactory {
  private readonly registry = new Map<string, IGraphicConstructor>();

  create<
    TGraphic extends IGraphic = IGraphic,
    TAttributes extends Partial<IGraphicAttribute> = Partial<IGraphicAttribute>
  >(type: string, attributes: TAttributes): TGraphic {
    const GraphicCtor = this.registry.get(type) as IGraphicConstructor<TGraphic, TAttributes> | undefined;

    if (!GraphicCtor) {
      throw new Error(`GraphicFactory has no creator registered for type "${type}"`);
    }

    return new GraphicCtor(attributes);
  }

  register<
    TGraphic extends IGraphic = IGraphic,
    TAttributes extends Partial<IGraphicAttribute> = Partial<IGraphicAttribute>
  >(type: string, ctor: IGraphicConstructor<TGraphic, TAttributes>): void {
    if (!type) {
      throw new Error('GraphicFactory requires a non-empty graphic type');
    }

    this.registry.set(type, ctor as IGraphicConstructor);
  }
}
