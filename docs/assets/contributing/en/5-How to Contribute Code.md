---
title: 5. How to Contribute Code

key words: VisActor, VChart, VTable, VStory, VMind, VGrammar, VRender, Visualization, Chart, Data, Table, Graph, Gis, LLM
---

# Create a Branch

The default branch for VRender is the develop branch. Whether it's for feature development, bug fixes, or documentation writing, please create a new branch and then merge it into the develop branch. Use the following code to create a branch:

```
// Create a branch for documentation and demo
git checkout -b docs/add-funnel-demo
```

# Find or Create an Issue

In principle, we require that every PR has a corresponding issue. Before starting development, please make sure there is a corresponding issue that has not been claimed.

## Search for an Issue

You can search for bug or feature-related issues in the following ways:

<img src='https://cdn.jsdelivr.net/gh/xuanhun/articles/visactor/img/TPy4bTm01o9MSgxiwZvcTz66nug.gif' alt='' width='487' height='auto'>

## Create a Code-Related Issue

Click on "NEW ISSUE" to open the issue selection page, then choose either "Bug Report" or "Feature Request".

<img src='https://cdn.jsdelivr.net/gh/xuanhun/articles/visactor/img/AhNvbxd1uoZZMHxuKxscjErrnDe.gif' alt='' width='611' height='auto'>

Fill in the relevant information for the documentation issue and add appropriate tags.

<img src='https://cdn.jsdelivr.net/gh/xuanhun/articles/visactor/img/Odonb0WssownV3xTSQDcEudhnOi.gif' alt='' width='828' height='auto'>

# Claim an Issue

If you want to contribute code, you can leave a message under the issue to claim it. An administrator will contact you, confirm, and then assign the issue to you.

For example:

<img src='https://cdn.jsdelivr.net/gh/xuanhun/articles/visactor/img/MMCpb9MvEomle4xYIe1cauFUnCe.gif' alt='' width='988' height='auto'>

# Write Code

All components in the VRender ecosystem are located in the same directory, divided by package names. Developers need to develop code on their own code branch and then commit it.

# Use Marscode AI Programming Assistant for Code Writing

By using the [Marscode AI Programming Assistant](https://www.marscode.cn/home?utm_source=developer&utm_medium=oss&utm_campaign=visactor_a), you can receive comprehensive assistance throughout the code writing process.

If you haven't installed the [Marscode AI Programming Assistant](https://www.marscode.cn/home?utm_source=developer&utm_medium=oss&utm_campaign=visactor_a) yet, please download it from this link: https://www.marscode.cn/home?utm_source=developer&utm_medium=oss&utm_campaign=visactor_a

During code writing, using the context command appropriately can enhance the accuracy of the content.

`**⭐️ #Workspace**`

Select global code in Workspace as context, and AI will automatically find relevant code context based on your query.

<img src='https://cdn.jsdelivr.net/gh/xuanhun/articles/visactor/img/DWoabR7kIoqRe8xVu7RcqjjenFg.gif' alt='' width='1000' height='auto'>

`**⭐️ #Files**`

Search and select files in the code repository as context.

<img src='https://cdn.jsdelivr.net/gh/xuanhun/articles/visactor/img/VcWsbki1MohwabxGtRPcZnXXnGb.gif' alt='' width='1000' height='auto'>

`**⭐️ #Code**`

Search and select functions or classes in the code repository as context.

<img src='https://cdn.jsdelivr.net/gh/xuanhun/articles/visactor/img/FDTHbZ2Hko9WrSx2JqWcJRRnnUf.gif' alt='' width='1000' height='auto'>

The following examples demonstrate how to use the [Marscode AI Programming Assistant](https://www.marscode.cn/home?utm_source=developer&utm_medium=oss&utm_campaign=visactor_a) for code writing.

## 5.1 Quickly Familiarize Yourself with the Entire Repository

Here, **use #Workspace to invoke it**, then ask it to generate a project structure explanation document.

<img src='https://cdn.jsdelivr.net/gh/xuanhun/articles/visactor/img/VuVub5lyZoVHQqxL3T9cvojUnVu.gif' alt='' width='1000' height='auto'>

You can also ask further questions about subfolders.

<img src='https://cdn.jsdelivr.net/gh/xuanhun/articles/visactor/img/AdgDb1oGFoAyaRxkW8xciziInvf.gif' alt='' width='1000' height='auto'>

## 5.2 Explain Code

### 5.2.1 Generate Code Explanations

When selecting a piece of code in a file, you can choose the Explain command from the floating menu, and [Marscode](https://www.marscode.cn/home?utm_source=developer&utm_medium=oss&utm_campaign=visactor_a) will generate detailed code explanations for you. You can then review and modify based on this.

<img src='https://cdn.jsdelivr.net/gh/xuanhun/articles/visactor/img/K2RVbq5broy4rpxSStYcA4J7ndf.gif' alt='' width='1000' height='auto'>

You can also directly input the Explain command in the dialog box.

<img src='https://cdn.jsdelivr.net/gh/xuanhun/articles/visactor/img/TH9ybov7JomacGxBX2QcccwFnvc.gif' alt='' width='1000' height='auto'>

You can also use the #Code context mentioned above to combine Explain with your instructions for more detailed tasks.

### 5.2.2 Generate Explanations for the Entire File

Explain can be used in conjunction with Context or Files commands to generate explanations for the entire file.

<img src='https://cdn.jsdelivr.net/gh/xuanhun/articles/visactor/img/HyeabsSvjoHYZ9xAbLRc55j8nDg.gif' alt='' width='1000' height='auto'>

## 5.3 Content Retrieval

Usually, each Q&A session with [Marscode](https://www.marscode.cn/home?utm_source=developer&utm_medium=oss&utm_campaign=visactor_a) will provide reference documents, which can provide more context for further analysis.

<img src='https://cdn.jsdelivr.net/gh/xuanhun/articles/visactor/img/OeF0bP4jPoUZWGxqDqScyHzhnvf.gif' alt='' width='1000' height='auto'>

You can also directly search for files:

<img src='https://cdn.jsdelivr.net/gh/xuanhun/articles/visactor/img/SFvjbKHzOokvkPxFGH0cZKRanpc.gif' alt='' width='1000' height='auto'>

## 5.4 Code Generation

In daily coding, you may often encounter scenarios where you need to use repetitive code, and sometimes you may not know if a certain function for a feature is already implemented. In such cases, use `#Workspace` to ask questions. For example:

<img src='https://cdn.jsdelivr.net/gh/xuanhun/articles/visactor/img/JpG9b7ggroUfX7xduo6cd3qXnOg.gif' alt='' width='1000' height='auto'>

## 5.5 Add Comments

Use the "/doc" command to generate code comments.

<img src='https://cdn.jsdelivr.net/gh/xuanhun/articles/visactor/img/KAS2bRAVWo1K5ixXvfDceiZinEh.gif' alt='' width='1000' height='auto'>

## 5.6 Generate Unit Tests

VRender unit test code is located in the "**tests**" directory of each package.

<img src='https://cdn.jsdelivr.net/gh/xuanhun/articles/visactor/img/DHbGbulZ5onHbtx3KFscOLgXnFg.gif' alt='' width='1000' height='auto'>

You can quickly generate unit test code using the "/test" command in [Marscode](https://www.marscode.cn/home?utm_source=developer&utm_medium=oss&utm_campaign=visactor_a).

<img src='https://cdn.jsdelivr.net/gh/xuanhun/articles/visactor/img/OnTDbxBAzoQ9h7xEk6vcpYjAnNd.gif' alt='' width='1000' height='auto'>

## 5.7 Intelligent Suggestions

During the writing process, intelligent code suggestions are a standard feature of the programming assistant. Feel free to experience it yourself.

# Commit Code

After completing the documentation, push the code to your remote branch. For example:

```
git commit -a -m "docs: add custom funnel demo and related docs"

```

VisActor's commit messages follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) specification, with **docs used for demos**.

`<type>[optional scope]: <description>`

Common `type` values include docs (documentation, log changes), feat (new feature), fix (bug fix), refactor (code refactoring), etc. Please choose according to the actual situation.

Write a short and precise description in English.

Before submitting the commit, we will perform a commit lint check. You can check the specific rules [here](https://github.com/VisActor/VStory/blob/develop/common/autoinstallers/lint/commitlint.config.js).

A common issue is when the upstream (@visactor/vstroy) has new updates, which may cause conflicts when submitting a Pull Request. Therefore, before submitting, merge the commits from other developers with your own commits. Use the following code to switch to the develop branch:

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

<img src='https://cdn.jsdelivr.net/gh/xuanhun/articles/visactor/img/H0J8bpv2qoodVCxPfFTcRHL1nCf.gif' alt='' width='1000' height='auto'>

Or create one through the `contribute` button:

Fill in the modifications for this submission according to the template:

- Check the type of modification

<img src='https://cdn.jsdelivr.net/gh/xuanhun/articles/visactor/img/AgIOb5bRAo7UUVxS52AcNZCanad.gif' alt='' width='692' height='auto'>

- Fill in the associated issue

<img src='https://cdn.jsdelivr.net/gh/xuanhun/articles/visactor/img/VGonbJeFJoc68XxDzkOc7j8Lnjd.gif' alt='' width='470' height='auto'>

- If there are complex changes, explain the background and solution

<img src='https://cdn.jsdelivr.net/gh/xuanhun/articles/visactor/img/HYy2bLtuCopGfxxdeKkc2pt0n4e.gif' alt='' width='1000' height='auto'>

After filling in the relevant information, click on Create pull request to submit.

An administrator will review the PR and decide whether to approve it. If it is not approved, you will need to make modifications and resubmit.

# Next Steps

Next, you can read about the implementation principles and source code explanations for each module, or join in contributing to these documents.

Join the VisActor family and contribute your efforts!

GitHub: [github.com/VisActor](https://link.juejin.cn/?target=https%3A%2F%2Fgithub.com%2FVisActor)

VisActor WeChat Subscription Account (you can join the WeChat group through the subscription account menu):

<img src='https://cdn.jsdelivr.net/gh/xuanhun/articles/visactor/img/ZqQ2bVj6woabSXxeLKOce9rrn9d.gif' alt='' width='258' height='auto'>

VisActor Official Website: [www.visactor.io/](https://link.juejin.cn/?target=https%3A%2F%2Fwww.visactor.io%2Fvtable)

Feishu Group:

<img src='https://cdn.jsdelivr.net/gh/xuanhun/articles/visactor/img/F0GRbKlLOoHUwRx9JBVcKxk0n6g.gif' alt='' width='264' height='auto'>

Discord: https://discord.com/invite/3wPyxVyH6m

# This Document is Contributed by the Following Individuals

[玄魂](https://github.com/xuanhun)
