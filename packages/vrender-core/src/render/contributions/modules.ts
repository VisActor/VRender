import type { Container } from '../../common/inversify-lite';
import renderModule from './render/module';

export default function load(container: Container) {
  container.load(renderModule);
}
