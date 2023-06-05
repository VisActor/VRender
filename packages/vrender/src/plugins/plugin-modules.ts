import { ContainerModule } from 'inversify';
import { DefaultPluginService, PluginService } from './plugin-service';

export default new ContainerModule(bind => {
  bind(DefaultPluginService).toSelf();
  bind(PluginService).toService(DefaultPluginService);
});
