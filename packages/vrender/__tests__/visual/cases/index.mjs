/** 视觉用例清单，新增用例须显式登记。 */
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
    "id": "scroll-dirty-bounds",
    "purpose": "滚动组嵌套图元在真实悬停后正确局部重绘",
    "file": "./scroll-dirty-bounds.mjs"
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
    "id": "label-line-update",
    "purpose": "数据标签在静止和移动柱条内外切换时移除并同步恢复引线",
    "file": "./label-line-update.mjs"
  },
  {
    "id": "arc-gradient-stroke",
    "purpose": "带坐标偏移的等半径圆弧保留锥形渐变描边",
    "file": "./arc-gradient-stroke.mjs"
  },
  {
    "id": "arc-label-line-update",
    "purpose": "移动扇区标签由内向外切换时引线连接当前扇区与文字",
    "file": "./arc-label-line-update.mjs"
  },
  {
    "id": "attribute-update",
    "purpose": "属性更新同步改变几何与拾取位置",
    "file": "./attribute-update.mjs"
  },
  {
    "id": "size-legend-handler-text",
    "purpose": "尺寸图例缩放选区和交叉手柄时，标签分离、样式更新且端点标签落在初始布局内",
    "file": "./size-legend-handler-text.mjs"
  },
  {
    "id": "stage-lifecycle",
    "purpose": "销毁独立 Stage 后画布移除且主 Stage 可继续绘制",
    "file": "./stage-lifecycle.mjs"
  }
];

/** Node 和浏览器共用相同用例模块。 */
export function loadCase(item) { return import(item.file); }
