import { container, ContainerModule, type Container, EnvContribution } from '@visactor/vrender-core';
import { loadMathPicker } from '../picker/math-module';
// import { wxEnvModule } from './contributions/module';
import { wxCanvasModule } from '../canvas/contributions/wx/modules';
import { wxWindowModule } from '../window/contributions/wx-contribution';
import { WxEnvContribution } from './contributions/wx-contribution';

export const wxEnvModule = new ContainerModule(bind => {
  // wx
  if (!(wxEnvModule as any)._isWxBound) {
    (wxEnvModule as any)._isWxBound = true;
    bind(WxEnvContribution).toSelf().inSingletonScope();
    bind(EnvContribution).toService(WxEnvContribution);
  }
});

(wxEnvModule as any)._isWxBound = false;

export function loadWxEnv(container: Container, loadPicker: boolean = true) {
  if (!loadWxEnv.__loaded) {
    loadWxEnv.__loaded = true;
    container.load(wxEnvModule);
    container.load(wxCanvasModule);
    container.load(wxWindowModule);
    loadPicker && loadMathPicker(container);
  }
}

loadWxEnv.__loaded = false;

export function initWxEnv() {
  loadWxEnv(container);
}
