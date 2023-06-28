import type { IContribution } from './contribution';
import type { IGraphicUtil } from './core';

export interface TextOptionsType {
  fontSize?: number;
  fontWeight?: string | number;
  fontFamily?: string;
  fontStyle?: string;
  fontVariant?: string;
}

export interface ITextMeasure extends IContribution<IGraphicUtil> {
  measureTextWidth: (text: string, options: TextOptionsType) => number;
  measureTextPixelHeight: (text: string, options: TextOptionsType) => number;
  measureTextBoundHieght: (text: string, options: TextOptionsType) => number;
  clipText: (text: string, options: TextOptionsType, width: number) => { str: string; width: number };
  clipTextWithSuffix: (
    text: string,
    options: TextOptionsType,
    width: number,
    suffix: string
  ) => { str: string; width: number };
  measureText: (text: string, options: TextOptionsType) => { width: number };
}
