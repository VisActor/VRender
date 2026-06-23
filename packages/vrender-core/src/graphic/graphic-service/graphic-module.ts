// import { DefaultTheme } from './default-theme';
import { DefaultGraphicService } from './graphic-service';
import { GraphicCreator, GraphicService } from '../constants';
import { graphicCreator } from '../graphic-creator';
// import { DefaultThemeService, Theme, ThemeServce } from './theme-service';

export function bindGraphicModules({ bind }: { bind: any }) {
  bind(GraphicService).to(DefaultGraphicService);

  bind(GraphicCreator).toConstantValue(graphicCreator);
}

export default bindGraphicModules;
