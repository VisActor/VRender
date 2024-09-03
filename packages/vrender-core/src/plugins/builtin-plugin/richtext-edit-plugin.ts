import type { IPointLike } from '@visactor/vutils';
import { isObject, isString, merge } from '@visactor/vutils';
import { Generator } from '../../common/generator';
import { createGroup, createLine, createRect } from '../../graphic';
import type {
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
  IRichTextParagraphCharacter
} from '../../interface';
import { EditModule, findCursorIndexIgnoreLinebreak } from './edit-module';

type UpdateType = 'input' | 'change' | 'onfocus' | 'defocus' | 'selection' | 'dispatch';

class Selection {
  cacheSelectionStartCursorIdx: number;
  cacheCurCursorIdx: number;
  selectionStartCursorIdx: number;
  curCursorIdx: number;
  rt: IRichText;

  constructor(
    cacheSelectionStartCursorIdx: number,
    cacheCurCursorIdx: number,
    selectionStartCursorIdx: number,
    curCursorIdx: number,
    rt: IRichText
  ) {
    this.curCursorIdx = curCursorIdx;
    this.selectionStartCursorIdx = selectionStartCursorIdx;
    this.cacheCurCursorIdx = cacheCurCursorIdx;
    this.cacheSelectionStartCursorIdx = cacheSelectionStartCursorIdx;
    this.rt = rt;
  }

  hasFormat(key: string): boolean {
    return this.getFormat(key) != null;
  }
  getFormat(key: string): any {
    if (!this.rt) {
      return null;
    }
    const config = this.rt.attribute.textConfig;
    const val: any = config[this.selectionStartCursorIdx + 1][key];
    if (val == null) {
      return null;
    }
    for (let i = this.selectionStartCursorIdx + 2; i <= this.curCursorIdx; i++) {
      const item = config[i];
      if (val === item[key]) {
        continue;
      }
      return null;
    }
    return val;
  }

  getAllFormat(key: string): any {
    if (!this.rt) {
      return [];
    }
    const config = this.rt.attribute.textConfig;
    const val: any = config[this.selectionStartCursorIdx + 1][key];
    const set = new Set();
    set.add(val);
    for (let i = this.selectionStartCursorIdx + 2; i <= this.curCursorIdx; i++) {
      const item = config[i];
      set.add(item[key]);
    }
    const list = Array.from(set.values());
    return list;
  }
}

export const FORMAT_TEXT_COMMAND = 'FORMAT_TEXT_COMMAND';
export const FORMAT_ELEMENT_COMMAND = 'FORMAT_ELEMENT_COMMAND';
export class RichTextEditPlugin implements IPlugin {
  name: 'RichTextEditPlugin' = 'RichTextEditPlugin';
  activeEvent: 'onRegister' = 'onRegister';
  pluginService: IPluginService;
  _uid: number = Generator.GenAutoIncrementId();
  key: string = this.name + this._uid;
  editing: boolean = false;
  editLine: ILine;
  editBg: IGroup;
  pointerDown: boolean = false;
  // 用于selection中保存上一次click时候的位置
  lastPoint?: IPointLike;
  editModule: EditModule;
  currRt: IRichText;

  // 当前的cursor信息
  curCursorIdx: number;
  selectionStartCursorIdx: number;

  commandCbs: Map<string, Array<(payload: any, p: RichTextEditPlugin) => void>>;
  updateCbs: Array<(type: UpdateType, p: RichTextEditPlugin) => void>;

  constructor() {
    this.commandCbs = new Map();
    this.commandCbs.set(FORMAT_TEXT_COMMAND, [this.formatTextCommandCb]);
    this.updateCbs = [];
  }

  getSelection() {
    if (
      this.selectionStartCursorIdx &&
      this.curCursorIdx &&
      this.selectionStartCursorIdx !== this.curCursorIdx &&
      this.currRt
    ) {
      return new Selection(
        this.selectionStartCursorIdx,
        this.curCursorIdx,
        findCursorIndexIgnoreLinebreak(this.currRt.attribute.textConfig, this.selectionStartCursorIdx),
        findCursorIndexIgnoreLinebreak(this.currRt.attribute.textConfig, this.curCursorIdx),
        this.currRt
      );
    }
    return null;
  }

  /* command */
  formatTextCommandCb(payload: string, p: RichTextEditPlugin) {
    const rt = p.currRt;
    if (!rt) {
      return;
    }
    const selectionData = p.getSelection();
    if (!selectionData) {
      return;
    }
    const { selectionStartCursorIdx, curCursorIdx } = selectionData;
    const config = rt.attribute.textConfig.slice(selectionStartCursorIdx + 1, curCursorIdx + 1);
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

  registerUpdateListener(cb: (type: UpdateType, p: RichTextEditPlugin) => void) {
    const cbs = this.updateCbs || [];
    cbs.push(cb);
  }

  activate(context: IPluginService): void {
    this.pluginService = context;
    this.editModule = new EditModule();
    // context.stage.on('click', this.handleClick);
    context.stage.on('pointermove', this.handleMove);
    context.stage.on('pointerdown', this.handlePointerDown);
    context.stage.on('pointerup', this.handlePointerUp);
    context.stage.on('pointerleave', this.handlePointerUp);

    this.editModule.onInput(this.handleInput);
    this.editModule.onChange(this.handleChange);
  }

  handleInput = (text: string, isComposing: boolean, cursorIdx: number, rt: IRichText, orient: 'left' | 'right') => {
    // 修改cursor的位置，但并不同步，因为这可能是临时的
    const p = this.getPointByColumnIdx(cursorIdx, rt, orient);
    this.hideSelection();
    this.setCursor(p.x, p.y1, p.y2);
    this.updateCbs.forEach(cb => cb('input', this));
  };
  handleChange = (text: string, isComposing: boolean, cursorIdx: number, rt: IRichText, orient: 'left' | 'right') => {
    // 修改cursor的位置，并同步到editModule
    const p = this.getPointByColumnIdx(cursorIdx, rt, orient);
    this.curCursorIdx = cursorIdx;
    this.selectionStartCursorIdx = cursorIdx;
    this.setCursorAndTextArea(p.x, p.y1, p.y2, rt);
    this.hideSelection();
    this.updateCbs.forEach(cb => cb('change', this));
  };

  handleMove = (e: PointerEvent) => {
    if (!this.isRichtext(e)) {
      return;
    }
    this.currRt = e.target as IRichText;
    this.handleEnter(e);
    (e.target as any).once('pointerleave', this.handleLeave);

    this.showSelection(e);
  };

  showSelection(e: PointerEvent) {
    const cache = (e.target as IRichText).getFrameCache();
    if (!(cache && this.editBg)) {
      return;
    }
    if (this.pointerDown) {
      let p0 = this.lastPoint;
      // 计算p1在字符中的位置
      let p1 = this.getEventPosition(e);
      let line1Info = this.getLineByPoint(cache, p1);
      const column1 = this.getColumnByLinePoint(line1Info, p1);
      const y1 = line1Info.top;
      const y2 = line1Info.top + line1Info.height;
      let x = column1.left + column1.width;
      let cursorIndex = this.getColumnIndex(cache, column1);
      if (p1.x < column1.left + column1.width / 2) {
        x = column1.left;
        cursorIndex -= 1;
      }
      p1.x = x;
      p1.y = (y1 + y2) / 2;
      let line0Info = this.getLineByPoint(cache, p0);
      if (p0.y > p1.y || (p0.y === p1.y && p0.x > p1.x)) {
        [p0, p1] = [p1, p0];
        [line1Info, line0Info] = [line0Info, line1Info];
      }

      this.editBg.removeAllChild();
      if (line0Info === line1Info) {
        const column0 = this.getColumnByLinePoint(line0Info, p0);
        this.editBg.setAttributes({
          x: p0.x,
          y: line0Info.top,
          width: p1.x - p0.x,
          height: column0.height,
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
                x: p0.x,
                y,
                width: p.left + p.width - p0.x,
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
                width: p1.x - p.left,
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

      this.curCursorIdx = cursorIndex;
      this.setCursorAndTextArea(x, y1 + 2, y2 - 2, e.target as IRichText);

      this.applyUpdate();
      this.updateCbs.forEach(cb => cb('selection', this));
    }
  }

  hideSelection() {
    if (this.editBg) {
      this.editBg.removeAllChild();
      this.editBg.setAttributes({ fill: 'transparent' });
    }
  }

  handlePointerDown = (e: PointerEvent) => {
    if (this.editing) {
      this.onFocus(e);
    } else {
      this.deFocus(e);
    }
    this.applyUpdate();
    this.pointerDown = true;
    this.updateCbs.forEach(cb => cb(this.editing ? 'onfocus' : 'defocus', this));
  };
  handlePointerUp = (e: PointerEvent) => {
    this.pointerDown = false;
  };

  // 鼠标进入
  handleEnter = (e: PointerEvent) => {
    this.editing = true;
    this.pluginService.stage.setCursor('text');
  };

  // 鼠标离开
  handleLeave = (e: PointerEvent) => {
    this.editing = false;
    this.pluginService.stage.setCursor('default');
  };

  isRichtext(e: PointerEvent) {
    return !!(e.target && (e.target as any).type === 'richtext' && (e.target as any).attribute.editable);
  }

  protected getEventPosition(e: PointerEvent): IPointLike {
    const p = this.pluginService.stage.eventPointTransform(e);

    const p1 = { x: 0, y: 0 };
    (e.target as IRichText).globalTransMatrix.transformPoint(p, p1);
    return p1;
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
  protected getColumnByLinePoint(lineInfo: IRichTextLine, p1: IPointLike): IRichTextParagraph | IRichTextIcon {
    let columnInfo = lineInfo.paragraphs[0];
    for (let i = 0; i < lineInfo.paragraphs.length; i++) {
      if (columnInfo.left <= p1.x && columnInfo.left + columnInfo.width >= p1.x) {
        break;
      }
      columnInfo = lineInfo.paragraphs[i];
    }

    return columnInfo;
  }

  onFocus(e: PointerEvent) {
    this.deFocus(e);

    // 添加shadowGraphic
    const target = e.target as IRichText;
    this.tryUpdateRichtext(target);
    const shadowRoot = target.attachShadow();
    shadowRoot.setAttributes({ shadowRootIdx: -1 });
    const cache = target.getFrameCache();
    if (!cache) {
      return;
    }
    if (!this.editLine) {
      const line = createLine({ x: 0, y: 0, lineWidth: 1, stroke: 'black' });
      line
        .animate()
        .to({ opacity: 1 }, 10, 'linear')
        .wait(700)
        .to({ opacity: 0 }, 10, 'linear')
        .wait(700)
        .loop(Infinity);
      this.editLine = line;

      const g = createGroup({ x: 0, y: 0, width: 0, height: 0 });
      this.editBg = g;
      shadowRoot.add(this.editLine);
      shadowRoot.add(this.editBg);
    }

    const p1 = this.getEventPosition(e);

    const lineInfo = this.getLineByPoint(cache, p1);

    if (lineInfo) {
      const columnInfo = this.getColumnByLinePoint(lineInfo, p1);
      if (!columnInfo) {
        return;
      }

      let y1 = lineInfo.top;
      let y2 = lineInfo.top + lineInfo.height;
      let x = columnInfo.left + columnInfo.width;
      y1 += 2;
      y2 -= 2;
      let cursorIndex = this.getColumnIndex(cache, columnInfo);
      if (p1.x < columnInfo.left + columnInfo.width / 2) {
        x = columnInfo.left;
        cursorIndex -= 1;
      }

      this.lastPoint = { x, y: (y1 + y2) / 2 };

      this.curCursorIdx = cursorIndex;
      this.selectionStartCursorIdx = cursorIndex;
      this.setCursorAndTextArea(x, y1, y2, target);
    }
  }

  protected getPointByColumnIdx(idx: number, rt: IRichText, orient: 'left' | 'right') {
    const cache = rt.getFrameCache();
    const { lineInfo, columnInfo } = this.getColumnByIndex(cache, idx);
    let y1 = lineInfo.top;
    let y2 = lineInfo.top + lineInfo.height;
    const x = columnInfo.left + (orient === 'left' ? 0 : columnInfo.width);
    y1 += 2;
    y2 -= 2;

    return { x, y1, y2 };
  }

  protected getColumnIndex(cache: IRichTextFrame, cInfo: IRichTextParagraph | IRichTextIcon) {
    // TODO 认为都是单个字符拆分的
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
  protected getColumnByIndex(
    cache: IRichTextFrame,
    index: number
  ): {
    lineInfo: IRichTextLine;
    columnInfo: IRichTextParagraph | IRichTextIcon;
  } | null {
    // TODO 认为都是单个字符拆分的
    let inputIndex = -1;
    for (let i = 0; i < cache.lines.length; i++) {
      const lineInfo = cache.lines[i];
      for (let j = 0; j < lineInfo.paragraphs.length; j++) {
        const columnInfo = lineInfo.paragraphs[j];
        inputIndex++;
        if (inputIndex === index) {
          return {
            lineInfo,
            columnInfo
          };
        }
      }
    }
    return null;
  }

  protected setCursorAndTextArea(x: number, y1: number, y2: number, rt: IRichText) {
    this.editLine.setAttributes({
      points: [
        { x, y: y1 },
        { x, y: y2 }
      ]
    });
    const out = { x: 0, y: 0 };
    rt.globalTransMatrix.getInverse().transformPoint({ x, y: y1 }, out);
    // TODO 考虑stage变换
    const { left, top } = this.pluginService.stage.window.getBoundingClientRect();
    out.x += left;
    out.y += top;

    this.editModule.moveTo(out.x, out.y, rt, this.curCursorIdx, this.selectionStartCursorIdx);
  }
  protected setCursor(x: number, y1: number, y2: number) {
    this.editLine.setAttributes({
      points: [
        { x, y: y1 },
        { x, y: y2 }
      ]
    });
  }

  applyUpdate() {
    this.pluginService.stage.renderNextFrame();
  }
  deFocus(e: PointerEvent) {
    const target = this.currRt as IRichText;
    if (!target) {
      return;
    }
    target.detachShadow();
    this.currRt = null;
    if (this.editLine) {
      this.editLine.parent.removeChild(this.editLine);
      this.editLine.release();
      this.editLine = null;

      this.editBg.parent.removeChild(this.editBg);
      this.editBg.release();
      this.editBg = null;
    }
  }

  splitText(text: string) {
    // 😁这种emoji长度算两个，所以得处理一下
    return Array.from(text);
  }

  tryUpdateRichtext(richtext: IRichText) {
    const cache = richtext.getFrameCache();
    if (
      !cache.lines.every(line =>
        line.paragraphs.every(item => !(item.text && isString(item.text) && this.splitText(item.text).length > 1))
      )
    ) {
      const tc: IRichTextCharacter[] = [];
      richtext.attribute.textConfig.forEach((item: IRichTextParagraphCharacter) => {
        const textList = this.splitText(item.text.toString());
        if (isString(item.text) && textList.length > 1) {
          // 拆分
          for (let i = 0; i < textList.length; i++) {
            const t = textList[i];
            tc.push({ ...item, text: t });
          }
        } else {
          tc.push(item);
        }
      });
      richtext.setAttributes({ textConfig: tc });
      richtext.doUpdateFrameCache(tc);
    }
  }

  onSelect() {
    return;
  }

  deactivate(context: IPluginService): void {
    // context.stage.off('pointerdown', this.handleClick);
    context.stage.off('pointermove', this.handleMove);
    context.stage.off('pointerdown', this.handlePointerDown);
    context.stage.off('pointerup', this.handlePointerUp);
    context.stage.off('pointerleave', this.handlePointerUp);
  }

  release() {
    this.editModule.release();
  }
}
