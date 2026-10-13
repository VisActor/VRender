interface IGeneratorState {
  autoIncrementId: number;
}

const GENERATOR_STATE_SYMBOL = Symbol.for('@visactor/vrender-core/generator-state');

function getGeneratorState(): IGeneratorState {
  const scope = globalThis as typeof globalThis & {
    [GENERATOR_STATE_SYMBOL]?: IGeneratorState;
  };
  return scope[GENERATOR_STATE_SYMBOL] || (scope[GENERATOR_STATE_SYMBOL] = { autoIncrementId: 0 });
}

// Application and legacy runtime state are shared across bundles. Keep node ids in the same
// global scope so a shared Stage cannot receive a Layer with a colliding id from another bundle.
const generatorState = getGeneratorState();

export class Generator {
  static GenAutoIncrementId(): number {
    return generatorState.autoIncrementId++;
  }
}
