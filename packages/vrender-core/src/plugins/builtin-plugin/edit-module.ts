import type { IRichText, IRichTextCharacter, IRichTextParagraphCharacter } from '../../interface';
import { IRichTextIcon, IRichTextParagraph } from '../../interface';

export function findCursorIndexIgnoreLinebreak(textConfig: IRichTextCharacter[], cursorIndex: number): number {
  let index = 0;
  for (index = 0; index < textConfig.length; index++) {
    const c = textConfig[index] as IRichTextParagraphCharacter;
    if (!(c.text && c.text === '\n')) {
      cursorIndex--;
    }
    if (cursorIndex < 0) {
      break;
    }
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
  onInputCbList: Array<
    (text: string, isComposing: boolean, cursorIdx: number, rt: IRichText, pos: 'left' | 'right') => void
  >;
  // change的回调（composing确认才会触发）
  onChangeCbList: Array<
    (text: string, isComposing: boolean, cursorIdx: number, rt: IRichText, pos: 'left' | 'right') => void
  >;

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

  onInput(cb: (text: string, isComposing: boolean, cursorIdx: number, rt: IRichText, pos: 'left' | 'right') => void) {
    this.onInputCbList.push(cb);
  }

  onChange(cb: (text: string, isComposing: boolean, cursorIdx: number, rt: IRichText, pos: 'left' | 'right') => void) {
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
    window.addEventListener('keydown', this.handleKeyDown);
  }

  handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Delete' || e.key === 'Backspace') {
      this.handleInput({ data: null, type: 'Backspace' });
    }
  };

  handleCompositionStart = () => {
    const { textConfig = [] } = this.currRt.attribute;
    const cursorIndex = findCursorIndexIgnoreLinebreak(textConfig, this.cursorIndex);
    const lastConfig = textConfig[cursorIndex];
    textConfig.splice(cursorIndex + 1, 0, { ...lastConfig, text: '' });
    this.isComposing = true;
  };
  handleCompositionEnd = () => {
    this.isComposing = false;
    // 拆分上一次的内容
    const { textConfig = [] } = this.currRt.attribute;
    const curIdx = findCursorIndexIgnoreLinebreak(textConfig, this.cursorIndex + 1);

    const lastConfig = textConfig[curIdx];
    textConfig.splice(curIdx, 1);
    const text = (lastConfig as any).text;
    const textList: string[] = Array.from(text.toString());
    for (let i = 0; i < textList.length; i++) {
      textConfig.splice(i + curIdx, 0, { ...lastConfig, text: textList[i] });
    }
    this.currRt.setAttributes({ textConfig });
    this.onChangeCbList.forEach(cb => {
      cb(text, this.isComposing, this.cursorIndex + textList.length, this.currRt, 'right');
    });
  };

  handleInput = (ev: any) => {
    if (!this.currRt) {
      return;
    }
    let str = (ev as any).data;
    if (ev.type !== 'Backspace' && !str) {
      str = '\n';
    }
    // 如果是回车，那就不往后+1
    const { textConfig = [] } = this.currRt.attribute;

    // 如果有选中多个文字，那就先删除
    let startIdx = this.selectionStartCursorIdx;
    let endIdx = this.cursorIndex;
    if (startIdx > endIdx) {
      [startIdx, endIdx] = [endIdx, startIdx];
    }
    // 无论是否composition都立刻恢复到没有选中的idx状态
    this.selectionStartCursorIdx = startIdx;
    this.cursorIndex = startIdx;

    // 转换成基于textConfig的
    startIdx = findCursorIndexIgnoreLinebreak(textConfig, startIdx);
    const delta = this.selectionStartCursorIdx - startIdx;
    endIdx = findCursorIndexIgnoreLinebreak(textConfig, endIdx);

    const lastConfig = textConfig[startIdx + (this.isComposing ? 1 : 0)];
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
    }

    this.currRt.setAttributes({ textConfig });
    if (!this.isComposing) {
      this.onChangeCbList.forEach(cb => {
        cb(str, this.isComposing, startIdx + delta, this.currRt, str === '\n' ? 'left' : 'right');
      });
    } else {
      this.onInputCbList.forEach(cb => {
        cb(str, this.isComposing, startIdx + delta, this.currRt, str === '\n' ? 'left' : 'right');
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
    window.removeEventListener('keydown', this.handleKeyDown);
  }
}
