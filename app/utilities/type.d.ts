declare const __TAG: unique symbol

// Branded typeの実装で、Branded typeのサブタイピングが出来る種類のやつ
type Branded<T, Name extends string> = T & { [key in `__${Name}`]: typeof __TAG }
