/**
 * 基于fabric.js https://github.com/fabricjs/fabric.js/blob/a709d3be8e5bbdf520ae385ff28bca17a9566d76/src/util/path.js
 * Copyright (c) 2008-2015 Printio (Juriy Zaytsev, Maxim Chernyak)

  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NON INFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  SOFTWARE.
 */
const rePathCommand = /([-+]?((\d+\.\d+)|((\d+)|(\.\d+)))(?:[eE][-+]?\d+)?)/gi;
const commandLengths: Record<string, number> = {
  m: 2,
  l: 2,
  h: 1,
  v: 1,
  c: 6,
  s: 4,
  q: 4,
  t: 2,
  a: 7,
  M: 2,
  L: 2,
  H: 1,
  V: 1,
  C: 6,
  S: 4,
  Q: 4,
  T: 2,
  A: 7
};

export const enumCommandMap = {
  A: 0,
  AT: 1,
  C: 2,
  Z: 3,
  E: 4,
  L: 5,
  M: 6,
  Q: 7,
  R: 8
};

type char = string;
let currPath: string;
let coordsStr: string;
let commandChar: char;
let coordStr: string;
let coordNumber: number;
let standardCommandLen: number;
export function parseSvgPath(str: string): Array<string | number>[] {
  if (!str) {
    return [];
  }
  // parse str到命令数组
  const paths = str.match(/[mzlhvcsqta][^mzlhvcsqta]*/gi);
  if (paths === null) {
    return [];
  }

  let currCommandData: (string | number)[];
  let coordsStrArr: RegExpMatchArray | null;
  const result: (string | number)[][] = [];
  for (let i = 0, len = paths.length; i < len; i++) {
    currPath = paths[i];
    coordsStr = currPath.slice(1);
    commandChar = currPath[0];
    currCommandData = [commandChar];

    coordsStrArr = coordsStr.match(rePathCommand);
    if (coordsStrArr === null) {
      result.push(currCommandData);
      continue;
    }

    // 转到number
    for (let i = 0, len = coordsStrArr.length; i < len; i++) {
      coordStr = coordsStrArr[i];
      coordNumber = parseFloat(coordStr);
      if (!Number.isNaN(coordNumber)) {
        currCommandData.push(coordNumber);
      }
    }

    // 当前命令的参数长度，svg可能会合并多个相同的命令
    standardCommandLen = commandLengths[commandChar];
    if (currCommandData.length - 1 > standardCommandLen) {
      // 如果命令长度超过默认长度，就拆分为多个命令
      let subCommand: (string | number)[];
      let bestCommandChar = commandChar;
      for (let i = 1, len = currCommandData.length; i < len; i += standardCommandLen) {
        subCommand = [bestCommandChar];
        for (let j = i, subLen = i + standardCommandLen; j < subLen; j++) {
          subCommand.push(currCommandData[j]);
        }
        result.push(subCommand);
        // 如果是一堆m命令，后续就转为l命令
        if (bestCommandChar === 'm') {
          bestCommandChar = 'l';
        } else if (bestCommandChar === 'M') {
          bestCommandChar = 'L';
        }
      }
    } else {
      result.push(currCommandData);
    }
  }

  return result;
}
