import type {
  IGroupGraphicAttribute,
  IRichTextGraphicAttribute,
  ISymbolGraphicAttribute
} from '@visactor/vrender-core';

export interface ILiItemAttrs {
  title?: IRichTextGraphicAttribute; // 标题样式
  text?: IRichTextGraphicAttribute; // 内容样式
  icon?: ISymbolGraphicAttribute; // 图标样式
}

export interface IStoryListAttrs extends IGroupGraphicAttribute {
  colors: string[];
  list: ILiItemAttrs[];
  width: number;
  height: number;
}

export interface IStoryArrowListAttrs extends IStoryListAttrs {
  direction?: 'right' | 'left' | 'up' | 'down'; // 箭头方向
  titleTextOrder?: 'top' | 'bottom'; // 标题文本顺序，默认是标题在上，文本在下
  themeStyle?: 'normal' | 'stroke-only' | 'fill-only'; // 主题风格
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
