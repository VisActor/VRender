---
title: 4.如何贡献demo

key words: VisActor,VChart,VTable,VStory,VMind,VGrammar,VRender,Visualization,Chart,Data,Table,Graph,Gis,LLM
---

# 创建分支

VRender 默认分支为 develop 分支。无论是功能开发、bug 修复、文档编写，都请新建立一个分支，再合并到 develop 分支上。使用以下代码创建分支：

```
// 创建文档、demo分支
git checkout -b docs/add-funnel-demo

```

# 寻找或者创建 issue

原则上，我们规定每一个 pr 都要有对应的 issue。在开始开发之前，请确认是否有对应的 issue，且 issue 没有被认领。

## 搜索 demo issue

可以通过如下方式搜索 demo 相关的 issue：

```
 label:demos

```

<img src='https://cdn.jsdelivr.net/gh/xuanhun/articles/visactor/img/RDQZbKyEYomaIRx7jwJccGoMnId.gif' alt='' width='769' height='auto'>

其中他有些 feature 会关联 doc 标签，可以进一步看一下该 issue 是不是纯 demo 任务。

## 创建 demo issue

点击 “NEW ISSUE”，打开 issue 选择页面，选择“**Others”。**

<img src='https://cdn.jsdelivr.net/gh/xuanhun/articles/visactor/img/VNGhbVirmoaQTIxhOlFc61w3nqb.gif' alt='' width='1000' height='auto'>

填写你要提交的文档 issue 相关信息,并打上“demos”标签即可。

<img src='https://cdn.jsdelivr.net/gh/xuanhun/articles/visactor/img/Cc8SbSAFFoCvQ2xJFd6cjv17nyc.gif' alt='' width='1000' height='auto'>

# 认领 issue

如果你想提交 demo 或者修改 demo bug，可以在该 issue 下留言认领。管理员会联系你，确认后将 issue assign 给你。

例如：

<img src='https://cdn.jsdelivr.net/gh/xuanhun/articles/visactor/img/Q2vGbhmevorebJxa8Toc1hmtnMc.gif' alt='' width='988' height='auto'>

# 创建或者修改 demo

VRender 文档和 demo 在项目的中的位置如下（examples）：

<img src='https://cdn.jsdelivr.net/gh/xiaoluoHe/articles/visactor/img/SCR-20241202-oujh.png' alt='' width='500' height='auto'>

以 basic-arc 的示例文档为例（目前一份示例同时包含中英文版本，分别在 zh & en 的路径下）：

<img src='https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/vrender/vrender-contributing-basic-arc.png' alt='' width='1000' height='auto'>

示例 Markdown 内容分为几个部分：

- 元信息：示例内容的属性定义，包括图表分类、封面图、关键词等；

- 标题：一级标题下的正文内容对应了示例的描述信息；

- 关键配置：示例中所包含的关键配置说明，这一部分将在示例页面右侧的“关键配置”中呈现；

- 代码演示：示例执行的具体代码内容，目前只支持原生的 JavaScript 代码。

```js
const graphics = [];
graphics.push(
  VRender.createArc({
    innerRadius: 0,
    outerRadius: 120,
    startAngle: 0,
    endAngle: Math.PI * 2,
    x: 200,
    y: 200,
    fill: {
      gradient: 'linear',
      x0: 0,
      y0: 0,
      x1: 1,
      y1: 0,
      stops: [
        { offset: 0, color: 'green' },
        { offset: 0.5, color: 'orange' },
        { offset: 1, color: 'red' }
      ]
    },
    fillOpacity: 0.2,
    background:
      '<svg t="1683876749384" class="icon" viewBox="0 0 1059 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5625" width="200" height="200"><path d="M928.662069 17.655172h-812.137931v208.331035h812.137931z" fill="#F1543F" p-id="5626"></path><path d="M1020.468966 275.42069l-236.579311 367.227586c0-17.655172-3.531034-35.310345-14.124138-49.434483-17.655172-24.717241-56.496552-28.248276-81.213793-45.903448-21.186207-14.124138-35.310345-42.372414-60.027586-56.496552L928.662069 17.655172l24.717241 14.124138c88.275862 49.434483 116.524138 158.896552 67.089656 243.64138M416.662069 490.813793c-21.186207 14.124138-38.841379 42.372414-60.027586 56.496552-24.717241 17.655172-63.558621 24.717241-81.213793 45.903448-10.593103 14.124138-10.593103 31.77931-14.124138 49.434483L24.717241 275.42069C-24.717241 190.675862 3.531034 81.213793 91.806897 31.77931l24.717241-14.124138 300.137931 473.158621z" fill="#FF7058" p-id="5627"></path><path d="M893.351724 656.772414c0 38.841379-35.310345 70.62069-45.903448 102.4-10.593103 35.310345-3.531034 81.213793-24.717242 109.462069-21.186207 28.248276-67.089655 35.310345-98.868965 56.496551-31.77931 28.248276-52.965517 70.62069-88.275862 81.213794-35.310345 10.593103-77.682759-10.593103-112.993104-10.593104-38.841379 0-81.213793 21.186207-116.524137 10.593104S349.572414 953.37931 317.793103 932.193103c-31.77931-21.186207-77.682759-28.248276-98.868965-56.496551-21.186207-28.248276-14.124138-74.151724-24.717241-109.462069-10.593103-35.310345-45.903448-67.089655-45.903449-102.4 0-38.841379 35.310345-70.62069 45.903449-105.931035 10.593103-35.310345 3.531034-81.213793 24.717241-109.462069 21.186207-28.248276 67.089655-35.310345 98.868965-56.496551 28.248276-21.186207 49.434483-63.558621 88.275863-74.151725 35.310345-10.593103 77.682759 10.593103 116.524137 10.593104 38.841379 0 81.213793-21.186207 112.993104-10.593104 35.310345 10.593103 56.496552 52.965517 88.275862 74.151725 31.77931 21.186207 77.682759 28.248276 98.868965 56.496551 21.186207 28.248276 14.124138 74.151724 24.717242 109.462069 10.593103 31.77931 45.903448 63.558621 45.903448 98.868966" fill="#F8B64C" p-id="5628"></path><path d="M790.951724 656.772414c0 144.772414-120.055172 264.827586-268.358621 264.827586-148.303448 0-268.358621-120.055172-268.35862-264.827586s120.055172-264.827586 268.35862-264.827586c148.303448 0 268.358621 120.055172 268.358621 264.827586" fill="#FFD15C" p-id="5629"></path><path d="M706.206897 589.682759h-123.586207c-7.062069 0-10.593103-3.531034-14.124138-10.593104L529.655172 466.096552c-3.531034-14.124138-21.186207-14.124138-28.248275 0l-38.84138 112.993103c-3.531034 7.062069-7.062069 10.593103-14.124138 10.593104H335.448276c-14.124138 0-21.186207 17.655172-7.062069 24.717241l98.868965 70.62069c3.531034 3.531034 7.062069 10.593103 3.531035 14.124138L391.944828 812.137931c-3.531034 14.124138 10.593103 24.717241 21.186206 14.124138l98.868966-70.62069c3.531034-3.531034 10.593103-3.531034 17.655172 0l98.868966 70.62069c10.593103 7.062069 24.717241-3.531034 21.186207-14.124138l-38.841379-112.993103c-3.531034-7.062069 0-10.593103 3.531034-14.124138l98.868966-70.62069c14.124138-7.062069 7.062069-24.717241-7.062069-24.717241" fill="#F8B64C" p-id="5630"></path></svg>',
    texture: 'circle',
    textureColor: 'orange',
    stroke: 'green',
    lineWidth: 2,
    cap: false
  })
);

graphics.push(
  VRender.createArc({
    innerRadius: 120,
    outerRadius: 130,
    startAngle: 0,
    endAngle: Math.PI * 2,
    x: 200,
    y: 200,
    stroke: '#63bbd0',
    lineWidth: 2,
    fill: {
      x: 0.5,
      y: 0.5,
      startAngle: 0,
      endAngle: 6.283185307179586,
      stops: [
        { offset: 0, color: '#ed2f6a' },
        { offset: 0.2, color: '#621d34' },
        { offset: 0.4, color: '#c08eaf' },
        { offset: 0.6, color: '#806d9e' },
        { offset: 0.8, color: '#2b73af' },
        { offset: 1, color: '#2f90b9' }
      ],
      gradient: 'conical'
    },
    cap: [false, true],
    cornerRadius: 26,
    forceShowCap: true
  })
);

const stage = new Stage({
  container: CONTAINER_ID,
  autoRender: true
});

graphics.forEach(g => {
  stage.defaultLayer.add(g);
});
```

其中 Markdown 的元信息的字段定义为：

- group：示例的分类信息，描述了当前示例属于什么图表类别

- title：示例的标

- keywords：示例的关键词

- order：示例在同个分组下的排序依据

- cover：示例的封面图

- tutorial：跳转的教程链接（默认的示例教程将会跳转到示例分组所对应的教程）

目前图表示例的 group 包含多个分类，例如 graphic-arc 、graphic-area 等，对应到 VRender 示例画廊中全部图表下的分类。具体的分类字段可以参照已有的示例文档进行填写。

<img src='https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/vrender/vrender-contributing-examples-page.png' alt='' width='1000' height='auto'>

完成新的 demo 编写后，可以在 docs/assets/examples/menu.json 文件中添加 demo 路径和标题：

<img src='https://cdn.jsdelivr.net/gh/xiaoluoHe/articles/visactor/img/SCR-20241202-skwm.png' alt='' width='800' height='auto'>

> Demo 制作过程中需要上传的图片资源，请参考[6.如何上传图片资源](./6-How%20to%20upload%20image)章节

# 借助豆包 Marscode AI 编程助手进行 demo 编写

借助豆包[Marscode AI 编程助手](https://www.marscode.cn/home?utm_source=developer&utm_medium=oss&utm_campaign=visactor_a)，可以在文档创作的整个流程中提供全方面的帮助。

如果你还没有安装[Marscode AI 编程助手](https://www.marscode.cn/home?utm_source=developer&utm_medium=oss&utm_campaign=visactor_a)，请从该链接进入下载页面：https://www.marscode.cn/home?utm_source=developer&utm_medium=oss&utm_campaign=visactor_a

在 demo 编写中，合理使用 context 指令，可以提升内容的准确性。

`**⭐️ #Workspace**`

选择 Workspace 中的全局代码作为上下文，AI 将根据用户 Query 自动寻找相关代码 Context

<img src='https://cdn.jsdelivr.net/gh/xuanhun/articles/visactor/img/XQaqbAX59oLBKOxR7ngctRbQnXb.gif' alt='' width='1000' height='auto'>

`**⭐️ #Files**`

搜索选择代码仓库中的文件作为上下文

<img src='https://cdn.jsdelivr.net/gh/xuanhun/articles/visactor/img/MhZTbAAD2oj1XJxil8WcHYSWn6d.gif' alt='' width='1000' height='auto'>

`**⭐️ #Code**`

搜索选择代码仓库中的函数、类作为上下文

<img src='https://cdn.jsdelivr.net/gh/xuanhun/articles/visactor/img/V4M7bX87hoHOxOxM1Nfc9of0nhL.gif' alt='' width='1000' height='auto'>

下面举例说明，如何使用[Marscode AI 编程助手](https://www.marscode.cn/home?utm_source=developer&utm_medium=oss&utm_campaign=visactor_a) 进行 demo 编写。

## 5.1 提供文档框架

这里 **通过 # 唤起 #Workspace ，**然后进行提问，选中一份 example 的文档内容，希望它仿照生成一份新的 example 文档。

<img src='https://cdn.jsdelivr.net/gh/xuanhun/articles/visactor/img/TUHVbTez5o6IjtxmCLhcWnGHnZg.gif' alt='' width='1000' height='auto'>

我们可以在此基础上继续细节的调整。

## 5.2 生成说明文字

每个 demo 的说明文字可以先用 [Marscode](https://www.marscode.cn/home?utm_source=developer&utm_medium=oss&utm_campaign=visactor_a) 生成，然后再做校对和调整。比如：

<img src='https://cdn.jsdelivr.net/gh/xuanhun/articles/visactor/img/U6n7bEo0DoaCGyxtiVVc1GBGnrg.gif' alt='' width='1000' height='auto'>

## 5.3 生成示例代码

为了更好的解释说明原理和用法，通常需要给出可以实际运行的 demo，可以利用 [Marscode](https://www.marscode.cn/home?utm_source=developer&utm_medium=oss&utm_campaign=visactor_a) 的代码生成能力为我们生成示例代码。不过目前各种 AI 的代码生成能力都不能保证准确，还需要进一步的进行验证。

## 5.4 内容检索

通常我们的每个问答，[Marscode](https://www.marscode.cn/home?utm_source=developer&utm_medium=oss&utm_campaign=visactor_a) 都会给出参考文档，这些文档可以给我们提供更多参考上下文，供进一步分析。

<img src='https://cdn.jsdelivr.net/gh/xuanhun/articles/visactor/img/DGyBbfi99oucAYxxkyJcfka3nJa.gif' alt='' width='1000' height='auto'>

也可以直接进行文件检索：

<img src='https://cdn.jsdelivr.net/gh/xuanhun/articles/visactor/img/WM9Ubr9JYoYAjOxFQ6tc8cW3nLd.gif' alt='' width='1000' height='auto'>

# 提交代码

文档完成之后，先把代码 push 到你的远程分支。例如：

```

git commit -a -m "docs: add custom funnel demo and related docs"

```

VisActor 的 commit 提交信息遵循 [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) 规范，**demo 使用 docs**

`<type>[optional scope]: <description>`

其中常用的`type`包括 docs（文档、日志修改）、feat（新功能）、fix（问题修复）、refactor（代码重构）等，请根据实际情况选择。

请用简短精确的英文描述编写 description

提交 commit 之前，我们会进行 commit lint 检查，具体可以查看[检查规则](https://github.com/VisActor/VRender/blob/develop/common/autoinstallers/lint/commitlint.config.js)。

一个常见的问题是远程的 upstream (@visactor/vrender) 有了新的更新， 从而会导致我们提交的 Pull Request 时会导致冲突。 因此我们可以在提交前先把远程其他开发者的 commit 和我们的 commit 合并。使用以下代码切换到 develop 分支:

```

git checkout develop

```

使用以下代码拉出远程的最新代码:

```

git pull upstream develop

```

切换回自己的开发分支:

```

git checkout docs/add-funnel-demo

```

把 develop 的 commit 合并到自己分支：

```

git rebase develop

```

把更新代码提交到自己的分支中:

```

git push origin docs/add-funnel-demo

```

# 提交 PR

你可以在你的 github 代码仓库页面点击 `Compare & pull request` 按钮。

<img src='https://cdn.jsdelivr.net/gh/xuanhun/articles/visactor/img/FWm3bZjbnoaqUOxiygXcFdLznwf.gif' alt='' width='1000' height='auto'>

或通过 `contribute` 按钮创建：

按照模板填写本次提交的修改内容：

- 勾选这是什么类型的修改

<img src='https://cdn.jsdelivr.net/gh/xuanhun/articles/visactor/img/V7xpbJhhEoSoCExC31WcyKvHnDe.gif' alt='' width='692' height='auto'>

- 填写关联的 issue

<img src='https://cdn.jsdelivr.net/gh/xuanhun/articles/visactor/img/O6YqbpdxgodBjfxHXEpcwob4n5E.gif' alt='' width='470' height='auto'>

- 若有复杂变更，请说明背景和解决方案

<img src='https://cdn.jsdelivr.net/gh/xuanhun/articles/visactor/img/QsnYbfLCio4u3MxK2uIc8epKnXh.gif' alt='' width='1000' height='auto'>

相关信息填写完成后，点击 Create pull request 提交。

管理员会 review pr 决定是否通过，如果不通过需要进行修改然后重新提交。

# 下一步

接下来可以继续尝试不同类型的任务。

github ：[github.com/VisActor](https://link.juejin.cn/?target=https%3A%2F%2Fgithub.com%2FVisActor)

VisActor 微信订阅号留言（可以通过订阅号菜单加入微信群）：

<img src='https://cdn.jsdelivr.net/gh/xuanhun/articles/visactor/img/I8OdbhGfkort6oxqHW6cR492n7d.gif' alt='' width='258' height='auto'>

VisActor 官网：[www.visactor.io/](https://link.juejin.cn/?target=https%3A%2F%2Fwww.visactor.io%2Fvtable)

飞书群：

<img src='https://cdn.jsdelivr.net/gh/xuanhun/articles/visactor/img/DdEAbEU9yoFq9IxjrN4curJnnyf.gif' alt='' width='264' height='auto'>

discord：https://discord.com/invite/3wPyxVyH6m

# 本文档由由以下人员贡献

[玄魂](https://github.com/xuanhun)
