import type { Handler } from 'hono'

export const handleError: Handler = async (c, next) => {
  try {
    await next()
  } catch (error: unknown) {
    const res = {
      name: error instanceof Error ? error.name : 'Error',
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    }
    return c.json(res, 500)
  }
}
