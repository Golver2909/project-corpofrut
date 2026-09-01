import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface CurrentUser {
  id: string;
  role: string;
}

export const GetUser = createParamDecorator((_data: unknown, ctx: ExecutionContext): CurrentUser => {
  const request = ctx.switchToHttp().getRequest();
  return {
    id: request.headers['x-user-id'],
    role: request.headers['x-user-role'],
  };
});