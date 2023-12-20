import { ContainerModule } from '../../common/inversify-lite';
// import { DefaultTheme } from './default-theme';
import { DefaultGraphicService } from './graphic-service';
import { GraphicCreator, GraphicService } from '../constants';
import { graphicCreator } from '../graphic-creator';
// import { DefaultThemeService, Theme, ThemeServce } from './theme-service';

export default new ContainerModule(bind => {
  bind(GraphicService).to(DefaultGraphicService).inSingletonScope();

  bind(GraphicCreator).toConstantValue(graphicCreator);
});
