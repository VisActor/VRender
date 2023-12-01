import type {
  IGroup,
  IGroupGraphicAttribute,
  IText,
  IShadowRoot,
  IGraphic,
  IWrapTextGraphicAttribute
} from '@visactor/vrender-core';
import { Group, ShadowRoot as MarkShadowRoot, WrapText, graphicCreator } from '@visactor/vrender-core';

export function createGroup(attributes: IGroupGraphicAttribute): IGroup {
  return new Group(attributes);
}

export function createWrapText(attributes: IWrapTextGraphicAttribute): IText {
  return new WrapText(attributes);
}
export function createShadowRoot(graphic?: IGraphic): IShadowRoot {
  return new MarkShadowRoot(graphic);
}

export function registerGroup() {
  graphicCreator.RegisterGraphicCreator('group', createGroup);
}

export function registerWrapText() {
  graphicCreator.RegisterGraphicCreator('wrapText', createWrapText);
}

export function registerShadowRoot() {
  graphicCreator.RegisterGraphicCreator('shadowRoot', createShadowRoot);
}

export * from './register-arc';
export * from './register-arc3d';
export * from './register-area';
export * from './register-circle';
export * from './register-glyph';
export * from './register-image';
export * from './register-line';
export * from './register-path';
export * from './register-polygon';
export * from './register-pyramid3d';
export * from './register-rect';
export * from './register-rect3d';
export * from './register-richtext';
export * from './register-symbol';
export * from './register-text';
