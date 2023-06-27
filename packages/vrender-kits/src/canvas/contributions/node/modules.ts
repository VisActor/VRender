// import { ContainerModule } from 'inversify';
// import type { CanvasConfigType, ICanvas } from '@visactor/vrender';
// import { CanvasFactory, Context2dFactory } from '@visactor/vrender';
// import { NodeCanvas } from './canvas';
// import { NodeContext2d } from './context';

// export default new ContainerModule(bind => {
//   bind(CanvasFactory)
//     .toDynamicValue(() => {
//       return (params: CanvasConfigType) => new NodeCanvas(params);
//     })
//     .whenTargetNamed(NodeContext2d.env);

//   bind(Context2dFactory)
//     .toDynamicValue(() => {
//       return (params: ICanvas) => new NodeContext2d(params, params.dpr);
//     })
//     .whenTargetNamed(NodeContext2d.env);
// });
