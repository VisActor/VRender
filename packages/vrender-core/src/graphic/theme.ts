import { clone } from '@visactor/vutils';
import type { IGraphicAttribute, IFullThemeSpec, IGraphic, IGroup, ITheme, IThemeSpec } from '../interface';
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
  DefaultRect3dAttribute,
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
  rect3d: DefaultRect3dAttribute,
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
    rect3d: Object.assign({}, defaultThemeObj.rect3d),
    polygon: Object.assign({}, defaultThemeObj.polygon),
    richtext: Object.assign({}, defaultThemeObj.richtext),
    richtextIcon: Object.assign({}, defaultThemeObj.richtextIcon),
    image: Object.assign({}, defaultThemeObj.image),
    group: Object.assign({}, defaultThemeObj.group),
    glyph: Object.assign({}, defaultThemeObj.glyph)
  };
}

// 将t合并到out中
function combineTheme(out: IThemeSpec, t: IThemeSpec, rewrite: boolean = true) {
  if (!t) {
    return;
  }
  if (rewrite) {
    Object.keys(t).forEach(k => {
      if (out[k]) {
        Object.assign(out[k], t[k]);
      } else {
        out[k] = t[k];
      }
    });
  } else {
    Object.keys(t).forEach(k => {
      if (out[k]) {
        // Object.assign(out[k], t[k]);
        const outItem = out[k];
        const tItem = t[k];
        Object.keys(t[k]).forEach(kItem => {
          if (outItem[kItem] === undefined) {
            outItem[kItem] = tItem[kItem];
          }
        });
      } else {
        out[k] = t[k];
      }
    });
  }
}

// 全局创建60个theme，节省打点耗时时间
const staticThemePools = new Array(60).fill(0).map(() => newThemeObj());

// // 性能优化，没有修改的theme都使用这个
// const defaultCommontTheme = newThemeObj();

// function combineTheme(out: IThemeSpec, userTheme: IThemeSpec, defaultTheme: IFullThemeSpec) {

// }

// 优先级：
// 1. userTheme
// 2. commonTheme
// 3. parentTheme
// 4. defaultTheme

export class Theme implements ITheme {
  // 当前的总theme，最终合并后的theme
  combinedTheme: IFullThemeSpec;

  // 记录累计应用的所有用户设置上的theme
  userTheme?: IThemeSpec;
  // 公共属性，有些属性所有图元都生效，那就放在common位置
  commonTheme?: Partial<IGraphicAttribute>;

  // // 记录下一次设置的theme，同时也作为一个dirty位，记录是否存在没有合并的theme
  // nextTheme?: IThemeSpec;

  protected _defaultTheme: IFullThemeSpec;

  dirty: boolean;

  constructor() {
    // group数量不多，问题不大
    this._defaultTheme = staticThemePools.pop() || newThemeObj();
    this.combinedTheme = this._defaultTheme;
    this.dirty = false;
  }

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
        // 将parentTheme.userTheme设置给自己的userTheme
        if (!this.userTheme) {
          this.userTheme = clone(parentTheme.userTheme);
        } else {
          combineTheme(this.userTheme, parentTheme.userTheme, false);
        }
        combineTheme(pt, parentTheme.userTheme);
      }
      // 如果当前节点没有userTheme的话，直接复用上层
      if (!this.userTheme) {
        if (parentGroup) {
          this.combinedTheme = parentGroup.theme.combinedTheme;
        } else {
          this.combinedTheme = this._defaultTheme;
          console.warn('未知错误，走到不应该走的区域里');
        }
        this.dirty = false;
      } else {
        this.doCombine(pt);
      }
    }

    return this.combinedTheme;
  }

  // 合并userTheme到combinedTheme
  protected doCombine(parentTheme: IThemeSpec) {
    const userTheme = this.userTheme;
    const defaultTheme = this._defaultTheme;
    const combinedTheme = this.combinedTheme;
    const parentCommonTheme = parentTheme.common || {};
    const commonTheme = Object.assign(parentCommonTheme, this.commonTheme);
    // combineTheme({}, this.userTheme, this._defaultTheme);
    themeKeys.forEach(k => {
      if (userTheme[k] || commonTheme || parentTheme[k]) {
        combinedTheme[k] = Object.assign(
          {},
          defaultTheme[k],
          commonTheme ?? {},
          parentTheme[k] ?? {},
          userTheme[k] ?? {}
        );
      } else {
        combinedTheme[k] = defaultTheme[k];
      }
    });
    this.dirty = false;
  }

  resetTheme(t: IThemeSpec, g: IGroup) {
    this.userTheme = t;
    // 设置自己和子节点的theme都为dirty
    this.dirty = true;
    this.dirtyChildren(g);
  }

  setTheme(t: IThemeSpec, g: IGroup) {
    // 设置自己的nextTheme
    let userTheme = this.userTheme;
    if (userTheme) {
      Object.keys(t).forEach(k => {
        if (userTheme[k]) {
          Object.assign(userTheme[k], t[k]);
        } else {
          // todo，这里调用次数不多，应该问题不大
          userTheme[k] = Object.assign({}, t[k]);
        }
      });
    } else {
      userTheme = t;
    }
    if (t.common) {
      if (!this.commonTheme) {
        this.commonTheme = t.common;
      } else {
        Object.assign(this.commonTheme, t.common);
      }
    }
    this.userTheme = userTheme;
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

  // // 设置theme到子元素，直接设置到currentTheme中去
  // setThemeToChildrenCurrentTheme(t :IThemeSpec, g: IGroup) {
  //   g.forEachChildren((item) => {
  //     if ((item as IGroup).isContainer) {
  //       const currentTheme = (item as IGroup).theme.currentTheme;
  //       Object.keys(t).forEach(k => {
  //         Object.assign(currentTheme[k], t[k]);
  //       });
  //       this.setThemeToChildrenCurrentTheme(t, item as IGroup);
  //     }
  //   })
  // }
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

  return getThemeFromGroup(graphic) || globalTheme.getTheme();
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
