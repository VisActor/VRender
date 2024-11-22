import type { IContribution } from './contribution';
import type { IGraphicUtil } from './core';
import type { MeasureModeEnum } from './graphic/text';

export interface TextOptionsType {
  fontSize?: number;
  fontWeight?: string | number;
  fontFamily?: string;
  fontStyle?: string;
  fontVariant?: string;
  lineHeight?: number;
  textBaseline?: 'alphabetic' | 'top' | 'middle' | 'bottom';
  textAlign?: 'left' | 'center' | 'right' | 'start' | 'end';
}

export interface ITextMeasure extends IContribution<IGraphicUtil> {
  measureTextWidth: (text: string, options: TextOptionsType) => number;
  measureTextPixelHeight: (text: string, options: TextOptionsType) => number;
  measureTextBoundHieght: (text: string, options: TextOptionsType) => number;
  measureTextPixelADscentAndWidth: (
    text: string,
    options: TextOptionsType,
    mode: MeasureModeEnum
  ) => { width: number; ascent: number; descent: number };
  clipText: (
    text: string,
    options: TextOptionsType,
    width: number,
    wordBreak: boolean,
    keepAllBreak?: boolean
  ) => { str: string; width: number; wordBreaked?: number };
  clipTextVertical: (
    verticalList: { text: string; width?: number; direction: number }[],
    options: TextOptionsType,
    width: number,
    wordBreak: boolean
  ) => { verticalList: { text: string; width?: number; direction: number }[]; width: number };
  clipTextWithSuffix: (
    text: string,
    options: TextOptionsType,
    width: number,
    suffix: string | boolean,
    wordBreak: boolean,
    position: 'start' | 'end' | 'middle',
    forceSuffix?: boolean
  ) => { str: string; width: number };
  clipTextWithSuffixVertical: (
    verticalList: { text: string; width?: number; direction: number }[],
    options: TextOptionsType,
    width: number,
    suffix: string,
    wordBreak: boolean,
    suffixPosition: 'start' | 'end' | 'middle'
  ) => { verticalList: { text: string; width?: number; direction: number }[]; width: number };
  measureText: (text: string, options: TextOptionsType) => { width: number };
}
