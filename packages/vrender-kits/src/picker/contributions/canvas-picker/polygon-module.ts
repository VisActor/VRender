import { ContainerModule } from '@visactor/vrender-core';
import { CanvasPickerContribution, CanvasPolygonPicker } from '../constants';
import { DefaultCanvasPolygonPicker } from './polygon-picker';

let loadPolygonPick = false;
export const polygonCanvasPickModule = new ContainerModule((bind, unbind, isBound, rebind) => {
  if (loadPolygonPick) {
    return;
  }
  loadPolygonPick = true;
  // polygon picker
  bind(CanvasPolygonPicker).to(DefaultCanvasPolygonPicker).inSingletonScope();
  bind(CanvasPickerContribution).toService(CanvasPolygonPicker);
});
