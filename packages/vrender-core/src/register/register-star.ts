import { createStar } from '../graphic/star';
import { registerGraphic } from '../graphic/graphic-creator';

export function registerStarGraphic() {
  registerGraphic('star', createStar);
}
