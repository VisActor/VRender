import { createImage } from '../graphic/image';
import { registerGraphic } from '../graphic/graphic-creator';

export function registerImageGraphic() {
  registerGraphic('image', createImage);
}
