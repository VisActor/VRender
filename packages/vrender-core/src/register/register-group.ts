import { createGroup } from '../graphic/group';
import { registerGraphic } from '../graphic/graphic-creator';

export function registerGroupGraphic() {
  registerGraphic('group', createGroup);
}
