# Radix UI: `children` Propの型エラー回避策

## 概要

Radix UIの一部のコンポーネントで `children` propを使用すると、TypeScriptの型エラーが発生することがあります。これは、TypeScriptの型チェックが厳格になったことに起因します。

## 回避策：グローバルな型定義の拡張（Module Augmentation）

この問題は、TypeScriptの「モジュール拡張（Module Augmentation）」機能を利用して解決できます。

**手順の概要:**

1.  プロジェクト内に、グローバルな型定義ファイル（例: `radix.d.ts` や `global.d.ts`）を作成します。
2.  そのファイルの中で、対象となるRadix UIコンポーネントのモジュールを拡張し、コンポーネントのPropsインターフェースにReactの `PropsWithChildren` を継承させます。

**サンプルコード:**

以下は、`@radix-ui/react-radio-group` パッケージの `RadioGroupItem` コンポーネントに `children` propを追加する例です。

```typescript
// global.d.ts

import 'react'

declare module '@radix-ui/react-radio-group' {
  interface RadioGroupItemProps extends React.PropsWithChildren {}
}
```
