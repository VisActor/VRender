import { Stage } from './core/stage';
import { IStageParams } from './interface/stage';

export function createStage(params: Partial<IStageParams>) {
  return new Stage(params);
  // return container.get<(params: Partial<IStageParams>) => IStage>(StageFactory)(params);
}
