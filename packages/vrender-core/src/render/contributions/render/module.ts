import { ContainerModule } from '../../../common/inversify-lite';
import { bindContributionProvider } from '../../../common/contribution-provider';
import { DefaultDrawContribution } from './draw-contribution';
import { DefaultCanvasGroupRender } from './group-render';
import { DefaultIncrementalDrawContribution } from './incremental-draw-contribution';
import { DrawContribution, GraphicRender, GroupRender, IncrementalDrawContribution, RenderSelector } from './symbol';
import { CommonDrawItemInterceptorContribution, DrawItemInterceptor } from './draw-interceptor';
import { GroupRenderContribution, InteractiveSubRenderContribution } from './contributions/constants';
import {
  DefaultBaseBackgroundRenderContribution,
  DefaultBaseInteractiveRenderContribution,
  DefaultBaseTextureRenderContribution
} from './contributions';

export default new ContainerModule(bind => {
  bind(DefaultBaseBackgroundRenderContribution).toSelf().inSingletonScope();
  bind(DefaultBaseTextureRenderContribution).toSelf().inSingletonScope();

  bind(DrawContribution).to(DefaultDrawContribution);
  bind(IncrementalDrawContribution).to(DefaultIncrementalDrawContribution);

  // bind(RenderSelector).to(DefaultRenderSelector).inSingletonScope();

  // group渲染器
  bind(GroupRender).to(DefaultCanvasGroupRender).inSingletonScope();
  bind(GraphicRender).toService(GroupRender);

  // group 渲染器注入contributions
  bindContributionProvider(bind, GroupRenderContribution);

  // 绑定通用interactive contribution
  bind(DefaultBaseInteractiveRenderContribution).toSelf().inSingletonScope();
  bindContributionProvider(bind, InteractiveSubRenderContribution);
  bindContributionProvider(bind, GraphicRender);

  // interceptor
  // bind(ShadowRootDrawItemInterceptorContribution).toSelf().inSingletonScope();
  // bind(DrawItemInterceptor).toService(ShadowRootDrawItemInterceptorContribution);
  bind(CommonDrawItemInterceptorContribution).toSelf().inSingletonScope();
  bind(DrawItemInterceptor).toService(CommonDrawItemInterceptorContribution);
  // bind(RenderSelector).toService()
  // bind(Canvas3DDrawItemInterceptor).toSelf().inSingletonScope();
  // bind(DrawItemInterceptor).toService(Canvas3DDrawItemInterceptor);
  // bind(InteractiveDrawItemInterceptorContribution).toSelf().inSingletonScope();
  // bind(DrawItemInterceptor).toService(InteractiveDrawItemInterceptorContribution);
  bindContributionProvider(bind, DrawItemInterceptor);
});
