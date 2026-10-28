import type { IStage, IStageParams, IWindow } from '../../src/interface';
import type { Stage } from '../../src/core/stage';

// Compile-only regression: preserve boolean consumers, legacy object literals/variables/callbacks,
// and both the public interface and concrete Stage entrypoints.
export function stageApiCompatibility(stage: IStage, concrete: Stage, target: IWindow, options: IStageParams) {
  const enabled: boolean = options.interactiveLayer;
  const legacy = { x: 10, y: 20, width: 30, height: 40 };
  stage.renderTo(target, { x: 10, y: 20, width: 30, height: 40 });
  stage.renderTo(target, legacy);
  concrete.renderTo(target);
  concrete.renderTo(target, legacy);
  const callback: (window: IWindow, params: typeof legacy) => void = stage.renderTo;
  callback(target, legacy);
  stage.renderTo(target);
  stage.renderTo(target, { clear: false });
  concrete.renderTo(target, { clear: false });
  const group: Partial<IStageParams> = { interactiveLayer: false, interactiveGroup: true };
  // @ts-expect-error interactiveLayer remains boolean; group is a separate option.
  const invalid: Partial<IStageParams> = { interactiveLayer: 'group' };
  return { enabled, group, invalid };
}
