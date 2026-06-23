import { PolygonRender } from '@visactor/vrender-core';
import { resolveContainerBinding } from '../../../common/explicit-binding';
import { CanvasPickerContribution, CanvasPolygonPicker } from '../constants';
import { DefaultCanvasPolygonPicker } from './polygon-picker';

let loadPolygonPick = false;
export function bindPolygonCanvasPickerContribution(container: any) {
  if (loadPolygonPick) {
    return;
  }
  loadPolygonPick = true;
  container
    .bind(CanvasPolygonPicker)
    .toDynamicValue(() => new DefaultCanvasPolygonPicker(resolveContainerBinding(container, PolygonRender)))
    .inSingletonScope();
  container.bind(CanvasPickerContribution).toService(CanvasPolygonPicker);
}
