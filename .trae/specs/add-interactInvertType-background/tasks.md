# Tasks
- [x] 更新类型定义与注释：为 SmartInvertAttrs.interactInvertType 添加 'background'，并改注释为“四种处理方式”
- [x] 修改 _smartInvert 相交分支：实现 'background' 行为（stroke=false；background=baseMark.fill；保持 fill 不变；跳过描边缺省早退）
- [x] 添加验证用例：构造 label 与 mark 相交示例，确认背景色与填充色一致且描边关闭（覆盖 IText 与 IRichText）
- [x] 自检与清理：校验边界（mark 无 fill、stroke 初始为数组/布尔的情况）、类型约束与代码风格

# Task Dependencies
- [修改 _smartInvert 相交分支] 依赖于 [更新类型定义与注释]
- [添加验证用例] 依赖于 [修改 _smartInvert 相交分支]
