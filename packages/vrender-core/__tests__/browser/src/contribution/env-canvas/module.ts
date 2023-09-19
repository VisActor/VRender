import { ContainerModule } from 'inversify';
import type { CanvasConfigType, ICanvas } from '@visactor/vrender';
import {
  CanvasFactory,
  Context2dFactory,
  EnvContribution,
  WindowHandlerContribution,
  container
} from '@visactor/vrender';
import { NodeCanvas } from './canvas';
import { NodeContext2d } from './context';
import { NodeEnvContribution } from './env-contribution';
import { NodeWindowHandlerContribution } from './window-contribution';

const windowModule = new ContainerModule(bind => {
  bind(NodeWindowHandlerContribution).toSelf().inSingletonScope();
  bind(WindowHandlerContribution).toService(NodeWindowHandlerContribution);
  // bindContributionProvider(bind, WindowHandlerContribution);
});

const envModule = new ContainerModule(bind => {
  bind(NodeEnvContribution).toSelf().inSingletonScope();
  bind(EnvContribution).toService(NodeEnvContribution);
});

const canvasModule = new ContainerModule(bind => {
  bind(CanvasFactory)
    .toDynamicValue(() => {
      return (params: CanvasConfigType) => new NodeCanvas(params);
    })
    .whenTargetNamed(NodeContext2d.env);

  bind(Context2dFactory)
    .toDynamicValue(() => {
      return (params: ICanvas) => new NodeContext2d(params, params.dpr);
    })
    .whenTargetNamed(NodeContext2d.env);
});

container.load(envModule);
container.load(canvasModule);
container.load(windowModule);
