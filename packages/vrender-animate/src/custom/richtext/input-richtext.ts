import { ACustomAnimate } from '../custom-animate';
import type {
  IRichTextCharacter,
  IRichTextParagraphCharacter,
  IAnimate,
  IStep,
  EasingType
} from '@visactor/vrender-core';
import { RichText } from '@visactor/vrender-core';

/**
 * 富文本输入动画，实现类似打字机的字符逐个显示效果
 * 支持通过beforeText和afterText参数添加前缀和后缀
 * 支持通过showCursor参数显示光标，cursorChar自定义光标字符
 * 支持通过fadeInChars参数开启字符透明度渐变效果
 */
export class InputRichText extends ACustomAnimate<{ textConfig: IRichTextCharacter[] }> {
  declare valid: boolean;

  private fromTextConfig: IRichTextCharacter[] = [];
  private toTextConfig: IRichTextCharacter[] = [];
  private originalTextConfig: IRichTextCharacter[] = [];
  private showCursor: boolean = false;
  private cursorChar: string = '|';
  private blinkCursor: boolean = true;
  private beforeText: string = '';
  private afterText: string = '';
  private fadeInChars: boolean = false;
  private fadeInDuration: number = 0.3; // 透明度渐变持续时间，以动画总时长的比例表示

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
      fadeInChars?: boolean;
      fadeInDuration?: number;
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
    if (params?.fadeInChars !== undefined) {
      this.fadeInChars = params.fadeInChars;
    }
    if (params?.fadeInDuration !== undefined) {
      this.fadeInDuration = params.fadeInDuration;
    }
  }

  onFirstRun(): void {
    const fromProps = this.getLastProps();
    const toProps = this.getEndProps();

    // 存储原始配置
    this.originalTextConfig = toProps.textConfig ? [...toProps.textConfig] : [];

    // 初始化解析结果
    this.valid = true;

    // 确保to不为空
    if (!this.originalTextConfig || this.originalTextConfig.length === 0) {
      this.valid = false;
      return;
    }

    // 将文本拆分为单个字符，使用RichText的静态方法
    this.fromTextConfig =
      fromProps.textConfig && fromProps.textConfig.length > 0
        ? RichText.TransformTextConfig2SingleCharacter(fromProps.textConfig)
        : [];

    this.toTextConfig = RichText.TransformTextConfig2SingleCharacter(this.originalTextConfig);
  }

  onEnd(cb?: (animate: IAnimate, step: IStep) => void): void {
    super.onEnd(cb);
    if (!cb) {
      // 动画结束时，恢复原始textConfig
      this.target.setAttribute('textConfig', this.originalTextConfig);
    }
  }

  onUpdate(end: boolean, ratio: number, out: Record<string, any>): void {
    if (!this.valid) {
      return;
    }

    // 计算当前应该显示的字符数量
    const totalItems = this.toTextConfig.length;
    const fromItems = this.fromTextConfig.length;

    // 计算文本显示比例上限 - 如果有渐变效果，需要为尾部字符的渐变留出时间
    // 例如，如果fadeInDuration为0.3，则文本显示部分最多占用动画时间的70%
    const maxTextShowRatio = this.fadeInChars ? 1 - this.fadeInDuration : 1;

    // 确定当前应该显示多少个项目
    let currentLength: number;

    // 如果fromItems比totalItems长，则是删除动画，否则是添加动画
    if (fromItems > totalItems) {
      // 删除文本动画（从多到少）
      currentLength = Math.round(fromItems - (fromItems - totalItems) * ratio);
    } else {
      // 添加文本动画（从少到多）- 需要更快显示字符以便留出时间让最后的字符完成渐变
      if (this.fadeInChars) {
        // 当ratio达到maxTextShowRatio时，应该已经显示全部文本
        const adjustedRatio = Math.min(1, ratio / maxTextShowRatio);
        currentLength = Math.round(fromItems + (totalItems - fromItems) * adjustedRatio);
      } else {
        // 无渐变效果时，正常显示
        currentLength = Math.round(fromItems + (totalItems - fromItems) * ratio);
      }
    }

    // 构建当前要显示的textConfig
    let currentTextConfig: IRichTextCharacter[];
    if (fromItems > totalItems) {
      // 删除动画：显示from的前currentLength项
      currentTextConfig = this.fromTextConfig.slice(0, currentLength);
    } else {
      // 添加文本动画：显示to的前currentLength项，可能需要应用透明度
      currentTextConfig = this.toTextConfig.slice(0, currentLength).map((item, index) => {
        // 如果启用了透明度渐变效果
        if (this.fadeInChars && 'text' in item) {
          // 计算每个字符从出现到结束的渐变进度
          // 字符在特定时间点出现：出现时刻 = (index / totalItems) * maxTextShowRatio
          // 当前时刻 = ratio
          // 渐变持续时间 = fadeInDuration
          // 渐变进度 = (当前时刻 - 出现时刻) / 渐变持续时间

          const appearTime = (index / totalItems) * maxTextShowRatio;
          const fadeProgress = (ratio - appearTime) / this.fadeInDuration;

          // 限制透明度在0-1范围内
          const opacity = Math.max(0, Math.min(1, fadeProgress));

          // 如果是文本项，添加透明度
          return {
            ...item,
            opacity: opacity
          };
        }
        return item;
      });
    }

    // 如果启用了光标
    if (this.showCursor && currentLength < totalItems) {
      // 判断是否应该显示光标
      let shouldShowCursor = true;

      if (this.blinkCursor) {
        // 闪烁效果：在动画期间，光标每半个周期闪烁一次
        const blinkRate = 0.1; // 光标闪烁频率（每10%动画进度闪烁一次）
        shouldShowCursor = Math.floor(ratio / blinkRate) % 2 === 0;
      }

      if (shouldShowCursor && currentTextConfig.length > 0) {
        // 找到最后一个文本项，在其后添加光标
        const lastIndex = currentTextConfig.length - 1;
        const lastItem = currentTextConfig[lastIndex];

        if ('text' in lastItem) {
          // 如果最后一项是文本，将光标添加到文本后面
          currentTextConfig[lastIndex] = {
            ...lastItem,
            text: String(lastItem.text) + this.cursorChar
          };
        } else {
          // 如果最后一项是非文本（如图片），添加一个只包含光标的新文本项
          const cursorItem: IRichTextParagraphCharacter = {
            text: this.cursorChar,
            fontSize: 16 // 使用默认字体大小，或者从context获取
          };
          currentTextConfig.push(cursorItem);
        }
      }
    }

    // 更新富文本的textConfig属性
    this.target.setAttribute('textConfig', currentTextConfig);
  }
}
