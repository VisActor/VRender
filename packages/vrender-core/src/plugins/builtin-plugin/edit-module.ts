import type { IRichText } from '../../interface';
import { IRichTextIcon, IRichTextParagraph } from '../../interface';

export class EditModule {
  container: HTMLElement;
  textAreaDom: HTMLTextAreaElement;
  currRt: IRichText;
  isComposing: boolean;
  cursorIndex: number;
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
      `width: 100px; height: 30px; left: 0; position: absolute; z-index: -1; outline: none; resize: none; border: none; overflow: hidden; color: transparent; user-select: none; caret-color: transparent;background-color: transparent;`
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
    const lastConfig = textConfig[this.cursorIndex];
    textConfig.splice(this.cursorIndex + 1, 0, { ...lastConfig, text: '' });
    this.isComposing = true;
  };
  handleCompositionEnd = () => {
    this.isComposing = false;

    // 拆分上一次的内容
    const { textConfig = [] } = this.currRt.attribute;
    const lastConfig = textConfig[this.cursorIndex];
    textConfig.splice(this.cursorIndex, 1);
    const text = (lastConfig as any).text;
    for (let i = this.cursorIndex; i < this.cursorIndex + text.length; i++) {
      const t = text[i - this.cursorIndex];
      textConfig.splice(i, 0, { ...lastConfig, text: t });
    }
    this.currRt.setAttributes({ textConfig });
    this.onChangeCbList.forEach(cb => {
      cb(text, this.isComposing, this.cursorIndex + text.length, this.currRt);
    });
  };

  handleInput = (ev: any) => {
    if (!this.currRt) {
      return;
    }
    const str = (ev as any).data || '\n';
    // 如果是回车，那就不往后+1
    let cursorOffset = (ev as any).data ? 1 : 0;
    const { textConfig = [] } = this.currRt.attribute;
    const lastConfig = textConfig[this.cursorIndex + (this.isComposing ? 1 : 0)];
    let currConfig = lastConfig;
    if (ev.type === 'Backspace') {
      textConfig.splice(this.cursorIndex, 1);
      cursorOffset = -1;
    } else {
      if (!this.isComposing) {
        currConfig = { ...lastConfig, text: '' };
        textConfig.splice(this.cursorIndex + 1, 0, currConfig);
      }
      (currConfig as any).text = str;
    }
    this.currRt.setAttributes({ textConfig });
    if (!this.isComposing) {
      this.onChangeCbList.forEach(cb => {
        cb(str, this.isComposing, this.cursorIndex + cursorOffset, this.currRt);
      });
    } else {
      this.onInputCbList.forEach(cb => {
        cb(str, this.isComposing, this.cursorIndex + cursorOffset, this.currRt);
      });
    }
    // this.cursorIndex = textConfig.findIndex(item => item === currConfig);
  };

  moveTo(x: number, y: number, rt: IRichText, cursorIndex: number) {
    this.textAreaDom.style.left = `${x}px`;
    this.textAreaDom.style.top = `${y}px`;
    setTimeout(() => {
      this.textAreaDom.focus();
      this.textAreaDom.setSelectionRange(0, 0);
    });
    this.currRt = rt;

    this.cursorIndex = cursorIndex;
  }

  release() {
    this.textAreaDom.removeEventListener('input', this.handleInput);
    this.textAreaDom.removeEventListener('compositionstart', this.handleCompositionStart);
    this.textAreaDom.removeEventListener('compositionend', this.handleCompositionEnd);
    window.removeEventListener('keydown', this.handleKeyDown);
  }
}
