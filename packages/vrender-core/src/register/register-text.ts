import { createText } from '../graphic/text';
import { registerGraphic } from '../graphic/graphic-creator';

export function registerTextGraphic() {
  registerGraphic('text', createText);
}
