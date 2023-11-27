import { container, ContainerModule, type Container, EnvContribution } from '@visactor/vrender-core';
// import { loadMathPicker } from '../picker/math-module';
// import { nodeEnvModule } from './contributions/module';
import { nodeCanvasModule } from '../canvas/contributions/node/modules';
import { nodeWindowModule } from '../window/contributions/node-contribution';
import { NodeEnvContribution } from './contributions/node-contribution';

let isNodeBound = false;
export const nodeEnvModule = new ContainerModule(bind => {
  // node
  if (!isNodeBound) {
    isNodeBound = true;
    bind(NodeEnvContribution).toSelf().inSingletonScope();
    bind(EnvContribution).toService(NodeEnvContribution);
  }
});

let loaded = false;
export function loadNodeEnv(container: Container, loadPicker: boolean = true) {
  if (!loaded) {
    loaded = true;
    container.load(nodeEnvModule);
    container.load(nodeCanvasModule);
    container.load(nodeWindowModule);
    // loadPicker && loadMathPicker(container);
  }
}

export function initNodeEnv() {
  loadNodeEnv(container);
}
