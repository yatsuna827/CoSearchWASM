export const optimizedAsyncTimer = () => {
  const controller = new AbortController()
  const signal = controller.signal

  const run = async function* (): AsyncGenerator<number, void> {
    while (!signal.aborted) {
      const timestamp = await new Promise<number>((resolve) => {
        requestAnimationFrame(resolve)
      })

      if (signal.aborted) break
      yield timestamp
    }
  }

  const abort = () => controller.abort()

  return {
    run,
    abort,
  }
}
