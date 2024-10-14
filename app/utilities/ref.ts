export type Ref<T> = {
  unwrap: () => T
  update: <Args extends unknown[] = []>(f: (s: T, ...args: Args) => T, ...args: Args) => T
  apply: <U, Args extends unknown[] = []>(f: (s: T, ...args: Args) => [U, T], ...args: Args) => U
}

export const Ref = {
  from: <T>(state: T): Ref<T> => {
    let _state = state

    return {
      unwrap: () => _state,
      update: (f, ...args) => {
        _state = f(_state, ...args)
        return _state
      },
      apply: (f, ...args) => {
        const [v, s] = f(_state, ...args)
        _state = s

        return v
      },
    }
  },
  clone: <T>(source: Ref<T>): Ref<T> => Ref.from(source.unwrap()),
}
