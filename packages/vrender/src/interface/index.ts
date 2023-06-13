// export type MaybePromise<T> = T | PromiseLike<T>;

// // 所有的接口都应当继承这个，避免内存没有释放
// export interface Disposable {
//   dispose: (params?: any) => void;
// }

// export { INode } from './node-tree';
// export { IGraphic, IGraphicAttribute, IFillStyle, IStrokeStyle, IStyle, ITransform } from './graphic';
// export { IArc, IArcAttribute, IArcGraphicAttribute, IArcCache } from './graphic/arc';
// export { IArea, IAreaAttribute, IAreaGraphicAttribute, IAreaCacheItem, IAreaSegment } from './graphic/area';
// export { ICircle, ICircleAttribute, ICircleGraphicAttribute } from './graphic/circle';
// export { IGroup, IGroupAttribute } from './graphic/group';
// export { IImage, IImageAttribute, IImageGraphicAttribute, IRepeatType } from './graphic/image';
// export { ILine, ILineAttribute, ILineGraphicAttribute, ISegment } from './graphic/line';
// export { IPath, IPathAttribute, IPathGraphicAttribute } from './graphic/path';
// export { IRect, IRectAttribute, IRectGraphicAttribute } from './graphic/rect';
// export {
//   IRichText,
//   IRichTextAttribute,
//   RichTextCharacter,
//   RichTextFontStyle,
//   RichTextGlobalAlignType,
//   RichTextGlobalBaselineType,
//   RichTextScript,
//   RichTextTextAlign,
//   RichTextTextDecoration,
//   RichTextVerticalDirection,
//   RichTextWordBreak,
//   IRichTextGraphicAttribute
// } from './graphic/richText';
// export { ISymbol, ISymbolAttribute, ISymbolGraphicAttribute, SymbolType } from './graphic/symbol';
// export { IText, ITextAttribute, ITextGraphicAttribute, ITextCache } from './graphic/text';
// export { ILayer, ILayerDrawParams } from './layer';
// export { IStage, IStageParams, IExportType } from './stage';

// // export * from './graphic';
// export { ICanvas, ICanvasLike } from './canvas';
// export { IContext2d, IContextLike, ICommonStyleParams, IStrokeStyleParams, ITextStyleParams } from './context';

// export { IPath2D, ICustomPath2D, CommandType, ICurvePath, ICurve } from './path';

// export { IColor, IColorStop, IConicalGradient, ILinearGradient, IRadialGradient } from './color';

// export { ICurveType } from './common';
// // export { IAreaCacheItem } from './graphic';

export * from './global';
export * from './common';
export * from './node-tree';
export * from './graphic';
export * from './graphic/index';
export * from './graphic/arc';
export * from './graphic/arc3d';
export * from './graphic/area';
export * from './graphic/circle';
export * from './graphic/group';
export * from './graphic/image';
export * from './graphic/line';
export * from './graphic/path';
export * from './graphic/rect';
export * from './graphic/rect3d';
export * from './graphic/glyph';
export * from './graphic/richText';
export * from './graphic/symbol';
export * from './graphic/text';
export * from './graphic/polygon';
export * from './graphic/pyramid3d';
export * from './graphic/shadow-root';
export * from './graphic/face3d';
export * from './layer';
export * from './stage';
export * from './canvas';
export * from './context';
export * from './path';
export * from './color';
export * from './common';
export * from './animate';
export * from './camera';
export * from './matrix';
export * from './light';
export * from './curve';
export * from './graphic-service';
