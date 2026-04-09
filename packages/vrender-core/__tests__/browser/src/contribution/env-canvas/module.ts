/** @deprecated Legacy DI browser fixture retained for major-migration tracking. Prefer app-scoped entries/plugins. */
import type { CanvasConfigType, ICanvas } from '@visactor/vrender';
import {
  CanvasFactory,
  Context2dFactory,
  EnvContribution,
  WindowHandlerContribution,
  getLegacyBindingContext
} from '@visactor/vrender';
import { NodeCanvas } from './canvas';
import { NodeContext2d } from './context';
import { NodeEnvContribution } from './env-contribution';
import { NodeWindowHandlerContribution } from './window-contribution';

const legacyContext = getLegacyBindingContext();

legacyContext.bind(NodeEnvContribution).toSelf().inSingletonScope();
legacyContext.bind(EnvContribution).toService(NodeEnvContribution);

legacyContext
  .bind(CanvasFactory)
  .toDynamicValue(() => {
    return (params: CanvasConfigType) => new NodeCanvas(params);
  })
  .whenTargetNamed(NodeContext2d.env);

legacyContext
  .bind(Context2dFactory)
  .toDynamicValue(() => {
    return (params: ICanvas) => new NodeContext2d(params, params.dpr);
  })
  .whenTargetNamed(NodeContext2d.env);

legacyContext.bind(NodeWindowHandlerContribution).toSelf().inSingletonScope();
legacyContext.bind(WindowHandlerContribution).toService(NodeWindowHandlerContribution);
