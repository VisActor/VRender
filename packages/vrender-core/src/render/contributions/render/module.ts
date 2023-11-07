import { ContainerModule } from '../../../common/inversify-lite';
import { bindContributionProvider } from '../../../common/contribution-provider';
import { DefaultCanvasCircleRender } from './circle-render';
import { DefaultCanvasRectRender } from './rect-render';
import { DefaultCanvasArcRender } from './arc-render';
import { DefaultDrawContribution } from './draw-contribution';
// import { DefaultRenderSelector } from './render-slector';
import { DefaultCanvasSymbolRender } from './symbol-render';
import { DefaultCanvasTextRender } from './text-render';
import { DefaultCanvasPathRender } from './path-render';
import { DefaultCanvasLineRender } from './line-render';
import { DefaultCanvasAreaRender } from './area-render';
import { DefaultCanvasGroupRender } from './group-render';
import { DefaultCanvasPolygonRender } from './polygon-render';
import { DefaultCanvasImageRender } from './image-render';
import { DefaultIncrementalDrawContribution } from './incremental-draw-contribution';
import {
  ArcRender,
  AreaRender,
  CircleRender,
  DrawContribution,
  GlyphRender,
  GraphicRender,
  GroupRender,
  IncrementalDrawContribution,
  LineRender,
  PathRender,
  PolygonRender,
  Rect3DRender,
  RectRender,
  RenderSelector,
  RichTextRender,
  SymbolRender,
  TextRender,
  ImageRender,
  Arc3dRender,
  Pyramid3dRender
} from './symbol';
import {
  Canvas3DDrawItemInterceptor,
  CommonDrawItemInterceptorContribution,
  DrawItemInterceptor,
  InteractiveDrawItemInterceptorContribution,
  ShadowRootDrawItemInterceptorContribution
} from './draw-interceptor';
import { DefaultCanvasRect3dRender } from './rect3d-render';
import { DefaultIncrementalCanvasLineRender } from './incremental-line-render';
import { DefaultIncrementalCanvasAreaRender } from './incremental-area-render';
import { DefaultCanvasRichTextRender } from './richtext-render';
import { DefaultSymbolRenderContribution } from './contributions/symbol-contribution-render';
import { DefaultCanvasGlyphRender } from './glyph-render';
import { DefaultCanvasArc3DRender } from './arc3d-render';
import { DefaultCanvasPyramid3dRender } from './pyramid3d-render';
import {
  RectRenderContribution,
  CircleRenderContribution,
  ArcRenderContribution,
  AreaRenderContribution,
  TextRenderContribution,
  PathRenderContribution,
  PolygonRenderContribution,
  GroupRenderContribution,
  ImageRenderContribution,
  SymbolRenderContribution,
  InteractiveSubRenderContribution
} from './contributions/constants';
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

  // circle 渲染器
  bind(CircleRender).to(DefaultCanvasCircleRender).inSingletonScope();
  bind(GraphicRender).toService(CircleRender);

  // circle 渲染器注入contributions
  bindContributionProvider(bind, CircleRenderContribution);

  // rect 渲染器
  bind(RectRender).to(DefaultCanvasRectRender).inSingletonScope();
  bind(GraphicRender).toService(RectRender);

  // rect3d 渲染器
  bind(Rect3DRender).to(DefaultCanvasRect3dRender).inSingletonScope();
  bind(GraphicRender).toService(Rect3DRender);

  // rect 渲染器注入contributions
  bindContributionProvider(bind, RectRenderContribution);

  // text 渲染器
  bind(TextRender).to(DefaultCanvasTextRender).inSingletonScope();
  bind(GraphicRender).toService(TextRender);
  bindContributionProvider(bind, TextRenderContribution);

  // path 渲染器
  bind(PathRender).to(DefaultCanvasPathRender).inSingletonScope();
  bind(GraphicRender).toService(PathRender);

  // path 渲染器注入contributions
  bindContributionProvider(bind, PathRenderContribution);

  // symbol渲染器
  bind(SymbolRender).to(DefaultCanvasSymbolRender).inSingletonScope();
  bind(GraphicRender).toService(SymbolRender);

  // symbol 渲染器注入contributions
  bindContributionProvider(bind, SymbolRenderContribution);

  // arc 渲染器
  bind(ArcRender).to(DefaultCanvasArcRender).inSingletonScope();
  bind(GraphicRender).toService(ArcRender);

  // arc3d 渲染器
  bind(Arc3dRender).to(DefaultCanvasArc3DRender).inSingletonScope();
  bind(GraphicRender).toService(Arc3dRender);

  // arc 渲染器注入contributions
  bindContributionProvider(bind, ArcRenderContribution);

  // line渲染器
  bind(LineRender).to(DefaultCanvasLineRender).inSingletonScope();
  bind(GraphicRender).toService(LineRender);

  // incremental-line渲染器
  bind(DefaultIncrementalCanvasLineRender).toSelf().inSingletonScope();
  bind(DefaultIncrementalCanvasAreaRender).toSelf().inSingletonScope();

  // area渲染器
  bind(AreaRender).to(DefaultCanvasAreaRender).inSingletonScope();
  bind(GraphicRender).toService(AreaRender);

  // area 渲染器注入contributions
  bindContributionProvider(bind, AreaRenderContribution);

  // group渲染器
  bind(GroupRender).to(DefaultCanvasGroupRender).inSingletonScope();
  bind(GraphicRender).toService(GroupRender);

  // group 渲染器注入contributions
  bindContributionProvider(bind, GroupRenderContribution);

  // polygon渲染器
  bind(PolygonRender).to(DefaultCanvasPolygonRender).inSingletonScope();
  bind(GraphicRender).toService(PolygonRender);

  // polygon 渲染器注入contributions
  bindContributionProvider(bind, PolygonRenderContribution);

  // glyph渲染器
  bind(GlyphRender).to(DefaultCanvasGlyphRender).inSingletonScope();
  bind(GraphicRender).toService(GlyphRender);

  // image渲染器
  bind(ImageRender).to(DefaultCanvasImageRender).inSingletonScope();
  bind(GraphicRender).toService(ImageRender);

  // image 渲染器注入contributions
  bindContributionProvider(bind, ImageRenderContribution);

  // richtext渲染器
  bind(RichTextRender).to(DefaultCanvasRichTextRender).inSingletonScope();
  bind(GraphicRender).toService(RichTextRender);

  // pyramid3d 渲染器
  bind(Pyramid3dRender).to(DefaultCanvasPyramid3dRender).inSingletonScope();
  bind(GraphicRender).toService(Pyramid3dRender);

  // 绑定通用interactive contribution
  bind(DefaultBaseInteractiveRenderContribution).toSelf().inSingletonScope();
  bind(TextRenderContribution).toService(DefaultBaseInteractiveRenderContribution);
  bind(ArcRenderContribution).toService(DefaultBaseInteractiveRenderContribution);
  bind(PathRenderContribution).toService(DefaultBaseInteractiveRenderContribution);
  bind(SymbolRenderContribution).toService(DefaultBaseInteractiveRenderContribution);
  bind(RectRenderContribution).toService(DefaultBaseInteractiveRenderContribution);
  bind(ImageRenderContribution).toService(DefaultBaseInteractiveRenderContribution);
  bind(CircleRenderContribution).toService(DefaultBaseInteractiveRenderContribution);
  bind(AreaRenderContribution).toService(DefaultBaseInteractiveRenderContribution);
  bind(PolygonRenderContribution).toService(DefaultBaseInteractiveRenderContribution);
  bindContributionProvider(bind, InteractiveSubRenderContribution);

  bindContributionProvider(bind, GraphicRender);

  // interceptor
  bind(ShadowRootDrawItemInterceptorContribution).toSelf().inSingletonScope();
  bind(DrawItemInterceptor).toService(ShadowRootDrawItemInterceptorContribution);
  bind(CommonDrawItemInterceptorContribution).toSelf().inSingletonScope();
  bind(DrawItemInterceptor).toService(CommonDrawItemInterceptorContribution);
  bind(Canvas3DDrawItemInterceptor).toSelf().inSingletonScope();
  bind(DrawItemInterceptor).toService(Canvas3DDrawItemInterceptor);
  bind(InteractiveDrawItemInterceptorContribution).toSelf().inSingletonScope();
  bind(DrawItemInterceptor).toService(InteractiveDrawItemInterceptorContribution);
  bindContributionProvider(bind, DrawItemInterceptor);
});
