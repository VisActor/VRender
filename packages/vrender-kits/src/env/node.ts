import { container, ContainerModule, type Container, EnvContribution } from '@visactor/vrender-core';
// import { loadMathPicker } from '../picker/math-module';
// import { nodeEnvModule } from './contributions/module';
import { nodeCanvasModule } from '../canvas/contributions/node/modules';
import { nodeWindowModule } from '../window/contributions/node-contribution';
import { NodeEnvContribution } from './contributions/node-contribution';

export const nodeEnvModule = new ContainerModule(bind => {
  // node
  if (!(nodeEnvModule as any).isNodeBound) {
    (nodeEnvModule as any).isNodeBound = true;
    bind(NodeEnvContribution).toSelf().inSingletonScope();
    bind(EnvContribution).toService(NodeEnvContribution);
  }
});

(nodeEnvModule as any).isNodeBound = false;

export function loadNodeEnv(container: Container, loadPicker: boolean = true) {
  if (!loadNodeEnv.__loaded) {
    loadNodeEnv.__loaded = true;
    container.load(nodeEnvModule);
    container.load(nodeCanvasModule);
    container.load(nodeWindowModule);
    // loadPicker && loadMathPicker(container);
  }
}
loadNodeEnv.__loaded = false;

export function initNodeEnv() {
  loadNodeEnv(container);
}
