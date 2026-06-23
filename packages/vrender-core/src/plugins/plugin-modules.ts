import { PluginService } from './constants';
import { DefaultPluginService } from './plugin-service';
import { bindContributionProviderNoSingletonScope } from '../common/contribution-provider';
import { AutoEnablePlugins } from './constants';

export function bindPluginModules({ bind }: { bind: any }) {
  bind(PluginService).to(DefaultPluginService);

  // image 渲染器注入contributions
  bindContributionProviderNoSingletonScope(bind, AutoEnablePlugins);
}

export default bindPluginModules;
