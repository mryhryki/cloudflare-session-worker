import { initSessionHandler } from '../src/index'

const sessionHandler = initSessionHandler({
  oidc: {
    clientId: '(TODO)',
    clientSecret: '(TODO)',
    baseDomain: '(TODO)',
  },
  secret: {
    signingKey: '(TODO)',
  },
  onRequestWithValidSession: async (request, user) => {
    return new Response(JSON.stringify(user, null, 2), {
      headers: {
        'Content-Type': 'text/plain',
      },
    })
  },
})

export default {
  async fetch(request, env, ctx): Promise<Response> {
    const { pathname } = new URL(request.url)
    if (pathname === "/health") {
      return new Response('OK', {
        headers: {
          'Content-Type': 'text/plain',
        },
      })
    }

    return await sessionHandler(request, env, ctx)
  },
} satisfies ExportedHandler<Env>
