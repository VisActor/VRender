import { ContainerModule } from 'inversify';
import { Global, IGlobal } from '../interface';
import { container } from '../container';
import { DefaultGlobal } from './global';
import envModules from './contributions/env/modules';

const globalModule = new ContainerModule((bind, unbind, isBound) => {
  // global对象，全局单例模式
  if (!isBound(Global)) {
    bind(DefaultGlobal).toSelf().inSingletonScope();
    bind(Global).toService(DefaultGlobal);
  }
});

container.load(globalModule);
container.load(envModules);

export const global = container.get<IGlobal>(Global);

export default globalModule;
