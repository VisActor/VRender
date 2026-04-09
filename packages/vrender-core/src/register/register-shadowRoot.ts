import { createShadowRoot } from '../graphic/shadow-root';
import { registerGraphic } from '../graphic/graphic-creator';

export function registerShadowRootGraphic() {
  registerGraphic('shadowRoot', createShadowRoot);
}
