import { injectable } from 'inversify';
import { IGraphicAttribute, IContext2d, IGraphic, IMarkAttribute, IThemeAttribute, mat4 } from '../../../interface';
import { BaseRender } from '../../../render/contributions/render/base-render';

@injectable()
export abstract class BasePicker<T extends IGraphic<Partial<IGraphicAttribute>>> extends BaseRender<T> {}
