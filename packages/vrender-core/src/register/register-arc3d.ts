import { createArc3d } from '../graphic/arc3d';
import { registerGraphic } from '../graphic/graphic-creator';

export function registerArc3dGraphic() {
  registerGraphic('arc3d', createArc3d);
}
