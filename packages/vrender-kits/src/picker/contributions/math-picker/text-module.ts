import { MathPickerContribution, MathTextPicker } from '../constants';
import { DefaultMathTextPicker } from './text-picker';

let loadTextPick = false;
export function bindTextMathPickerContribution(container: any) {
  if (loadTextPick) {
    return;
  }
  loadTextPick = true;
  container
    .bind(MathTextPicker)
    .toDynamicValue(() => new DefaultMathTextPicker())
    .inSingletonScope();
  container.bind(MathPickerContribution).toService(MathTextPicker);
}
