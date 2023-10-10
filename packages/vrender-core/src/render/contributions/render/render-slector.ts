import { injectable } from '../../../common/inversify-lite';
import type { IGraphic, IGraphicRender, IRenderSelector } from '../../../interface';

@injectable()
export abstract class DefaultRenderSelector implements IRenderSelector {
  selector(graphic: IGraphic): IGraphicRender | null {
    return null;
  }
}
