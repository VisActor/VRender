import { createPath } from '../graphic/path';
import { registerGraphic } from '../graphic/graphic-creator';

export function registerPathGraphic() {
  registerGraphic('path', createPath);
}
