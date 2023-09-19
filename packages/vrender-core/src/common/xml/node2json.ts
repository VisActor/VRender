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

/**
 *
 * @param {array} node
 * @param {any} options
 * @returns
 */
export function prettify(node: any, options: any) {
  return compress(node);
}

/**
 *
 * @param {array} arr
 * @param {object} options
 * @param {string} jPath
 * @returns object
 */
function compress(arr: any, jPath?: any) {
  let text;
  const compressedObj = {};
  for (let i = 0; i < arr.length; i++) {
    const tagObj = arr[i];
    const property = propName(tagObj);
    let newJpath = '';
    if (jPath === undefined) {
      newJpath = property;
    } else {
      newJpath = jPath + '.' + property;
    }

    if (property === undefined) {
      continue;
    } else if (tagObj[property]) {
      const val = compress(tagObj[property], newJpath);
      const isLeaf = isLeafTag(val);

      if (tagObj[':@']) {
        assignAttributes(val, tagObj[':@'], newJpath);
      }

      if (compressedObj[property] !== undefined && compressedObj.hasOwnProperty(property)) {
        if (!Array.isArray(compressedObj[property])) {
          compressedObj[property] = [compressedObj[property]];
        }
        compressedObj[property].push(val);
      } else {
        //TODO: if a node is not an array, then check if it should be an array
        //also determine if it is a leaf node
        compressedObj[property] = val;
      }
    }
  }
  return compressedObj;
}

function propName(obj: any) {
  const keys = Object.keys(obj);
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    if (key !== ':@') {
      return key;
    }
  }
}

function assignAttributes(obj: any, attrMap: any, jpath: any) {
  if (attrMap) {
    const keys = Object.keys(attrMap);
    const len = keys.length; //don't make it inline
    for (let i = 0; i < len; i++) {
      const atrrName = keys[i];
      obj[atrrName] = attrMap[atrrName];
    }
  }
}

function isLeafTag(obj: any) {
  const propCount = Object.keys(obj).length;

  if (propCount === 0) {
    return true;
  }

  return false;
}
