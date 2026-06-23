import renderModule from './render/module';
import type { ILegacyContributionBindingContext } from '../../legacy/module-types';

export default function load(container: ILegacyContributionBindingContext) {
  renderModule({ bind: container.bind });
}
