# CLAUDE.md

このファイルは、このリポジトリでコードを操作する際に Claude Code (claude.ai/code)に対するガイダンスを提供します。

## 開発コマンド

### 基本コマンド

- `npm run dev` - ポート 8080 で開発サーバーを起動
- `npm run build` - React Router アプリケーションのプロダクションビルドを実行
- `npm run build:mbt` - MoonBit ソースから WASM モジュールをビルド
- `npm run lint` - BiomeJS リンターを実行
- `npm run typecheck` - TypeScript 型チェックと React Router 型生成を実行
- `npm test` - Vitest テストを実行

### WASM ビルドプロセス

このプロジェクトは WASM 生成に MoonBit を使用しています。ビルドプロセス：

1. `moon build`で MoonBit ソースを WASM にコンパイル
2. 生成された WASM ファイルを`target/wasm-gc/release/build/app`から`app/wasm/`にコピー
3. WASM モジュールを React コンポーネントで動的にロード

## アーキテクチャ概要

### 技術スタック

- **フロントエンド**: React Router v7 (SPA モード), TypeScript, Tailwind CSS
- **WASM**: 32bit 整数や 32bit 浮動小数点数が必要な計算に MoonBit 言語を使用
- **ビルドツール**: Vite, BiomeJS (リント・フォーマット)
- **状態管理**: Jotai (グローバル状態), React Hook Form (フォーム)
- **ワーカー**: 重い計算処理に Web Workers + Comlink を使用

### プロジェクト構造

```
app/
├── components/     # 再利用可能なUIコンポーネント
├── domain/         # ビジネスロジック (LCGアルゴリズム、ゲーム機能)
├── hooks/          # カスタムReactフック
├── lib/            # ユーティリティライブラリ (タイマーなど)
├── routes/         # ファイルベースルーティング (React Router)
├── utilities/      # 汎用ユーティリティ
└── wasm/           # コンパイル済みWASMファイル

moonbit/
├── app/            # WASMアプリケーションモジュール
└── lib/            # 共有MoonBitライブラリ
```

### 主要パターン

#### WASM 統合

- `moonbit/`ディレクトリの MoonBit ソースから WASM モジュールをコンパイル
- コンテキストプロバイダーでの動的ロード (`app/routes/*/wasm/Context.tsx`を参照)
- UI ブロッキングを避けるため重い計算に Web Workers を使用

#### LCG (線形合同法)

- TypeScript (`app/domain/gc/lcg.ts`) と MoonBit (`moonbit/lib/lcg-gc/`) の両方で実装
- ポケモンのゲームの乱数をエミュレートする
- 高速な前進・巻き戻し操作のためのシードジャンプ機能

#### ルート構成

- ネストした構造でのファイルベースルーティング
  - セパレータは`.`
- ゲーム固有のルートは`gc.*`パターン (ゲームキューブゲーム)
- 実験的機能は`experimental.*`パターン
- 各主要機能は独自のルートディレクトリにコンポーネントとドメインロジックを配置
- URL に`CoSearchWASM`の prefix あり

#### ワーカー管理

- 制御されたワーカーライフサイクルのための`LazyLoadableWorker`クラス
- 依存性注入のためのコンテキストプロバイダー
- 型安全なワーカー通信に Comlink 使用

### ゲーム固有機能

このアプリケーションはポケモンゲームキューブゲーム（コロシアム、XD）に焦点を当てており、以下のツールを提供：

- RNG 操作とシード検索
- まばたきタイミング解析
- バトル仕組みシミュレーション
- スターターポケモン生成
- ポケスポット遭遇

### コードスタイル

#### 基本フォーマット

- **インデント**: 2 スペース (タブ不使用)
- **行幅**: JavaScript 100 文字、フォーマッター 120 文字
- **クォート**: 文字列にシングル、JSX にダブル
- **セミコロン**: `asNeeded` (ASI - 自動セミコロン挿入)
- **末尾カンマ**: `all` (配列・オブジェクトで常に使用)
- **アロー関数**: 単一パラメータでも括弧を常に使用

#### コンポーネントパターン

**コンポーネント宣言**:

```typescript
// 標準パターン: React.FC を明示的に型付け
export const ComponentName: React.FC<Props> = ({ prop1, prop2, ...rest }) => {
  return <div>...</div>;
};
```

**Props 型定義**:

```typescript
// パターン1: ネイティブコンポーネントの props を拡張
type Props = React.ComponentProps<"input"> & { label: string };

// パターン2: 専用の props オブジェクト
type Props = {
  className?: string;
  attributes: Attributes;
  pad?: number;
};
```

**デフォルトエクスポート** (ルート用):

```typescript
// React Router v7 の規約により、ルートファイルはデフォルトエクスポートが必須

// 基本構造: メインコンポーネントを名前付きで定義
const Page: React.FC = () => {
  const targetSeed = useLoaderData<typeof clientLoader>();
  return targetSeed == null ? (
    <PageDefault />
  ) : (
    <PageActivated targetSeed={targetSeed} />
  );
};

export default Page;
```

#### 関数スタイル

- **アロー関数を優先**: 通常の function 宣言は使用しない
- **オブジェクトメソッド**: アロー関数でメソッドライクプロパティを定義

```typescript
export const LCG = {
  from: (seed: number): LCG => (seed >>> 0) as LCG,
  getIndex: (lcg: LCG, from: LCG = 0 as LCG): number => {
    /* ... */
  },
};
```

#### 型定義パターン

**ブランド型**:

```typescript
// Branded<T, Name> は app/utilities/type.ts にグローバル定義済み
// どこでもimportなしでbranded typeを定義可能
export type LCG = Branded<number, "LCG">;
export type Timestamp = Branded<number, "Timestamp">;
export type UserId = Branded<string, "UserId">;
```

**関数型プログラミング式ユーティリティ**:

```typescript
// Ref<T> は状態を不変に操作するためのラッパー型
export type Ref<T> = {
  unwrap: () => T; // 値を取得
  update: <Args extends unknown[] = []>(
    f: (s: T, ...args: Args) => T,
    ...args: Args
  ) => T; // 状態更新
  apply: <U, Args extends unknown[] = []>(
    f: (s: T, ...args: Args) => [U, T],
    ...args: Args
  ) => U; // 計算実行
  map: <U, Args extends unknown[] = []>(
    f: (s: T, ...args: Args) => U,
    ...args: Args
  ) => U; // 値変換
};

// 使用例: const ref = Ref.from(initialState); ref.update(state => newState)
```

#### インポート/エクスポート

**インポート順序**:

1. React インポート
2. サードパーティライブラリ
3. パスエイリアスを使用したローカルインポート (`@/`, `@util/`, `@dotnet/`)

**エクスポート**:

- 名前付きエクスポートを優先
- デフォルトエクスポートはフレームワーク規約（React Router 等）以外では使用しない
- 個別インポートを推奨

#### エラーハンドリング

**基本方針**: 「予防重視・安全な失敗」アプローチ

- **型安全性**: TypeScript とブランド型で実行時エラーを防止
- **null リターンパターン**: 例外よりも `null` 返却を優先
- **Result 型**: 計算集約的な処理で関数型エラーハンドリング使用
- **早期リターン**: null チェックによる早期リターン
- **例外は開発時のみ**: 不正な使用方法に対してのみ例外をスロー

#### スタイリング

**Tailwind + cn ユーティリティ**:

```typescript
className={cn(
  'base-classes',
  conditionalClasses && 'conditional-classes',
  className, // props での上書き
)}
```

#### 命名規則

- **コンポーネント**: PascalCase (`LabeledInput`)
- **関数/変数**: camelCase (`handleSearch`)
- **型**: PascalCase (`Props`, `Individual`)
- **ファイル**:
  - **コンポーネント**: PascalCase (`LabeledInput.tsx`, `Container.tsx`)
  - **その他**: camelCase (`useSeedInput.tsx`, `lcg.ts`, `timer.ts`)
- **ルートディレクトリ**: React Router v7 の規約によりドット区切り (`gc.xd.starter`)  
  例: `gc.xd.starter/index.tsx` → `/CoSearchWASM/gc/xd/starter`

#### 制約事項

- **クラス使用禁止**: 関数型プログラミングスタイルを採用
- **function 宣言禁止**: アロー関数のみ使用
  - ただし、ジェネレータ関数は `function*` でしか書けないので `function*` で書く
