import { ACustomAnimate } from '../custom-animate';
import type { IRichTextCharacter, IAnimate, IStep, EasingType } from '@visactor/vrender-core';
import { RichText } from '@visactor/vrender-core';

/**
 * 滑动富文本动画，结合打字效果和方向滑动效果
 * 文字会从指定方向滑入，同时逐字显示和渐入
 * 支持上、下、左、右四个方向
 * 支持按单词或字符入场
 */
export class SlideRichText extends ACustomAnimate<{ textConfig: IRichTextCharacter[] }> {
  declare valid: boolean;

  private fromTextConfig: IRichTextCharacter[] = [];
  private toTextConfig: IRichTextCharacter[] = [];
  private originalTextConfig: IRichTextCharacter[] = [];
  private singleCharConfig: IRichTextCharacter[] = [];
  private fadeInDuration: number = 0.3; // 透明度渐变持续时间，以动画总时长的比例表示
  private slideDirection: 'up' | 'down' | 'left' | 'right' = 'right'; // 滑动方向
  private slideDistance: number = 30; // 滑动距离（像素）
  private wordByWord: boolean = false; // 是否按单词为单位进行动画
  // 默认正则表达式: 匹配英文单词(含中间连字符),连续中文字符,数字,以及独立的符号和空格
  private wordRegex: RegExp = /[a-zA-Z]+(-[a-zA-Z]+)*|[\u4e00-\u9fa5]+|[0-9]+|[^\s\w\u4e00-\u9fa5]/g;
  private wordGroups: number[][] = []; // 存储单词分组信息，每个数组包含属于同一单词的字符索引

  constructor(
    from: { textConfig: IRichTextCharacter[] },
    to: { textConfig: IRichTextCharacter[] },
    duration: number,
    easing: EasingType,
    params?: {
      fadeInDuration?: number;
      slideDirection?: 'up' | 'down' | 'left' | 'right';
      slideDistance?: number;
      wordByWord?: boolean;
      wordRegex?: RegExp;
    }
  ) {
    super(from, to, duration, easing, params);

    // 配置透明度渐变效果
    if (params?.fadeInDuration !== undefined) {
      this.fadeInDuration = params.fadeInDuration;
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

    // 创建单字符数组，用于动画
    this.singleCharConfig = this.toTextConfig.map(item => {
      if ('text' in item) {
        // 文本字符初始设置为透明
        return {
          ...item,
          opacity: 0,
          dx: this.getInitialDx(),
          dy: this.getInitialDy()
        };
      }
      return { ...item, opacity: 0 };
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
    this.toTextConfig.forEach((item, configIndex) => {
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

    for (let i = 0; i < this.toTextConfig.length; i++) {
      if ('text' in this.toTextConfig[i] && !allocatedIndices.has(i)) {
        // 单独为每个未分配的字符创建一个"单词"
        this.wordGroups.push([i]);
      }
    }
  }

  // 根据滑动方向计算初始x偏移
  private getInitialDx(): number {
    switch (this.slideDirection) {
      case 'left':
        return -this.slideDistance;
      case 'right':
        return this.slideDistance;
      default:
        return 0;
    }
  }

  // 根据滑动方向计算初始y偏移
  private getInitialDy(): number {
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
      // 动画结束时，恢复原始textConfig
      this.target.setAttribute('textConfig', this.originalTextConfig);
    }
  }

  onUpdate(end: boolean, ratio: number, out: Record<string, any>): void {
    if (!this.valid) {
      return;
    }

    // 计算文本显示比例上限 - 为尾部字符的渐变和滑动效果留出时间
    const maxTextShowRatio = 1 - this.fadeInDuration;

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
      // 计算这个单词组的显示时间点
      let appearTime;
      if (this.slideDirection === 'left') {
        // 从右到左顺序（最后的单词先出现）
        appearTime = ((totalGroups - 1 - groupIndex) / totalGroups) * maxTextShowRatio;
      } else {
        // 标准顺序（第一个单词先出现）
        appearTime = (groupIndex / totalGroups) * maxTextShowRatio;
      }

      // 如果当前时间还没到显示这个单词的时间点，保持隐藏状态
      if (ratio < appearTime) {
        for (const charIndex of this.wordGroups[groupIndex]) {
          const item = updatedTextConfig[charIndex];
          if ('text' in item) {
            updatedTextConfig[charIndex] = {
              ...item,
              opacity: 0,
              dx: this.getInitialDx(),
              dy: this.getInitialDy()
            };
          }
        }
        continue;
      }

      // 计算动画进度（0-1之间）
      const animProgress = (ratio - appearTime) / this.fadeInDuration;
      const progress = Math.max(0, Math.min(1, animProgress));

      // 计算当前偏移和透明度
      const dx = this.getInitialDx() * (1 - progress);
      const dy = this.getInitialDy() * (1 - progress);

      // 更新这个单词的所有字符
      for (const charIndex of this.wordGroups[groupIndex]) {
        const item = updatedTextConfig[charIndex];
        if ('text' in item) {
          updatedTextConfig[charIndex] = {
            ...item,
            opacity: progress,
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
    const totalItems = this.toTextConfig.length;
    const updatedTextConfig = [...this.singleCharConfig];

    // 更新每个字符的状态
    for (let index = 0; index < updatedTextConfig.length; index++) {
      const item = updatedTextConfig[index];
      if ('text' in item) {
        // 计算每个字符的显示时间点
        // 对于left方向，反转显示顺序（从右到左）
        let appearTime;
        if (this.slideDirection === 'left') {
          // 从右到左的顺序 (最后的字符先出现)
          appearTime = ((totalItems - 1 - index) / totalItems) * maxTextShowRatio;
        } else {
          // 标准顺序 (第一个字符先出现)
          appearTime = (index / totalItems) * maxTextShowRatio;
        }

        // 如果当前时间还没到显示这个字符的时间点，保持隐藏状态
        if (ratio < appearTime) {
          updatedTextConfig[index] = {
            ...item,
            opacity: 0,
            dx: this.getInitialDx(),
            dy: this.getInitialDy()
          };
          continue;
        }

        // 计算动画进度（0-1之间）
        const animProgress = (ratio - appearTime) / this.fadeInDuration;
        const progress = Math.max(0, Math.min(1, animProgress));

        // 计算当前偏移和透明度
        const dx = this.getInitialDx() * (1 - progress);
        const dy = this.getInitialDy() * (1 - progress);

        updatedTextConfig[index] = {
          ...item,
          opacity: progress,
          dx,
          dy
        };
      }
    }

    return updatedTextConfig;
  }
}
