import { createPolygon } from '../graphic/polygon';
import { registerGraphic } from '../graphic/graphic-creator';

export function registerPolygonGraphic() {
  registerGraphic('polygon', createPolygon);
}
