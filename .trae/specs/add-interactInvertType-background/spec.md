# 标签相交背景模式 Spec

## Why
当前标签与 mark 相交时仅支持 none/stroked/inside 三种处理方式，无法满足关闭描边并以底层 mark 的填充色作为文字背景的视觉需求，导致相交场景下对比度与观感不可控。

## What Changes
- 在 SmartInvertAttrs.interactInvertType 中新增 'background' 选项
- 在相交场景下（label 与 mark 相交且不完全在内部），当 interactInvertType 为 'background'：
  - 将标签描边 stroke 设置为 false（禁用描边）
  - 将标签背景 background 设置为关联 mark 的填充色
- 更新 SmartInvert 相关注释文档，将“三种处理方式”修改为“四种”，并补充 background 描述
- 默认行为不变（未配置时保持现状），无破坏性变更

## Impact
- Affected specs: 标签智能反色/相交处理能力
- Affected code:
  - packages/vrender-components/src/label/type.ts（类型与注释）
  - packages/vrender-components/src/label/base.ts（_smartInvert 相交分支逻辑）

## ADDED Requirements
### Requirement: 新增 interactInvertType 'background'
系统应在标签与 mark 相交且配置 interactInvertType 为 'background' 时：
- 将标签的 stroke 设为 false，关闭描边；
- 将标签的 background 颜色设置为关联 mark 的填充色（优先取 mark.attribute.fill；若缺省则不改动 background）。
- 保持标签 fill 不做变更。

#### Scenario: Success case
- WHEN 标签与 mark 相交，且 smartInvert.interactInvertType === 'background'
- THEN label.stroke === false，且 label.background === baseMark.fill（存在时）

## MODIFIED Requirements
### Requirement: 更新交互反色类型文档
将注释由“支持三种处理方式：none/stroked/inside”更新为“四种处理方式：none/stroked/inside/background”，其中：
- background：关闭描边，并以 mark 的填充色作为文本背景参与渲染。

## REMOVED Requirements
无

