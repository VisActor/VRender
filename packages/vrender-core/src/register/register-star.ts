import { createStar } from '../graphic/star';
import { graphicCreator } from '../graphic/graphic-creator';

export function registerStarGraphic() {
  graphicCreator.RegisterGraphicCreator('star', createStar);
}
