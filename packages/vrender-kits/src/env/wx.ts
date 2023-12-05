import { container, ContainerModule, type Container, EnvContribution } from '@visactor/vrender-core';
import { loadMathPicker } from '../picker/math-module';
// import { wxEnvModule } from './contributions/module';
import { wxCanvasModule } from '../canvas/contributions/wx/modules';
import { wxWindowModule } from '../window/contributions/wx-contribution';
import { WxEnvContribution } from './contributions/wx-contribution';

let isWxBound = false;
export const wxEnvModule = new ContainerModule(bind => {
  // wx
  if (!isWxBound) {
    isWxBound = true;
    bind(WxEnvContribution).toSelf().inSingletonScope();
    bind(EnvContribution).toService(WxEnvContribution);
  }
});

let loaded = false;
export function loadWxEnv(container: Container, loadPicker: boolean = true) {
  if (!loaded) {
    loaded = true;
    container.load(wxEnvModule);
    container.load(wxCanvasModule);
    container.load(wxWindowModule);
    loadPicker && loadMathPicker(container);
  }
}

export function initWxEnv() {
  loadWxEnv(container);
}
