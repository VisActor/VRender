import { bindContributionProvider } from '../../../common/contribution-provider';
import { EnvContribution } from '../../../constants';

export function bindEnvContributionModules({ bind }: { bind: any }) {
  bindContributionProvider(bind, EnvContribution);
}

export default bindEnvContributionModules;
