import { createLine } from '../graphic/line';
import { registerGraphic } from '../graphic/graphic-creator';

export function registerLineGraphic() {
  registerGraphic('line', createLine);
}
