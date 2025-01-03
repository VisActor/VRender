---
title: 4. How to Contribute Demo

key words: VisActor, VChart, VTable, VStory, VMind, VGrammar, VRender, Visualization, Chart, Data, Table, Graph, Gis, LLM
---

# Create a Branch

The default branch for VRender is the `develop` branch. Whether it's for feature development, bug fixes, or documentation writing, please create a new branch and then merge it into the `develop` branch. Use the following code to create a branch:

```
// Create a branch for documentation and demo
git checkout -b docs/add-funnel-demo
```

# Find or Create an Issue

In principle, we require that each PR has a corresponding issue. Before starting development, please make sure there is a corresponding issue that has not been claimed.

## Search for Demo Issues

You can search for demo-related issues using the following method:

```
label:demos
```

![Search Demo Issues](https://cdn.jsdelivr.net/gh/xuanhun/articles/visactor/img/RDQZbKyEYomaIRx7jwJccGoMnId.gif)

Some features may be associated with the `doc` label, so you can further check if the issue is purely a demo task.

## Create a Demo Issue

Click on "NEW ISSUE", open the issue selection page, and choose "**Others**".

![Create Demo Issue](https://cdn.jsdelivr.net/gh/xuanhun/articles/visactor/img/VNGhbVirmoaQTIxhOlFc61w3nqb.gif)

Fill in the relevant information for the document issue you want to submit, and tag it with the "demos" label.

![Fill in Demo Issue](https://cdn.jsdelivr.net/gh/xuanhun/articles/visactor/img/Cc8SbSAFFoCvQ2xJFd6cjv17nyc.gif)

# Claim the Issue

If you want to submit a demo or fix a demo bug, you can leave a message under that issue to claim it. The administrator will contact you, confirm, and then assign the issue to you.

For example:

![Claim Issue](https://cdn.jsdelivr.net/gh/xuanhun/articles/visactor/img/Q2vGbhmevorebJxa8Toc1hmtnMc.gif)

# Create or Modify Demo

The location of VRender documentation and demos in the project is as follows (examples):

![VRender Examples Location](https://cdn.jsdelivr.net/gh/xiaoluoHe/articles/visactor/img/SCR-20241202-oujh.png)

Taking the example document of `basic-arc` as an example (currently one example contains both Chinese and English versions, located in the `zh` & `en` paths):

![Example Markdown Content](https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/vrender/vrender-contributing-basic-arc.png)

The example Markdown content is divided into several parts:

- Metadata: Defines the attributes of the example content, including chart category, cover image, keywords, etc.
- Title: The content under the first-level title corresponds to the description of the example.
- Key Configurations: Key configuration explanations included in the example, which will be displayed in the "Key Configurations" section on the example page.
- Code Demo: The specific code content executed in the example, currently only supports native JavaScript code.

```js
// Code example
```

The fields defined in the metadata of Markdown are:

- group: The classification information of the example, describing which chart category the current example belongs to.
- title: The title of the example.
- keywords: Keywords of the example.
- order: The sorting basis of the example under the same group.
- cover: The cover image of the example.
- tutorial: Link to the tutorial (the default example tutorial will jump to the tutorial corresponding to the example group).

Currently, the group of the chart example contains multiple categories, such as `graphic-arc`, `graphic-area`, etc., corresponding to the categories under all charts in the VRender example gallery. You can refer to existing example documents to fill in the specific category fields.

![Example Categories](https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/vrender/vrender-contributing-examples-page.png)

After completing the new demo writing, you can add the demo path and title to the `docs/assets/examples/menu.json` file:

![Add Demo Path and Title](https://cdn.jsdelivr.net/gh/xiaoluoHe/articles/visactor/img/SCR-20241202-skwm.png)

> For image resources that need to be uploaded during demo creation, please refer to the chapter [6. How to upload image resources](./6-How%20to%20upload%20image).

# Use Marscode AI Programming Assistant for Demo Writing

With the help of the [Marscode AI Programming Assistant](https://www.marscode.cn/home?utm_source=developer&utm_medium=oss&utm_campaign=visactor_a), you can provide comprehensive assistance throughout the document creation process.

If you haven't installed the [Marscode AI Programming Assistant](https://www.marscode.cn/home?utm_source=developer&utm_medium=oss&utm_campaign=visactor_a) yet, please download it from this link: [Download Marscode AI Programming Assistant](https://www.marscode.cn/home?utm_source=developer&utm_medium=oss&utm_campaign=visactor_a)

In demo writing, using context commands appropriately can improve the accuracy of the content.

`**⭐️ #Workspace**`

Select global code in Workspace as context, and AI will automatically find relevant code context based on your query.

![Workspace Context](https://cdn.jsdelivr.net/gh/xuanhun/articles/visactor/img/XQaqbAX59oLBKOxR7ngctRbQnXb.gif)

`**⭐️ #Files**`

Search and select files in the code repository as context.

![Files Context](https://cdn.jsdelivr.net/gh/xuanhun/articles/visactor/img/MhZTbAAD2oj1XJxil8WcHYSWn6d.gif)

`**⭐️ #Code**`

Search and select functions or classes in the code repository as context.

![Code Context](https://cdn.jsdelivr.net/gh/xuanhun/articles/visactor/img/V4M7bX87hoHOxOxM1Nfc9of0nhL.gif)

Here are examples of how to use the [Marscode AI Programming Assistant](https://www.marscode.cn/home?utm_source=developer&utm_medium=oss&utm_campaign=visactor_a) for demo writing.

## 5.1 Provide Document Framework

Here **invoke #Workspace**, then ask a question, select the content of an example document, and request it to generate a new example document based on that.

![Provide Document Framework](https://cdn.jsdelivr.net/gh/xuanhun/articles/visactor/img/TUHVbTez5o6IjtxmCLhcWnGHnZg.gif)

You can continue to adjust the details based on this generated framework.

## 5.2 Generate Descriptive Text

The descriptive text for each demo can be generated first using [Marscode](https://www.marscode.cn/home?utm_source=developer&utm_medium=oss&utm_campaign=visactor_a), and then proofread and adjusted. For example:

![Generate Descriptive Text](https://cdn.jsdelivr.net/gh/xuanhun/articles/visactor/img/U6n7bEo0DoaCGyxtiVVc1GBGnrg.gif)

## 5.3 Generate Example Code

To better explain the principles and usage, it is usually necessary to provide a demo that can be actually run. You can use the code generation capability of [Marscode](https://www.marscode.cn/home?utm_source=developer&utm_medium=oss&utm_campaign=visactor_a) to generate example code for us. However, the code generation capabilities of various AIs cannot guarantee accuracy, so further verification is needed.

## 5.4 Content Retrieval

Usually, each of our Q&A in [Marscode](https://www.marscode.cn/home?utm_source=developer&utm_medium=oss&utm_campaign=visactor_a) will provide reference documents, which can provide more context for further analysis.

![Content Retrieval](https://cdn.jsdelivr.net/gh/xuanhun/articles/visactor/img/DGyBbfi99oucAYxxkyJcfka3nJa.gif)

You can also directly search for files:

![File Search](https://cdn.jsdelivr.net/gh/xuanhun/articles/visactor/img/WM9Ubr9JYoYAjOxFQ6tc8cW3nLd.gif)

# Submit Code

After completing the document, push the code to your remote branch. For example:

```
git commit -a -m "docs: add custom funnel demo and related docs"
```

VisActor's commit messages follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) specification, with **docs used for demos**.

`<type>[optional scope]: <description>`

Common `type` values include docs (documentation, log changes), feat (new feature), fix (bug fix), refactor (code refactoring), etc. Please choose according to the actual situation.

Write a concise and accurate description in English before committing.

Before submitting the commit, we will perform a commit lint check. You can check the [lint rules](https://github.com/VisActor/VRender/blob/develop/common/autoinstallers/lint/commitlint.config.js) for more details.

A common issue is that the remote upstream (@visactor/vrender) has been updated, which may cause conflicts when submitting a Pull Request. Therefore, you can merge the commits from other developers and your commits before submitting the PR. Switch to the `develop` branch using the following code:

```
git checkout develop
```

Pull the latest code from the remote:

```
git pull upstream develop
```

Switch back to your development branch:

```
git checkout docs/add-funnel-demo
```

Merge the commits from `develop` into your branch:

```
git rebase develop
```

Push the updated code to your branch:

```
git push origin docs/add-funnel-demo
```

# Submit PR

You can click on the `Compare & pull request` button on your GitHub repository page.

![Compare & Pull Request](https://cdn.jsdelivr.net/gh/xuanhun/articles/visactor/img/FWm3bZjbnoaqUOxiygXcFdLznwf.gif)

Or create one through the `contribute` button:

Fill in the modifications for this submission according to the template:

- Check the type of modification

![Select Modification Type](https://cdn.jsdelivr.net/gh/xuanhun/articles/visactor/img/V7xpbJhhEoSoCExC31WcyKvHnDe.gif)

- Fill in the associated issue

![Fill in Associated Issue](https://cdn.jsdelivr.net/gh/xuanhun/articles/visactor/img/O6YqbpdxgodBjfxHXEpcwob4n5E.gif)

- If there are complex changes, explain the background and solution

![Explain Changes](https://cdn.jsdelivr.net/gh/xuanhun/articles/visactor/img/QsnYbfLCio4u3MxK2uIc8epKnXh.gif)

After filling in the relevant information, click on Create pull request to submit.

The administrator will review the PR and decide whether to approve it. If it is not approved, you will need to make modifications and resubmit.

# Next Steps

You can continue to try different types of tasks.

GitHub: [github.com/VisActor](https://link.juejin.cn/?target=https%3A%2F%2Fgithub.com%2FVisActor)

VisActor WeChat subscription account (you can join the WeChat group through the subscription account menu):

![VisActor WeChat](https://cdn.jsdelivr.net/gh/xuanhun/articles/visactor/img/I8OdbhGfkort6oxqHW6cR492n7d.gif)

VisActor Official Website: [www.visactor.io/](https://link.juejin.cn/?target=https%3A%2F%2Fwww.visactor.io%2Fvtable)

Feishu Group:

![Feishu Group](https://cdn.jsdelivr.net/gh/xuanhun/articles/visactor/img/DdEAbEU9yoFq9IxjrN4curJnnyf.gif)

Discord: [Join Discord](https://discord.com/invite/3wPyxVyH6m)

# This Document is Contributed by the Following Individuals

[玄魂](https://github.com/xuanhun)
