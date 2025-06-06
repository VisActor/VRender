import type { IAABBBounds, IPointLike } from '@visactor/vutils';
import { isObject, isString, max, merge } from '@visactor/vutils';
import { Generator } from '../../common/generator';
import {
  createGroup,
  createLine,
  createRect,
  createRichText,
  createText,
  getRichTextBounds,
  Graphic,
  RichText
} from '../../graphic';
import type {
  IGraphic,
  IGroup,
  ILine,
  IPlugin,
  IPluginService,
  IRect,
  IRichText,
  IRichTextCharacter,
  IRichTextFrame,
  IRichTextIcon,
  IRichTextLine,
  IRichTextParagraph,
  IRichTextParagraphCharacter,
  ITicker,
  ITimeline
} from '../../interface';
import { EditModule, findConfigIndexByCursorIdx, getDefaultCharacterConfig } from './edit-module';
import { application } from '../../application';
import { getWordStartEndIdx } from '../../graphic/richtext/utils';
// import { testLetter, testLetter2 } from '../../graphic/richtext/utils';

type UpdateType =
  | 'input'
  | 'change'
  | 'onfocus'
  | 'beforeOnfocus'
  | 'defocus'
  | 'beforeDefocus'
  | 'selection'
  | 'dispatch';

class Selection {
  selectionStartCursorIdx: number;
  curCursorIdx: number;
  rt: IRichText;

  constructor(selectionStartCursorIdx: number, curCursorIdx: number, rt: IRichText) {
    this.curCursorIdx = curCursorIdx;
    this.selectionStartCursorIdx = selectionStartCursorIdx;
    this.rt = rt;
  }

  isEmpty(): boolean {
    return this.selectionStartCursorIdx === this.curCursorIdx;
  }

  getSelectionPureText(): string {
    const minCursorIdx = Math.min(this.selectionStartCursorIdx, this.curCursorIdx);
    const maxCursorIdx = Math.max(this.selectionStartCursorIdx, this.curCursorIdx);
    if (minCursorIdx === maxCursorIdx) {
      return '';
    }
    const config = this.rt.attribute.textConfig as any;
    const startIdx = findConfigIndexByCursorIdx(config, Math.ceil(minCursorIdx));
    const endIdx = findConfigIndexByCursorIdx(config, Math.floor(maxCursorIdx));
    let str = '';
    for (let i = startIdx; i <= endIdx; i++) {
      str += config[i].text;
    }
    return str;
  }

  hasFormat(key: string): boolean {
    return this.getFormat(key) != null;
  }

  /**
   * 获取第idx中key的值
   * @param key
   * @param cursorIdx
   */
  _getFormat(key: string, cursorIdx: number) {
    if (!this.rt) {
      return null;
    }
    let idx = Math.round(cursorIdx);
    const config = this.rt.attribute.textConfig as any;
    if (!config.length) {
      return null;
    }
    for (let i = 0; i < config.length; i++) {
      if (config[i].text !== '\n') {
        idx--;
        if (idx < 0) {
          return config[i][key];
        }
      }
    }
    return config[Math.min(idx, config.length - 1)][key] ?? (this.rt.attribute as any)[key];
  }
  getFormat(key: string, supportOutAttr: boolean = false): any {
    return this.getAllFormat(key, supportOutAttr)[0];
  }

  getAllFormat(key: string, supportOutAttr: boolean = false): any {
    const valSet = new Set();
    const minCursorIdx = Math.min(this.selectionStartCursorIdx, this.curCursorIdx);
    const maxCursorIdx = Math.max(this.selectionStartCursorIdx, this.curCursorIdx);
    if (minCursorIdx === maxCursorIdx) {
      return supportOutAttr
        ? [this._getFormat(key, minCursorIdx) ?? (this.rt?.attribute as any)[key]]
        : [this._getFormat(key, minCursorIdx)];
    }
    for (let i = Math.ceil(minCursorIdx); i <= Math.floor(maxCursorIdx); i++) {
      const val = supportOutAttr
        ? this._getFormat(key, i) ?? (this.rt?.attribute as any)[key]
        : this._getFormat(key, i);
      val && valSet.add(val);
    }
    return Array.from(valSet.values());
  }
}

export const FORMAT_TEXT_COMMAND = 'FORMAT_TEXT_COMMAND';
export const FORMAT_ALL_TEXT_COMMAND = 'FORMAT_ALL_TEXT_COMMAND';
export const FORMAT_ELEMENT_COMMAND = 'FORMAT_ELEMENT_COMMAND';
export class RichTextEditPlugin implements IPlugin {
  name: 'RichTextEditPlugin' = 'RichTextEditPlugin';
  activeEvent: 'onRegister' = 'onRegister';
  pluginService: IPluginService;
  _uid: number = Generator.GenAutoIncrementId();
  key: string = this.name + this._uid;

  // 是否正在编辑
  editing: boolean = false;
  // 是否正在聚焦中
  focusing: boolean = false;
  // 鼠标是否按下，判断是否展示selection
  pointerDown: boolean = false;

  // selection组件
  editLine: ILine;
  editBg: IGroup;
  shadowPlaceHolder: IRichText;
  shadowBounds: IRect;

  ticker?: ITicker;
  timeline?: ITimeline;

  currRt: IRichText;

  // 当前的cursor信息
  // 0.1为第一个字符右侧, -0.1为第一个字符左侧
  // 1.1为第二个字符右侧，0.9为第二个字符左侧
  curCursorIdx: number;
  selectionStartCursorIdx: number;
  startCursorPos?: IPointLike;

  editModule: EditModule;

  protected commandCbs: Map<string, Array<(payload: any, p: RichTextEditPlugin) => void>>;
  protected updateCbs: Array<(type: UpdateType, p: RichTextEditPlugin, params?: any) => void>;

  // 富文本外部有align或者baseline的时候，需要对光标做偏移
  protected declare deltaX: number;
  protected declare deltaY: number;

  // static splitText(text: string) {
  //   // 😁这种emoji长度算两个，所以得处理一下
  //   return Array.from(text);
  // }

  static tryUpdateRichtext(richtext: IRichText) {
    const cache = richtext.getFrameCache();
    if (!RichText.AllSingleCharacter(cache)) {
      const tc = RichText.TransformTextConfig2SingleCharacter(richtext.attribute.textConfig);
      // richtext.attribute.textConfig.forEach((item: IRichTextParagraphCharacter) => {
      //   const textList = RichTextEditPlugin.splitText(item.text.toString());
      //   if (isString(item.text) && textList.length > 1) {
      //     // 拆分
      //     for (let i = 0; i < textList.length; i++) {
      //       const t = textList[i];
      //       tc.push({ ...item, text: t });
      //     }
      //   } else {
      //     tc.push(item);
      //   }
      // });
      richtext.setAttributes({ textConfig: tc });
      richtext.doUpdateFrameCache(tc);
    }
  }

  static CreateSelection(rt: IRichText) {
    if (!rt) {
      return null;
    }
    const { textConfig = [] } = rt.attribute;
    return new Selection(0, textConfig.length - 1, rt);
  }

  constructor() {
    this.commandCbs = new Map();
    this.commandCbs.set(FORMAT_TEXT_COMMAND, [this.formatTextCommandCb]);
    this.commandCbs.set(FORMAT_ALL_TEXT_COMMAND, [this.formatAllTextCommandCb]);
    this.updateCbs = [];
    this.deltaX = 0;
    this.deltaY = 0;
  }

  formatTextCommandCb = (payload: string, p: RichTextEditPlugin) => {
    const rt = p.currRt;
    if (!rt) {
      return;
    }
    const selectionData = p.getSelection();
    if (!selectionData) {
      return;
    }
    const { selectionStartCursorIdx, curCursorIdx } = selectionData;
    const minCursorIdx = Math.min(selectionStartCursorIdx, curCursorIdx);
    const maxCursorIdx = Math.max(selectionStartCursorIdx, curCursorIdx);
    const minConfigIdx = findConfigIndexByCursorIdx(rt.attribute.textConfig, minCursorIdx);
    const maxConfigIdx = findConfigIndexByCursorIdx(rt.attribute.textConfig, maxCursorIdx);
    const config = rt.attribute.textConfig.slice(minConfigIdx, maxConfigIdx);
    this._formatTextCommand(payload, config, rt);
  };

  formatAllTextCommandCb = (payload: string, p: RichTextEditPlugin) => {
    const rt = p.currRt;
    if (!rt) {
      return;
    }
    const config = rt.attribute.textConfig;
    this._formatTextCommand(payload, config, rt);
  };

  _formatTextCommand(payload: string, config: IRichTextCharacter[], rt: IRichText) {
    if (payload === 'bold') {
      config.forEach((item: IRichTextParagraphCharacter) => (item.fontWeight = 'bold'));
    } else if (payload === 'italic') {
      config.forEach((item: IRichTextParagraphCharacter) => (item.fontStyle = 'italic'));
    } else if (payload === 'underline') {
      config.forEach((item: IRichTextParagraphCharacter) => (item.underline = true));
    } else if (payload === 'lineThrough') {
      config.forEach((item: IRichTextParagraphCharacter) => (item.lineThrough = true));
    } else if (isObject(payload)) {
      config.forEach((item: IRichTextParagraphCharacter) => merge(item, payload));
    }
    rt.setAttributes(rt.attribute);
    // 重新渲染Selection位置，因为fontSize会影响文字大小
    const cache = rt.getFrameCache();
    if (!cache) {
      return;
    }
    this.selectionRangeByCursorIdx(this.selectionStartCursorIdx, this.curCursorIdx, cache);
    // 设置属性的时候，Bounds也要更改
    this.tryShowInputBounds();
  }

  dispatchCommand(command: string, payload: any) {
    const cbs = this.commandCbs.get(command);
    cbs && cbs.forEach(cb => cb(payload, this));
    this.updateCbs.forEach(cb => cb('dispatch', this));
  }

  registerCommand(command: string, cb: (payload: any, p: RichTextEditPlugin) => void) {
    const cbs: Array<(payload: any, p: RichTextEditPlugin) => void> = this.commandCbs.get(command) || [];
    cbs.push(cb);
  }

  removeCommand(command: string, cb: (payload: any, p: RichTextEditPlugin) => void) {
    const cbs: Array<(payload: any, p: RichTextEditPlugin) => void> = this.commandCbs.get(command) || [];
    const idx = cbs.indexOf(cb);
    if (idx > -1) {
      cbs.splice(idx, 1);
    }
  }

  registerUpdateListener(cb: (type: UpdateType, p: RichTextEditPlugin) => void) {
    const cbs = this.updateCbs || [];
    cbs.push(cb);
  }

  removeUpdateListener(cb: (type: UpdateType, p: RichTextEditPlugin) => void) {
    const cbs = this.updateCbs || [];
    const idx = cbs.indexOf(cb);
    if (idx > -1) {
      cbs.splice(idx, 1);
    }
  }

  activate(context: IPluginService): void {
    this.pluginService = context;
    this.editModule = new EditModule();
    // context.stage.on('click', this.handleClick);
    context.stage.on('pointermove', this.handleMove, { capture: true });
    context.stage.on('pointerdown', this.handlePointerDown, { capture: true });
    context.stage.on('pointerup', this.handlePointerUp, { capture: true });
    context.stage.on('pointerleave', this.handlePointerUp, { capture: true });
    context.stage.on('dblclick', this.handleDBLClick, { capture: true });
    application.global.addEventListener('keydown', this.handleKeyDown);

    this.editModule.onInput(this.handleInput);
    this.editModule.onChange(this.handleChange);
    this.editModule.onFocusOut(this.handleFocusOut);

    this.timeline = (this as any).createTimeline && (this as any).createTimeline();
    this.ticker = (this as any).createTicker && (this as any).createTicker(context.stage);
  }

  copyToClipboard(e: KeyboardEvent): boolean {
    if (
      (application.global.isMacOS() && e.metaKey && e.key === 'c') ||
      (!application.global.isMacOS() && e.ctrlKey && e.key === 'c')
    ) {
      const selection = this.getSelection();
      const text = selection.getSelectionPureText();
      application.global.copyToClipBoard(text);
      e.preventDefault();
      return true;
    }
    return false;
  }

  /**
   * 选中某一个区间，startIdx和endIdx分别是开始结束的光标位置
   * 设置光标为endIdx，设置开始位置为startIdx
   * @param startIdx 开始位置
   * @param endIdx 结束位置
   * @returns
   */
  selectionRange(startIdx: number, endIdx: number) {
    const currRt = this.currRt;
    if (!currRt) {
      return;
    }
    const cache = currRt.getFrameCache();
    if (!cache) {
      return;
    }
    // 对startIdx和endIdx约束
    const { lines } = cache;
    const totalCursorCount = lines.reduce((total, line) => total + line.paragraphs.length, 0) - 1;
    if (startIdx > endIdx) {
      [startIdx, endIdx] = [endIdx, startIdx];
    }
    startIdx = Math.min(Math.max(startIdx, -0.1), totalCursorCount + 0.1);
    endIdx = Math.min(Math.max(endIdx, -0.1), totalCursorCount + 0.1);

    this.selectionRangeByCursorIdx(startIdx, endIdx, cache);
  }

  selectionRangeByCursorIdx(startCursorIdx: number, endCursorIdx: number, cache: IRichTextFrame) {
    this.curCursorIdx = endCursorIdx;
    this.selectionStartCursorIdx = startCursorIdx;
    const { x, y1, y2 } = this.computedCursorPosByCursorIdx(this.selectionStartCursorIdx, this.currRt);
    this.startCursorPos = { x, y: (y1 + y2) / 2 };
    const pos = this.computedCursorPosByCursorIdx(this.curCursorIdx, this.currRt);
    this.setCursorAndTextArea(pos.x, pos.y1, pos.y2, this.currRt);
    this._tryShowSelection(pos, cache);
  }

  fullSelection() {
    const currRt = this.currRt;
    if (!currRt) {
      return;
    }
    const cache = currRt.getFrameCache();
    if (!cache) {
      return;
    }
    const { lines } = cache;
    if (!(lines.length && lines[0].paragraphs.length)) {
      return;
    }
    const totalCursorCount = lines.reduce((total, line) => total + line.paragraphs.length, 0) - 1;
    this.selectionRange(-0.1, totalCursorCount + 0.1);
  }

  protected fullSelectionKeyHandler(e: KeyboardEvent) {
    if (
      (application.global.isMacOS() && e.metaKey && e.key === 'a') ||
      (!application.global.isMacOS() && e.ctrlKey && e.key === 'a')
    ) {
      this.fullSelection();
      e.preventDefault();
      return true;
    }
    return false;
  }

  directKeyHandler(e: KeyboardEvent) {
    if (!(e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
      return false;
    }
    const cache = this.currRt.getFrameCache();
    if (!cache) {
      return false;
    }
    let x = 0;
    let y = 0;
    if (e.key === 'ArrowUp') {
      y = -1;
    } else if (e.key === 'ArrowDown') {
      y = 1;
    } else if (e.key === 'ArrowLeft') {
      x = -1;
    } else if (e.key === 'ArrowRight') {
      x = 1;
    }

    // const pos = this.computedCursorPosByCursorIdx(this.curCursorIdx, this.currRt);
    const { lineInfo, columnInfo } = this.getColumnByIndex(cache, Math.round(this.curCursorIdx));
    const { lines } = cache;
    const totalCursorCount = lines.reduce((total, line) => total + line.paragraphs.length, 0) - 1;
    if (x) {
      // 快接近首尾需要特殊处理
      if (
        x > 0 &&
        columnInfo === lineInfo.paragraphs[lineInfo.paragraphs.length - 2] &&
        this.curCursorIdx < Math.round(this.curCursorIdx)
      ) {
        this.curCursorIdx = this.curCursorIdx + 0.2;
      } else if (
        x > 0 &&
        columnInfo === lineInfo.paragraphs[lineInfo.paragraphs.length - 1] &&
        this.curCursorIdx > Math.round(this.curCursorIdx)
      ) {
        this.curCursorIdx = this.curCursorIdx + 1 - 0.2;
      } else if (x < 0 && columnInfo === lineInfo.paragraphs[0] && this.curCursorIdx > Math.round(this.curCursorIdx)) {
        this.curCursorIdx = this.curCursorIdx - 0.2;
      } else if (x < 0 && columnInfo === lineInfo.paragraphs[0] && this.curCursorIdx < Math.round(this.curCursorIdx)) {
        this.curCursorIdx = this.curCursorIdx - 1 + 0.2;
      } else {
        this.curCursorIdx += x;
      }
      if (this.curCursorIdx < -0.1) {
        this.curCursorIdx = -0.1;
      } else if (this.curCursorIdx > totalCursorCount + 0.1) {
        this.curCursorIdx = totalCursorCount + 0.1;
      }

      this.selectionStartCursorIdx = this.curCursorIdx;

      const pos = this.computedCursorPosByCursorIdx(this.curCursorIdx, this.currRt);
      this.setCursorAndTextArea(pos.x, pos.y1, pos.y2, this.currRt);
      this.hideSelection();
    }

    if (y) {
      if (y > 0 && lineInfo === cache.lines[cache.lines.length - 1]) {
        return;
      }
      if (y < 0 && lineInfo === cache.lines[0]) {
        return;
      }
      const lineIdx = cache.lines.findIndex(item => item === lineInfo) + y;
      if (lineIdx < 0 || lineIdx >= cache.lines.length) {
        return;
      }
      const pos = this.computedCursorPosByCursorIdx(this.curCursorIdx, this.currRt);
      const posX = pos.x;
      let posY = (pos.y1 + pos.y2) / 2;
      posY += y * lineInfo.height;
      const nextLineInfo = cache.lines[lineIdx];
      const { columnInfo, delta } = this.getColumnAndIndexByLinePoint(nextLineInfo, { x: posX, y: posY });
      if (!columnInfo) {
        return;
      }
      let cursorIdx = this.getColumnIndex(cache, columnInfo) + delta;
      const data = this.computedCursorPosByCursorIdx(cursorIdx, this.currRt);

      if (cursorIdx < -0.1) {
        cursorIdx = -0.1;
      } else if (cursorIdx > totalCursorCount + 0.1) {
        cursorIdx = totalCursorCount + 0.1;
      }

      this.curCursorIdx = cursorIdx;
      this.selectionStartCursorIdx = cursorIdx;
      this.setCursorAndTextArea(data.x, data.y1, data.y2, this.currRt);
    }

    return true;
  }

  handleKeyDown = (e: KeyboardEvent) => {
    if (!(this.currRt && this.editing)) {
      return;
    }
    // 复制到剪贴板
    // cmd/ctl + C
    if (this.copyToClipboard(e)) {
      return;
    }
    // 全选
    // cmd/ctl + A
    if (this.fullSelectionKeyHandler(e)) {
      return;
    }
    // 方向键
    // 上、下、左、右
    if (this.directKeyHandler(e)) {
      return;
    }
  };

  handleInput = (text: string, isComposing: boolean, cursorIdx: number, rt: IRichText) => {
    if (!this.currRt) {
      return;
    }
    // 如果文字被删除光了，那么展示一个shadowRoot
    this.tryShowShadowPlaceholder();
    this.tryShowInputBounds();

    // 修改cursor的位置，但并不同步到curIdx，因为这可能是临时的
    // const p = this.getPointByColumnIdx(cursorIdx, rt, orient);
    // console.log(this.curCursorIdx, cursorIdx);
    this.hideSelection();
    // this.setCursor(p.x, p.y1, p.y2);
    this.updateCbs.forEach(cb => cb('input', this));
  };

  handleChange = (text: string, isComposing: boolean, cursorIdx: number, rt: IRichText) => {
    if (!this.currRt) {
      return;
    }
    this.tryShowShadowPlaceholder();
    this.tryShowInputBounds();

    // 修改cursor的位置，并同步到editModule
    this.curCursorIdx = cursorIdx;
    this.selectionStartCursorIdx = cursorIdx;
    const p = this.computedCursorPosByCursorIdx(cursorIdx, rt);
    this.setCursorAndTextArea(p.x, p.y1, p.y2, rt);
    this.hideSelection();
    this.updateCbs.forEach(cb => cb('change', this));
  };

  tryShowShadowPlaceholder() {
    if (!this.currRt) {
      return;
    }
    // 删除富文本影子节点
    const shadowRoot = this.currRt.shadowRoot;
    if (shadowRoot) {
      const placeholder = shadowRoot.getElementsByType('richtext')[0];
      placeholder && shadowRoot.removeChild(placeholder);
    }
    const { textConfig, editOptions = {} } = this.currRt.attribute;
    if (textConfig && textConfig.length) {
      return;
    }
    if (!(editOptions && editOptions.placeholder)) {
      return;
    }
    const {
      placeholder,
      placeholderColor = 'rgba(0, 0, 0, 0.6)',
      placeholderFontFamily,
      placeholderFontSize
    } = editOptions;
    const shadow = this.getShadow(this.currRt);
    const textConfigItem = { ...getDefaultCharacterConfig(this.currRt.attribute), text: placeholder };
    if (placeholderColor) {
      textConfigItem.fill = placeholderColor;
    }
    if (placeholderFontFamily) {
      textConfigItem.fontFamily = placeholderFontFamily;
    }
    if (placeholderFontSize) {
      textConfigItem.fontSize = placeholderFontSize;
    }

    this.shadowPlaceHolder = createRichText({
      ...this.currRt.attribute,
      x: 0,
      y: 0,
      // 倒回去，因为shadowPlace能够适用富文本的align和baseline
      dx: -this.deltaX,
      dy: -this.deltaY,
      angle: 0,
      textConfig: [textConfigItem]
    });
    shadow.add(this.shadowPlaceHolder);
  }

  /**
   * 获取富文本的AABBBounds，如果内部没有内容的话高度依然要保持，同时如果有placeholder的话，需要把placeholder宽度加上
   * @param rt
   */
  getRichTextAABBBounds(rt: IRichText) {
    const { attribute } = rt;
    if (!attribute.textConfig.length) {
      return getRichTextBounds({
        ...this.shadowPlaceHolder.attribute,
        x: attribute.x,
        y: attribute.y,
        textAlign: attribute.textAlign,
        boundsMode: 'accurate'
      });
    }
    return rt.AABBBounds;
  }

  tryShowInputBounds() {
    if (!(this.currRt && this.focusing)) {
      return;
    }
    const { editOptions = {} } = this.currRt.attribute;
    const { boundsStrokeWhenInput } = editOptions;

    if (!editOptions || !boundsStrokeWhenInput) {
      return;
    }
    // 得先偏移，不然上一次的Bounds会影响后续的计算
    this.offsetShadowRoot();
    // const { attribute } = this.currRt;
    const b = this.getRichTextAABBBounds(this.currRt);
    const height = b.height();
    const width = b.width();
    // if (!attribute.textConfig.length && this.editLine) {
    //   const { points } = this.editLine.attribute;
    //   height = points[1].y - points[0].y;
    // }
    this.shadowBounds = this.shadowBounds || createRect({});
    this.shadowBounds.setAttributes({
      x: 0,
      y: 0,
      width,
      height,
      fill: false,
      stroke: boundsStrokeWhenInput,
      lineWidth: 1,
      zIndex: -1
    });
    const shadow = this.getShadow(this.currRt);
    this.addEditLineOrBgOrBounds(this.shadowBounds, shadow);
    // shadow.add(this.shadowBounds);

    this.offsetLineBgAndShadowBounds();
  }

  trySyncPlaceholderToTextConfig() {
    if (!this.currRt) {
      return;
    }
    const { textConfig, editOptions } = this.currRt.attribute;
    if (textConfig && textConfig.length) {
      return;
    }
    if (!(editOptions && editOptions.placeholder && editOptions.syncPlaceholderToTextConfig)) {
      return;
    }
    const { placeholder } = editOptions;
    this.currRt.setAttributes({
      textConfig: [
        {
          text: placeholder,
          ...getDefaultCharacterConfig(this.currRt.attribute)
        }
      ]
    });
  }

  handleFocusIn = () => {
    throw new Error('不会走到这里 handleFocusIn');
    // this.updateCbs.forEach(cb => cb(this.editing ? 'onfocus' : 'defocus', this));
  };

  handleFocusOut = () => {
    throw new Error('不会走到这里 handleFocusOut');
    // console.log('abc')
    // this.editing = false;
    // this.deFocus();
    // this.pointerDown = false;
    // this.triggerRender();
    // this.updateCbs.forEach(cb => cb('defocus', this));
  };

  deactivate(context: IPluginService): void {
    // context.stage.off('pointerdown', this.handleClick);
    context.stage.off('pointermove', this.handleMove, { capture: true });
    context.stage.off('pointerdown', this.handlePointerDown, { capture: true });
    context.stage.off('pointerup', this.handlePointerUp, { capture: true });
    context.stage.off('pointerleave', this.handlePointerUp, { capture: true });
    context.stage.off('dblclick', this.handleDBLClick, { capture: true });

    application.global.addEventListener('keydown', this.handleKeyDown);
  }

  handleMove = (e: PointerEvent) => {
    // 如果发现当前的richtext不是editable的richtext，那么需要强行defocus一下，这可能是用户手动设置了richtext的editable为false
    if (this.currRt && !this.currRt.attribute.editable) {
      this.deFocus(true);
    }
    if (!this.isEditableRichtext(e)) {
      this.handleLeave();
      return;
    }
    // this.currRt = e.target as IRichText;
    this.handleEnter();
    (e.target as any).once('pointerleave', this.handleLeave, { capture: true });

    this.tryShowSelection(e, false);
  };

  // 鼠标进入
  handleEnter = () => {
    this.editing = true;
    this.pluginService.stage.setCursor('text');
  };

  // 鼠标离开
  handleLeave = () => {
    this.editing = false;
    this.pluginService.stage.setCursor('default');
  };

  handlePointerDown = (e: PointerEvent) => {
    if (!this.editing || !this.isEditableRichtext(e)) {
      this.deFocus(true);
    } else {
      this.onFocus(e);
    }
    this.triggerRender();
    this.pointerDown = true;
    this.updateCbs.forEach(cb => cb(this.editing ? 'onfocus' : 'defocus', this));
  };
  handlePointerUp = (e: PointerEvent) => {
    this.pointerDown = false;
  };
  handleDBLClick = (e: PointerEvent) => {
    if (!this.editing) {
      return;
    }

    this.tryShowSelection(e, true);
  };

  protected stopPropagation(e: Event) {
    e.stopPropagation();
  }

  addEditLineOrBgOrBounds(graphic: IGraphic, shadowRoot: IGroup) {
    let group = shadowRoot.getElementById('emptyBoundsContainer');
    if (!group) {
      group = createGroup({ x: 0, y: 0, width: 0, height: 0, boundsMode: 'empty' });
      group.id = 'emptyBoundsContainer';
      shadowRoot.add(group);
    }
    group.add(graphic);
  }

  removeEditLineOrBgOrBounds(graphic: IGraphic, shadowRoot: IGroup) {
    const group = shadowRoot.getElementById('emptyBoundsContainer');
    if (!group) {
      return;
    }
    group.removeChild(graphic);
  }

  onFocus(e: PointerEvent, data?: any) {
    this.updateCbs && this.updateCbs.forEach(cb => cb('beforeOnfocus', this));
    this.deFocus(false);
    this.focusing = true;
    this.editing = true;
    const target = e.target as IRichText;
    if (!(target && target.type === 'richtext')) {
      return;
    }
    this.currRt = target as IRichText;

    // 创建shadowGraphic
    RichTextEditPlugin.tryUpdateRichtext(target);
    const shadowRoot = this.getShadow(target);
    const cache = target.getFrameCache();
    if (!cache) {
      return;
    }
    const { editOptions = {} } = this.currRt.attribute;
    if (editOptions.stopPropagation) {
      target.addEventListener('*', this.stopPropagation);
    }
    // 计算全局偏移
    this.offsetShadowRoot(target);
    if (!this.editLine) {
      const line = createLine({ x: 0, y: 0, lineWidth: 1, stroke: 'black' });
      // 不使用stage的Ticker，避免影响其他的动画以及受到其他动画影响
      this.addAnimateToLine(line);
      this.editLine = line;
      this.ticker && this.ticker.start(true);

      const g = createGroup({ x: 0, y: 0, width: 0, height: 0 });
      this.editBg = g;
      this.addEditLineOrBgOrBounds(this.editLine, shadowRoot);
      this.addEditLineOrBgOrBounds(this.editBg, shadowRoot);
      // shadowRoot.add(this.editLine);
      // shadowRoot.add(this.editBg);
    }

    data = data || this.computedCursorPosByEvent(e, cache);

    if (data) {
      const { x, y1, y2, cursorIndex } = data;
      this.startCursorPos = { x, y: (y1 + y2) / 2 };
      this.curCursorIdx = cursorIndex;
      this.selectionStartCursorIdx = cursorIndex;
      this.setCursorAndTextArea(x, y1, y2, target);
    } else {
      const x = 0;
      const y1 = 0;
      const y2 = getRichTextBounds({ ...target.attribute, textConfig: [{ text: 'a' }] }).height();
      this.startCursorPos = { x, y: (y1 + y2) / 2 };
      this.curCursorIdx = -0.1;
      this.selectionStartCursorIdx = -0.1;
      this.setCursorAndTextArea(x, y1, y2, target);
    }

    // 聚焦的时候也判断，这样在最开始就能展示placeholder，否则需要等用户输入
    this.tryShowShadowPlaceholder();
    // 聚焦的时候也判断，这样在最开始就能展示bounds，否则需要等用户输入
    this.tryShowInputBounds();
    // 触发Bounds更新
    this.currRt.addUpdateBoundTag();
  }

  offsetShadowRoot(rt?: IRichText) {
    rt = rt || this.currRt;
    if (!rt) {
      return;
    }
    const shadowRoot = this.getShadow(rt);
    if (!shadowRoot) {
      return;
    }
    const cache = rt.getFrameCache();
    if (!cache) {
      return;
    }
    // 计算全局偏移
    this.computeGlobalDelta(cache);

    // 添加cursor节点，shadowRoot在上面
    shadowRoot.setAttributes({ shadowRootIdx: 1, pickable: false, x: this.deltaX, y: this.deltaY });
    this.shadowPlaceHolder && this.shadowPlaceHolder.setAttributes({ dx: -this.deltaX, dy: -this.deltaY });
  }

  // 偏移线和背景，因为文字的baseline可能是middle或者bottom
  protected offsetLineBgAndShadowBounds() {
    const rt = this.currRt;
    const { textBaseline } = rt.attribute;
    let dy = 0;
    let attr = rt.attribute;
    let b: IAABBBounds;
    if (textBaseline === 'middle' || textBaseline === 'bottom') {
      if (!attr.textConfig.length) {
        attr = { ...attr, textConfig: [{ text: 'a' }] };
      }
      b = getRichTextBounds(attr);
    }
    if (textBaseline === 'middle') {
      dy = -b.height() / 2;
    } else if (textBaseline === 'bottom') {
      dy = -b.height();
    }
    this.editLine && this.editLine.setAttributes({ dy });
    this.editBg && this.editBg.setAttributes({ dy });
    if (this.shadowBounds) {
      this.shadowBounds.setAttributes({ dy });
    }
  }

  protected deFocus(trulyDeFocus = false) {
    this.editing = false;
    this.updateCbs && this.updateCbs.forEach(cb => cb('beforeDefocus', this, { trulyDeFocus }));
    const currRt = this.currRt as IRichText;
    if (!currRt) {
      return;
    }
    const { editOptions = {} } = currRt.attribute;
    if (editOptions.stopPropagation) {
      currRt.removeEventListener('*', this.stopPropagation);
    }
    if (trulyDeFocus) {
      this.trySyncPlaceholderToTextConfig();
      currRt.detachShadow();
    }
    this.currRt = null;
    this.editModule.currRt = null;
    const shadowRoot = this.getShadow(currRt);
    if (this.editLine) {
      this.removeEditLineOrBgOrBounds(this.editLine, shadowRoot);
      this.editLine.release();
      this.editLine = null;

      this.removeEditLineOrBgOrBounds(this.editBg, shadowRoot);
      this.editBg.release();
      this.editBg = null;
    }

    if (trulyDeFocus) {
      if (this.shadowBounds) {
        this.removeEditLineOrBgOrBounds(this.shadowBounds, shadowRoot);
        this.shadowBounds.release();
        this.shadowBounds = null;
      }
      if (this.shadowPlaceHolder) {
        this.shadowPlaceHolder.parent && this.shadowPlaceHolder.parent.removeChild(this.shadowPlaceHolder);
        this.shadowPlaceHolder.release();
        this.shadowPlaceHolder = null;
      }
    }
    this.focusing = false;

    // 清理textConfig，不让最后有换行符
    // const textConfig = currRt.attribute.textConfig;
    // let lastConfig = textConfig[textConfig.length - 1];
    // let cleared = false;
    // while (lastConfig && (lastConfig as any).text === '\n') {
    //   textConfig.pop();
    //   lastConfig = textConfig[textConfig.length - 1];
    //   cleared = true;
    // }
    // cleared && currRt.setAttributes({ textConfig });

    // TODO 因为handlerLeave可能不会执行，所以这里需要手动清除
    currRt.removeEventListener('pointerleave', this.handleLeave);
  }

  protected addAnimateToLine(line: ILine) {
    if (!line.animate) {
      return;
    }
    line.setAttributes({ opacity: 1 });
    line.animates &&
      line.animates.forEach(animate => {
        animate.stop();
        animate.release();
      });
    const animate = line.animate({
      timeline: this.timeline
    });
    animate.to({ opacity: 1 }, 10, 'linear').wait(700).to({ opacity: 0 }, 10, 'linear').wait(700).loop(Infinity);
  }

  // 显示selection
  tryShowSelection(e: PointerEvent, dblclick: boolean) {
    const cache = (e.target as IRichText).getFrameCache();
    if (!(cache && this.editBg && this.startCursorPos)) {
      return;
    }

    if (!dblclick) {
      if (this.pointerDown) {
        const currCursorData = this.computedCursorPosByEvent(e, cache);
        if (!currCursorData) {
          return;
        }
        this.curCursorIdx = currCursorData.cursorIndex;
        this._tryShowSelection(currCursorData, cache);
      }
    } else {
      const currCursorData = this.computedCursorPosByEvent(e, cache);
      if (!currCursorData) {
        return;
      }
      // const curCursorIdx = currCursorData.cursorIndex;
      const lineInfo = currCursorData.lineInfo;
      const columnIndex = lineInfo.paragraphs.findIndex(item => item === currCursorData.columnInfo);
      if (columnIndex < 0) {
        return;
      }
      const str = lineInfo.paragraphs.reduce((str, item) => {
        return str + item.text;
      }, '');

      let idx = 0;
      for (let i = 0; i < cache.lines.length; i++) {
        const line = cache.lines[i];
        if (line === lineInfo) {
          break;
        }
        idx += line.paragraphs.length;
      }

      const { startIdx, endIdx } = getWordStartEndIdx(str, columnIndex);

      this.selectionRange(idx + startIdx - 0.1, idx + endIdx - 0.1);
    }
  }

  _tryShowSelection(
    currCursorData: {
      x: any;
      y1: number;
      y2: number;
    },
    cache: IRichTextFrame
  ) {
    let startCursorPos = this.startCursorPos;
    let endCursorPos = {
      x: currCursorData.x,
      y: (currCursorData.y1 + currCursorData.y2) / 2
    };
    let line0Info = this.getLineByPoint(cache, startCursorPos);
    let line1Info = this.getLineByPoint(cache, endCursorPos);

    if (
      startCursorPos.y > endCursorPos.y ||
      (startCursorPos.y === endCursorPos.y && startCursorPos.x > endCursorPos.x)
    ) {
      [startCursorPos, endCursorPos] = [endCursorPos, startCursorPos];
      [line1Info, line0Info] = [line0Info, line1Info];
    }

    this.hideSelection();
    if (line0Info === line1Info) {
      // 同行
      this.editBg.setAttributes({
        x: startCursorPos.x,
        y: line0Info.top,
        width: endCursorPos.x - startCursorPos.x,
        height: line0Info.height,
        fill: '#336df4',
        fillOpacity: 0.2
      });
    } else {
      this.editBg.setAttributes({ x: 0, y: line0Info.top, width: 0, height: 0 });
      const startIdx = cache.lines.findIndex(item => item === line0Info);
      const endIdx = cache.lines.findIndex(item => item === line1Info);
      let y = 0;
      for (let i = startIdx; i <= endIdx; i++) {
        const line = cache.lines[i];
        if (i === startIdx) {
          const p = line.paragraphs[line.paragraphs.length - 1];
          this.editBg.add(
            createRect({
              x: startCursorPos.x,
              y,
              width: p.left + p.width - startCursorPos.x,
              height: line.height,
              fill: '#336df4',
              fillOpacity: 0.2
            })
          );
        } else if (i === endIdx) {
          const p = line.paragraphs[0];
          this.editBg.add(
            createRect({
              x: p.left,
              y,
              width: endCursorPos.x - p.left,
              height: line.height,
              fill: '#336df4',
              fillOpacity: 0.2
            })
          );
        } else {
          const p0 = line.paragraphs[0];
          const p1 = line.paragraphs[line.paragraphs.length - 1];
          this.editBg.add(
            createRect({
              x: p0.left,
              y,
              width: p1.left + p1.width - p0.left,
              height: line.height,
              fill: '#336df4',
              fillOpacity: 0.2
            })
          );
        }
        y += line.height;
      }
    }

    this.setCursorAndTextArea(currCursorData.x, currCursorData.y1, currCursorData.y2, this.currRt as IRichText);

    this.triggerRender();
    this.updateCbs.forEach(cb => cb('selection', this));
  }

  hideSelection() {
    if (this.editBg) {
      this.editBg.removeAllChild();
      this.editBg.setAttributes({ fill: 'transparent' });
    }
  }

  protected getShadow(rt: IRichText) {
    const sr = rt.shadowRoot || rt.attachShadow();
    // TODO 这里比较hack，因为emptyBoundsContainer是empty，导致shadowRoot的Bounds为空，所以这里给一个1*1的rect，让其能绘制
    sr.setAttributes({ width: 0, height: 0 });
    return sr;
  }

  protected getLineByPoint(cache: IRichTextFrame, p1: IPointLike): IRichTextLine {
    let lineInfo = cache.lines[0];
    for (let i = 0; i < cache.lines.length; i++) {
      if (lineInfo.top <= p1.y && lineInfo.top + lineInfo.height >= p1.y) {
        break;
      }
      lineInfo = cache.lines[i + 1];
    }

    return lineInfo;
  }
  protected getColumnAndIndexByLinePoint(
    lineInfo: IRichTextLine,
    p1: IPointLike
  ): {
    columnInfo: IRichTextParagraph | IRichTextIcon;
    delta: number;
  } {
    let columnInfo = lineInfo.paragraphs[0];
    let delta = 0;
    if (lineInfo.paragraphs.length) {
      const start = lineInfo.paragraphs[0];
      const end = lineInfo.paragraphs[lineInfo.paragraphs.length - 1];
      if (p1.x <= start.left) {
        delta = -0.1;
        columnInfo = start;
      } else if (p1.x >= end.left + end.width) {
        delta = 0.1;
        columnInfo = end;
      }
    }

    if (!delta) {
      for (let i = 0; i < lineInfo.paragraphs.length; i++) {
        columnInfo = lineInfo.paragraphs[i];
        if (columnInfo.left <= p1.x && columnInfo.left + columnInfo.width >= p1.x) {
          if (p1.x > columnInfo.left + columnInfo.width / 2) {
            delta = 0.1;
          } else {
            delta = -0.1;
          }
          break;
        }
      }
    }

    return {
      columnInfo,
      delta
    };
  }
  /* 工具函数 */
  /**
   * 根据给定的ParagraphInfo得到对应的index
   * @param cache 富文本缓存
   * @param cInfo ParagraphInfo
   * @returns
   */
  protected getColumnIndex(cache: IRichTextFrame, cInfo: IRichTextParagraph | IRichTextIcon) {
    // TODO 【注意】认为cache都是单个字符拆分的
    let inputIndex = -1;
    for (let i = 0; i < cache.lines.length; i++) {
      const line = cache.lines[i];
      for (let j = 0; j < line.paragraphs.length; j++) {
        inputIndex++;
        if (cInfo === line.paragraphs[j]) {
          return inputIndex;
        }
      }
    }
    return -1;
  }

  protected isRichtext(e: PointerEvent) {
    return !!(e.target && (e.target as any).type === 'richtext');
  }

  protected isEditableRichtext(e: PointerEvent) {
    return this.isRichtext(e) && !!(e.target as any).attribute.editable;
  }

  // 如果没有开自动渲染，得触发重绘
  protected triggerRender() {
    this.pluginService.stage.renderNextFrame();
  }

  protected computeGlobalDelta(cache: IRichTextFrame) {
    this.deltaX = 0;
    this.deltaY = 0;
    if (cache.lines.length === 0 && this.shadowPlaceHolder) {
      cache = this.shadowPlaceHolder.getFrameCache();
    }
    const height = cache.height;
    const actualHeight = cache.actualHeight;
    const width = cache.lines.reduce((w, item) => Math.max(w, item.actualWidth), 0);
    if (cache.globalAlign === 'center') {
      this.deltaX = -width / 2;
    } else if (cache.globalAlign === 'right') {
      this.deltaX = -width;
    }
    if (cache.verticalDirection === 'middle') {
      this.deltaY = height / 2 - actualHeight / 2;
    } else if (cache.verticalDirection === 'bottom') {
      this.deltaY = height - actualHeight;
    }
  }

  protected getEventPosition(e: PointerEvent): IPointLike {
    const p = this.pluginService.stage.eventPointTransform(e);

    const p1 = { x: 0, y: 0 };
    (e.target as IRichText).globalTransMatrix.transformPoint(p, p1);
    p1.x -= this.deltaX;
    p1.y -= this.deltaY;

    const rt = this.currRt;
    const { textBaseline } = rt.attribute;
    let dy = 0;
    if (textBaseline === 'middle') {
      const b = getRichTextBounds(rt.attribute);
      dy = b.height() / 2;
    } else if (textBaseline === 'bottom') {
      const b = getRichTextBounds(rt.attribute);
      dy = b.height();
    }
    p1.y += dy;
    return p1;
  }

  protected setCursorAndTextArea(x: number, y1: number, y2: number, rt: IRichText) {
    this.editLine.setAttributes({
      points: [
        { x, y: y1 },
        { x, y: y2 }
      ]
    });
    this.addAnimateToLine(this.editLine);
    const out = { x: 0, y: 0 };
    rt.globalTransMatrix.getInverse().transformPoint({ x, y: y1 }, out);
    // TODO 考虑stage变换
    const { left, top } = this.pluginService.stage.window.getBoundingClientRect();
    out.x += left;
    out.y += top;

    this.offsetLineBgAndShadowBounds();
    this.offsetShadowRoot();

    this.editModule.moveTo(out.x, out.y, rt, this.curCursorIdx, this.selectionStartCursorIdx);
  }

  /**
   * 根据Event算出光标位置等信息
   * @param e Event
   * @param cache 富文本缓存
   * @returns
   */
  protected computedCursorPosByEvent(e: PointerEvent, cache: IRichTextFrame) {
    const p1 = this.getEventPosition(e);
    const lineInfo = this.getLineByPoint(cache, p1);
    if (!lineInfo) {
      return;
    }

    const { columnInfo, delta } = this.getColumnAndIndexByLinePoint(lineInfo, p1);
    if (!columnInfo) {
      return;
    }

    const y1 = lineInfo.top;
    const y2 = lineInfo.top + lineInfo.height;

    let cursorIndex = this.getColumnIndex(cache, columnInfo);
    cursorIndex += delta;
    const x = columnInfo.left + (delta > 0 ? columnInfo.width : 0);

    return {
      x,
      y1,
      y2,
      cursorIndex,
      lineInfo,
      columnInfo
    };
  }

  /**
   * 根据cursorIdx计算出点的位置
   * @param cursorIdx index
   * @param rt 富文本
   * @returns
   */
  protected computedCursorPosByCursorIdx(cursorIdx: number, rt: IRichText) {
    const idx = Math.round(cursorIdx);
    const leftRight = cursorIdx - idx; // >0 向右，<0 向左
    const cache = rt.getFrameCache();
    const column = this.getColumnByIndex(cache, idx);
    const height = rt.attribute.fontSize ?? (rt.attribute.textConfig?.[0] as any)?.fontSize;
    if (!column) {
      // 检查是不是空文本
      if (!cache.lines.length) {
        const b = getRichTextBounds({ ...rt.attribute, textConfig: [{ text: 'a' }] });
        return {
          x: 0,
          y1: 0,
          y2: b.height()
        };
      }
      return {
        x: 0,
        y1: 0,
        y2: height
      };
    }
    const { lineInfo, columnInfo } = column;
    const y1 = lineInfo.top;
    const y2 = lineInfo.top + lineInfo.height;
    const x = columnInfo.left + (leftRight < 0 ? 0 : columnInfo.width);

    return { x, y1, y2, lineInfo, columnInfo };
  }

  /**
   * 根据index获取columnInfo
   * @param cache 缓存
   * @param index index
   * @returns
   */
  protected getColumnByIndex(
    cache: IRichTextFrame,
    index: number
  ): {
    lineInfo: IRichTextLine;
    columnInfo: IRichTextParagraph | IRichTextIcon;
  } | null {
    // TODO 认为都是单个字符拆分的
    for (let i = 0, inputIndex = 0; i < cache.lines.length; i++) {
      const lineInfo = cache.lines[i];
      for (let j = 0; j < lineInfo.paragraphs.length; j++) {
        const columnInfo = lineInfo.paragraphs[j];
        if (inputIndex === index) {
          return {
            lineInfo,
            columnInfo
          };
        }
        inputIndex++;
      }
    }
    return null;
  }

  release() {
    this.deactivate(this.pluginService);
    this.editModule.release();
  }

  /**
   * 获取当前选择的区间范围
   * @param defaultAll 如果force为true，又没有选择，则认为选择了所有然后进行匹配，如果为false，则认为什么都没有选择，返回null
   * @returns
   */
  getSelection(defaultAll: boolean = false) {
    if (!this.currRt) {
      return null;
    }
    if (
      this.selectionStartCursorIdx != null &&
      this.curCursorIdx != null
      // this.selectionStartCursorIdx !== this.curCursorIdx &&
    ) {
      return new Selection(this.selectionStartCursorIdx, this.curCursorIdx, this.currRt);
    } else if (defaultAll) {
      return RichTextEditPlugin.CreateSelection(this.currRt);
    }
    return null;
  }

  forceFocus(params: { e?: PointerEvent; target: IRichText | null; cursorIndex?: number }) {
    const { target, e, cursorIndex } = params;
    if (!target) {
      return;
    }
    this.currRt = target;
    if (e) {
      this._forceFocusByEvent(e);
    } else {
      this._forceFocusByCursorIndex(cursorIndex ?? -0.1);
    }
  }

  protected _forceFocusByEvent(e: PointerEvent) {
    this.handleEnter();
    this.handlePointerDown(e);
    this.handlePointerUp(e);
  }

  protected _forceFocusByCursorIndex(cursorIndex: number) {
    const richtext = this.currRt;
    if (!richtext) {
      return;
    }

    let x = 0;
    let y1 = 0;
    let y2 = 2;
    let lineInfo = null;
    let columnInfo = null;
    const data = this.computedCursorPosByCursorIdx(cursorIndex, richtext);
    x = data.x;
    y1 = data.y1;
    y2 = data.y2;
    lineInfo = data.lineInfo;
    columnInfo = data.columnInfo;

    this.onFocus({ target: this.currRt } as any, {
      x,
      y1,
      y2,
      cursorIndex,
      lineInfo,
      columnInfo
    });
  }
}
