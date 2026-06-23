import { createArea } from '../graphic/area';
import { registerGraphic } from '../graphic/graphic-creator';

export function registerAreaGraphic() {
  registerGraphic('area', createArea);
}
