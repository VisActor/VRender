import { createArc } from '../graphic/arc';
import { registerGraphic } from '../graphic/graphic-creator';

export function registerArcGraphic() {
  registerGraphic('arc', createArc);
}
