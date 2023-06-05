import { injectable } from 'inversify';
import { Generator } from '../../../common';
import { IWindow, IWindowHandlerContribution, IWindowParams } from '../..';
import { ICanvas, IContext2d, IDomRectLike, EnvType, IGlobal } from '../../../interface';
import { IBoundsLike } from '@visactor/vutils';

type OnchangeCbType = (params: { x: number; y: number; width: number; height: number }) => void;

@injectable()
export abstract class BaseWindowHandlerContribution implements IWindowHandlerContribution {
  declare type: EnvType;

  declare _uid: number;

  constructor() {
    this._uid = Generator.GenAutoIncrementId();
  }

  protected declare _onChangeCb?: OnchangeCbType;

  onChange(cb: OnchangeCbType) {
    this._onChangeCb = cb;
  }

  configure(window: IWindow, global: IGlobal) {
    if (global.env === this.type) {
      window.setWindowHandler(this);
    }
  }
  abstract createWindow(params: IWindowParams): void;
  abstract releaseWindow(): void;
  abstract setDpr(dpr: number): void;
  abstract resizeWindow(width: number, height: number): void;
  abstract getContext(): IContext2d;
  abstract getWH(): { width: number; height: number };
  abstract getTitle(): string;
  abstract getXY(): { x: number; y: number };
  abstract getNativeHandler(): ICanvas | any;
  abstract getDpr(): number;
  abstract clearViewBox(vb: IBoundsLike, color?: string): void;
  abstract addEventListener<K extends keyof DocumentEventMap>(
    type: K,
    listener: (this: Document, ev: DocumentEventMap[K]) => any,
    options?: boolean | AddEventListenerOptions
  ): void;
  abstract addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  abstract removeEventListener<K extends keyof DocumentEventMap>(
    type: K,
    listener: (this: Document, ev: DocumentEventMap[K]) => any,
    options?: boolean | EventListenerOptions
  ): void;
  abstract removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
  abstract dispatchEvent(event: any): boolean;

  abstract getStyle(): CSSStyleDeclaration | Record<string, any>;
  abstract setStyle(style: CSSStyleDeclaration | Record<string, any>): void;
  abstract getBoundingClientRect(): IDomRectLike;
}
