import type { IPointLike } from '@visactor/vutils';
import { isString } from '@visactor/vutils';
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
import { EditModule } from './edit-module';

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
  lastPoint?: IPointLike;
  editModule: EditModule;

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

  handleInput = (text: string, isComposing: boolean, cursorIdx: number, rt: IRichText) => {
    // 修改cursor的位置
    const p = this.getPointByColumnIdx(cursorIdx, rt);
    this.setCursor(p.x, p.y1, p.y2);
  };
  handleChange = (text: string, isComposing: boolean, cursorIdx: number, rt: IRichText) => {
    // 修改cursor的位置，并同步到editModule
    const p = this.getPointByColumnIdx(cursorIdx, rt);
    this.setCursorAndTextArea(p.x, p.y1, p.y2, rt, cursorIdx);
  };

  handleMove = (e: PointerEvent) => {
    if (!this.isRichtext(e)) {
      return;
    }
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

      this.setCursorAndTextArea(x, y1 + 2, y2 - 2, e.target as IRichText, cursorIndex);
    }
    this.applyUpdate();
  }

  handlePointerDown = (e: PointerEvent) => {
    if (this.editing) {
      this.onFocus(e);
    } else {
      this.deFocus(e);
    }
    this.applyUpdate();
    this.pointerDown = true;
  };
  handlePointerUp = (e: PointerEvent) => {
    this.pointerDown = false;
  };

  handleEnter = (e: PointerEvent) => {
    this.editing = true;
    this.pluginService.stage.setCursor('text');
  };

  handleLeave = (e: PointerEvent) => {
    this.editing = false;
    this.pluginService.stage.setCursor('default');
  };

  isRichtext(e: PointerEvent) {
    return !!(e.target && (e.target as any).type === 'richtext');
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

      this.setCursorAndTextArea(x, y1, y2, target, cursorIndex);
    }
  }

  protected getPointByColumnIdx(idx: number, rt: IRichText) {
    const cache = rt.getFrameCache();
    const { lineInfo, columnInfo } = this.getColumnByIndex(cache, idx);
    let y1 = lineInfo.top;
    let y2 = lineInfo.top + lineInfo.height;
    const x = columnInfo.left + columnInfo.width;
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

  protected setCursorAndTextArea(x: number, y1: number, y2: number, rt: IRichText, cursorIndex: number) {
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

    this.editModule.moveTo(out.x, out.y, rt, cursorIndex);
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
    const target = e.target as IRichText;
    target.detachShadow();
    if (this.editLine) {
      this.editLine.parent.removeChild(this.editLine);
      this.editLine.release();
      this.editLine = null;

      this.editBg.parent.removeChild(this.editBg);
      this.editBg.release();
      this.editBg = null;
    }
  }

  tryUpdateRichtext(richtext: IRichText) {
    const cache = richtext.getFrameCache();
    if (
      !cache.lines.every(line =>
        line.paragraphs.every(item => !(item.text && isString(item.text) && item.text.length > 1))
      )
    ) {
      const tc: IRichTextCharacter[] = [];
      richtext.attribute.textConfig.forEach((item: IRichTextParagraphCharacter) => {
        if (isString(item.text) && item.text.length > 1) {
          // 拆分
          for (let i = 0; i < item.text.length; i++) {
            const t = item.text[i];
            tc.push({ ...item, text: t });
          }
        } else {
          tc.push(item);
        }
      });
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
