import { BoundsContext } from './bounds-context';
import type { CommandStrType, CommandType, ICurve, ICustomPath2D, IDirection, ILine, IPath2D } from '../interface';
import { CurvePath } from './segment/curve/path';
import { enumCommandMap, parseSvgPath } from './path-svg';
import type { IPoint, IPointLike } from '@visactor/vutils';
import { abs } from '@visactor/vutils';
import { Direction } from './enums';
import { drawArc, addArcToBezierPath } from './shape/arc';
import { renderCommandList } from './render-command-list';
import { calcLineCache } from './segment';

/**
 * 部分源码参考 https://github.com/d3/d3-shape/
 * Copyright 2010-2022 Mike Bostock

  Permission to use, copy, modify, and/or distribute this software for any purpose
  with or without fee is hereby granted, provided that the above copyright notice
  and this permission notice appear in all copies.

  THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
  REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND
  FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
  INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS
  OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER
  TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF
  THIS SOFTWARE.
 */
// 基于d3-shape重构
// https://github.com/vega/vega/blob/master/packages/vega-scenegraph/src/path/render.js

export class CustomPath2D extends CurvePath implements ICustomPath2D {
  commandList: CommandType[] = [];
  _boundsContext: IPath2D;
  _ctx?: IPath2D;
  direction?: IDirection;
  protected transformCbList?: ((cmd: CommandType, x: number, y: number, sx: number, sy: number) => void)[];
  protected toStringCbList?: ((cmd: CommandType) => string)[];

  constructor(ctx?: IPath2D) {
    super();
    if (ctx) {
      this._ctx = ctx;
    }
    this._boundsContext = new BoundsContext(this.bounds);
  }

  setCtx(ctx?: IPath2D) {
    this._ctx = ctx;
  }

  moveTo(x: number, y: number) {
    this.commandList.push([enumCommandMap.M, x, y]);
    this._ctx && this._ctx.moveTo(x, y);
    return this;
  }
  lineTo(x: number, y: number) {
    this.commandList.push([enumCommandMap.L, x, y]);
    this._ctx && this._ctx.lineTo(x, y);
    return this;
  }
  quadraticCurveTo(aCPx: number, aCPy: number, aX: number, aY: number) {
    this.commandList.push([enumCommandMap.Q, aCPx, aCPy, aX, aY]);
    this._ctx && this._ctx.quadraticCurveTo(aCPx, aCPy, aX, aY);
    return this;
  }
  bezierCurveTo(aCP1x: number, aCP1y: number, aCP2x: number, aCP2y: number, aX: number, aY: number) {
    this.commandList.push([enumCommandMap.C, aCP1x, aCP1y, aCP2x, aCP2y, aX, aY]);
    this._ctx && this._ctx.bezierCurveTo(aCP1x, aCP1y, aCP2x, aCP2y, aX, aY);
    return this;
  }
  arcTo(aX1: number, aY1: number, aX2: number, aY2: number, aRadius: number) {
    this.commandList.push([enumCommandMap.AT, aX1, aY1, aX2, aY2, aRadius]);
    this._ctx && this._ctx.arcTo(aX1, aY1, aX2, aY2, aRadius);
    return this;
  }
  ellipse(
    aX: number,
    aY: number,
    xRadius: number,
    yRadius: number,
    aRotation: number,
    aStartAngle: number,
    aEndAngle: number,
    aClockwise: boolean
  ) {
    this.commandList.push([enumCommandMap.E, aX, aY, xRadius, yRadius, aRotation, aStartAngle, aEndAngle, aClockwise]);
    this._ctx && this._ctx.ellipse(aX, aY, xRadius, yRadius, aRotation, aStartAngle, aEndAngle, aClockwise);
    return this;
  }
  rect(x: number, y: number, w: number, h: number) {
    this.commandList.push([enumCommandMap.R, x, y, w, h]);
    this._ctx && this._ctx.rect(x, y, w, h);
    return this;
  }
  arc(x: number, y: number, radius: number, startAngle: number, endAngle: number, counterclockwise?: boolean) {
    this.commandList.push([enumCommandMap.A, x, y, radius, startAngle, endAngle, counterclockwise]);
    this._ctx && this._ctx.arc(x, y, radius, startAngle, endAngle, counterclockwise);
    return this;
  }
  closePath() {
    this.commandList.push([enumCommandMap.Z]);
    this._ctx && this._ctx.closePath();
    return this;
  }

  addCurve(curve: ICurve<IPoint>) {
    this.curves.push(curve);
    // todo parse curve
  }
  clear() {
    this.transformCbList = null;
    this.commandList.length = 0;
    this.curves.length = 0;
  }

  beginPath() {
    this.clear();
  }

  toString(): string {
    if (!this.toStringCbList) {
      const list: ((cmd: CommandType) => string)[] = [];
      list[enumCommandMap.M] = (cmd: CommandType) => `M${cmd[1]} ${cmd[2]}`;
      list[enumCommandMap.L] = (cmd: CommandType) => `L${cmd[1]} ${cmd[2]}`;
      list[enumCommandMap.Q] = (cmd: CommandType) => `Q${cmd[1]} ${cmd[2]} ${cmd[3]} ${cmd[4]}`;
      list[enumCommandMap.C] = (cmd: CommandType) => `C${cmd[1]} ${cmd[2]} ${cmd[3]} ${cmd[4]} ${cmd[5]} ${cmd[6]}`;
      list[enumCommandMap.A] = (cmd: CommandType) => {
        const bezierPathList: number[] = [];
        addArcToBezierPath(
          bezierPathList,
          cmd[4] as number,
          cmd[5] as number,
          cmd[1] as number,
          cmd[2] as number,
          cmd[3] as number,
          cmd[3] as number
        );
        let path = '';
        for (let i = 0; i < bezierPathList.length; i += 6) {
          path += `C${bezierPathList[i]} ${bezierPathList[i + 1]} ${bezierPathList[i + 2]} ${bezierPathList[i + 3]} ${
            bezierPathList[i + 4]
          } ${bezierPathList[i + 5]}`;
        }
        return path;
      };
      // list[enumCommandMap.AT] = this.arcToTransform;
      // list[enumCommandMap.E] = this.ellipseTransform;
      list[enumCommandMap.R] = (cmd: CommandType) => `M${cmd[1]} ${cmd[2]} h${cmd[3]} v${cmd[4]} H${cmd[1]}Z`;
      // list[enumCommandMap.A] = this.arcTransform;
      list[enumCommandMap.Z] = (cmd: CommandType) => `Z`;
      this.toStringCbList = list;
    }

    const list = this.toStringCbList;
    let path = '';
    this.commandList.forEach(c => {
      path += list[c[0]](c);
    });
    return path;
  }

  fromString(str: string, x?: number, y?: number, sX?: number, sY?: number) {
    this.clear();

    // 解析path字符串
    const commandStrList = parseSvgPath(str) as CommandStrType[]; // TODO: 目前正则性能较差，后续需要加上回调函数供用户直接操作绘图命令
    this._runCommandStrList(commandStrList, x, y, sX, sY);

    // 更新bounds
    this._updateBounds();
    return this;
  }
  fromLine(line: ILine) {
    const { points, curveType, clipRangeByDimension } = line.attribute;
    if (!points) {
      return;
    }
    const cache = calcLineCache(points, curveType);
    if (clipRangeByDimension === 'x') {
      this.direction = Direction.ROW;
    } else if (clipRangeByDimension === 'y') {
      this.direction = Direction.COLUMN;
    } else if (clipRangeByDimension === 'auto') {
      this.direction = cache.direction;
    }
    this.curves = cache.curves;
  }
  fromCustomPath2D(path: ICustomPath2D, x?: number, y?: number, sX?: number, sY?: number) {
    this.clear();
    this._runCommandList(path.commandList as CommandType[], x, y, sX, sY);

    // 更新bounds
    this._updateBounds();
    return this;
  }
  transform(x: number, y: number, sx: number, sy: number) {
    const commandList = this.commandList;
    if (!this.transformCbList) {
      const list: ((cmd: CommandType, x: number, y: number, sx: number, sy: number) => void)[] = [];
      list[enumCommandMap.M] = this.moveToTransform;
      list[enumCommandMap.L] = this.lineToTransform;
      list[enumCommandMap.Q] = this.quadraticCurveToTransform;
      list[enumCommandMap.C] = this.bezierCurveToTransform;
      list[enumCommandMap.AT] = this.arcToTransform;
      list[enumCommandMap.E] = this.ellipseTransform;
      list[enumCommandMap.R] = this.rectTransform;
      list[enumCommandMap.A] = this.arcTransform;
      list[enumCommandMap.Z] = this.closePathTransform;
      this.transformCbList = list;
    }
    commandList.forEach(cmd => {
      this.transformCbList[cmd[0]](cmd, x, y, sx, sy);
    });
    this._updateBounds();
  }

  protected moveToTransform(cmd: CommandType, x: number, y: number, sx: number, sy: number) {
    cmd[1] = (cmd[1] as number) * sx + x;
    cmd[2] = (cmd[2] as number) * sy + y;
  }
  protected lineToTransform(cmd: CommandType, x: number, y: number, sx: number, sy: number) {
    cmd[1] = (cmd[1] as number) * sx + x;
    cmd[2] = (cmd[2] as number) * sy + y;
  }
  protected quadraticCurveToTransform(cmd: CommandType, x: number, y: number, sx: number, sy: number) {
    cmd[1] = (cmd[1] as number) * sx + x;
    cmd[2] = (cmd[2] as number) * sy + y;
    cmd[3] = (cmd[3] as number) * sx + x;
    cmd[4] = (cmd[4] as number) * sy + y;
  }
  protected bezierCurveToTransform(cmd: CommandType, x: number, y: number, sx: number, sy: number) {
    cmd[1] = (cmd[1] as number) * sx + x;
    cmd[2] = (cmd[2] as number) * sy + y;
    cmd[3] = (cmd[3] as number) * sx + x;
    cmd[4] = (cmd[4] as number) * sy + y;
    cmd[5] = (cmd[5] as number) * sx + x;
    cmd[6] = (cmd[6] as number) * sy + y;
  }
  arcToTransform(cmd: CommandType, x: number, y: number, sx: number, sy: number) {
    cmd[1] = (cmd[1] as number) * sx + x;
    cmd[2] = (cmd[2] as number) * sy + y;
    cmd[3] = (cmd[3] as number) * sx + x;
    cmd[4] = (cmd[4] as number) * sy + y;
    cmd[5] = ((cmd[5] as number) * (sx + sy)) / 2;
  }
  ellipseTransform(cmd: CommandType, x: number, y: number, sx: number, sy: number) {
    cmd[1] = (cmd[1] as number) * sx + x;
    cmd[2] = (cmd[2] as number) * sy + y;
    cmd[3] = (cmd[3] as number) * sx;
    cmd[4] = (cmd[4] as number) * sy;
  }
  rectTransform(cmd: CommandType, x: number, y: number, sx: number, sy: number) {
    cmd[1] = (cmd[1] as number) * sx + x;
    cmd[2] = (cmd[2] as number) * sy + y;
    cmd[3] = (cmd[3] as number) * sx;
    cmd[4] = (cmd[4] as number) * sy;
  }
  arcTransform(cmd: CommandType, x: number, y: number, sx: number, sy: number) {
    cmd[1] = (cmd[1] as number) * sx + x;
    cmd[2] = (cmd[2] as number) * sy + y;
    cmd[3] = ((cmd[3] as number) * (sx + sy)) / 2;
  }
  closePathTransform() {
    return;
  }
  protected _runCommandStrList(
    commandStrList: CommandStrType[],
    l: number = 0,
    t: number = 0,
    sX: number = 1,
    sY: number = 1
  ) {
    let current; // current instruction
    let previous = null;
    let x = 0; // current x
    let y = 0; // current y
    // let sX = 0;
    // let sY = 0;
    let controlX = 0; // current control point x
    let controlY = 0; // current control point y
    let tempX;
    let tempY;
    let tempControlX;
    let tempControlY;

    // if (isNil(l)) l = 0;
    // if (isNil(t)) t = 0;
    // if (isNil(sX)) sX = 1;
    // if (isNil(sY)) sY = sX;

    for (let i = 0, len = commandStrList.length; i < len; ++i) {
      current = commandStrList[i];
      if (sX !== 1 || sY !== 1) {
        current = scale(current, sX, sY);
      }

      switch (
        current[0] // first letter
      ) {
        case 'l': // lineto, relative
          x += current[1] as number;
          y += current[2] as number;
          this.lineTo(x + l, y + t);
          break;

        case 'L': // lineto, absolute
          x = current[1] as number;
          y = current[2] as number;
          this.lineTo(x + l, y + t);
          break;

        case 'h': // horizontal lineto, relative
          x += current[1] as number;
          this.lineTo(x + l, y + t);
          break;

        case 'H': // horizontal lineto, absolute
          x = current[1] as number;
          this.lineTo(x + l, y + t);
          break;

        case 'v': // vertical lineto, relative
          y += current[1] as number;
          this.lineTo(x + l, y + t);
          break;

        case 'V': // verical lineto, absolute
          y = current[1] as number;
          this.lineTo(x + l, y + t);
          break;

        case 'm': // moveTo, relative
          x += current[1] as number;
          y += current[2] as number;
          this.moveTo(x + l, y + t);
          break;

        case 'M': // moveTo, absolute
          x = current[1] as number;
          y = current[2] as number;
          this.moveTo(x + l, y + t);
          break;

        case 'c': // bezierCurveTo, relative
          tempX = x + (current[5] as number);
          tempY = y + (current[6] as number);
          controlX = x + (current[3] as number);
          controlY = y + (current[4] as number);
          this.bezierCurveTo(
            x + (current[1] as number) + l, // x1
            y + (current[2] as number) + t, // y1
            controlX + l, // x2
            controlY + t, // y2
            tempX + l,
            tempY + t
          );
          x = tempX;
          y = tempY;
          break;

        case 'C': // bezierCurveTo, absolute
          x = current[5] as number;
          y = current[6] as number;
          controlX = current[3] as number;
          controlY = current[4] as number;
          this.bezierCurveTo(
            (current[1] as number) + l,
            (current[2] as number) + t,
            controlX + l,
            controlY + t,
            x + l,
            y + t
          );
          break;

        case 's': // shorthand cubic bezierCurveTo, relative
          // transform to absolute x,y
          tempX = x + (current[3] as number);
          tempY = y + (current[4] as number);
          // calculate reflection of previous control points
          controlX = 2 * x - controlX;
          controlY = 2 * y - controlY;
          this.bezierCurveTo(
            controlX + l,
            controlY + t,
            x + (current[1] as number) + l,
            y + (current[2] as number) + t,
            tempX + l,
            tempY + t
          );

          // set control point to 2nd one of this command
          // the first control point is assumed to be the reflection of
          // the second control point on the previous command relative
          // to the current point.
          controlX = x + (current[1] as number);
          controlY = y + (current[2] as number);

          x = tempX;
          y = tempY;
          break;

        case 'S': // shorthand cubic bezierCurveTo, absolute
          tempX = current[3] as number;
          tempY = current[4] as number;
          // calculate reflection of previous control points
          controlX = 2 * x - controlX;
          controlY = 2 * y - controlY;
          this.bezierCurveTo(
            controlX + l,
            controlY + t,
            (current[1] as number) + l,
            (current[2] as number) + t,
            tempX + l,
            tempY + t
          );
          x = tempX;
          y = tempY;
          // set control point to 2nd one of this command
          // the first control point is assumed to be the reflection of
          // the second control point on the previous command relative
          // to the current point.
          controlX = current[1] as number;
          controlY = current[2] as number;

          break;

        case 'q': // quadraticCurveTo, relative
          // transform to absolute x,y
          tempX = x + (current[3] as number);
          tempY = y + (current[4] as number);

          controlX = x + (current[1] as number);
          controlY = y + (current[2] as number);

          this.quadraticCurveTo(controlX + l, controlY + t, tempX + l, tempY + t);
          x = tempX;
          y = tempY;
          break;

        case 'Q': // quadraticCurveTo, absolute
          tempX = current[3] as number;
          tempY = current[4] as number;

          this.quadraticCurveTo((current[1] as number) + l, (current[2] as number) + t, tempX + l, tempY + t);
          x = tempX;
          y = tempY;
          controlX = current[1] as number;
          controlY = current[2] as number;
          break;

        case 't': // shorthand quadraticCurveTo, relative
          // transform to absolute x,y
          tempX = x + (current[1] as number);
          tempY = y + (current[2] as number);

          if ((previous![0] as string).match(/[QqTt]/) === null) {
            // If there is no previous command or if the previous command was not a Q, q, T or t,
            // assume the control point is coincident with the current point
            controlX = x;
            controlY = y;
          } else if (previous![0] === 't') {
            // calculate reflection of previous control points for t
            controlX = 2 * x - (tempControlX as number);
            controlY = 2 * y - (tempControlY as number);
          } else if (previous![0] === 'q') {
            // calculate reflection of previous control points for q
            controlX = 2 * x - controlX;
            controlY = 2 * y - controlY;
          }

          tempControlX = controlX;
          tempControlY = controlY;

          this.quadraticCurveTo(controlX + l, controlY + t, tempX + l, tempY + t);
          x = tempX;
          y = tempY;
          controlX = x + (current[1] as number);
          controlY = y + (current[2] as number);
          break;

        case 'T':
          tempX = current[1] as number;
          tempY = current[2] as number;

          // calculate reflection of previous control points
          controlX = 2 * x - controlX;
          controlY = 2 * y - controlY;
          this.quadraticCurveTo(controlX + l, controlY + t, tempX + l, tempY + t);
          x = tempX;
          y = tempY;
          break;

        case 'a':
          drawArc(this, x + l, y + t, [
            current[1] as number,
            current[2] as number,
            current[3] as number,
            current[4] as number,
            current[5] as number,
            (current[6] as number) + x + l,
            (current[7] as number) + y + t
          ]);
          x += current[6] as number;
          y += current[7] as number;
          break;

        case 'A':
          drawArc(this, x + l, y + t, [
            current[1] as number,
            current[2] as number,
            current[3] as number,
            current[4] as number,
            current[5] as number,
            (current[6] as number) + l,
            (current[7] as number) + t
          ]);
          x = current[6] as number;
          y = current[7] as number;
          break;

        case 'z':
        case 'Z':
          this.closePath();
          break;
      }
      previous = current;
    }
  }

  protected _runCommandList(commandList: CommandType[], l: number = 0, t: number = 0, sX: number = 1, sY: number = 1) {
    if (l === 0 && t === 0 && sX === 1 && sY === 1) {
      this.commandList = commandList.map(entry => entry.slice() as CommandType);
      return;
    }

    for (let i = 0, len = commandList.length; i < len; ++i) {
      const current = commandList[i].slice() as CommandType;

      switch (
        current[0] // first letter
      ) {
        case enumCommandMap.L:
          this.lineToTransform(current, l, t, sX, sY);
          break;

        case enumCommandMap.M:
          this.moveToTransform(current, l, t, sX, sY);
          break;

        case enumCommandMap.C:
          this.bezierCurveToTransform(current, l, t, sX, sY);
          break;

        case enumCommandMap.Q:
          this.quadraticCurveToTransform(current, l, t, sX, sY);
          break;

        case enumCommandMap.A:
          this.arcToTransform(current, l, t, sX, sY);
          break;
        case enumCommandMap.E:
          this.ellipseTransform(current, l, t, sX, sY);
          break;
        case enumCommandMap.R:
          this.rectTransform(current, l, t, sX, sY);
          break;
        case enumCommandMap.AT:
          this.arcToTransform(current, l, t, sX, sY);
          break;
        case enumCommandMap.Z:
          this.closePath();
          break;
      }
    }
  }
  private _updateBounds() {
    this.bounds.clear();
    renderCommandList(this.commandList, this._boundsContext as unknown as ICustomPath2D);
  }

  release(): void {
    this.commandList = [];
    this._boundsContext = null;
    this._ctx = null;
  }

  getLength(): number {
    if (this.direction === Direction.COLUMN) {
      if (!this.curves.length) {
        return 0;
      }
      const sc = this.curves[0];
      const ec = this.curves[this.curves.length - 1];
      return abs(sc.p0.y - ec.p1.y);
    } else if (this.direction === Direction.ROW) {
      if (!this.curves.length) {
        return 0;
      }
      const sc = this.curves[0];
      const ec = this.curves[this.curves.length - 1];
      return abs(sc.p0.x - ec.p1.x);
    }
    return this.curves.reduce((l, c) => l + c.getLength(), 0);
  }

  getAttrAt(distance: number): { pos: IPointLike; angle: number } {
    if (!this.curves) {
      return { pos: { x: 0, y: 0 }, angle: 0 };
    }
    let _dis = 0;
    let curve: ICurve<IPoint>;
    for (let i = 0; i < this.curves.length; i++) {
      curve = this.curves[i];
      const cl = curve.getLength(this.direction);
      if (_dis + cl >= distance) {
        break;
      } else {
        _dis += cl;
      }
    }
    const t = (distance - _dis) / curve.getLength(this.direction);
    const pos = curve.getPointAt(t);
    const angle = curve.getAngleAt(t);
    return { pos, angle };
  }
}

const temp = ['l', 0, 0, 0, 0, 0, 0, 0];

function scale(current: CommandStrType, sX: number, sY: number) {
  const c = (temp[0] = current[0]);
  if (c === 'a' || c === 'A') {
    temp[1] = sX * (current[1] as number);
    temp[2] = sY * (current[2] as number);
    temp[3] = current[3] as number;
    temp[4] = current[4] as number;
    temp[5] = current[5] as number;
    temp[6] = sX * (current[6] as number);
    temp[7] = sY * (current[7] as number);
  } else if (c === 'h' || c === 'H') {
    temp[1] = sX * (current[1] as number);
  } else if (c === 'v' || c === 'V') {
    temp[1] = sY * (current[1] as number);
  } else {
    for (let i = 1, n = current.length; i < n; ++i) {
      temp[i] = (i % 2 === 1 ? sX : sY) * (current[i] as number);
    }
  }
  return temp;
}
