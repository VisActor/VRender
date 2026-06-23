import type { IStage } from '../interface';
import { Stage } from '../core/stage';
import type { IStageConstructor, IStageDependenciesFactory, IStageFactory } from './types';

export class StageFactory<TStage extends IStage = IStage> implements IStageFactory<TStage> {
  constructor(
    private readonly StageCtor: IStageConstructor<TStage> = Stage as unknown as IStageConstructor<TStage>,
    private readonly depsFactory?: IStageDependenciesFactory
  ) {}

  create(params = {}) {
    return new this.StageCtor(params, this.depsFactory?.());
  }
}
