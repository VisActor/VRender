import type { IRichText, IRichTextGraphicAttribute } from './core';
import { RichText, container, graphicCreator, richtextModule } from './core';
import { browser } from './isbrowser';
import { richTextMathPickModule, richtextCanvasPickModule } from './kits';

export function createRichText(attributes: IRichTextGraphicAttribute): IRichText {
  return new RichText(attributes);
}

export function registerRichtext() {
  graphicCreator.RegisterGraphicCreator('richtext', createRichText);
  container.load(richtextModule);
  container.load(browser ? richtextCanvasPickModule : richTextMathPickModule);
}
