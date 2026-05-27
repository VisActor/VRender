import { bindContributionProvider } from '../../../common/contribution-provider';
import { isBindingContextLoaded } from '../../../common/module-guard';
import { DefaultBaseInteractiveRenderContribution } from './contributions';
import { TextRenderContribution } from './contributions/constants';
import { GraphicRender, TextRender } from './symbol';
import { DefaultCanvasTextRender } from './text-render';

const loadedTextModuleContexts = new WeakSet<object>();
export function bindTextRenderModule({ bind }: { bind: any }) {
  if (isBindingContextLoaded(loadedTextModuleContexts, bind)) {
    return;
  }
  // text 渲染器
  bind(TextRender).to(DefaultCanvasTextRender).inSingletonScope();
  bind(GraphicRender).toService(TextRender);
  bind(TextRenderContribution).toService(DefaultBaseInteractiveRenderContribution);

  bindContributionProvider(bind, TextRenderContribution);
}

export const textModule = bindTextRenderModule;
