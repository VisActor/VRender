import type {
  IGroupGraphicAttribute,
  IRichTextGraphicAttribute,
  ISymbolGraphicAttribute
} from '@visactor/vrender-core';

export interface ILiItemAttrs {
  title?: IRichTextGraphicAttribute; // 标题样式
  text?: IRichTextGraphicAttribute; // 内容样式
  icon?: ISymbolGraphicAttribute; // 图标样式
  position?: 'top' | 'bottom'; // title和text的位置，默认为top
  spaceTitleText?: number; // title和text的间距，默认为10
  space?: number; // 主体和文本的间距，默认为10
}

export interface IStoryListAttrs extends IGroupGraphicAttribute {
  colors: string[];
  list: ILiItemAttrs[];
  width: number;
  height: number;
}

export interface IStoryArrowListAttrs extends IStoryListAttrs {
  direction?: 'right' | 'left' | 'up' | 'down' | 'left-right'; // 箭头方向，添加left-right表示左右都有箭头
  titleTextOrder?: 'top' | 'bottom'; // 标题文本顺序，默认是标题在上，文本在下
  themeStyle?: 'normal' | 'stroke-only' | 'fill-only'; // 主题风格
}

export interface IStoryShapeListAttrs extends IStoryListAttrs {
  shapePath?: string; // SVG路径字符串，定义左侧的形状
  shapeRatio?: number; // 左侧形状占据总宽度的比例，默认0.4
  spacing?: number; // 列表项之间的间距，默认10
  themeStyle?: 'normal' | 'stroke-only' | 'fill-only'; // 主题风格
}

export interface IIconLabelItemAttrs extends ILiItemAttrs {
  height: number; // 整体的高度，icon、title、text会在范围内进行布局
  color: string; // 颜色，会影响icon、title、text的填充色
}

// const exampleList: ILiItemAttrs = [
//   {
//     title: {
//       textConfig: [{ text: '南亚', fontSize: 12, fill: '#000' }]
//     },
//     text: {
//       textConfig: [{ text: '预计2025年，南亚地区GDP将超过1.5万亿美元', fontSize: 12, fill: '#000' }]
//     }
//   },
//   {
//     title: {
//       textConfig: [{ text: '东亚', fontSize: 12, fill: '#000' }]
//     },
//     text: {
//       textConfig: [{ text: '预计2025年，东亚地区GDP将超过2.5万亿美元', fontSize: 12, fill: '#000' }]
//     }
//   },
//   {
//     title: {
//       textConfig: [{ text: '非洲', fontSize: 12, fill: '#000' }]
//     },
//     text: {
//       textConfig: [{ text: '预计2025年，非洲地区GDP将超过0.5万亿美元', fontSize: 12, fill: '#000' }]
//     }
//   }
// ];
