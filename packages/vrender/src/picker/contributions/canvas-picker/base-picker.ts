import { injectable } from '../../../common/inversify-lite';
import type { IGraphicAttribute, IGraphic } from '../../../interface';
import { BaseRender } from '../../../render/contributions/render/base-render';

@injectable()
export abstract class BasePicker<T extends IGraphic<Partial<IGraphicAttribute>>> extends BaseRender<T> {}
