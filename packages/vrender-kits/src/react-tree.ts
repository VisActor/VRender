import { isArray } from '@visactor/vutils';
import { REACT_TO_CANOPUS_EVENTS } from './jsx';

// temp devode for react jsx customLayout
export function decodeReactDom(dom: any) {
  if (!dom || !dom.$$typeof) {
    // not react
    return dom;
  }
  const type = dom.type;
  const { attribute, children, stateProxy, id, name } = dom.props;
  const g = type({ attribute });
  const out = parseToGraphic(g, dom.props, children);
  if (out) {
    return out;
  }
  if (stateProxy) {
    g.stateProxy = stateProxy;
  }

  g.id = id;
  g.name = name;
  if (isArray(children)) {
    children.forEach((item: any) => {
      const c = decodeReactDom(item);
      c && c.type && g.add(c);
    });
  } else if (children) {
    g.add(decodeReactDom(children));
  }
  return g;
}

function parseToGraphic(g: any, props: any, childrenList: any): any {
  let isGraphic: boolean = false;
  let out;
  switch (g.type) {
    case 'richtext':
      break;
    case 'rich/text':
      out = g.attribute || {};
      childrenList && (out.text = childrenList);
      g.attribute = out;
      break;
    case 'rich/image':
      out = g.attribute || {};
      break;
    default:
      isGraphic = true;
  }

  if (isGraphic) {
    Object.keys(props).forEach(k => {
      const en = REACT_TO_CANOPUS_EVENTS[k];
      if (en) {
        g.on(en, props[k]);
      }
    });
  } else if (g.type === 'richtext') {
    g.attribute.textConfig = childrenList
      .map((item: any) => {
        return decodeReactDom(item);
      })
      .filter((item: any) => item);
  }
  return out;
}
