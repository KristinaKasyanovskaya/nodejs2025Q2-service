import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private readonly publicRoutes = [
    '/auth/signup',
    '/auth/login',
    '/auth/refresh',
    '/doc',
    '/',
  ];

  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const url = request.url.split('?')[0];

    if (this.isPublicRoute(url)) {
      return true;
    }

    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Access token is missing or invalid');
    }

    const token = authHeader.substring(7);

    try {
      const payload = this.jwtService.verify(token);
      request.user = payload;
      return true;
    } catch (error) {
      throw new UnauthorizedException('Access token is missing or invalid');
    }
  }

  private isPublicRoute(url: string): boolean {
    return this.publicRoutes.some((route) => {
      if (route === '/') {
        return url === '/' || url === '';
      }
      return url.startsWith(route);
    });
  }
}
