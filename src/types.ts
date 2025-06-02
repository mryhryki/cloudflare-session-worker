export type RequestHandler<T = undefined> = (
  request: Request,
  env: Env,
  ctx: ExecutionContext,
  Args: T,
) => Promise<Response>;
