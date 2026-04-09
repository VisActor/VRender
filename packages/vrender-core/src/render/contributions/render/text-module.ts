import { bindContributionProvider } from '../../../common/contribution-provider';
import { DefaultCanvasCircleRender } from './circle-render';
import { DefaultBaseInteractiveRenderContribution } from './contributions';
import { CircleRenderContribution, TextRenderContribution } from './contributions/constants';
import { CircleRender, GraphicRender, TextRender } from './symbol';
import { DefaultCanvasTextRender } from './text-render';

let loadTextModule = false;
export function bindTextRenderModule({ bind }: { bind: any }) {
  if (loadTextModule) {
    return;
  }
  loadTextModule = true;
  // text 渲染器
  bind(TextRender).to(DefaultCanvasTextRender).inSingletonScope();
  bind(GraphicRender).toService(TextRender);
  bind(TextRenderContribution).toService(DefaultBaseInteractiveRenderContribution);

  bindContributionProvider(bind, TextRenderContribution);
}

export const textModule = bindTextRenderModule;
