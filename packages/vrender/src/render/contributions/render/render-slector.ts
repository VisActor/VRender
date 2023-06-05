import { injectable } from 'inversify';
import { IGraphic } from '../../../interface';
import { IGraphicRender } from './graphic-render';

export interface IRenderSelector {
  selector: (graphic: IGraphic) => IGraphicRender | null;
}

@injectable()
export abstract class DefaultRenderSelector implements IRenderSelector {
  selector(graphic: IGraphic): IGraphicRender | null {
    return null;
  }
}
