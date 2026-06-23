import { createCircle } from '../graphic/circle';
import { registerGraphic } from '../graphic/graphic-creator';

export function registerCircleGraphic() {
  registerGraphic('circle', createCircle);
}
