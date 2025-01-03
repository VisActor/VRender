/**
 * The MIT License (MIT)

  Copyright (c) 2014 gskinner.com, inc.

  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in all
  copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  SOFTWARE.
 */

// 参考TweenJS
// https://github.com/CreateJS/TweenJS/tree/master/src/tweenjs
import { pi2 } from '@visactor/vutils';

/**
 * 代码迁移自createjs
 * 部分缓动函数参考https://easings.net/
 */
export class Easing {
  private constructor() {
    // do nothing
  }

  static linear(t: number): number {
    return t;
  }

  static none() {
    return this.linear;
  }

  /**
   * 获取缓动函数，amount指示这个缓动函数的插值方式
   * @param amount
   * @returns
   */
  static get(amount: number) {
    if (amount < -1) {
      amount = -1;
    } else if (amount > 1) {
      amount = 1;
    }

    return function (t: number) {
      if (amount === 0) {
        return t;
      }
      if (amount < 0) {
        return t * (t * -amount + 1 + amount);
      }
      return t * ((2 - t) * amount + (1 - amount));
    };
  }

  /* 语法糖 */
  static getPowIn(pow: number) {
    return function (t: number) {
      return Math.pow(t, pow);
    };
  }

  static getPowOut(pow: number) {
    return function (t: number) {
      return 1 - Math.pow(1 - t, pow);
    };
  }

  static getPowInOut(pow: number) {
    return function (t: number) {
      if ((t *= 2) < 1) {
        return 0.5 * Math.pow(t, pow);
      }
      return 1 - 0.5 * Math.abs(Math.pow(2 - t, pow));
    };
  }

  // 插值函数
  static quadIn = Easing.getPowIn(2);
  static quadOut = Easing.getPowOut(2);

  static quadInOut = Easing.getPowInOut(2);
  static cubicIn = Easing.getPowIn(3);
  static cubicOut = Easing.getPowOut(3);
  static cubicInOut = Easing.getPowInOut(3);
  static quartIn = Easing.getPowIn(4);
  static quartOut = Easing.getPowOut(4);
  static quartInOut = Easing.getPowInOut(4);
  static quintIn = Easing.getPowIn(5);
  static quintOut = Easing.getPowOut(5);
  static quintInOut = Easing.getPowInOut(5);

  /* 语法糖 */
  static getBackIn(amount: number) {
    return function (t: number) {
      return t * t * ((amount + 1) * t - amount);
    };
  }
  static getBackOut(amount: number) {
    return function (t: number) {
      return --t * t * ((amount + 1) * t + amount) + 1;
    };
  }
  static getBackInOut(amount: number) {
    amount *= 1.525;
    return function (t: number) {
      if ((t *= 2) < 1) {
        return 0.5 * (t * t * ((amount + 1) * t - amount));
      }
      return 0.5 * ((t -= 2) * t * ((amount + 1) * t + amount) + 2);
    };
  }

  // 插值函数
  static backIn = Easing.getBackIn(1.7);
  static backOut = Easing.getBackOut(1.7);
  static backInOut = Easing.getBackInOut(1.7);

  static sineIn(t: number): number {
    return 1 - Math.cos((t * Math.PI) / 2);
  }

  static sineOut(t: number): number {
    return Math.sin((t * Math.PI) / 2);
  }

  static sineInOut(t: number): number {
    return -(Math.cos(Math.PI * t) - 1) / 2;
  }

  static expoIn(t: number): number {
    return t === 0 ? 0 : Math.pow(2, 10 * t - 10);
  }

  static expoOut(t: number): number {
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
  }

  static expoInOut(t: number): number {
    return t === 0 ? 0 : t === 1 ? 1 : t < 0.5 ? Math.pow(2, 20 * t - 10) / 2 : (2 - Math.pow(2, -20 * t + 10)) / 2;
  }

  // 插值函数
  static circIn(t: number) {
    return -(Math.sqrt(1 - t * t) - 1);
  }

  static circOut(t: number) {
    return Math.sqrt(1 - --t * t);
  }

  static circInOut(t: number) {
    if ((t *= 2) < 1) {
      return -0.5 * (Math.sqrt(1 - t * t) - 1);
    }
    return 0.5 * (Math.sqrt(1 - (t -= 2) * t) + 1);
  }
  static bounceOut(t: number) {
    if (t < 1 / 2.75) {
      return 7.5625 * t * t;
    } else if (t < 2 / 2.75) {
      return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
    } else if (t < 2.5 / 2.75) {
      return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
    }
    return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
  }
  static bounceIn(t: number) {
    return 1 - Easing.bounceOut(1 - t);
  }

  static bounceInOut(t: number) {
    if (t < 0.5) {
      return Easing.bounceIn(t * 2) * 0.5;
    }
    return Easing.bounceOut(t * 2 - 1) * 0.5 + 0.5;
  }

  /* 语法糖 */
  static getElasticIn(amplitude: number, period: number) {
    return function (t: number) {
      if (t === 0 || t === 1) {
        return t;
      }
      const s = (period / pi2) * Math.asin(1 / amplitude);
      return -(amplitude * Math.pow(2, 10 * (t -= 1)) * Math.sin(((t - s) * pi2) / period));
    };
  }
  static getElasticOut(amplitude: number, period: number) {
    return function (t: number) {
      if (t === 0 || t === 1) {
        return t;
      }
      const s = (period / pi2) * Math.asin(1 / amplitude);
      return amplitude * Math.pow(2, -10 * t) * Math.sin(((t - s) * pi2) / period) + 1;
    };
  }
  static getElasticInOut(amplitude: number, period: number) {
    return function (t: number) {
      const s = (period / pi2) * Math.asin(1 / amplitude);
      if ((t *= 2) < 1) {
        return -0.5 * (amplitude * Math.pow(2, 10 * (t -= 1)) * Math.sin(((t - s) * pi2) / period));
      }
      return amplitude * Math.pow(2, -10 * (t -= 1)) * Math.sin(((t - s) * pi2) / period) * 0.5 + 1;
    };
  }

  // 插值函数
  static elasticIn = Easing.getElasticIn(1, 0.3);
  static elasticOut = Easing.getElasticOut(1, 0.3);
  static elasticInOut = Easing.getElasticInOut(1, 0.3 * 1.5);

  static easeInOutQuad = (t: number) => {
    if ((t /= 0.5) < 1) {
      return 0.5 * Math.pow(t, 2);
    }
    return -0.5 * ((t -= 2) * t - 2);
  };

  static easeOutElastic = (x: number) => {
    const c4 = (2 * Math.PI) / 3;

    return x === 0 ? 0 : x === 1 ? 1 : Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * c4) + 1;
  };

  static easeInOutElastic = (x: number) => {
    const c5 = (2 * Math.PI) / 4.5;

    return x === 0
      ? 0
      : x === 1
      ? 1
      : x < 0.5
      ? -(Math.pow(2, 20 * x - 10) * Math.sin((20 * x - 11.125) * c5)) / 2
      : (Math.pow(2, -20 * x + 10) * Math.sin((20 * x - 11.125) * c5)) / 2 + 1;
  };
  static registerFunc(name: string, func: (t: number) => number) {
    (Easing as any)[name] = func;
  }
}

function flicker(t: number, n: number) {
  const step = 1 / n;
  let flag = 1;
  while (t > step) {
    t -= step;
    flag *= -1;
  }
  const v = (flag * t) / step;
  return v > 0 ? v : 1 + v;
}

// 注册flicker
for (let i = 0; i < 10; i++) {
  (Easing as any)[`flicker${i}`] = (t: number) => flicker(t, i);
}

for (let i = 2; i < 10; i++) {
  (Easing as any)[`aIn${i}`] = (t: number) => i * t * t + (1 - i) * t;
}
