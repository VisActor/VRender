import { Logger } from '@visactor/vutils';
import type { IFullThemeSpec, IGraphic, IGroup, ITheme, IThemeSpec } from '../interface';
import {
  DefaultArcAttribute,
  DefaultAreaAttribute,
  DefaultCircleAttribute,
  DefaultGlyphAttribute,
  DefaultGroupAttribute,
  DefaultImageAttribute,
  DefaultLineAttribute,
  DefaultPathAttribute,
  DefaultPolygonAttribute,
  DefaultRectAttribute,
  DefaultSymbolAttribute,
  DefaultTextAttribute,
  DefaultRichTextAttribute,
  DefaultRichTextIconAttribute
} from './config';

const defaultThemeObj = {
  arc: DefaultArcAttribute,
  area: DefaultAreaAttribute,
  circle: DefaultCircleAttribute,
  line: DefaultLineAttribute,
  path: DefaultPathAttribute,
  symbol: DefaultSymbolAttribute,
  text: DefaultTextAttribute,
  rect: DefaultRectAttribute,
  polygon: DefaultPolygonAttribute,
  richtext: DefaultRichTextAttribute,
  richtextIcon: DefaultRichTextIconAttribute,
  image: DefaultImageAttribute,
  group: DefaultGroupAttribute,
  glyph: DefaultGlyphAttribute
};

const themeKeys = Object.keys(defaultThemeObj);

export function newThemeObj(): IFullThemeSpec {
  return {
    arc: Object.assign({}, defaultThemeObj.arc),
    area: Object.assign({}, defaultThemeObj.area),
    circle: Object.assign({}, defaultThemeObj.circle),
    line: Object.assign({}, defaultThemeObj.line),
    path: Object.assign({}, defaultThemeObj.path),
    symbol: Object.assign({}, defaultThemeObj.symbol),
    text: Object.assign({}, defaultThemeObj.text),
    rect: Object.assign({}, defaultThemeObj.rect),
    polygon: Object.assign({}, defaultThemeObj.polygon),
    richtext: Object.assign({}, defaultThemeObj.richtext),
    richtextIcon: Object.assign({}, defaultThemeObj.richtextIcon),
    image: Object.assign({}, defaultThemeObj.image),
    group: Object.assign({}, defaultThemeObj.group),
    glyph: Object.assign({}, defaultThemeObj.glyph)
  };
}

// /**
//  * 将t合并到out中
//  * @param out
//  * @param t
//  * @param rewrite 是否重写out的属性
//  * @returns
//  */
// function combineTheme(out: IThemeSpec, t: IThemeSpec, rewrite: boolean = true) {
//   if (!t) {
//     return;
//   }
//   if (rewrite) {
//     Object.keys(t).forEach(k => {
//       if (out[k]) {
//         Object.assign(out[k], t[k]);
//       } else {
//         out[k] = t[k];
//       }
//     });
//   } else {
//     Object.keys(t).forEach(k => {
//       if (out[k]) {
//         // Object.assign(out[k], t[k]);
//         const outItem = out[k];
//         const tItem = t[k];
//         Object.keys(t[k]).forEach(kItem => {
//           if (outItem[kItem] === undefined) {
//             outItem[kItem] = tItem[kItem];
//           }
//         });
//       } else {
//         out[k] = t[k];
//       }
//     });
//   }
// }

function combine(out: Record<string, any>, t: Record<string, any>) {
  Object.keys(t).forEach(k => {
    out[k] = t[k];
  });
}

const globalThemeObj = newThemeObj();

// // 性能优化，没有修改的theme都使用这个
// const defaultCommontTheme = newThemeObj();

// function combineTheme(out: IThemeSpec, userTheme: IThemeSpec, defaultTheme: IFullThemeSpec) {

// }

// 优先级：
// 1. userTheme
// 2. commonTheme
// 3. parentTheme
// 4. defaultTheme

// 使用原型链来保存主题，避免大量的merge操作
export class Theme implements ITheme {
  // 当前的总theme，最终合并后的theme
  combinedTheme: IFullThemeSpec;
  // 记录累计应用的所有用户设置上的theme
  userTheme?: IThemeSpec;

  protected _defaultTheme: IFullThemeSpec;

  dirty: boolean;

  constructor() {
    this.initTheme();
    this.dirty = false;
  }

  initTheme() {
    this._defaultTheme = {} as any;
    themeKeys.forEach(key => {
      (this._defaultTheme as any)[key] = Object.create((globalThemeObj as any)[key]);
    });
    this.combinedTheme = this._defaultTheme;
  }

  /**
   * 获取group上应该有的主题配置
   * @param group
   * @returns
   */
  getTheme(group?: IGroup) {
    if (!group) {
      return this.combinedTheme;
    }
    if (!this.dirty) {
      return this.combinedTheme;
    }
    let parentTheme = {};
    const parentGroup = this.getParentWithTheme(group);
    if (parentGroup) {
      parentTheme = parentGroup.theme;
    }
    this.applyTheme(group, parentTheme);
    return this.combinedTheme;
  }

  // 获取具有主题的parent
  getParentWithTheme(group: IGroup) {
    while (group.parent) {
      group = group.parent;
      if (group.theme) {
        return group;
      }
    }
    return null;
  }

  // 应用主题，从根节点一直触发到当前节点（如果上层节点需要的话）
  applyTheme(group: IGroup, pt: IThemeSpec, force: boolean = false): IThemeSpec {
    if (this.dirty) {
      const parentGroup = this.getParentWithTheme(group);
      if (parentGroup) {
        const parentTheme = parentGroup.theme;
        if (parentTheme.dirty || force) {
          // 强制apply所有的上层
          parentTheme.applyTheme(parentGroup, pt, true);
        }
      }
      // 如果当前节点没有userTheme的话，直接复用上层的combinedTheme
      // 或者直接用默认的theme
      if (!this.userTheme) {
        if (parentGroup) {
          this.combinedTheme = parentGroup.theme.combinedTheme;
        } else {
          this.combinedTheme = this._defaultTheme;
          Logger.getInstance().warn('未知错误，走到不应该走的区域里');
        }
        this.dirty = false;
      } else {
        this.doCombine(parentGroup && parentGroup.theme.combinedTheme);
      }
    }

    return this.combinedTheme;
  }

  // 合并userTheme到combinedTheme
  protected doCombine(parentCombinedTheme?: IThemeSpec) {
    const userTheme = this.userTheme;
    const combinedTheme = this.combinedTheme;

    // 1. userTheme
    // 2. combinedTheme
    // 3. parentCombinedTheme
    // 4. defaultTheme
    themeKeys.forEach(k => {
      // init defaultTheme
      const obj = Object.create((globalThemeObj as any)[k]);
      // merge parentCombinedTheme
      if (parentCombinedTheme && (parentCombinedTheme as any)[k]) {
        combine(obj, (parentCombinedTheme as any)[k]);
      }
      // merge combinedTheme
      if ((combinedTheme as any)[k]) {
        combine(obj, (combinedTheme as any)[k]);
      }
      // merge userTheme
      if ((userTheme as any)[k]) {
        combine(obj, (userTheme as any)[k]);
      }
      (this.combinedTheme as any)[k] = obj;
    });
    if (userTheme.common) {
      themeKeys.forEach(k => {
        combine((this.combinedTheme as any)[k], userTheme.common);
      });
    }
    this.dirty = false;
  }

  setTheme(t: IThemeSpec, g: IGroup) {
    // 设置自己的nextTheme
    let userTheme = this.userTheme;
    if (userTheme) {
      Object.keys(t).forEach(k => {
        if ((userTheme as any)[k]) {
          Object.assign((userTheme as any)[k], (t as any)[k]);
        } else {
          // todo，这里调用次数不多，应该问题不大
          (userTheme as any)[k] = Object.assign({}, (t as any)[k]);
        }
      });
    } else {
      userTheme = t;
    }
    this.userTheme = userTheme;
    // 设置自己和子节点的theme都为dirty
    this.dirty = true;
    this.dirtyChildren(g);
  }

  resetTheme(t: IThemeSpec, g: IGroup) {
    this.userTheme = t;
    // 设置自己和子节点的theme都为dirty
    this.dirty = true;
    this.dirtyChildren(g);
  }

  dirtyChildren(g: IGroup) {
    g.forEachChildren(item => {
      if ((item as IGroup).isContainer) {
        if ((item as IGroup).theme) {
          (item as IGroup).theme.dirty = true;
        }
        this.dirtyChildren(item as IGroup);
      }
    });
  }
}

export const globalTheme = new Theme();

export function getTheme(graphic: IGraphic, theme?: IFullThemeSpec): IFullThemeSpec {
  if (graphic.glyphHost) {
    return getTheme(graphic.glyphHost);
  }
  if (theme) {
    if (graphic.isContainer) {
      // 暂时不支持Group
      return theme;
    }
    return theme;
  }

  return (
    getThemeFromGroup(graphic) ||
    (graphic.attachedThemeGraphic && getTheme(graphic.attachedThemeGraphic as IGraphic)) ||
    globalTheme.getTheme()
  );
}

export function getThemeFromGroup(graphic: IGraphic): IFullThemeSpec | null {
  let g: IGroup;
  if (graphic.isContainer) {
    // 找到存在theme的group
    g = graphic as IGroup;
  } else {
    g = graphic.parent;
  }

  if (g) {
    while (g) {
      if (g.theme) {
        break;
      }
      g = g.parent;
    }
    if (!g) {
      return globalTheme.getTheme();
    }
    if (!g.theme) {
      g.createTheme();
    }
    return g.theme.getTheme(g as IGroup);
  }
  return null;
}
