export type Result<T, E> = readonly [T, null] | readonly [null, E]
export const ok = <T>(v: T) => [v, null] as const
export const err = <E>(e: E) => [null, e] as const
