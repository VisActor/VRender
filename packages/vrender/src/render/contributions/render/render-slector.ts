import { injectable } from 'inversify';
import type { IGraphic, IGraphicRender, IRenderSelector } from '../../../interface';

@injectable()
export abstract class DefaultRenderSelector implements IRenderSelector {
  selector(graphic: IGraphic): IGraphicRender | null {
    return null;
  }
}
