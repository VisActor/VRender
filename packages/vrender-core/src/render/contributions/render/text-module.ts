import { bindContributionProvider } from '../../../common/contribution-provider';
import { ContainerModule } from '../../../common/inversify';
import { DefaultCanvasCircleRender } from './circle-render';
import { DefaultBaseInteractiveRenderContribution } from './contributions';
import { CircleRenderContribution, TextRenderContribution } from './contributions/constants';
import { CircleRender, GraphicRender, TextRender } from './symbol';
import { DefaultCanvasTextRender } from './text-render';

let loadTextModule = false;
export const textModule = new ContainerModule(bind => {
  if (loadTextModule) {
    return;
  }
  loadTextModule = true;
  // text 渲染器
  bind(TextRender).to(DefaultCanvasTextRender).inSingletonScope();
  bind(GraphicRender).toService(TextRender);
  bind(TextRenderContribution).toService(DefaultBaseInteractiveRenderContribution);

  bindContributionProvider(bind, TextRenderContribution);
});
