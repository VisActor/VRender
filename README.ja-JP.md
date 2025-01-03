<div align="center">
  <a href="https://github.com/VisActor#gh-light-mode-only" target="_blank">
    <img alt="VisActor Logo" width="200" src="https://github.com/VisActor/.github/blob/main/profile/logo_500_200_light.svg"/>
  </a>
  <a href="https://github.com/VisActor#gh-dark-mode-only" target="_blank">
    <img alt="VisActor Logo" width="200" src="https://github.com/VisActor/.github/blob/main/profile/logo_500_200_dark.svg"/>
  </a>
</div>

<div align="center">
  <h1>VRender</h1>
</div>

<div align="center">

VRenderは、機能豊富なビジュアルレンダリングエンジンであり、美しいアートワークを作成するための巧妙で独創的なツールです。

<p align="center">
  <a href="https://www.visactor.io/vrender">紹介</a> •
  <a href="https://www.visactor.io/vrender/example">デモ</a> •
  <a href="https://www.visactor.io/vrender/guide/">チュートリアル</a> •
</p>

![image test](https://github.com/visactor/vrender/actions/workflows/bug-server.yml/badge.svg?event=push)
![unit test](https://github.com/visactor/vrender/actions/workflows/unit-test.yml/badge.svg?event=push)
[![npm Version](https://img.shields.io/npm/v/@visactor/vrender.svg)](https://www.npmjs.com/package/@visactor/vrender)
[![npm Download](https://img.shields.io/npm/dm/@visactor/vrender.svg)](https://www.npmjs.com/package/@visactor/vrender)
[![license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/visactor/vrender/blob/main/LICENSE)

</div>

<div align="center">

[English](./README.md) | [简体中文](./README.zh-CN.md) | 日本語

</div>

<div align="center">

（ビデオ）

</div>

# 紹介

VRenderはビジュアルレンダリングライブラリです。主な機能は以下の通りです：

1. 機能が豊富：カスタマイズ可能なアニメーション、要素の組み合わせ、ナラティブの配置、さまざまなビジュアライゼーションシナリオに適しています。
2. 柔軟な拡張性：プラグインシステムを提供し、自由に拡張可能です。
3. シンプルで強力：同じ設定で2D/3D効果をシームレスに切り替えられます。

# リポジトリの紹介

このリポジトリには以下のパッケージが含まれています：

1. VRender: VRenderのメインパッケージ

# 使用方法

## インストール

[npm package](https://www.npmjs.com/package/@visactor/vrender)

```bash
// npm
npm install @visactor/vrender

// yarn
yarn add @visactor/vrender
```

## クイックスタート

```javascript
import { createSymbol, createStage } from '@visactor/vrender';

const sy = createSymbol({
  x: 500,
  y: 100,
  symbolType: 'circle',
  size: 160,
  outerBorder: {
    distance: 10,
    lineWidth: 2,
    strokeColor: 'green'
  },
  innerBorder: {
    distance: 10,
    lineWidth: 1,
    strokeColor: 'red'
  },
  // fillColor: 'green',
  background:
    'data:image/png;base64,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',
  texture: 'circle',
  texturePadding: 1,
  textureSize: 8,
  textureColor: 'red',
  fillOpacity: 1,
  scaleX: 2,
  scaleY: 2,
  lineWidth: 6
});
const st = createStage({
  canvas: 'main',
  autoRender: true
});
st.defaultLayer.add(sy);
```

##

[詳細なデモとチュートリアル](https://visactor.io/vrender)

# 関連リンク

- [公式サイト](https://visactor.io/vrender)

# エコシステム

| プロジェクト | 説明 |
| ---- | ---- |
| [VChart](https://visactor.io/vchart) | [VisActor/VRender](https://visactor.io/vrender) に基づいたチャートライブラリ |
| [VGrammar](https://visactor.io/vgrammar) | [VisActor/VRender](https://visactor.io/vrender) に基づいたビジュアル文法ライブラリ |
| [React コンポーネントライブラリ](https://visactor.io/react-vchart) | [VisActor/VChart](https://visactor.io/vchart) に基づいた React チャートコンポーネントライブラリ |
| [AI生成コンポーネント](https://visactor.io/ai-vchart) | AI生成のチャートコンポーネント |

# 貢献

貢献したい場合は、まず [行動規範](./CODE_OF_CONDUCT.md) と [ガイド](./CONTRIBUTING.md) をお読みください。

小さな流れが大河となり、最終的には大海となります！

<a href="https://github.com/visactor/vrender/graphs/contributors"><img src="https://contrib.rocks/image?repo=visactor/vrender" /></a>

# ライセンス

[MIT ライセンス](./LICENSE)
