import { isArray, isString } from '@visactor/vutils';
import { graphicCreator } from '../graphic';

export function jsx(type: string | any, config: Record<string, any>, ...children: any) {
  const { key, attribute, ...props } = config || {};

  let c = type;
  if (isString(type)) {
    c = graphicCreator[type];
  }

  let childrenList = [];
  if (children.length) {
    childrenList = children.length === 1 ? children[0] : children;
  }

  const g = new c(attribute);
  if (childrenList && isArray(childrenList)) {
    childrenList.forEach((c: any) => {
      g.add(c);
    });
  } else {
    g.add(childrenList);
  }
  return g;
}

export class Fragment {
  children: any[] = [];
  add(g: any) {
    this.children.push(g);
  }
}
