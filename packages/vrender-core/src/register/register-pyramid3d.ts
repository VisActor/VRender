import { createPyramid3d } from '../graphic/pyramid3d';
import { registerGraphic } from '../graphic/graphic-creator';

export function registerPyramid3dGraphic() {
  registerGraphic('pyramid3d', createPyramid3d);
}
