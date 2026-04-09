import { StageFactory } from './factory';
import type { IStageParams } from './interface/stage';
import { configureLegacyApplication } from './modules';

export function createStage(params: Partial<IStageParams>) {
  configureLegacyApplication();
  return new StageFactory().create(params);
}
