import type { Container } from '../../common/inversify-lite';
// import { PickerContribution } from '../picker-service';
import canvasPickModule from './canvas-picker/module';
import mathPickModule from './math-picker/module';
// import { ArcPicker, AreaPicker, CirclePicker, ImagePicker, LinePicker, PathPicker, RectPicker, SymbolPicker, TextPicker } from './constants';

// const pickModule = new ContainerModule((bind, unbind, isBound, rebind) => {
//   // circle picker
//   bind(PickerContribution).toService(CirclePicker);

//   // reat picker
//   bind(PickerContribution).toService(RectPicker);

//   // arc picker
//   bind(PickerContribution).toService(ArcPicker);

//   // area picker
//   bind(PickerContribution).toService(AreaPicker);

//   // image picker
//   bind(PickerContribution).toService(ImagePicker);

//   // line picker
//   bind(PickerContribution).toService(LinePicker);

//   // path picker
//   bind(PickerContribution).toService(PathPicker);

//   // symbol picker
//   bind(PickerContribution).toService(SymbolPicker);

//   // text picker
//   bind(PickerContribution).toService(TextPicker);

//   bindContributionProvider(bind, PickerContribution);
// });

export default function load(container: Container) {
  // container.load(pickModule);
  container.load(canvasPickModule);
  container.load(mathPickModule);
}
