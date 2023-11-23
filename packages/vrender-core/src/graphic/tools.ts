import { application } from '../application';
import { isXML } from '../common/xml/parser';
import type { IGraphic, IGroup, ILayer, IRichTextCharacter, IRichTextImageCharacter, IStage } from '../interface';
import { isArray, type IAABBBounds } from '@visactor/vutils';
import { XMLParser } from '../common/xml';

// 不触发外部的render
export function incrementalAddTo(group: IGroup, graphic: IGraphic) {
  group.incrementalAppendChild(graphic);
  // if (group.layer && group.layer.subLayers) {
  //   // const subLayer = group.layer.subLayers.get(group._uid);
  // }
}

export async function waitForAllSubLayers(stage: IStage) {
  const promiseList: Promise<any>[] = [];
  const layers = stage.getChildren() as ILayer[];
  await new Promise(resolve => {
    application.global.getRequestAnimationFrame()(() => {
      resolve(null);
    });
  });
  layers.forEach(l => {
    if (l.subLayers.size) {
      l.subLayers.forEach(sl => {
        if (sl.drawContribution && sl.drawContribution.hooks && sl.drawContribution.rendering) {
          promiseList.push(
            new Promise(resolve => {
              sl.drawContribution!.hooks!.completeDraw.tap('outWait', () => {
                sl.drawContribution!.hooks!.completeDraw.taps = sl.drawContribution!.hooks!.completeDraw.taps.filter(
                  i => {
                    return i.name !== 'outWait';
                  }
                );
                resolve(null);
              });
            })
          );
        }
      });
    }
  });
  await Promise.all(promiseList);
}

export function boundStroke(bounds: IAABBBounds, halfW: number, miter: boolean, pad = 0) {
  bounds.expand(halfW + (pad / 2 + (miter ? miterAdjustment(miter, halfW) : 0)));
  return bounds;
}

function miterAdjustment(miter: boolean, strokeWidth: number) {
  return miter ? strokeWidth : 0;
}

// function attachShadow(graphic: Graphic) {
//   graphic.shadowRoot = createShadowRoot(graphic);
//   graphic.addUpdateBoundTag();
//   return graphic.shadowRoot;
// }

// function detachShadow(graphic: Graphic) {
//   if (graphic.shadowRoot) {
//     graphic.addUpdateBoundTag();
//     graphic.shadowRoot = null;
//   }
// }

let NUMBER_TYPE: number = 0;
export function genNumberType() {
  return NUMBER_TYPE++;
}

export enum TextDirection {
  HORIZONTAL = 0,
  VERTICAL = 1
}
export function verticalLayout(text: string) {
  const nextCharacter: { text: string; direction: TextDirection }[] = [];
  let flag = 0; // 0: 竖排，1: 旋转
  let currStr = '';
  for (let i = 0; i < text.length; i++) {
    if (rotateText(text[i])) {
      if (flag) {
        currStr += text[i];
      } else {
        flag = 1;
        currStr = text[i];
      }
    } else {
      if (flag) {
        nextCharacter.push({
          text: currStr,
          direction: TextDirection.VERTICAL
        });
        currStr = '';
        flag = 0;
      }
      nextCharacter.push({
        text: text[i],
        direction: TextDirection.HORIZONTAL
      });
    }
  }

  if (currStr) {
    nextCharacter.push({
      text: currStr,
      direction: TextDirection.VERTICAL
    });
  }
  return nextCharacter;
}

// ——, ……, （, )
const rotateCharList = ['…', '（', '）', '—', '【', '】', '「', '」', '《', '》'];
const rotateCharMap = new Map();
rotateCharList.forEach(c => rotateCharMap.set(c, true));
const noRotateCharList = [''];
const noRotateCharMap = new Map();
noRotateCharList.forEach(c => noRotateCharMap.set(c, true));

function rotateText(c: string) {
  if (rotateCharMap.has(c)) {
    return true;
  }
  if (noRotateCharMap.has(c)) {
    return false;
  }
  const cp = c.codePointAt(0);
  let rotate = false;
  // 默认ascii码就旋转
  if (cp < 256) {
    rotate = true;
  }
  return rotate;
}

export function xul(str: string | string[]): IRichTextCharacter[] {
  const xmlStr = isArray(str) ? str[0] : str;
  const config: IRichTextCharacter[] = [];
  if (!xmlStr) {
    return config;
  }
  const valid = isXML(xmlStr);
  if (valid === true) {
    const parser = new XMLParser();
    const data = parser.parse(xmlStr);
    data.tc &&
      Object.keys(data.tc).forEach(k => {
        if (k === 'text') {
          config.push(parseRTTextXML(data.tc[k]));
        } else {
          config.push(parseRTImageXML(data.tc[k]));
        }
      });
  }
  return config;
}

function parseRTTextXML(str: string): IRichTextCharacter {
  const output: IRichTextCharacter = { text: '' };
  parseCommonXML(str, output);
  const inlineText = str['#text'];
  if (inlineText) {
    output.text = inlineText;
  }

  return output;
}

function parseCommonXML(str: string, output: IRichTextCharacter) {
  const attr = (str as any).attribute;
  if (attr) {
    const attrList = attr.split(';');
    attrList.forEach((attrItem: string) => {
      if (!attrItem) {
        return;
      }
      const kv = attrItem.split(':');

      if (kv.length === 2) {
        const val = parseFloat(kv[1]);
        output[kv[0].trim()] = isFinite(val) ? val : kv[1].trim();
      } else {
        let val = '';
        for (let i = 1; i < kv.length; i++) {
          if (i > 1) {
            val += ':';
          }
          val += kv[i].trim();
        }
        output[kv[0].trim()] = val;
      }
    });
  }
}

function parseRTImageXML(str: string): IRichTextCharacter {
  const output: IRichTextImageCharacter = { image: '', width: 0, height: 0 };
  parseCommonXML(str, output);
  const image = output.image as string;
  if (image) {
    output.image = (image as any).replaceAll('&quot', '"').replaceAll('&lt', '<').replaceAll('&gt', '>');
  }
  return output;
}
