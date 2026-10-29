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
  stage.renderTo(target, undefined, { clear: false });
  stage.renderTo(target, legacy, { clear: false });
  concrete.renderTo(target, undefined, { clear: false });
  concrete.renderTo(target, legacy, { clear: false });
  // @ts-expect-error New drawing options must not change the legacy rectangle argument.
  stage.renderTo(target, { clear: false });
  // @ts-expect-error Legacy rectangle fields remain required when the second argument is supplied.
  stage.renderTo(target, { x: 10 });
  // @ts-expect-error Legacy rectangle fields do not belong to drawing options.
  stage.renderTo(target, undefined, { x: 10 });
  const virtual: Partial<IStageParams> = { interactiveLayer: true, interactiveLayerMode: 'virtual' };
  // @ts-expect-error interactiveLayer remains boolean; the layer mode is a separate option.
  const invalid: Partial<IStageParams> = { interactiveLayer: 'group' };
  return { enabled, virtual, invalid };
}
