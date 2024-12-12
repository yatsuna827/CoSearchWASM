import { renderToString } from 'react-dom/server'
import type { AppLoadContext, EntryContext } from 'react-router'
import { ServerRouter } from 'react-router'

export default function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext,
  loadContext: AppLoadContext,
) {
  let html = renderToString(<ServerRouter context={remixContext} url={request.url} />)
  html = `<!DOCTYPE html>\n${html}`
  return new Response(html, {
    headers: { 'Content-Type': 'text/html' },
    status: responseStatusCode,
  })
}
