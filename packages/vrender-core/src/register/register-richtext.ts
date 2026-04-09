import { createRichText } from '../graphic/richtext';
import { registerGraphic } from '../graphic/graphic-creator';

export function registerRichtextGraphic() {
  registerGraphic('richtext', createRichText);
}
