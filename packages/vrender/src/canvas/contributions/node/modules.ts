import { ContainerModule } from 'inversify';
import { NodeCanvas } from './canvas';
import { NodeContext2d } from './context';
import { CanvasFactory, Context2dFactory } from '../../interface';
import { CanvasConfigType, ICanvas } from '../../../interface';

export default new ContainerModule(bind => {
  bind(CanvasFactory)
    .toDynamicValue(() => {
      return (params: CanvasConfigType) => new NodeCanvas(params);
    })
    .whenTargetNamed(NodeCanvas.env);

  bind(Context2dFactory)
    .toDynamicValue(() => {
      return (params: ICanvas, dpr: number) => new NodeContext2d(params, dpr);
    })
    .whenTargetNamed(NodeContext2d.env);
});
