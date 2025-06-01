export type SessionHandler = (request: Request, env: Env, ctx: ExecutionContext) => Promise<Response>

export interface InitSessionHandlerArgs {
  oidc: {
    clientId: string
    clientSecret: string
    baseDomain: string
  },
  secret: {
    signingKey: string
  }
  onRequestWithValidSession: (
    request: Request,
    env: Env,
    ctx: ExecutionContext,
    user: unknown, /* TODO */
  ) => Promise<Response>
}

export const initSessionHandler = (args: InitSessionHandlerArgs): SessionHandler => {
  const { onRequestWithValidSession} = args

  // TODO

  const user: unknown = {}; // TODO

  return async (request, env, ctx) => {

    // TODO

    return onRequestWithValidSession(request, env, ctx, user)
  }
}
