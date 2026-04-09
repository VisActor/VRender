import envModules from './env/modules';
import textMeasureModules from './textMeasure/modules';
import layerHandlerModules from './layerHandler/modules';
import type { ILegacyContributionBindingContext } from '../../legacy/module-types';

export default function load(container: ILegacyContributionBindingContext) {
  envModules({ bind: container.bind });
  textMeasureModules({ bind: container.bind });
  layerHandlerModules({ bind: container.bind });
}
