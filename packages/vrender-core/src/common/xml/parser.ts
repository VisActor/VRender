// 参考fast-xml-parser
// https://github.com/NaturalIntelligence/fast-xml-parser
/**
 * MIT License

Copyright (c) 2017 Amit Kumar Gupta

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

import { OrderedObjParser } from './OrderedObjParser';
import { prettify } from './node2json';
import type { X2jOptions } from './type';

export class XMLParser {
  static defaultOptions: Partial<X2jOptions> = {};
  options: Partial<X2jOptions>;

  constructor(options?: Partial<X2jOptions>) {
    this.options = Object.assign({}, XMLParser.defaultOptions, options);
  }

  valid(xml: string) {
    return xml.startsWith('<');
  }

  parse(xmlData: string): any {
    if (!this.valid) {
      return false;
    }
    const orderedObjParser = new OrderedObjParser(this.options);
    const orderedResult = orderedObjParser.parseXml(xmlData);
    return prettify(orderedResult, this.options);
  }
}

export function isSvg(str: string) {
  return str.startsWith('<svg') || str.startsWith('<?xml');
}

export function isXML(str: string) {
  return str.startsWith('<');
}
