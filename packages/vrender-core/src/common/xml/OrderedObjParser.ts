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
import type { X2jOptions } from './type';
import { getAllMatches } from './utils';

class XmlNode {
  declare tagname: string;
  declare child: any[];

  constructor(tagname: string) {
    this.tagname = tagname;
    this.child = []; //nested tags, text, cdata, comments in order
    this[':@'] = {}; //attributes map
  }
  add(key: string, val: string) {
    // this.child.push( {name : key, val: val, isCdata: isCdata });
    if (key === '__proto__') {
      key = '#__proto__';
    }
    this.child.push({ [key]: val });
  }
  addChild(node: XmlNode) {
    if (node.tagname === '__proto__') {
      node.tagname = '#__proto__';
    }
    if (node[':@'] && Object.keys(node[':@']).length > 0) {
      this.child.push({ [node.tagname]: node.child, [':@']: node[':@'] });
    } else {
      this.child.push({ [node.tagname]: node.child });
    }
  }
}

function findClosingIndex(xmlData: string, str: string, i: number, errMsg: string) {
  const closingIndex = xmlData.indexOf(str, i);
  if (closingIndex === -1) {
    throw new Error(errMsg);
  } else {
    return closingIndex + str.length - 1;
  }
}

/**
 * Returns the tag Expression and where it is ending handling single-double quotes situation
 * @param {string} xmlData
 * @param {number} i starting index
 * @returns
 */
function tagExpWithClosingIndex(xmlData: string, i: number, closingChar = '>') {
  let attrBoundary;
  let tagExp = '';
  for (let index = i; index < xmlData.length; index++) {
    let ch = xmlData[index];
    if (attrBoundary) {
      if (ch === attrBoundary) {
        attrBoundary = '';
      } //reset
    } else if (ch === '"' || ch === "'") {
      attrBoundary = ch;
    } else if (ch === closingChar[0]) {
      if (closingChar[1]) {
        if (xmlData[index + 1] === closingChar[1]) {
          return {
            data: tagExp,
            index: index
          };
        }
      } else {
        return {
          data: tagExp,
          index: index
        };
      }
    } else if (ch === '\t') {
      ch = ' ';
    }
    tagExp += ch;
  }
}

function readTagExp(xmlData: string, i: number, removeNSPrefix: boolean, closingChar = '>') {
  const result = tagExpWithClosingIndex(xmlData, i + 1, closingChar);
  if (!result) {
    return;
  }
  let tagExp = result.data;
  const closeIndex = result.index;
  const separatorIndex = tagExp.search(/\s/);
  let tagName = tagExp;
  let attrExpPresent = true;
  if (separatorIndex !== -1) {
    //separate tag name and attributes expression
    tagName = tagExp.substr(0, separatorIndex).replace(/\s\s*$/, '');
    tagExp = tagExp.substr(separatorIndex + 1);
  }

  const rawTagName = tagName;
  if (removeNSPrefix) {
    const colonIndex = tagName.indexOf(':');
    if (colonIndex !== -1) {
      tagName = tagName.substr(colonIndex + 1);
      attrExpPresent = tagName !== result.data.substr(colonIndex + 1);
    }
  }

  return {
    tagName: tagName,
    tagExp: tagExp,
    closeIndex: closeIndex,
    attrExpPresent: attrExpPresent,
    rawTagName: rawTagName
  };
}

const attrsRegx = new RegExp('([^\\s=]+)\\s*(=\\s*([\'"])([\\s\\S]*?)\\3)?', 'gm');

export class OrderedObjParser {
  declare options: Partial<X2jOptions>;
  declare currentNode: XmlNode | null;
  declare tagsNodeStack: XmlNode[];
  declare docTypeEntities: Record<string, any>;

  constructor(options: Partial<X2jOptions>) {
    this.currentNode = null;
    this.options = options;
    this.tagsNodeStack = [];
    this.docTypeEntities = {};
  }

  protected addChild(currentNode: XmlNode, childNode: XmlNode, jPath: string) {
    const result = childNode.tagname;
    if (typeof result === 'string') {
      childNode.tagname = result;
      currentNode.addChild(childNode);
    } else {
      currentNode.addChild(childNode);
    }
  }

  protected buildAttributesMap(attrStr: string, jPath: string, tagName: string) {
    const attrs = {};
    if (!attrStr) {
      return;
    }
    const matches = getAllMatches(attrStr, attrsRegx);
    const len = matches.length; //don't make it inline
    for (let i = 0; i < len; i++) {
      const attrName = matches[i][1];
      const oldVal = matches[i][4];
      const aName = attrName;
      if (attrName) {
        if (oldVal !== undefined) {
          attrs[aName] = isNaN(oldVal) ? oldVal : Number(oldVal);
        } else {
          attrs[aName] = true;
        }
      }
    }
    return attrs;
  }

  parseXml(xmlData: string) {
    // 判断xml的合法性
    xmlData = xmlData.replace(/\r\n?/g, '\n');
    const xmlObj = new XmlNode('!xml');
    let currentNode = xmlObj;
    let textData = '';
    let jPath = '';
    for (let i = 0; i < xmlData.length; i++) {
      const ch = xmlData[i];
      if (ch === '<') {
        if (xmlData[i + 1] === '/') {
          const closeIndex = findClosingIndex(xmlData, '>', i, 'Closing Tag is not closed.');
          const propIndex = jPath.lastIndexOf('.');
          jPath = jPath.substring(0, propIndex);
          currentNode = this.tagsNodeStack.pop();
          textData = '';
          i = closeIndex;
        } else if (xmlData[i + 1] === '?') {
          const tagData = readTagExp(xmlData, i, false, '?>');
          i = tagData.closeIndex + 1;
        } else if (xmlData.substr(i + 1, 3) === '!--') {
          const endIndex = findClosingIndex(xmlData, '-->', i + 4, 'Comment is not closed.');
          i = endIndex;
        } else {
          const result = readTagExp(xmlData, i, false);
          let tagName = result.tagName;
          let tagExp = result.tagExp;
          const attrExpPresent = result.attrExpPresent;
          const closeIndex = result.closeIndex;
          if (tagName !== xmlObj.tagname) {
            jPath += jPath ? '.' + tagName : tagName;
          }
          if (tagExp.length > 0 && tagExp.lastIndexOf('/') === tagExp.length - 1) {
            if (tagName[tagName.length - 1] === '/') {
              tagName = tagName.substr(0, tagName.length - 1);
              jPath = jPath.substr(0, jPath.length - 1);
              tagExp = tagName;
            } else {
              tagExp = tagExp.substr(0, tagExp.length - 1);
            }
            const childNode = new XmlNode(tagName);
            if (tagName !== tagExp && attrExpPresent) {
              childNode[':@'] = this.buildAttributesMap(tagExp, jPath, tagName);
            }
            this.addChild(currentNode, childNode, jPath);
            jPath = jPath.substr(0, jPath.lastIndexOf('.'));
          } else {
            const childNode = new XmlNode(tagName);
            this.tagsNodeStack.push(currentNode);
            if (tagName !== tagExp && attrExpPresent) {
              childNode[':@'] = this.buildAttributesMap(tagExp, jPath, tagName);
            }
            this.addChild(currentNode, childNode, jPath);
            currentNode = childNode;
          }
          textData = '';
          i = closeIndex;
        }
      } else {
        textData += xmlData[i];
      }
    }
    return xmlObj.child;
  }
}
