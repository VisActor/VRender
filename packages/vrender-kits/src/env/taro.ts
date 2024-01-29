import { container, ContainerModule, type Container, EnvContribution } from '@visactor/vrender-core';
import { loadMathPicker } from '../picker/math-module';
// import { taroEnvModule } from './contributions/module';
import { taroCanvasModule } from '../canvas/contributions/taro/modules';
import { taroWindowModule } from '../window/contributions/taro-contribution';
import { TaroEnvContribution } from './contributions/taro-contribution';

export const taroEnvModule = new ContainerModule(bind => {
  // taro
  if (!(taroEnvModule as any).isTaroBound) {
    (taroEnvModule as any).isTaroBound = true;
    bind(TaroEnvContribution).toSelf().inSingletonScope();
    bind(EnvContribution).toService(TaroEnvContribution);
  }
});

(taroEnvModule as any).isTaroBound = false;

export function loadTaroEnv(container: Container, loadPicker: boolean = true) {
  if (!loadTaroEnv.__loaded) {
    loadTaroEnv.__loaded = true;
    container.load(taroEnvModule);
    container.load(taroCanvasModule);
    container.load(taroWindowModule);
    loadPicker && loadMathPicker(container);
  }
}

loadTaroEnv.__loaded = false;

export function initTaroEnv() {
  loadTaroEnv(container);
}
