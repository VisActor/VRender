import { application } from '../../application';
import type { IRichText, IRichTextCharacter, IRichTextParagraphCharacter } from '../../interface';
import { IRichTextIcon, IRichTextParagraph } from '../../interface';

function getMaxConfigIndexIgnoreLinebreak(textConfig: IRichTextCharacter[]) {
  let idx = 0;
  for (let i = 0; i < textConfig.length; i++) {
    const c = textConfig[i] as IRichTextParagraphCharacter;
    if (c.text !== '\n') {
      idx++;
    }
  }
  return Math.max(idx - 1, 0);
}

/**
 * 找到cursorIndex所在的textConfig的位置，忽略换行符
 * @param textConfig
 * @param cursorIndex
 * @returns
 */
export function findConfigIndex(textConfig: IRichTextCharacter[], cursorIndex: number): number {
  let index = 0;
  // 小于0是在最前面了
  if (cursorIndex < 0) {
    return -1;
  }
  let idx = Math.round(cursorIndex);
  for (index = 0; index < textConfig.length; index++) {
    const c = textConfig[index] as IRichTextParagraphCharacter;
    if (c.text !== '\n') {
      idx--;
    }
    if (idx < 0) {
      break;
    }
  }
  if (cursorIndex - Math.round(cursorIndex) < 0) {
    index--;
  }
  index = Math.max(index, 0);
  // 避免超过限度，最后一个字符可能是换行符，算一个字符
  return Math.min(index, textConfig.length - 1);
}

export function textConfigIgnoreLinebreakIdxToCursorIdx(textConfig: IRichTextCharacter[], cursorIndex: number): number {
  let index = 0;
  for (let i = 0; i < cursorIndex; i++) {
    const c = textConfig[i] as IRichTextParagraphCharacter;
    if (c.text !== '\n') {
      index++;
    }
  }
  // 正常Cursor是放在右边的，但如果回退到换行符了，那就放在左侧
  if ((textConfig[cursorIndex] as any)?.text === '\n') {
    index -= 0.1;
  } else {
    index += 0.1;
  }
  return index;
}

export class EditModule {
  container: HTMLElement;
  textAreaDom: HTMLTextAreaElement;
  currRt: IRichText;
  isComposing: boolean;
  cursorIndex: number;
  selectionStartCursorIdx: number;
  // 输入的回调（composing的时候每次也会触发）
  onInputCbList: Array<(text: string, isComposing: boolean, cursorIdx: number, rt: IRichText) => void>;
  // change的回调（composing确认才会触发）
  onChangeCbList: Array<(text: string, isComposing: boolean, cursorIdx: number, rt: IRichText) => void>;

  constructor(container?: HTMLElement) {
    this.container = container ?? document.body;

    const textAreaDom = document.createElement('textarea');
    textAreaDom.autocomplete = 'off';
    textAreaDom.innerText = '';
    this.applyStyle(textAreaDom);
    this.container.append(textAreaDom);
    this.textAreaDom = textAreaDom;
    this.isComposing = false;
    this.onInputCbList = [];
    this.onChangeCbList = [];
  }

  onInput(cb: (text: string, isComposing: boolean, cursorIdx: number, rt: IRichText) => void) {
    this.onInputCbList.push(cb);
  }

  onChange(cb: (text: string, isComposing: boolean, cursorIdx: number, rt: IRichText) => void) {
    this.onChangeCbList.push(cb);
  }

  applyStyle(textAreaDom: HTMLTextAreaElement) {
    textAreaDom.setAttribute(
      'style',
      `width: 100px; height: 30px; left: 0; top: 0; position: absolute; z-index: -1; outline: none; resize: none; border: none; overflow: hidden; color: transparent; user-select: none; caret-color: transparent;background-color: transparent;`
    );

    textAreaDom.addEventListener('input', this.handleInput);
    textAreaDom.addEventListener('compositionstart', this.handleCompositionStart);
    textAreaDom.addEventListener('compositionend', this.handleCompositionEnd);
    application.global.addEventListener('keydown', this.handleKeyDown);
  }

  handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Delete' || e.key === 'Backspace') {
      this.handleInput({ data: null, type: 'Backspace' });
    }
  };

  handleCompositionStart = () => {
    const { textConfig = [] } = this.currRt.attribute;
    if (this.cursorIndex < 0) {
      const config = textConfig[0];
      textConfig.unshift({ fill: 'black', ...config, text: '' });
    } else {
      const cursorIndex = findConfigIndex(textConfig, this.cursorIndex);
      const lastConfig = textConfig[cursorIndex];
      textConfig.splice(cursorIndex + 1, 0, { ...lastConfig, text: '' });
    }

    this.isComposing = true;
  };
  handleCompositionEnd = () => {
    this.isComposing = false;
    // 拆分上一次的内容
    const { textConfig = [] } = this.currRt.attribute;
    const configIdx = findConfigIndex(textConfig, this.cursorIndex + 1);

    const lastConfig = textConfig[configIdx];
    textConfig.splice(configIdx, 1);
    const text = (lastConfig as any).text;
    const textList: string[] = text ? Array.from(text.toString()) : [];
    for (let i = 0; i < textList.length; i++) {
      textConfig.splice(i + configIdx, 0, { ...lastConfig, text: textList[i] });
    }
    this.currRt.setAttributes({ textConfig });
    this.onChangeCbList.forEach(cb => {
      cb(
        text,
        this.isComposing,
        // TODO 当换行后刚开始输入会有问题，后续看这里具体Cursor变换逻辑
        Math.min(this.cursorIndex + textList.length, getMaxConfigIndexIgnoreLinebreak(textConfig) + 0.1),
        this.currRt
      );
    });
  };

  handleInput = (ev: any) => {
    if (!this.currRt) {
      return;
    }

    // 如果是回车，那就不往后+1
    const { textConfig = [], ...rest } = this.currRt.attribute;
    // 删完了，直接返回
    if (ev.type === 'Backspace' && !textConfig.length) {
      return;
    }

    let str = (ev as any).data;
    if (!this.isComposing && ev.type !== 'Backspace' && !str) {
      str = '\n';
    }

    // 如果有选中多个文字，那就先删除
    let startIdx = this.selectionStartCursorIdx;
    let endIdx = this.cursorIndex;
    if (startIdx > endIdx) {
      [startIdx, endIdx] = [endIdx, startIdx];
    }
    // 无论是否composition都立刻恢复到没有选中的idx状态
    this.selectionStartCursorIdx = startIdx;

    // 转换成基于textConfig的
    // let delta = 0;
    startIdx = findConfigIndex(textConfig, startIdx);
    // delta = this.selectionStartCursorIdx - startIdx;
    endIdx = findConfigIndex(textConfig, endIdx);
    // console.log(startIdx, delta, endIdx);

    let idxDelta = 0;
    // 如果是换行，得往回一格
    if (str === '\n') {
      idxDelta = -0.2;
    }

    const lastConfigIdx = startIdx + (this.isComposing ? 1 : 0);
    let lastConfig: any = textConfig[lastConfigIdx];
    if (!lastConfig) {
      if (textConfig.length === 0) {
        lastConfig = {
          fill: rest.fill ?? 'black',
          stroke: rest.stroke ?? false,
          fontSize: rest.fontSize ?? 12,
          fontWeight: rest.fontWeight ?? 'normal'
        };
      } else {
        lastConfig = textConfig[lastConfigIdx - 1] || textConfig[lastConfigIdx + 1];
      }
    }
    let currConfig = lastConfig;
    if (ev.type === 'Backspace' && !this.isComposing) {
      if (startIdx !== endIdx) {
        textConfig.splice(startIdx + 1, endIdx - startIdx);
      } else {
        textConfig.splice(startIdx, 1);
        startIdx -= 1;
      }
    } else {
      if (startIdx !== endIdx) {
        textConfig.splice(startIdx + 1, endIdx - startIdx);
      }

      if (!this.isComposing) {
        currConfig = { ...lastConfig, text: '' };
        startIdx += 1;
        textConfig.splice(startIdx, 0, currConfig);
      }
      (currConfig as any).text = str;
      if (!textConfig.length) {
        textConfig.push(currConfig);
      }
    }

    this.currRt.setAttributes({ textConfig });
    this.cursorIndex = textConfigIgnoreLinebreakIdxToCursorIdx(textConfig, startIdx);

    this.cursorIndex += idxDelta;
    if (!this.isComposing) {
      this.onChangeCbList.forEach(cb => {
        cb(str, this.isComposing, this.cursorIndex, this.currRt);
      });
    } else {
      this.onInputCbList.forEach(cb => {
        cb(str, this.isComposing, this.cursorIndex, this.currRt);
      });
    }
  };

  moveTo(x: number, y: number, rt: IRichText, cursorIndex: number, selectionStartCursorIdx: number) {
    this.textAreaDom.style.left = `${x}px`;
    this.textAreaDom.style.top = `${y}px`;
    setTimeout(() => {
      this.textAreaDom.focus();
      this.textAreaDom.setSelectionRange(0, 0);
    });
    this.currRt = rt;

    this.cursorIndex = cursorIndex;
    this.selectionStartCursorIdx = selectionStartCursorIdx;
  }

  release() {
    this.textAreaDom.removeEventListener('input', this.handleInput);
    this.textAreaDom.removeEventListener('compositionstart', this.handleCompositionStart);
    this.textAreaDom.removeEventListener('compositionend', this.handleCompositionEnd);
    application.global.removeEventListener('keydown', this.handleKeyDown);
  }
}
