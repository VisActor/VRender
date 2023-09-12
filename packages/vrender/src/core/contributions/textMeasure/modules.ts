import { ContainerModule } from '../../../common/inversify-lite';
import { bindContributionProvider } from '../../../common/contribution-provider';
import { DefaultTextMeasureContribution, TextMeasureContribution } from './textMeasure-contribution';

export default new ContainerModule(bind => {
  bind(DefaultTextMeasureContribution).toSelf().inSingletonScope();
  bind(TextMeasureContribution).toService(DefaultTextMeasureContribution);
  bindContributionProvider(bind, TextMeasureContribution);
});
