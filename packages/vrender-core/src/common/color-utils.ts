// 解析字符串gradient-color
/**
 * The MIT License (MIT)

  Copyright (c) 2014 Rafael Carício

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
// Copyright (c) 2014 Rafael Caricio. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import { pi, pi2 } from '@visactor/vutils';
import type { IColor, IConicalGradient, ILinearGradient, IRadialGradient } from '../interface';

// @ts-ignore

const parse = (function () {
  const tokens = {
    linearGradient: /^(linear\-gradient)/i,
    radialGradient: /^(radial\-gradient)/i,
    conicGradient: /^(conic\-gradient)/i,
    sideOrCorner:
      /^to (left (top|bottom)|right (top|bottom)|top (left|right)|bottom (left|right)|left|right|top|bottom)/i,
    extentKeywords: /^(closest\-side|closest\-corner|farthest\-side|farthest\-corner|contain|cover)/,
    positionKeywords: /^(left|center|right|top|bottom)/i,
    pixelValue: /^(-?(([0-9]*\.[0-9]+)|([0-9]+\.?)))px/,
    percentageValue: /^(-?(([0-9]*\.[0-9]+)|([0-9]+\.?)))\%/,
    emValue: /^(-?(([0-9]*\.[0-9]+)|([0-9]+\.?)))em/,
    angleValue: /^(-?(([0-9]*\.[0-9]+)|([0-9]+\.?)))deg/,
    fromAngleValue: /^from\s*(-?(([0-9]*\.[0-9]+)|([0-9]+\.?)))deg/,
    startCall: /^\(/,
    endCall: /^\)/,
    comma: /^,/,
    hexColor: /(^\#[0-9a-fA-F]+)/,
    literalColor: /^([a-zA-Z]+)/,
    rgbColor: /^(rgb\(\d{1,3},\s*\d{1,3},\s*\d{1,3}\))/i,
    rgbaColor: /^(rgba\(\d{1,3},\s*\d{1,3},\s*\d{1,3},\s*((\d\.\d+)|\d{1,3})\))/i,
    number: /^(([0-9]*\.[0-9]+)|([0-9]+\.?))/
  };

  let input = '';

  function error(msg: any) {
    const err: any = new Error(input + ': ' + msg);
    err.source = input;
    throw err;
  }

  function getAST() {
    const ast = matchListDefinitions();

    if (input.length > 0) {
      error('Invalid input not EOF');
    }

    return ast;
  }

  function matchListDefinitions() {
    return matchListing(matchDefinition);
  }

  function matchDefinition() {
    return (
      matchGradient('linear', tokens.linearGradient, matchLinearOrientation) ||
      matchGradient('radial', tokens.radialGradient, matchListRadialOrientations) ||
      matchGradient('conic', tokens.conicGradient, matchConicalOrientation)
    );
  }

  function matchGradient(gradientType: string, pattern: RegExp, orientationMatcher: any) {
    return matchCall(pattern, function (captures: any) {
      const orientation = orientationMatcher();
      if (orientation) {
        if (!scan(tokens.comma)) {
          error('Missing comma before color stops');
        }
      }

      return {
        type: gradientType,
        orientation: orientation,
        colorStops: matchListing(matchColorStop)
      };
    });
  }

  function matchCall(pattern: RegExp, callback: any) {
    const captures = scan(pattern);

    if (captures) {
      if (!scan(tokens.startCall)) {
        error('Missing (');
      }

      const result = callback(captures);

      if (!scan(tokens.endCall)) {
        error('Missing )');
      }

      return result;
    }
  }

  function matchLinearOrientation() {
    return matchSideOrCorner() || matchAngle();
  }
  function matchConicalOrientation() {
    return matchFromAngle();
  }

  function matchSideOrCorner() {
    return match('directional', tokens.sideOrCorner, 1);
  }

  function matchAngle() {
    return match('angular', tokens.angleValue, 1);
  }
  function matchFromAngle() {
    return match('angular', tokens.fromAngleValue, 1);
  }

  function matchListRadialOrientations() {
    let radialOrientations;
    let radialOrientation = matchRadialOrientation();
    let lookaheadCache;

    if (radialOrientation) {
      radialOrientations = [];
      radialOrientations.push(radialOrientation);

      lookaheadCache = input;
      if (scan(tokens.comma)) {
        radialOrientation = matchRadialOrientation();
        if (radialOrientation) {
          radialOrientations.push(radialOrientation);
        } else {
          input = lookaheadCache;
        }
      }
    }

    return radialOrientations;
  }

  function matchRadialOrientation() {
    let radialType: any = matchCircle() || matchEllipse();

    if (radialType) {
      radialType.at = matchAtPosition();
    } else {
      const extent = matchExtentKeyword();
      if (extent) {
        radialType = extent;
        const positionAt = matchAtPosition();
        if (positionAt) {
          radialType.at = positionAt;
        }
      } else {
        const defaultPosition = matchPositioning();
        if (defaultPosition) {
          radialType = {
            type: 'default-radial',
            at: defaultPosition
          };
        }
      }
    }

    return radialType;
  }

  function matchCircle() {
    const circle: any = match('shape', /^(circle)/i, 0);

    if (circle) {
      circle.style = matchLength() || matchExtentKeyword();
    }

    return circle;
  }

  function matchEllipse() {
    const ellipse: any = match('shape', /^(ellipse)/i, 0);

    if (ellipse) {
      ellipse.style = matchDistance() || matchExtentKeyword();
    }

    return ellipse;
  }

  function matchExtentKeyword() {
    return match('extent-keyword', tokens.extentKeywords, 1);
  }

  function matchAtPosition() {
    if (match('position', /^at/, 0)) {
      const positioning = matchPositioning();

      if (!positioning) {
        error('Missing positioning value');
      }

      return positioning;
    }
  }

  function matchPositioning() {
    const location = matchCoordinates();

    if (location.x || location.y) {
      return {
        type: 'position',
        value: location
      };
    }
  }

  function matchCoordinates() {
    return {
      x: matchDistance(),
      y: matchDistance()
    };
  }

  function matchListing(matcher: any) {
    let captures = matcher();
    const result = [];

    if (captures) {
      result.push(captures);
      while (scan(tokens.comma)) {
        captures = matcher();
        if (captures) {
          result.push(captures);
        } else {
          error('One extra comma');
        }
      }
    }

    return result;
  }

  function matchColorStop() {
    const color: any = matchColor();

    if (!color) {
      error('Expected color definition');
    }

    color.length = matchDistance();
    return color;
  }

  function matchColor() {
    return matchHexColor() || matchRGBAColor() || matchRGBColor() || matchLiteralColor();
  }

  function matchLiteralColor() {
    return match('literal', tokens.literalColor, 0);
  }

  function matchHexColor() {
    return match('hex', tokens.hexColor, 1);
  }

  function matchRGBColor() {
    return match('rgb', tokens.rgbColor, 1);
  }

  function matchRGBAColor() {
    return match('rgba', tokens.rgbaColor, 1);
  }

  function matchNumber() {
    return scan(tokens.number)[1];
  }

  function matchDistance() {
    return match('%', tokens.percentageValue, 1) || matchPositionKeyword() || matchLength();
  }

  function matchPositionKeyword() {
    return match('position-keyword', tokens.positionKeywords, 1);
  }

  function matchLength() {
    return match('px', tokens.pixelValue, 1) || match('em', tokens.emValue, 1);
  }

  function match(type: string, pattern: RegExp, captureIndex: number) {
    const captures = scan(pattern);
    if (captures) {
      return {
        type: type,
        value: captures[captureIndex]
      };
    }
  }

  function scan(regexp: RegExp) {
    const blankCaptures = /^[\n\r\t\s]+/.exec(input);
    if (blankCaptures) {
      consume(blankCaptures[0].length);
    }

    const captures = regexp.exec(input);
    if (captures) {
      consume(captures[0].length);
    }

    return captures;
  }

  function consume(size: number) {
    input = input.substr(size);
  }

  return function (code: string) {
    input = code.toString();
    return getAST();
  };
})();

export class GradientParser {
  static IsGradient(c: IColor) {
    return !(typeof c === 'string' && !c.includes('gradient'));
  }

  static IsGradientStr(c: IColor) {
    return typeof c === 'string' && c.includes('gradient');
  }

  static Parse(c: IColor): IColor {
    if (GradientParser.IsGradientStr(c)) {
      try {
        const data = parse(c as string);
        const datum = data[0];
        if (datum) {
          if (datum.type === 'linear') {
            return GradientParser.ParseLinear(datum);
          } else if (datum.type === 'radial') {
            return GradientParser.ParseRadial(datum);
          } else if (datum.type === 'conic') {
            return GradientParser.ParseConic(datum);
          }
        }
      } catch (err) {
        return c;
      }
    }
    return c;
  }
  private static ParseConic(datum: any): IConicalGradient {
    const { orientation, colorStops = [] } = datum;
    const halfPi = pi / 2;
    const sa = (parseFloat(orientation.value) / 180) * pi - halfPi;
    return {
      gradient: 'conical',
      x: 0.5,
      y: 0.5,
      startAngle: sa,
      endAngle: sa + pi2,
      stops: colorStops.map((item: any) => {
        return {
          color: item.value,
          offset: parseFloat(item.length.value) / 100
        };
      })
    };
  }
  private static ParseRadial(datum: any): IRadialGradient {
    const { colorStops = [] } = datum;
    return {
      gradient: 'radial',
      x0: 0.5,
      y0: 0.5,
      x1: 0.5,
      y1: 0.5,
      r0: 0,
      r1: 1,
      stops: colorStops.map((item: any) => {
        return {
          color: item.value,
          offset: parseFloat(item.length.value) / 100
        };
      })
    };
  }
  private static ParseLinear(datum: any): ILinearGradient {
    const { orientation, colorStops = [] } = datum;
    const halfPi = pi / 2;
    let angle = orientation.type === 'angular' ? (parseFloat(orientation.value) / 180) * pi : 0;
    while (angle < 0) {
      angle += pi2;
    }
    while (angle >= pi2) {
      angle -= pi2;
    }
    let x0 = 0;
    let y0 = 0;
    let x1 = 0;
    let y1 = 0;
    if (angle < halfPi) {
      x0 = 0;
      y0 = 1;
      x1 = Math.sin(angle);
      y1 = y0 - Math.cos(angle);
    } else if (angle < pi) {
      x0 = 0;
      y0 = 0;
      x1 = Math.cos(angle - halfPi);
      y1 = Math.sin(angle - halfPi);
    } else if (angle < pi + halfPi) {
      x0 = 1;
      y0 = 0;
      x1 = x0 - Math.sin(angle - pi);
      y1 = Math.cos(angle - pi);
    } else {
      x0 = 1;
      y0 - 1;
      x1 = x0 - Math.cos(angle - halfPi - pi);
      y1 = y1 - Math.sin(angle - halfPi - pi);
    }
    return {
      gradient: 'linear',
      x0,
      y0,
      x1,
      y1,
      stops: colorStops.map((item: any) => {
        return {
          color: item.value,
          offset: parseFloat(item.length.value) / 100
        };
      })
    };
  }
}
