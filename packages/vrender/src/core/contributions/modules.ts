import { Container } from 'inversify';
import envModules from './env/modules';
import windowModules from './window/modules';
import textMeasureModules from './textMeasure/modules';
import layerHandlerModules from './layerHandler/modules';

export default function load(container: Container) {
  container.load(envModules);
  container.load(windowModules);
  container.load(textMeasureModules);
  container.load(layerHandlerModules);
}
