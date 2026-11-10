/** 冻结的首批用例清单；新增用例须显式登记。 */
export const cases = [
  {
    "id": "primitives-text",
    "purpose": "图元和文本产生实际绘制与有效边界",
    "file": "./primitives-text.mjs"
  },
  {
    "id": "transform-clip",
    "purpose": "分组平移缩放与裁剪边界",
    "file": "./transform-clip.mjs"
  },
  {
    "id": "picking-events",
    "purpose": "真实鼠标悬停及点击命中顶层图元",
    "file": "./picking-events.mjs"
  },
  {
    "id": "tag-component",
    "purpose": "标签组件文字、背景与更新",
    "file": "./tag-component.mjs"
  },
  {
    "id": "attribute-update",
    "purpose": "属性更新同步改变几何与拾取位置",
    "file": "./attribute-update.mjs"
  },
  {
    "id": "stage-lifecycle",
    "purpose": "销毁独立 Stage 后画布移除且主 Stage 可继续绘制",
    "file": "./stage-lifecycle.mjs"
  }
];

/** Node 和浏览器共用相同用例模块。 */
export function loadCase(item) { return import(item.file); }
