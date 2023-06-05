import { Container } from 'inversify';
import renderModule from './render/module';

export default function load(container: Container) {
  container.load(renderModule);
}
