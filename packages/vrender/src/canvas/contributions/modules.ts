import { Container } from 'inversify';
import browserModule from './browser/modules';
import taroModule from './taro/modules';
import feishuModule from './feishu/modules';
import lynxModule from './lynx/modules';

export default function load(container: Container) {
  container.load(browserModule);
  container.load(feishuModule);
  container.load(taroModule);
  container.load(lynxModule);
}
