import { ContainerModule } from 'inversify';
import { bindContributionProvider } from '../../common/contribution-provider';
import { ArcBoundsContribution, DefaultArcOuterBorderBoundsContribution } from './arc-contribution';
import { CircleBoundsContribution, DefaultCircleOuterBorderBoundsContribution } from './circle-contribution';
// import { DefaultTheme } from './default-theme';
import { DefaultGraphicService } from './graphic-service';
import { DefaultPathOuterBorderBoundsContribution, PathBoundsContribution } from './path-contribution';
import { RectBoundsContribution, DefaultRectOuterBorderBoundsContribution } from './rect-contribution';
import { DefaultSymbolOuterBorderBoundsContribution, SymbolBoundsContribution } from './symbol-contribution';
import { GraphicCreator, GraphicService } from '../constants';
import { graphicCreator } from '../graphic-creator';
// import { DefaultThemeService, Theme, ThemeServce } from './theme-service';

export default new ContainerModule(bind => {
  bind(DefaultGraphicService).toSelf().inSingletonScope();
  bind(GraphicService).toService(DefaultGraphicService);

  // rect的bounds contributions
  bind(DefaultRectOuterBorderBoundsContribution).toSelf().inSingletonScope();
  bind(RectBoundsContribution).toService(DefaultRectOuterBorderBoundsContribution);
  bindContributionProvider(bind, RectBoundsContribution);

  // symbol的bounds contributions
  bind(DefaultSymbolOuterBorderBoundsContribution).toSelf().inSingletonScope();
  bind(SymbolBoundsContribution).toService(DefaultSymbolOuterBorderBoundsContribution);
  bindContributionProvider(bind, SymbolBoundsContribution);

  // circle的bounds contributions
  bind(DefaultCircleOuterBorderBoundsContribution).toSelf().inSingletonScope();
  bind(CircleBoundsContribution).toService(DefaultCircleOuterBorderBoundsContribution);
  bindContributionProvider(bind, CircleBoundsContribution);

  // arc的bounds contributions
  bind(DefaultArcOuterBorderBoundsContribution).toSelf().inSingletonScope();
  bind(ArcBoundsContribution).toService(DefaultArcOuterBorderBoundsContribution);
  bindContributionProvider(bind, ArcBoundsContribution);

  // path的bounds contributions
  bind(DefaultPathOuterBorderBoundsContribution).toSelf().inSingletonScope();
  bind(PathBoundsContribution).toService(DefaultPathOuterBorderBoundsContribution);
  bindContributionProvider(bind, PathBoundsContribution);

  bind(GraphicCreator).toConstantValue(graphicCreator);
  // bind(DefaultThemeService).toSelf().inSingletonScope();
  // bind(ThemeServce).toService(DefaultThemeService);
  // bind(DefaultTheme).toSelf().inSingletonScope();
  // bind(Theme).toService(DefaultTheme);
  // bindContributionProvider(bind, Theme);
});
