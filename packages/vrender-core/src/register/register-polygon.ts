import { createPolygon } from '../graphic/polygon';
import { graphicCreator } from '../graphic/graphic-creator';

export function registerPolygonGraphic() {
  graphicCreator.RegisterGraphicCreator('polygon', createPolygon);
}
