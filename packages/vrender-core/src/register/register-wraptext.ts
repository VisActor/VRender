import { createWrapText } from '../graphic/wrap-text';
import { registerGraphic } from '../graphic/graphic-creator';

export function registerWrapTextGraphic() {
  registerGraphic('wrapText', createWrapText);
}
