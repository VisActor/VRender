import { bindContributionProvider } from '../../../common/contribution-provider';
import { DefaultTextMeasureContribution, TextMeasureContribution } from './textMeasure-contribution';

export function bindTextMeasureModules({ bind }: { bind: any }) {
  bind(TextMeasureContribution).to(DefaultTextMeasureContribution).inSingletonScope();
  bindContributionProvider(bind, TextMeasureContribution);
}

export default bindTextMeasureModules;
