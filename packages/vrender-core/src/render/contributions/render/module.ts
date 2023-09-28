import { ContainerModule } from '../../../common/inversify-lite';
import { bindContributionProvider } from '../../../common/contribution-provider';
import { DefaultCanvasCircleRender } from './circle-render';
import { DefaultCanvasRectRender } from './rect-render';
import { DefaultCanvasArcRender } from './arc-render';
import { DefaultDrawContribution } from './draw-contribution';
import { DefaultRenderSelector } from './render-slector';
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
import {
  DefaultRectBackgroundRenderContribution,
  DefaultRectRenderContribution,
  DefaultRectTextureRenderContribution,
  SplitRectAfterRenderContribution,
  SplitRectBeforeRenderContribution
} from './contributions/rect-contribution-render';
import {
  DefaultSymbolBackgroundRenderContribution,
  DefaultSymbolRenderContribution,
  DefaultSymbolTextureRenderContribution
} from './contributions/symbol-contribution-render';
import {
  DefaultCircleBackgroundRenderContribution,
  DefaultCircleRenderContribution,
  DefaultCircleTextureRenderContribution
} from './contributions/circle-contribution-render';
import {
  DefaultArcBackgroundRenderContribution,
  DefaultArcRenderContribution,
  DefaultArcTextureRenderContribution
} from './contributions/arc-contribution-render';
import { DefaultCanvasGlyphRender } from './glyph-render';
import { DefaultImageBackgroundRenderContribution } from './contributions/image-contribution-render';
import { DefaultGroupBackgroundRenderContribution } from './contributions/group-contribution-render';
import { DefaultCanvasArc3DRender } from './arc3d-render';
import { DefaultCanvasPyramid3dRender } from './pyramid3d-render';
import {
  DefaultPolygonBackgroundRenderContribution,
  DefaultPolygonTextureRenderContribution
} from './contributions/polygon-contribution-render';
import {
  DefaultPathBackgroundRenderContribution,
  DefaultPathTextureRenderContribution
} from './contributions/path-contribution-render';
import {
  DefaultAreaBackgroundRenderContribution,
  DefaultAreaTextureRenderContribution
} from './contributions/area-contribution-render';
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
import { DefaultBaseInteractiveRenderContribution } from './contributions';

export default new ContainerModule(bind => {
  bind(DefaultDrawContribution).toSelf();
  bind(DrawContribution).toService(DefaultDrawContribution);
  bind(DefaultIncrementalDrawContribution).toSelf();
  bind(IncrementalDrawContribution).toService(DefaultIncrementalDrawContribution);

  bind(DefaultRenderSelector).toSelf();
  bind(RenderSelector).toService(DefaultRenderSelector);

  // circle 渲染器
  bind(DefaultCanvasCircleRender).toSelf().inSingletonScope();
  bind(CircleRender).to(DefaultCanvasCircleRender);
  bind(GraphicRender).to(DefaultCanvasCircleRender);

  // circle 渲染器注入contributions
  bind(DefaultCircleRenderContribution).toSelf().inSingletonScope();
  bind(DefaultCircleBackgroundRenderContribution).toSelf().inSingletonScope();
  bind(DefaultCircleTextureRenderContribution).toSelf().inSingletonScope();
  bind(CircleRenderContribution).toService(DefaultCircleRenderContribution);
  bind(CircleRenderContribution).toService(DefaultCircleBackgroundRenderContribution);
  bind(CircleRenderContribution).toService(DefaultCircleTextureRenderContribution);
  bindContributionProvider(bind, CircleRenderContribution);

  // rect 渲染器
  bind(DefaultCanvasRectRender).toSelf().inSingletonScope();
  bind(RectRender).to(DefaultCanvasRectRender);
  bind(GraphicRender).to(DefaultCanvasRectRender);

  // rect3d 渲染器
  bind(DefaultCanvasRect3dRender).toSelf().inSingletonScope();
  bind(Rect3DRender).toService(DefaultCanvasRect3dRender);
  bind(GraphicRender).toService(Rect3DRender);
  // rect 渲染器注入contributions
  bind(DefaultRectRenderContribution).toSelf().inSingletonScope();
  bind(DefaultRectBackgroundRenderContribution).toSelf().inSingletonScope();
  bind(DefaultRectTextureRenderContribution).toSelf().inSingletonScope();
  bind(SplitRectBeforeRenderContribution).toSelf().inSingletonScope();
  bind(SplitRectAfterRenderContribution).toSelf().inSingletonScope();
  bind(RectRenderContribution).toService(DefaultRectRenderContribution);
  bind(RectRenderContribution).toService(DefaultRectBackgroundRenderContribution);
  bind(RectRenderContribution).toService(DefaultRectTextureRenderContribution);
  bind(RectRenderContribution).toService(SplitRectBeforeRenderContribution);
  bind(RectRenderContribution).toService(SplitRectAfterRenderContribution);
  bindContributionProvider(bind, RectRenderContribution);

  // text 渲染器
  bind(DefaultCanvasTextRender).toSelf().inSingletonScope();
  bind(TextRender).to(DefaultCanvasTextRender);
  bind(GraphicRender).to(DefaultCanvasTextRender);
  bindContributionProvider(bind, TextRenderContribution);

  // path 渲染器
  bind(DefaultCanvasPathRender).toSelf().inSingletonScope();
  bind(PathRender).to(DefaultCanvasPathRender);
  bind(GraphicRender).to(DefaultCanvasPathRender);

  // path 渲染器注入contributions
  bind(DefaultPathBackgroundRenderContribution).toSelf().inSingletonScope();
  bind(DefaultPathTextureRenderContribution).toSelf().inSingletonScope();
  bind(PathRenderContribution).toService(DefaultPathBackgroundRenderContribution);
  bind(PathRenderContribution).toService(DefaultPathTextureRenderContribution);
  bindContributionProvider(bind, PathRenderContribution);

  // symbol渲染器
  bind(DefaultCanvasSymbolRender).toSelf().inSingletonScope();
  bind(SymbolRender).to(DefaultCanvasSymbolRender);
  bind(GraphicRender).to(DefaultCanvasSymbolRender);

  // symbol 渲染器注入contributions
  bind(DefaultSymbolRenderContribution).toSelf().inSingletonScope();
  bind(DefaultSymbolBackgroundRenderContribution).toSelf().inSingletonScope();
  bind(DefaultSymbolTextureRenderContribution).toSelf().inSingletonScope();
  bind(SymbolRenderContribution).toService(DefaultSymbolRenderContribution);
  bind(SymbolRenderContribution).toService(DefaultSymbolBackgroundRenderContribution);
  bind(SymbolRenderContribution).toService(DefaultSymbolTextureRenderContribution);
  bindContributionProvider(bind, SymbolRenderContribution);

  // arc 渲染器
  bind(DefaultCanvasArcRender).toSelf().inSingletonScope();
  bind(ArcRender).to(DefaultCanvasArcRender);
  bind(GraphicRender).to(DefaultCanvasArcRender);

  // arc3d 渲染器
  bind(DefaultCanvasArc3DRender).toSelf().inSingletonScope();
  bind(Arc3dRender).toService(DefaultCanvasArc3DRender);
  bind(GraphicRender).toService(Arc3dRender);

  // arc 渲染器注入contributions
  bind(DefaultArcRenderContribution).toSelf().inSingletonScope();
  bind(DefaultArcBackgroundRenderContribution).toSelf().inSingletonScope();
  bind(DefaultArcTextureRenderContribution).toSelf().inSingletonScope();
  bind(ArcRenderContribution).toService(DefaultArcRenderContribution);
  bind(ArcRenderContribution).toService(DefaultArcBackgroundRenderContribution);
  bind(ArcRenderContribution).toService(DefaultArcTextureRenderContribution);
  bindContributionProvider(bind, ArcRenderContribution);

  // line渲染器
  bind(DefaultCanvasLineRender).toSelf().inSingletonScope();
  bind(LineRender).to(DefaultCanvasLineRender);
  bind(GraphicRender).to(DefaultCanvasLineRender);

  // incremental-line渲染器
  bind(DefaultIncrementalCanvasLineRender).toSelf().inSingletonScope();
  bind(DefaultIncrementalCanvasAreaRender).toSelf().inSingletonScope();

  // area渲染器
  bind(DefaultCanvasAreaRender).toSelf().inSingletonScope();
  bind(AreaRender).to(DefaultCanvasAreaRender);
  bind(GraphicRender).to(DefaultCanvasAreaRender);

  // area 渲染器注入contributions
  bind(DefaultAreaBackgroundRenderContribution).toSelf().inSingletonScope();
  bind(DefaultAreaTextureRenderContribution).toSelf().inSingletonScope();

  bind(AreaRenderContribution).toService(DefaultAreaBackgroundRenderContribution);
  bind(AreaRenderContribution).toService(DefaultAreaTextureRenderContribution);
  bindContributionProvider(bind, AreaRenderContribution);

  // group渲染器
  bind(DefaultCanvasGroupRender).toSelf().inSingletonScope();
  bind(GroupRender).to(DefaultCanvasGroupRender);
  bind(GraphicRender).to(DefaultCanvasGroupRender);

  // group 渲染器注入contributions\
  bind(DefaultGroupBackgroundRenderContribution).toSelf().inSingletonScope();
  bind(GroupRenderContribution).toService(DefaultGroupBackgroundRenderContribution);
  bindContributionProvider(bind, GroupRenderContribution);

  // polygon渲染器
  bind(DefaultCanvasPolygonRender).toSelf().inSingletonScope();
  bind(PolygonRender).to(DefaultCanvasPolygonRender);
  bind(GraphicRender).to(DefaultCanvasPolygonRender);

  // polygon 渲染器注入contributions
  bind(DefaultPolygonBackgroundRenderContribution).toSelf().inSingletonScope();
  bind(DefaultPolygonTextureRenderContribution).toSelf().inSingletonScope();
  bind(PolygonRenderContribution).toService(DefaultPolygonBackgroundRenderContribution);
  bind(PolygonRenderContribution).toService(DefaultPolygonTextureRenderContribution);
  bindContributionProvider(bind, PolygonRenderContribution);

  // glyph渲染器
  bind(DefaultCanvasGlyphRender).toSelf().inSingletonScope();
  bind(GlyphRender).toService(DefaultCanvasGlyphRender);
  bind(GraphicRender).toService(GlyphRender);

  // image渲染器
  bind(DefaultCanvasImageRender).toSelf().inSingletonScope();
  bind(ImageRender).toService(DefaultCanvasImageRender);
  bind(GraphicRender).toService(ImageRender);

  // image 渲染器注入contributions
  bind(DefaultImageBackgroundRenderContribution).toSelf().inSingletonScope();
  bind(ImageRenderContribution).toService(DefaultImageBackgroundRenderContribution);
  bindContributionProvider(bind, ImageRenderContribution);

  // richtext渲染器
  bind(DefaultCanvasRichTextRender).toSelf().inSingletonScope();
  bind(RichTextRender).toService(DefaultCanvasRichTextRender);
  bind(GraphicRender).toService(RichTextRender);

  // pyramid3d 渲染器
  bind(DefaultCanvasPyramid3dRender).toSelf().inSingletonScope();
  bind(Pyramid3dRender).toService(DefaultCanvasPyramid3dRender);
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
