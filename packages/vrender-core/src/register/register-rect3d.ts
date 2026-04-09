import { createRect3d } from '../graphic/rect3d';
import { registerGraphic } from '../graphic/graphic-creator';

export function registerRect3dGraphic() {
  registerGraphic('rect3d', createRect3d);
}
