import type { IAnimate, IStep } from '../../intreface/animate';
import type { EasingType } from '../../intreface/easing';
import { ACustomAnimate } from '../custom-animate';
import type { IRichTextCharacter, IRichTextParagraphCharacter } from '@visactor/vrender-core';
import { RichText } from '@visactor/vrender-core';

/**
 * 滑动富文本退出动画，文字会向指定方向滑出，同时逐字消失
 * 支持上、下、左、右四个方向
 * 支持按单词或字符退场
 */
export class SlideOutRichText extends ACustomAnimate<{ textConfig: IRichTextCharacter[] }> {
  declare valid: boolean;

  private fromTextConfig: IRichTextCharacter[] = [];
  private toTextConfig: IRichTextCharacter[] = [];
  private originalTextConfig: IRichTextCharacter[] = [];
  private singleCharConfig: IRichTextCharacter[] = [];
  private fadeOutDuration: number = 0.3; // 透明度渐变持续时间，以动画总时长的比例表示
  private slideDirection: 'up' | 'down' | 'left' | 'right' = 'right'; // 滑动方向
  private slideDistance: number = 30; // 滑动距离（像素）
  private wordByWord: boolean = false; // 是否按单词为单位进行动画
  // 默认正则表达式: 匹配英文单词(含中间连字符),连续中文字符,数字,以及独立的符号和空格
  private wordRegex: RegExp = /[a-zA-Z]+(-[a-zA-Z]+)*|[\u4e00-\u9fa5]+|[0-9]+|[^\s\w\u4e00-\u9fa5]/g;
  private wordGroups: number[][] = []; // 存储单词分组信息，每个数组包含属于同一单词的字符索引
  private reverseOrder: boolean = false; // 是否反转字符/单词的消失顺序

  constructor(
    from: { textConfig: IRichTextCharacter[] },
    to: { textConfig: IRichTextCharacter[] },
    duration: number,
    easing: EasingType,
    params?: {
      fadeOutDuration?: number;
      slideDirection?: 'up' | 'down' | 'left' | 'right';
      slideDistance?: number;
      wordByWord?: boolean;
      wordRegex?: RegExp;
      reverseOrder?: boolean;
    }
  ) {
    super(from, to, duration, easing, params);

    // 配置透明度渐变效果
    if (params?.fadeOutDuration !== undefined) {
      this.fadeOutDuration = params.fadeOutDuration;
    }

    // 配置滑动方向和距离
    if (params?.slideDirection !== undefined) {
      this.slideDirection = params.slideDirection;
    }
    if (params?.slideDistance !== undefined) {
      this.slideDistance = params.slideDistance;
    }

    // 配置按单词动画
    if (params?.wordByWord !== undefined) {
      this.wordByWord = params.wordByWord;
    }
    if (params?.wordRegex !== undefined) {
      this.wordRegex = params.wordRegex;
    }

    // 配置顺序
    if (params?.reverseOrder !== undefined) {
      this.reverseOrder = params.reverseOrder;
    }

    this.propKeys = ['textConfig'];
  }

  onFirstRun(): void {
    const fromProps = this.getLastProps();
    const toProps = this.getEndProps();

    // 存储原始配置
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

    // 创建单字符数组，用于动画初始状态
    this.singleCharConfig = this.fromTextConfig.map(item => {
      if ('text' in item) {
        // 文本字符初始设置为完全可见且无偏移
        return {
          ...item,
          opacity: 1,
          dx: 0,
          dy: 0
        };
      }
      return { ...item, opacity: 1 };
    });

    // 如果启用按单词动画，则计算单词分组
    if (this.wordByWord) {
      this.calculateWordGroups();
    }
  }

  // 计算单词分组
  private calculateWordGroups(): void {
    // 重置单词分组
    this.wordGroups = [];

    // 构建完整文本用于正则匹配
    let fullText = '';
    const charMap: Record<number, number> = {}; // 映射全文索引到字符配置索引
    let fullTextIndex = 0;

    // 构建全文和映射
    this.fromTextConfig.forEach((item, configIndex) => {
      if ('text' in item) {
        const text = String(item.text);
        fullText += text;
        // 为每个字符创建映射
        charMap[fullTextIndex] = configIndex;
        fullTextIndex++;
      }
    });

    // 使用正则表达式查找单词
    let match;

    // 重置正则表达式状态
    this.wordRegex.lastIndex = 0;

    while ((match = this.wordRegex.exec(fullText)) !== null) {
      const wordStart = match.index;
      const wordEnd = match.index + match[0].length;

      // 找出属于这个单词的所有字符索引
      const wordIndices = [];

      for (let i = wordStart; i < wordEnd; i++) {
        if (charMap[i] !== undefined) {
          wordIndices.push(charMap[i]);
        }
      }

      // 添加到单词分组
      if (wordIndices.length > 0) {
        this.wordGroups.push(wordIndices);
      }
    }

    // 处理没有分配到任何单词的字符
    const allocatedIndices = new Set<number>();
    this.wordGroups.forEach(group => {
      group.forEach(index => allocatedIndices.add(index));
    });

    for (let i = 0; i < this.fromTextConfig.length; i++) {
      if ('text' in this.fromTextConfig[i] && !allocatedIndices.has(i)) {
        // 单独为每个未分配的字符创建一个"单词"
        this.wordGroups.push([i]);
      }
    }
  }

  // 根据滑动方向计算目标x偏移（最终位置）
  private getTargetDx(): number {
    switch (this.slideDirection) {
      case 'left':
        return -this.slideDistance;
      case 'right':
        return this.slideDistance;
      default:
        return 0;
    }
  }

  // 根据滑动方向计算目标y偏移（最终位置）
  private getTargetDy(): number {
    switch (this.slideDirection) {
      case 'up':
        return -this.slideDistance;
      case 'down':
        return this.slideDistance;
      default:
        return 0;
    }
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

    // 计算文本显示时间比例上限 - 为尾部字符的渐变和滑动效果留出时间
    const maxTextShowRatio = 1 - this.fadeOutDuration;

    let updatedTextConfig: IRichTextCharacter[];

    if (this.wordByWord && this.wordGroups.length > 0) {
      // 按单词动画
      updatedTextConfig = this.updateByWord(ratio, maxTextShowRatio);
    } else {
      // 按字符动画
      updatedTextConfig = this.updateByCharacter(ratio, maxTextShowRatio);
    }

    // 更新富文本的textConfig属性
    this.target.setAttribute('textConfig', updatedTextConfig);
  }

  // 按单词更新文本配置
  private updateByWord(ratio: number, maxTextShowRatio: number): IRichTextCharacter[] {
    const totalGroups = this.wordGroups.length;
    const updatedTextConfig = [...this.singleCharConfig];

    // 处理单词分组
    for (let groupIndex = 0; groupIndex < this.wordGroups.length; groupIndex++) {
      // 计算这个单词组的消失时间点
      let disappearTime;

      if (this.reverseOrder) {
        // 反转顺序 (与入场顺序相反)
        if (this.slideDirection === 'left') {
          // 从左到右的顺序 (第一个单词先消失)
          disappearTime = (groupIndex / totalGroups) * maxTextShowRatio;
        } else {
          // 从右到左的顺序 (最后的单词先消失)
          disappearTime = ((totalGroups - 1 - groupIndex) / totalGroups) * maxTextShowRatio;
        }
      } else {
        // 标准顺序 (与入场顺序相同)
        if (this.slideDirection === 'left') {
          // 从右到左的顺序 (最后的单词先消失)
          disappearTime = ((totalGroups - 1 - groupIndex) / totalGroups) * maxTextShowRatio;
        } else {
          // 从左到右的顺序 (第一个单词先消失)
          disappearTime = (groupIndex / totalGroups) * maxTextShowRatio;
        }
      }

      // 如果当前时间还没到显示这个单词的消失时间点，保持可见状态
      if (ratio < disappearTime) {
        for (const charIndex of this.wordGroups[groupIndex]) {
          const item = updatedTextConfig[charIndex];
          if ('text' in item) {
            updatedTextConfig[charIndex] = {
              ...item,
              opacity: 1,
              dx: 0,
              dy: 0
            };
          }
        }
        continue;
      }

      // 计算动画进度（0-1之间）
      const animProgress = (ratio - disappearTime) / this.fadeOutDuration;
      const progress = Math.max(0, Math.min(1, animProgress));

      // 计算当前偏移和透明度
      const dx = this.getTargetDx() * progress;
      const dy = this.getTargetDy() * progress;
      const opacity = 1 - progress;

      // 更新这个单词的所有字符
      for (const charIndex of this.wordGroups[groupIndex]) {
        const item = updatedTextConfig[charIndex];
        if ('text' in item) {
          updatedTextConfig[charIndex] = {
            ...item,
            opacity,
            dx,
            dy
          };
        }
      }
    }

    return updatedTextConfig;
  }

  // 按字符更新文本配置
  private updateByCharacter(ratio: number, maxTextShowRatio: number): IRichTextCharacter[] {
    const totalItems = this.fromTextConfig.length;
    const updatedTextConfig = [...this.singleCharConfig];

    // 更新每个字符的状态
    for (let index = 0; index < updatedTextConfig.length; index++) {
      const item = updatedTextConfig[index];
      if ('text' in item) {
        // 计算每个字符的消失时间点
        let disappearTime;

        if (this.reverseOrder) {
          // 反转入场顺序
          if (this.slideDirection === 'left') {
            // 从左到右的顺序 (第一个字符先消失)
            disappearTime = (index / totalItems) * maxTextShowRatio;
          } else {
            // 从右到左的顺序 (最后的字符先消失)
            disappearTime = ((totalItems - 1 - index) / totalItems) * maxTextShowRatio;
          }
        } else {
          // 与入场顺序相同
          if (this.slideDirection === 'left') {
            // 从右到左的顺序 (最后的字符先消失)
            disappearTime = ((totalItems - 1 - index) / totalItems) * maxTextShowRatio;
          } else {
            // 标准顺序 (第一个字符先消失)
            disappearTime = (index / totalItems) * maxTextShowRatio;
          }
        }

        // 如果当前时间还没到这个字符的消失时间点，保持可见状态
        if (ratio < disappearTime) {
          updatedTextConfig[index] = {
            ...item,
            opacity: 1,
            dx: 0,
            dy: 0
          };
          continue;
        }

        // 计算动画进度（0-1之间）
        const animProgress = (ratio - disappearTime) / this.fadeOutDuration;
        const progress = Math.max(0, Math.min(1, animProgress));

        // 计算当前偏移和透明度
        const dx = this.getTargetDx() * progress;
        const dy = this.getTargetDy() * progress;
        const opacity = 1 - progress;

        updatedTextConfig[index] = {
          ...item,
          opacity,
          dx,
          dy
        };
      }
    }

    return updatedTextConfig;
  }
}
