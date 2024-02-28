import { isArray, isString } from '@visactor/vutils';
import { Group, graphicCreator } from '@visactor/vrender-core';
import { REACT_TO_CANOPUS_EVENTS } from './graphicType';

function flatten(list: any, out: any[]): void {
  if (isArray(list)) {
    return list.forEach(i => flatten(i, out));
  }
  out.push(list);
}

export function jsx(type: string | any, config: Record<string, any>, ...children: any) {
  const { key, name, id, attribute, stateProxy, ...props } = config || {};

  let c = type;
  if (isString(type)) {
    c = graphicCreator[type];
  }

  const childrenList: any[] = [];
  if (children.length) {
    flatten(children.length === 1 ? children[0] : children, childrenList);
  }

  const g = c.name === 'Group' ? new c(attribute) : c(config);
  parseToGraphic(g, childrenList, props);

  if (stateProxy) {
    g.stateProxy = stateProxy;
  }

  return g;
}

function parseToGraphic(g: any, childrenList: any[], props: any) {
  let isGraphic: boolean = false;
  let out: any;
  switch (g.type) {
    case 'richtext':
      break;
    case 'rich/text':
      out = g.attribute || {};
      childrenList[0] && (out.text = childrenList[0]);
      break;
    case 'rich/image':
      break;
    default:
      isGraphic = true;
  }

  if (isGraphic) {
    childrenList.forEach((c: any) => {
      c && g.add(c);
    });

    Object.keys(props).forEach(k => {
      const en = REACT_TO_CANOPUS_EVENTS[k];
      if (en) {
        g.on(en, props[k]);
      }
    });
  } else {
    if (g.type === 'richtext') {
      g.attribute.textConfig = childrenList.map(item => item.attribute).filter(item => item);
    }
  }
}

export const Fragment = Group;
