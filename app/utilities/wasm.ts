export const moonbitImports = () => {
  // WASMから渡ってきた文字を溜めておいてflushで流す

  let buffer: number[] = []
  const flush = () => {
    if (buffer.length > 0) {
      console.log(new TextDecoder('utf-16').decode(new Uint16Array(buffer).valueOf()))
      buffer = []
    }
  }
  const print_char = (ch: number) => {
    if (ch === '\n'.charCodeAt(0)) {
      flush()
    } else if (ch === '\r'.charCodeAt(0)) {
      /* noop */
    } else {
      buffer.push(ch)
    }
  }

  return [{ spectest: { print_char } }, flush] as const
}
