import { MathImagePicker, MathPickerContribution } from '../constants';
import { DefaultMathImagePicker } from './image-picker';

let loadImagePick = false;
export function bindImageMathPickerContribution(container: any) {
  if (loadImagePick) {
    return;
  }
  loadImagePick = true;
  container
    .bind(MathImagePicker)
    .toDynamicValue(() => new DefaultMathImagePicker())
    .inSingletonScope();
  container.bind(MathPickerContribution).toService(MathImagePicker);
}
