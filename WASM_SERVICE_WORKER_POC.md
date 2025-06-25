# WASM Service Worker PoC 設計書

## 概要

WASM 関数呼び出しを Service Worker 経由で WebAPI 風に実行する PoC。従来の複雑な WASM ロード処理を標準的な fetch() API に変換する。

## 解決する課題

- **UI ブロッキング**: 重い WASM 計算でメインスレッドが停止
- **複雑な WASM ロード**: ルート毎の個別実装とコールバック管理
- **統一性の欠如**: WASM 関数毎に異なるインターフェース

## アーキテクチャ変更

### 従来 → 新方式

```typescript
// 従来: 複雑なWASMモジュール管理
const { iterSmoke } = await wasmReturn;
const result = iterSmoke(seed, take);

// 新方式: WebAPI風インターフェース
import { iterSmoke } from "@/lib/wasm-api";
const result = await iterSmoke(seed, take);
```

### データフロー

```
React Component → fetch() → Service Worker → WASM Module → Response
```

## API 設計

```
POST /CoSearchWASM/wasm-api/iterSmoke
Content-Type: application/json

{ "seed": 123, "take": 10 }
```

### レスポンス形式

```json
[
  { "i": 0, "seed": 123 },
  { "i": 1, "seed": 456 }
]
```

## Service Worker上でのHono実行
- Service Worker内でHonoアプリケーションを起動
- Express風ルーティングによる複数WASM関数の統一管理
- ミドルウェアによる共通処理（エラーハンドリング、ログ等）
