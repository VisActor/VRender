## 自定义动画背景提示

- VChart 如果存在入场动画，将不会设置属性到 attribute，需要在动画中进行设置（从 finalAttribute 中获取，finalAttribute 中保存着一份最新的属性副本）。
- VChart 如果存在出场动画，通常不需要直接设置属性，否则可能会导致跳帧。

## 容易误解的定义

1. step 是一个动画的基本单元，自定义动画继承自 step，step 通过 props 属性作为动画的目标属性。
2. 而自定义动画中通常使用 from 和 to 保存动画的开始和结束状态，作为一一对应，自定义动画中因为插值是自己实现的，所以你定义 fromaaa 和 toccc 都可以，自己在 update 里拿到你保存的开始和结束变量，然后自己计算。
3. 但是自定义动画中，你自己保存了自定义的 from 和 to 之后，还需要设置一下 props，这样上层的 Animate 才知道这个动画的最终属性是什么（因为 from 和 to 是你自定义的，而 props 属性才是动画系统认可的最终状态）。
