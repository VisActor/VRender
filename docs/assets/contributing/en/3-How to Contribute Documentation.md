---
title: 3. How to Contribute to Documentation

key words: VisActor, VChart, VTable, VStory, VMind, VGrammar, VRender, Visualization, Chart, Data, Table, Graph, Gis, LLM
---

# Create a Branch

The default branch for VRender is the develop branch. Whether it's for feature development, bug fixes, or documentation writing, please create a new branch and then merge it into the develop branch. Use the following code to create a branch:

```
// Create a documentation or demo branch
git checkout -b docs/add-funnel-demo
```

# Find or Create an Issue

In principle, we require that every PR has a corresponding issue. Before starting development, please make sure there is a corresponding issue that has not been claimed.

## Search for Documentation Issues

You can search for documentation-related issues using the following method:

```
is:open label:docs
```

![Search for Documentation Issues](https://cdn.jsdelivr.net/gh/xuanhun/articles/visactor/img/JkscbtGcbo9iQRxuAR2clnx6n9J.gif)

Some features may be associated with the "doc" label, so you can further check if the issue is purely a documentation task.

## Create a Documentation Issue

Click on "NEW ISSUE", open the issue selection page, and choose "**Documentation Request**".

![Create a Documentation Issue](https://cdn.jsdelivr.net/gh/xuanhun/articles/visactor/img/Xs7nbpfaCo479XxGRq5cONJ3nye.gif)

Fill in the relevant information for the documentation issue you want to submit.

![Fill in Documentation Issue Information](https://cdn.jsdelivr.net/gh/xuanhun/articles/visactor/img/KXsCbe7XYo0puWxn3oGczfXInbc.gif)

# Claim an Issue

If you want to write or modify documentation, you can leave a message under the issue to claim it. An administrator will contact you, confirm, and then assign the issue to you.

For example:

![Claim an Issue](https://cdn.jsdelivr.net/gh/xuanhun/articles/visactor/img/V9UTb3w08oJcj6xUSUKc32gTnrh.gif)

# Create or Modify Documentation

The location of VRender documentation and demos in the project is as follows:

![VRender Directory Structure](https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/vrender/vrender-dir.png)

Currently, the types of documentation are as follows:

- examples: Element examples, corresponding to the site:

https://www.visactor.io/vrender/example

- guide: Tutorials, corresponding to the site: https://www.visactor.io/vrender/guide/asd/VRender_Website_Guide

Find the corresponding location of the documentation for additions or modifications. It is important to note that some documentation also requires maintenance of the "menu.json" file.

![Maintain menu.json File](https://cdn.jsdelivr.net/gh/xuanhun/articles/visactor/img/TxwTb83S5oOnqMx5VI7cqzjXnkg.gif)

This file corresponds to the final display location and name of the documentation on the site. For example:

![Example of menu.json File](https://cdn.jsdelivr.net/gh/xuanhun/articles/visactor/img/L6WpbXlFEo15F4xSIsMch9YTnof.gif)

# Use Marscode AI Programming Assistant for Documentation Writing

[Marscode AI Programming Assistant](https://www.marscode.cn/home?utm_source=developer&utm_medium=oss&utm_campaign=visactor_a) can provide comprehensive assistance throughout the documentation creation process.

If you have not installed [Marscode AI Programming Assistant](https://www.marscode.cn/home?utm_source=developer&utm_medium=oss&utm_campaign=visactor_a) yet, please download it from this link: https://www.marscode.cn/home?utm_source=developer&utm_medium=oss&utm_campaign=visactor_a

In documentation writing, using the context command appropriately can enhance the accuracy of the content.

`**⭐️ #Workspace**`

Select global code in Workspace as context, and AI will automatically find relevant code context based on your query.

![Use Workspace for Context](https://cdn.jsdelivr.net/gh/xuanhun/articles/visactor/img/WiikbC26FovfN8xiDrkc5jDGn4b.gif)

`**⭐️ #Files**`

Search and select files in the code repository as context.

![Use Files for Context](https://cdn.jsdelivr.net/gh/xuanhun/articles/visactor/img/OG15bVGdAoghaux6QlUckffVnfg.gif)

`**⭐️ #Code**`

Search and select functions or classes in the code repository as context.

![Use Code for Context](https://cdn.jsdelivr.net/gh/xuanhun/articles/visactor/img/BEaXbdXyUoik0WxoWqHcz0A6nCg.gif)

Here are examples of how to use [Marscode AI Programming Assistant](https://www.marscode.cn/home?utm_source=developer&utm_medium=oss&utm_campaign=visactor_a) for documentation writing.

## 5.1 Provide Documentation Writing Ideas

Here, **invoke #Workspace** and ask for help in generating an outline for developer documentation.

![Generate Documentation Outline](https://cdn.jsdelivr.net/gh/xuanhun/articles/visactor/img/GnctbsyzWo6OBFxLFFNcjXh9n22.gif)

## 5.2 Generate Project Structure Explanation

Here, **invoke #Workspace** and ask for help in generating a document explaining the project structure.

![Generate Project Structure Explanation](https://cdn.jsdelivr.net/gh/xuanhun/articles/visactor/img/RI9sb17ygoL2JMxwpqrcDLD3nVh.gif)

You can further inquire about subfolders for more detailed explanations.

![Inquire About Subfolders](https://cdn.jsdelivr.net/gh/xuanhun/articles/visactor/img/Za3MbDf4FoEnQKx5vUUcpB34nZg.gif)

## 5.3 Generate File or Code Explanations

### 5.3.1 Generate Code Explanations

When selecting a piece of code in a file, you can choose the Explain command from the floating menu, and [Marscode](https://www.marscode.cn/home?utm_source=developer&utm_medium=oss&utm_campaign=visactor_a) will generate a detailed code explanation. You can then review and adapt it as needed.

![Generate Code Explanation](https://cdn.jsdelivr.net/gh/xuanhun/articles/visactor/img/BQurb7A6fo7UVJxxuqHcSLIdnzc.gif)

You can also directly input the Explain command in the dialog box.

![Directly Input Explain Command](https://cdn.jsdelivr.net/gh/xuanhun/articles/visactor/img/FtYLb95EEoCXGOx835tc3X2Zn7g.gif)

You can also use the #Code context mentioned earlier to combine Explain with your instructions for more detailed tasks.

### 5.3.2 Generate File-Specific Explanations

Explain can be used in conjunction with Context or Files commands to generate explanations for the entire file.

![Generate File Explanation](https://cdn.jsdelivr.net/gh/xuanhun/articles/visactor/img/HoqGbdBxyolQodx2uhdcquven0g.gif)

## 5.4 Generate Sample Code

To better explain principles and usage, it is often necessary to provide runnable demos. You can use the code generation capabilities of [Marscode](https://www.marscode.cn/home?utm_source=developer&utm_medium=oss&utm_campaign=visactor_a) to generate sample code. However, it is important to verify the accuracy of the generated code as AI-generated code may not always be precise.

## 5.5 Content Retrieval

Typically, each Q&A session with [Marscode](https://www.marscode.cn/home?utm_source=developer&utm_medium=oss&utm_campaign=visactor_a) will provide reference documents that can offer more context for further analysis.

![Retrieve Content](https://cdn.jsdelivr.net/gh/xuanhun/articles/visactor/img/QMD7b5mQgoyNYtxNK5jcNTL4n7c.gif)

You can also directly search for files:

![Search for Files](https://cdn.jsdelivr.net/gh/xuanhun/articles/visactor/img/ZBPmb7fn5oK3DAxLQAxcBP1An5d.gif)

## 5.6 Translate Documentation

VisActor's documentation needs to be provided in both Chinese and English, and Marscode can assist with translation.

# Commit Code

After completing the documentation, push the code to your remote branch. For example:

```
git commit -a -m "docs: add custom funnel demo and related docs"
```

VisActor's commit messages follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) specification:

`<type>[optional scope]: <description>`

Common `type` values include docs (documentation, log changes), feat (new feature), fix (bug fix), refactor (code refactoring), etc. Please choose accordingly based on the actual situation.

Before submitting the commit, we will perform commit lint checks. You can refer to the [check rules](https://github.com/VisActor/VRender/blob/develop/common/autoinstallers/lint/commitlint.config.js) for more details.

A common issue is when the upstream (@visactor/vrender) has new updates, which may cause conflicts when submitting a Pull Request. Therefore, before submitting, merge the commits from other developers with your own. Switch to the develop branch using the following code:

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

Merge the commits from develop into your branch:

```
git rebase develop
```

Push the updated code to your branch:

```
git push origin docs/add-funnel-demo
```

# Submit a PR

You can click on the `Compare & pull request` button on your GitHub repository page.

![Create a Pull Request](https://cdn.jsdelivr.net/gh/xuanhun/articles/visactor/img/S8hebTyczoKfg7x4ZTncy8uenX9.gif)

Or create one through the `contribute` button:

Fill in the modifications for this submission using the template:

- Check the type of modification

![Select Modification Type](https://cdn.jsdelivr.net/gh/xuanhun/articles/visactor/img/J9z9biTukokoJBx846zcIOVqnsh.gif)

- Fill in the associated issue

![Fill in Associated Issue](https://cdn.jsdelivr.net/gh/xuanhun/articles/visactor/img/Oxl7bkBuEoHdssxxfRHc11IAnsg.gif)

- If there are complex changes, explain the background and solution

![Explain Background and Solution](https://cdn.jsdelivr.net/gh/xuanhun/articles/visactor/img/RUeebaBA8oGMZNxWdi1cstXWn1d.gif)

After filling in the relevant information, click on Create pull request to submit.

An administrator will review the PR and decide whether to approve it. If not approved, modifications will be required before resubmitting.

# Next Steps

Different types of documentation have specific requirements for demo documentation, which can be found in the "How to Contribute to Demos" section.

You can continue to explore different types of tasks.

GitHub: [github.com/VisActor](https://link.juejin.cn/?target=https%3A%2F%2Fgithub.com%2FVisActor)

VisActor WeChat subscription account (join the WeChat group through the subscription account menu):

![VisActor WeChat Subscription Account](https://cdn.jsdelivr.net/gh/xuanhun/articles/visactor/img/Cj40bjDrxoEDnZxrBl4cEfs9nyc.gif)

VisActor Official Website: [www.visactor.io/](https://link.juejin.cn/?target=https%3A%2F%2Fwww.visactor.io%2Fvtable)

Feishu Group:

![Feishu Group](https://cdn.jsdelivr.net/gh/xuanhun/articles/visactor/img/VeKlb1t5sogCmExPAFmcbtmgndb.gif)

Discord: https://discord.com/invite/3wPyxVyH6m

# Contributors to this Documentation

[玄魂](https://github.com/xuanhun)
