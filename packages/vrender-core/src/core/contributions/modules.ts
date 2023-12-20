import type { Container } from '../../common/inversify-lite';
import envModules from './env/modules';
import textMeasureModules from './textMeasure/modules';
import layerHandlerModules from './layerHandler/modules';

export default function load(container: Container) {
  container.load(envModules);
  container.load(textMeasureModules);
  container.load(layerHandlerModules);
}
