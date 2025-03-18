import type { IAnimate, IStep } from '../intreface/animate';
import type { EasingType } from '../intreface/easing';
import { ACustomAnimate } from './custom-animate';

/**
 * 文本输入动画，实现类似打字机的字符逐个显示效果
 * 支持通过beforeText和afterText参数添加前缀和后缀
 * 支持通过showCursor参数显示光标，cursorChar自定义光标字符
 */
export class InputText extends ACustomAnimate<{ text: string }> {
  declare valid: boolean;

  private fromText: string = '';
  private toText: string = '';
  private showCursor: boolean = false;
  private cursorChar: string = '|';
  private blinkCursor: boolean = true;
  private beforeText: string = '';
  private afterText: string = '';

  constructor(
    from: { text: string },
    to: { text: string },
    duration: number,
    easing: EasingType,
    params?: {
      showCursor?: boolean;
      cursorChar?: string;
      blinkCursor?: boolean;
      beforeText?: string;
      afterText?: string;
    }
  ) {
    super(from, to, duration, easing, params);

    // 配置光标相关选项
    if (params?.showCursor !== undefined) {
      this.showCursor = params.showCursor;
    }
    if (params?.cursorChar !== undefined) {
      this.cursorChar = params.cursorChar;
    }
    if (params?.blinkCursor !== undefined) {
      this.blinkCursor = params.blinkCursor;
    }

    // 配置前缀和后缀文本
    if (params?.beforeText !== undefined) {
      this.beforeText = params.beforeText;
    }
    if (params?.afterText !== undefined) {
      this.afterText = params.afterText;
    }
  }

  onFirstRun(): void {
    const fromProps = this.getLastProps();
    const toProps = this.getEndProps();
    const fromText = fromProps.text ?? '';
    const toText = toProps.text ?? '';

    // 初始化解析结果
    this.valid = true;

    // 存储文本用于动画
    this.fromText = fromText.toString();
    this.toText = toText.toString();

    // 确保to不为空
    if (!this.toText && this.toText !== '') {
      this.valid = false;
      return;
    }
  }

  onEnd(cb?: (animate: IAnimate, step: IStep) => void): void {
    super.onEnd(cb);
    if (!cb) {
      // 动画结束时，显示完整文本（不带闪烁光标）
      if (this.showCursor && !this.blinkCursor) {
        // 如果有光标但不闪烁，保留光标
        this.target.setAttribute('text', this.beforeText + this.toText + this.cursorChar + this.afterText);
      } else {
        // 不显示光标
        this.target.setAttribute('text', this.beforeText + this.toText + this.afterText);
      }
    }
  }

  onUpdate(end: boolean, ratio: number, out: Record<string, any>): void {
    if (!this.valid) {
      return;
    }

    // 计算当前应该显示的字符数量
    const totalChars = this.toText.length;
    const fromChars = this.fromText.length;

    // 如果fromText比toText长，则是删除动画
    // 否则是添加动画
    let currentLength: number;
    let currentText: string;

    if (fromChars > totalChars) {
      // 删除文本动画（从多到少）
      currentLength = Math.round(fromChars - (fromChars - totalChars) * ratio);
      currentText = this.fromText.substring(0, currentLength);
    } else {
      // 添加文本动画（从少到多）
      currentLength = Math.round(fromChars + (totalChars - fromChars) * ratio);

      // 如果fromText是toText的前缀，则直接使用toText的子串
      if (this.toText.startsWith(this.fromText)) {
        currentText = this.toText.substring(0, currentLength);
      } else {
        // 否则需要在fromText和toText之间进行过渡
        if (currentLength <= fromChars) {
          currentText = this.fromText.substring(0, currentLength);
        } else {
          currentText = this.toText.substring(0, currentLength - fromChars + Math.min(fromChars, currentLength));
        }
      }
    }

    // 构建最终显示的文本
    let displayText = this.beforeText + currentText + this.afterText;

    // 添加光标效果
    if (this.showCursor) {
      if (this.blinkCursor) {
        // 闪烁效果：在动画期间，光标每半个周期闪烁一次
        const blinkRate = 0.1; // 光标闪烁频率（每10%动画进度闪烁一次）
        const showCursorNow = Math.floor(ratio / blinkRate) % 2 === 0;

        if (showCursorNow) {
          displayText = this.beforeText + currentText + this.cursorChar + this.afterText;
        }
      } else {
        // 固定光标（不闪烁）
        displayText = this.beforeText + currentText + this.cursorChar + this.afterText;
      }
    }

    // 更新图形的text属性
    this.target.setAttribute('text', displayText);
  }
}
