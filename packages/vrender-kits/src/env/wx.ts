import { container, type Container } from '@visactor/vrender-core';
import { loadMathPicker } from '../picker/math-module';
import { wxEnvModule } from './contributions/module';
import { wxCanvasModule } from '../canvas/contributions/wx/modules';
import { wxWindowModule } from '../window/contributions/wx-contribution';

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
