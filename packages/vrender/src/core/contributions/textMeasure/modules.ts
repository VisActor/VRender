import { ContainerModule } from 'inversify';
import { bindContributionProvider } from '../../../common';
import { DefaultTextMeasureContribution, TextMeasureContribution } from './textMeasure-contribution';

export default new ContainerModule(bind => {
  bind(DefaultTextMeasureContribution).toSelf().inSingletonScope();
  bind(TextMeasureContribution).toService(DefaultTextMeasureContribution);
  bindContributionProvider(bind, TextMeasureContribution);
});
