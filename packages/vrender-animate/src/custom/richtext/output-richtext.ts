import { ACustomAnimate } from '../custom-animate';
import type { IRichTextCharacter, IAnimate, IStep, EasingType } from '@visactor/vrender-core';
import { RichText } from '@visactor/vrender-core';

/**
 * 富文本退出动画，实现类似打字机的字符逐个消失效果
 * 支持通过beforeText和afterText参数添加前缀和后缀
 * 支持通过showCursor参数显示光标，cursorChar自定义光标字符
 * 支持通过fadeOutChars参数开启字符透明度渐变效果
 * 支持通过direction参数控制消失方向（从头到尾或从尾到头）
 */
export class OutputRichText extends ACustomAnimate<{ textConfig: IRichTextCharacter[] }> {
  declare valid: boolean;

  private fromTextConfig: IRichTextCharacter[] = [];
  private toTextConfig: IRichTextCharacter[] = [];
  private originalTextConfig: IRichTextCharacter[] = [];
  private showCursor: boolean = false;
  private cursorChar: string = '|';
  private blinkCursor: boolean = true;
  private beforeText: string = '';
  private afterText: string = '';
  private fadeOutChars: boolean = false;
  private fadeOutDuration: number = 0.3; // 透明度渐变持续时间，以动画总时长的比例表示
  private direction: 'forward' | 'backward' = 'backward'; // 字符消失方向，默认从尾到头（backward）

  constructor(
    from: { textConfig: IRichTextCharacter[] },
    to: { textConfig: IRichTextCharacter[] },
    duration: number,
    easing: EasingType,
    params?: {
      showCursor?: boolean;
      cursorChar?: string;
      blinkCursor?: boolean;
      beforeText?: string;
      afterText?: string;
      fadeOutChars?: boolean;
      fadeOutDuration?: number;
      direction?: 'forward' | 'backward';
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

    // 配置字符透明度渐变效果
    if (params?.fadeOutChars !== undefined) {
      this.fadeOutChars = params.fadeOutChars;
    }
    if (params?.fadeOutDuration !== undefined) {
      this.fadeOutDuration = params.fadeOutDuration;
    }

    // 配置方向
    if (params?.direction !== undefined) {
      this.direction = params.direction;
    }

    this.propKeys = ['textConfig'];
  }

  onFirstRun(): void {
    const fromProps = this.getLastProps();
    const toProps = this.getEndProps();

    // 存储原始配置（这里是起始状态，显示所有文本）
    this.originalTextConfig = fromProps.textConfig ? [...fromProps.textConfig] : [];

    // 初始化解析结果
    this.valid = true;

    // 确保from不为空
    if (!this.originalTextConfig || this.originalTextConfig.length === 0) {
      this.valid = false;
      return;
    }

    // 将文本拆分为单个字符，使用RichText的静态方法
    this.fromTextConfig = RichText.TransformTextConfig2SingleCharacter(this.originalTextConfig);

    // 目标状态是空文本（或指定的目标）
    this.toTextConfig =
      toProps.textConfig && toProps.textConfig.length > 0
        ? RichText.TransformTextConfig2SingleCharacter(toProps.textConfig)
        : [];
  }

  onEnd(cb?: (animate: IAnimate, step: IStep) => void): void {
    super.onEnd(cb);
    if (!cb) {
      // 动画结束时，应用最终textConfig（通常是空的或特定的toTextConfig）
      if (this.toTextConfig.length > 0) {
        this.target.setAttribute('textConfig', this.toTextConfig);
      } else {
        this.target.setAttribute('textConfig', []);
      }
    }
  }

  onUpdate(end: boolean, ratio: number, out: Record<string, any>): void {
    if (!this.valid) {
      return;
    }

    // 获取当前应该显示的字符
    const fromItems = this.fromTextConfig.length;

    // 计算文本显示比例上限 - 如果有渐变效果，需要为尾部字符的渐变留出时间
    const maxTextHideRatio = this.fadeOutChars ? 1 - this.fadeOutDuration : 1;

    // 根据方向确定字符消失的顺序
    let displayedLength: number;

    if (this.direction === 'forward') {
      // 从前往后消失（类似于正向打字效果）
      if (this.fadeOutChars) {
        // 当ratio达到maxTextHideRatio时，应该已经隐藏全部文本
        const adjustedRatio = Math.min(1, ratio / maxTextHideRatio);
        displayedLength = Math.round(fromItems * (1 - adjustedRatio));
      } else {
        // 无渐变效果时，正常隐藏
        displayedLength = Math.round(fromItems * (1 - ratio));
      }

      // 构建从头开始删除的文本配置
      let currentTextConfig =
        this.direction === 'forward'
          ? this.fromTextConfig.slice(fromItems - displayedLength) // 从头开始隐藏，保留尾部
          : this.fromTextConfig.slice(0, displayedLength); // 从尾开始隐藏，保留头部

      // 应用透明度渐变效果
      if (this.fadeOutChars) {
        currentTextConfig = this.applyFadeEffect(currentTextConfig, ratio, fromItems, displayedLength);
      }

      // 如果启用了光标
      if (this.showCursor && displayedLength > 0) {
        currentTextConfig = this.addCursor(currentTextConfig, ratio);
      }

      // 更新富文本的textConfig属性
      this.target.setAttribute('textConfig', currentTextConfig);
    } else {
      // 从后往前消失（类似于退格删除效果）
      if (this.fadeOutChars) {
        // 当ratio达到maxTextHideRatio时，应该已经隐藏全部文本
        const adjustedRatio = Math.min(1, ratio / maxTextHideRatio);
        displayedLength = Math.round(fromItems * (1 - adjustedRatio));
      } else {
        // 无渐变效果时，正常隐藏
        displayedLength = Math.round(fromItems * (1 - ratio));
      }

      // 构建从尾开始删除的文本配置
      let currentTextConfig = this.fromTextConfig.slice(0, displayedLength);

      // 应用透明度渐变效果
      if (this.fadeOutChars) {
        currentTextConfig = this.applyFadeEffect(currentTextConfig, ratio, fromItems, displayedLength);
      }

      // 如果启用了光标
      if (this.showCursor && displayedLength > 0) {
        currentTextConfig = this.addCursor(currentTextConfig, ratio);
      }

      // 更新富文本的textConfig属性
      this.target.setAttribute('textConfig', currentTextConfig);
    }
  }

  // 应用透明度渐变效果
  private applyFadeEffect(
    textConfig: IRichTextCharacter[],
    ratio: number,
    totalItems: number,
    displayedLength: number
  ): IRichTextCharacter[] {
    // 计算边界字符的索引，这是正在淡出的字符
    let fadeIndex: number;

    if (this.direction === 'forward') {
      // 从前往后消失，当前正在淡出的是第displayedLength个字符
      fadeIndex = totalItems - displayedLength;
    } else {
      // 从后往前消失，当前正在淡出的是第displayedLength个字符
      fadeIndex = displayedLength;
    }

    // 计算边界字符的透明度
    const fadeProgress = (ratio - (1 - this.fadeOutDuration)) / this.fadeOutDuration;
    const fadeOpacity = Math.max(0, 1 - Math.min(1, fadeProgress));

    return textConfig.map((item, index) => {
      if (this.direction === 'forward') {
        // 从前往后消失，第一个字符最先淡出
        if (index === 0 && 'text' in item) {
          return {
            ...item,
            opacity: fadeOpacity
          };
        }
      } else {
        // 从后往前消失，最后一个字符最先淡出
        if (index === textConfig.length - 1 && 'text' in item) {
          return {
            ...item,
            opacity: fadeOpacity
          };
        }
      }
      return item;
    });
  }

  // 添加光标
  private addCursor(textConfig: IRichTextCharacter[], ratio: number): IRichTextCharacter[] {
    // 判断是否应该显示光标
    let shouldShowCursor = true;

    if (this.blinkCursor) {
      // 闪烁效果：在动画期间，光标每半个周期闪烁一次
      const blinkRate = 0.1; // 光标闪烁频率（每10%动画进度闪烁一次）
      shouldShowCursor = Math.floor(ratio / blinkRate) % 2 === 0;
    }

    if (shouldShowCursor && textConfig.length > 0) {
      // 确定光标位置（根据direction）
      const cursorIndex = this.direction === 'forward' ? 0 : textConfig.length - 1;
      const cursorItem = textConfig[cursorIndex];

      if ('text' in cursorItem) {
        // 复制数组
        const result = [...textConfig];

        if (this.direction === 'forward') {
          // 光标在前面
          result[cursorIndex] = {
            ...cursorItem,
            text: this.cursorChar + String(cursorItem.text)
          };
        } else {
          // 光标在后面
          result[cursorIndex] = {
            ...cursorItem,
            text: String(cursorItem.text) + this.cursorChar
          };
        }

        return result;
      }
    }

    return textConfig;
  }
}
