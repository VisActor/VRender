import { injectable, BaseRender } from '@visactor/vrender-core';
import type { IGraphicAttribute, IGraphic } from '@visactor/vrender-core';

@injectable()
export abstract class BasePicker<T extends IGraphic<Partial<IGraphicAttribute>>> extends BaseRender<T> {}
