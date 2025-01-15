import { application } from '../../application';
import type {
  IRichText,
  IRichTextCharacter,
  IRichTextGraphicAttribute,
  IRichTextParagraphCharacter
} from '../../interface';

// function getMaxConfigIndexIgnoreLinebreak(textConfig: IRichTextCharacter[]) {
//   let idx = 0;
//   for (let i = 0; i < textConfig.length; i++) {
//     const c = textConfig[i] as IRichTextParagraphCharacter;
//     if (c.text !== '\n') {
//       idx++;
//     }
//   }
//   return Math.max(idx - 1, 0);
// }

function getDefaultCharacterConfig(attribute: IRichTextGraphicAttribute) {
  const { fill = 'black', stroke = false, fontWeight = 'normal', fontFamily = 'Arial' } = attribute;
  let { fontSize = 12 } = attribute;
  if (!isFinite(fontSize)) {
    fontSize = 12;
  }
  return {
    fill,
    stroke,
    fontSize,
    fontWeight,
    fontFamily
  } as any;
}

/**
 * 找到cursorIndex所在的textConfig的位置，给出的index就是要插入的准确位置
 * @param textConfig
 * @param cursorIndex
 * @returns
 */
export function findConfigIndexByCursorIdx(textConfig: IRichTextCharacter[], cursorIndex: number): number {
  if (cursorIndex < 0) {
    return 0;
  }

  // 排序找到对应的元素
  const intCursorIndex = Math.round(cursorIndex);
  let tempCursorIndex = intCursorIndex;
  // 跳过连续换行符中的第一个换行符
  let lineBreak = false;
  let configIdx = 0;
  for (configIdx = 0; configIdx < textConfig.length && tempCursorIndex >= 0; configIdx++) {
    const c = textConfig[configIdx] as IRichTextParagraphCharacter;
    if (c.text === '\n') {
      tempCursorIndex -= Number(lineBreak);
      lineBreak = true;
    } else {
      tempCursorIndex--;
      lineBreak = false;
    }
  }
  // 说明过限了
  if (tempCursorIndex >= 0) {
    return textConfig.length;
  }
  configIdx -= 1;

  // 如果有换行，一定在换行符左边写
  if (cursorIndex > intCursorIndex && !lineBreak) {
    configIdx += 1;
  }
  return configIdx;
}

/**
 * 根据configIndex找到cursorIndex的位置，忽略单个换行符，连续换行符的时候只忽略第一个
 * @param textConfig
 * @param configIndex
 * @returns
 */
export function findCursorIdxByConfigIndex(textConfig: IRichTextCharacter[], configIndex: number): number {
  let cursorIndex = 0;
  if (configIndex < 0) {
    return -0.1;
  }
  // 仅有一个\n，那不算
  // 如果有连续的\n，那就少算一个
  let lastLineBreak = false;

  for (let i = 0; i <= configIndex && i < textConfig.length; i++) {
    const c = textConfig[i] as IRichTextParagraphCharacter;
    if (c.text === '\n') {
      cursorIndex += Number(lastLineBreak);
      lastLineBreak = true;
    } else {
      cursorIndex++;
      lastLineBreak = false;
    }
  }
  cursorIndex = Math.max(cursorIndex - 1, 0);

  // 超出区间了直接设置到尾部，configIndex超过区间，cursorIndex不会超过
  if (configIndex > textConfig.length - 1) {
    // 如果最后一行是一个换行符，那么就得是xx.9否则就是xx.1
    if ((textConfig[textConfig.length - 1] as any)?.text === '\n') {
      return cursorIndex + 0.9;
    }
    return cursorIndex + 0.1;
  }

  // 如果是这个configIdx对应到的是单个换行的话，那么算到下一个字符上
  const lineBreak = (textConfig[configIndex] as any)?.text === '\n';
  if (configIndex >= textConfig.length - 1 && lineBreak) {
    return cursorIndex + 1 - 0.1;
  }
  const singleLineBreak = lineBreak && (textConfig[configIndex - 1] as any)?.text !== '\n';

  // 光标往左放
  cursorIndex -= 0.1;

  // 如果是单行，那么这一个换行符没有算字符，光标要往右放
  if (singleLineBreak) {
    cursorIndex += 0.2;
  }
  return cursorIndex;
}

export class EditModule {
  container: HTMLElement;
  textAreaDom: HTMLTextAreaElement;
  currRt: IRichText;
  isComposing: boolean;
  composingConfigIdx: number;
  cursorIndex: number;
  selectionStartCursorIdx: number;
  // 输入的回调（composing的时候每次也会触发）
  onInputCbList: Array<(text: string, isComposing: boolean, cursorIdx: number, rt: IRichText) => void>;
  // change的回调（composing确认才会触发）
  onChangeCbList: Array<(text: string, isComposing: boolean, cursorIdx: number, rt: IRichText) => void>;
  onFocusInList: Array<() => void>;
  onFocusOutList: Array<() => void>;
  focusOutTimer: number;

  constructor(container?: HTMLElement) {
    this.container = container ?? document.body;

    const textAreaDom = document.createElement('textarea');
    textAreaDom.autocomplete = 'off';
    textAreaDom.innerText = '';
    this.applyStyle(textAreaDom);
    this.container.append(textAreaDom);
    this.textAreaDom = textAreaDom;
    this.isComposing = false;
    this.composingConfigIdx = -1;
    this.onInputCbList = [];
    this.onChangeCbList = [];
    this.onFocusInList = [];
    this.onFocusOutList = [];
  }

  onInput(cb: (text: string, isComposing: boolean, cursorIdx: number, rt: IRichText) => void) {
    this.onInputCbList.push(cb);
  }

  onChange(cb: (text: string, isComposing: boolean, cursorIdx: number, rt: IRichText) => void) {
    this.onChangeCbList.push(cb);
  }

  onFocusIn(cb: () => void) {
    this.onFocusInList.push(cb);
  }

  onFocusOut(cb: () => void) {
    this.onFocusOutList.push(cb);
  }

  applyStyle(textAreaDom: HTMLTextAreaElement) {
    textAreaDom.setAttribute(
      'style',
      `width: 100px; height: 30px; left: 0; top: 0; position: absolute; z-index: -1; outline: none; resize: none; border: none; overflow: hidden; color: transparent; user-select: none; caret-color: transparent;background-color: transparent;`
    );

    textAreaDom.addEventListener('input', this.handleInput);
    textAreaDom.addEventListener('compositionstart', this.handleCompositionStart);
    textAreaDom.addEventListener('compositionend', this.handleCompositionEnd);
    // 监听焦点
    textAreaDom.addEventListener('focusin', this.handleFocusIn);
    textAreaDom.addEventListener('focusout', this.handleFocusOut);
    application.global.addEventListener('keydown', this.handleKeyDown);
  }

  handleFocusIn = () => {
    // this.focusOutTimer && clearTimeout(this.focusOutTimer);
    // this.focusOutTimer = 0;
    // this.onFocusInList && this.onFocusInList.forEach(cb => cb());
  };
  handleFocusOut = () => {
    // 暂时注释，会导致非期待情况下的误关闭
    // // 延时触发，避免误关闭
    // this.focusOutTimer = setTimeout(() => {
    //   this.onFocusOutList && this.onFocusOutList.forEach(cb => cb());
    // }, 100);
  };

  handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Delete' || e.key === 'Backspace') {
      this.handleInput({ data: null, type: 'Backspace' });
    }
  };

  handleCompositionStart = () => {
    this.isComposing = true;
    const { textConfig = [] } = this.currRt.attribute;
    this.composingConfigIdx = this.cursorIndex < 0 ? 0 : findConfigIndexByCursorIdx(textConfig, this.cursorIndex);
    if (this.cursorIndex < 0) {
      const config = textConfig[0];
      textConfig.unshift({ ...getDefaultCharacterConfig(this.currRt.attribute), ...config, text: '' });
    } else {
      const configIdx = this.composingConfigIdx;
      const lastConfig = textConfig[configIdx] || textConfig[configIdx - 1];
      textConfig.splice(configIdx, 0, { ...lastConfig, text: '' });
    }
  };
  handleCompositionEnd = () => {
    this.isComposing = false;

    const text = this.parseCompositionStr(this.composingConfigIdx);
    // 拆分上一次的内容
    // const { textConfig = [] } = this.currRt.attribute;
    // const configIdx = this.composingConfigIdx;

    // const lastConfig = textConfig[configIdx];
    // textConfig.splice(configIdx, 1);
    // const text = (lastConfig as any).text;
    // const textList: string[] = text ? Array.from(text.toString()) : [];
    // for (let i = 0; i < textList.length; i++) {
    //   textConfig.splice(i + configIdx, 0, { ...lastConfig, isComposing: false, text: textList[i] } as any);
    // }
    // this.currRt.setAttributes({ textConfig });
    // const nextConfigIdx = configIdx + textList.length;
    // this.cursorIndex = findCursorIdxByConfigIndex(textConfig, nextConfigIdx);
    this.composingConfigIdx = -1;

    this.onChangeCbList.forEach(cb => {
      cb(
        text,
        this.isComposing,
        // TODO 当换行后刚开始输入会有问题，后续看这里具体Cursor变换逻辑
        this.cursorIndex,
        this.currRt
      );
    });
  };

  /**
   * 复合输入以及粘贴，都会复制出一大段内容，这时候需要重新处理textConfig和cursorIndex
   * 1. 拆分text到textConfig
   * 2. 计算新的cursorIndex
   * @param configIdx
   */
  parseCompositionStr(configIdx: number) {
    const { textConfig = [] } = this.currRt.attribute;

    const lastConfig = textConfig[configIdx];
    textConfig.splice(configIdx, 1);
    const text = (lastConfig as any).text;
    const textList: string[] = text ? Array.from(text.toString()) : [];
    for (let i = 0; i < textList.length; i++) {
      textConfig.splice(i + configIdx, 0, {
        fill: 'black',
        ...lastConfig,
        isComposing: false,
        text: textList[i]
      } as any);
    }
    this.currRt.setAttributes({ textConfig });
    const nextConfigIdx = configIdx + textList.length;
    this.cursorIndex = findCursorIdxByConfigIndex(textConfig, nextConfigIdx);
    return text;
  }

  handleInput = (ev: any) => {
    if (!this.currRt) {
      return;
    }
    if (ev.inputType === 'historyUndo') {
      return;
    }
    const { textConfig = [], ...rest } = this.currRt.attribute;
    // 删完了，直接返回
    if (ev.type === 'Backspace' && !textConfig.length) {
      return;
    }

    let str = (ev as any).data;
    if (!this.isComposing && ev.type !== 'Backspace' && !str) {
      str = '\n';
    }

    // 处理正反选
    if (this.selectionStartCursorIdx > this.cursorIndex) {
      [this.cursorIndex, this.selectionStartCursorIdx] = [this.selectionStartCursorIdx, this.cursorIndex];
    }

    const startIdx = findConfigIndexByCursorIdx(textConfig, this.selectionStartCursorIdx);
    const endIdx = findConfigIndexByCursorIdx(textConfig, this.cursorIndex);

    // composing的话会插入一个字符，所以往右加一个
    const lastConfigIdx = this.isComposing ? this.composingConfigIdx : Math.max(startIdx - 1, 0);
    // 算一个默认属性
    let lastConfig: any = textConfig[lastConfigIdx];
    if (!lastConfig) {
      lastConfig = getDefaultCharacterConfig(rest);
    }
    let nextConfig = lastConfig;

    if (startIdx !== endIdx) {
      textConfig.splice(startIdx, endIdx - startIdx);
      if (this.isComposing) {
        this.composingConfigIdx = startIdx;
      }
    }

    let nextConfigIdx = startIdx;

    // 删除键
    if (ev.type === 'Backspace' && !this.isComposing) {
      if (startIdx === endIdx) {
        if (startIdx <= 0) {
          return;
        }
        // 删除
        textConfig.splice(startIdx - 1, 1);
        nextConfigIdx = Math.max(startIdx - 1, 0);
      } else {
        // 不插入内容
      }
    } else {
      // 插入
      if (!this.isComposing) {
        nextConfig = { fill: 'black', ...lastConfig, text: '' };
        textConfig.splice(startIdx, 0, nextConfig);
        nextConfigIdx++;
      }
      // 插入
      nextConfig.text = str;
      // 标记isComposing，用来判定是否应该拆分成单个字符
      nextConfig.isComposing = this.isComposing;
    }

    this.currRt.setAttributes({ textConfig });
    // 重新计算cursorIdx
    // nextConfigIdx = Math.min(nextConfigIdx, textConfig.length - 1);

    let cursorIndex = this.cursorIndex;
    if (str && str.length > 1 && !this.isComposing) {
      // 如果字符长度大于1且不是composing，那说明是粘贴
      // 拆分
      this.parseCompositionStr(nextConfigIdx - 1);
      cursorIndex = this.cursorIndex;
    } else {
      // composing的时候不偏移，只有完整输入后才偏移
      cursorIndex = findCursorIdxByConfigIndex(textConfig, nextConfigIdx);
      if (!this.isComposing) {
        this.cursorIndex = cursorIndex;
      } else {
        this.cursorIndex = this.selectionStartCursorIdx;
      }
    }

    if (!this.isComposing) {
      this.onChangeCbList.forEach(cb => {
        cb(str, this.isComposing, cursorIndex, this.currRt);
      });
    } else {
      this.onInputCbList.forEach(cb => {
        cb(str, this.isComposing, cursorIndex, this.currRt);
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
    this.textAreaDom.addEventListener('focusin', this.handleFocusOut);
    this.textAreaDom.addEventListener('focusout', this.handleFocusOut);
    application.global.removeEventListener('keydown', this.handleKeyDown);
  }
}
