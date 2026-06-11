import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(_context: ExecutionContext): boolean {
    // TODO: Replace with JWT/session admin checks when authentication is implemented.
    return true;
  }
}
