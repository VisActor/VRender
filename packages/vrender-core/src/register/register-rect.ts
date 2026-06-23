import { createRect } from '../graphic/rect';
import { registerGraphic } from '../graphic/graphic-creator';

export function registerRectGraphic() {
  registerGraphic('rect', createRect);
}
