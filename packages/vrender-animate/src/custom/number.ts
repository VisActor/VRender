import type { IAnimate, IStep } from '../intreface/animate';
import type { EasingType } from '../intreface/easing';
import { ACustomAnimate } from './custom-animate';

/**
 * 数字增加动画，支持string; number; xx%; xx,xxx; xxx.xx%
 * 也支持通过formatTemplate参数指定格式化模板，如 "{{var}}m"、"${{var}}"
 * format和formatTemplate可以同时生效，先应用format再应用模板
 */
export class IncreaseCount extends ACustomAnimate<{ text: string | number }> {
  declare valid: boolean;

  private fromNumber: number;
  private toNumber: number;
  private decimalLength: number;
  private format: string;
  private formatTemplate: string | null = null;

  constructor(
    from: { text: string | number },
    to: { text: string | number },
    duration: number,
    easing: EasingType,
    // 支持外部控制小数位数以及格式化
    // format控制数字本身的格式化方式
    // formatTemplate可以定义模板字符串如 "{{var}}m"、"${{var}}"，两者可以同时使用
    params?: {
      decimalLength?: number;
      format?: 'percent' | 'thousandth' | 'none';
      formatTemplate?: string;
    }
  ) {
    super(from, to, duration, easing, params);
    this.decimalLength = params?.decimalLength;

    // 检查是否提供了格式化模板
    if (params?.formatTemplate && params.formatTemplate.includes('{{var}}')) {
      this.formatTemplate = params.formatTemplate;
    }
  }

  onFirstRun(): void {
    const fromProps = this.getLastProps();
    const toProps = this.getEndProps();
    const fromText = fromProps.text ?? 0;
    const toText = toProps.text ?? 0;

    // 初始化解析结果
    this.valid = true;
    let fromNum = 0;
    let toNum = 0;
    let fromFormat = '';
    let toFormat = '';
    let maxDecimalLength = 0;

    // 解析fromText
    if (typeof fromText === 'number') {
      fromNum = fromText;
      const str = fromText.toString();
      const decimalPart = str.split('.')[1] || '';
      maxDecimalLength = Math.max(maxDecimalLength, decimalPart.length);
    } else if (typeof fromText === 'string') {
      // 检查是否是百分比
      if (fromText.endsWith('%')) {
        fromFormat = '%';
        const numStr = fromText.substring(0, fromText.length - 1);
        // 去除可能的千分位逗号
        const cleanNumStr = numStr.replace(/,/g, '');
        fromNum = parseFloat(cleanNumStr) / 100;
        if (isNaN(fromNum)) {
          this.valid = false;
          return;
        }
        const decimalPart = cleanNumStr.split('.')[1] || '';
        maxDecimalLength = Math.max(maxDecimalLength, decimalPart.length + 2); // 百分比需要加2
      } else {
        // 处理普通数字或带千分位逗号的数字
        const cleanNumStr = fromText.replace(/,/g, '');
        fromNum = parseFloat(cleanNumStr);
        if (isNaN(fromNum)) {
          this.valid = false;
          return;
        }
        // 检查是否有千分位
        if (fromText.includes(',')) {
          fromFormat = ',';
        }
        const decimalPart = cleanNumStr.split('.')[1] || '';
        maxDecimalLength = Math.max(maxDecimalLength, decimalPart.length);
      }
    } else {
      this.valid = false;
      return;
    }

    // 解析toText
    if (typeof toText === 'number') {
      toNum = toText;
      const str = toText.toString();
      const decimalPart = str.split('.')[1] || '';
      maxDecimalLength = Math.max(maxDecimalLength, decimalPart.length);
    } else if (typeof toText === 'string') {
      // 检查是否是百分比
      if (toText.endsWith('%')) {
        toFormat = '%';
        const numStr = toText.substring(0, toText.length - 1);
        // 去除可能的千分位逗号
        const cleanNumStr = numStr.replace(/,/g, '');
        toNum = parseFloat(cleanNumStr) / 100;
        if (isNaN(toNum)) {
          this.valid = false;
          return;
        }
        const decimalPart = cleanNumStr.split('.')[1] || '';
        maxDecimalLength = Math.max(maxDecimalLength, decimalPart.length + 2); // 百分比需要加2
      } else {
        // 处理普通数字或带千分位逗号的数字
        const cleanNumStr = toText.replace(/,/g, '');
        toNum = parseFloat(cleanNumStr);
        if (isNaN(toNum)) {
          this.valid = false;
          return;
        }
        // 检查是否有千分位
        if (toText.includes(',')) {
          toFormat = ',';
        }
        const decimalPart = cleanNumStr.split('.')[1] || '';
        maxDecimalLength = Math.max(maxDecimalLength, decimalPart.length);
      }
    } else {
      this.valid = false;
      return;
    }

    // 设置最终格式
    // 检查是否有外部传入的格式
    if (this.params?.format) {
      // 使用外部传入的格式，将外部格式映射到内部格式
      switch (this.params.format) {
        case 'percent':
          this.format = '%';
          break;
        case 'thousandth':
          this.format = ',';
          break;
        case 'none':
          this.format = '';
          break;
        default:
          // 如果传入了未知格式，则使用自动检测的格式
          this.format = toFormat || fromFormat;
      }

      // 如果外部指定了百分比格式，但输入不是百分比，需要适配
      if (this.format === '%' && toFormat !== '%' && fromFormat !== '%') {
        // 不需要除以100，因为输入不是百分比
        if (this.decimalLength === undefined) {
          // 默认百分比显示2位小数
          this.decimalLength = 2;
        }
      }

      // 如果外部指定了不用百分比格式，但输入是百分比，需要适配
      if (this.format !== '%' && (toFormat === '%' || fromFormat === '%')) {
        // 需要乘以100，因为输入是百分比但不显示为百分比
        fromNum = fromNum * 100;
        toNum = toNum * 100;
      }
    } else {
      // 自动检测格式，优先使用toFormat，如果to没有特殊格式则使用fromFormat
      this.format = toFormat || fromFormat;
    }

    // 设置fromNumber和toNumber
    this.fromNumber = fromNum;
    this.toNumber = toNum;

    // 如果没有传入decimalLength，则根据输入格式设置
    if (this.decimalLength === undefined) {
      this.decimalLength = maxDecimalLength;
    }
  }

  onEnd(cb?: (animate: IAnimate, step: IStep) => void): void {
    super.onEnd(cb);
    if (!cb) {
      this.props && this.target.setAttributes(this.props as any);
    }
  }

  onUpdate(end: boolean, ratio: number, out: Record<string, any>): void {
    if (!this.valid) {
      return;
    }
    // 插值计算当前数值
    const currentNumber = this.fromNumber + (this.toNumber - this.fromNumber) * ratio;

    // 根据格式和小数位格式化数字
    let formattedText: string | number = '';
    const format = this.format;

    // 首先格式化数字值（保留小数位）
    // 对于百分比，乘以100
    const adjustedNumber = format === '%' ? currentNumber * 100 : currentNumber;
    // 保留指定小数位
    const numberWithDecimals = adjustedNumber.toFixed(this.decimalLength);
    // 如果小数位全是0，转为整数
    let formattedNumber: string | number = numberWithDecimals;
    if (parseFloat(numberWithDecimals) === Math.floor(parseFloat(numberWithDecimals))) {
      formattedNumber = Math.floor(parseFloat(numberWithDecimals));
    }

    // 应用基本格式（百分比、千分位）
    let formattedWithBasicFormat: string | number;
    if (format === '%') {
      // 百分比格式
      formattedWithBasicFormat = `${formattedNumber}%`;
    } else if (format === ',') {
      // 千分位格式
      const parts = formattedNumber.toString().split('.');
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      formattedWithBasicFormat = parts.join('.');
    } else {
      // 普通数字格式
      formattedWithBasicFormat = formattedNumber;
    }

    // 应用模板（如果存在）
    if (this.formatTemplate) {
      // 使用模板格式化
      formattedText = this.formatTemplate.replace('{{var}}', formattedWithBasicFormat.toString());
    } else {
      // 不使用模板，直接使用基本格式的结果
      formattedText = formattedWithBasicFormat;
    }

    // 更新图形的text属性
    this.target.setAttribute('text', formattedText);
  }
}
