import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Token de autenticación no proporcionado');
    }

    try {
      // Nota: En una implementación de producción real con NestJS, usarías:
      // const payload = await this.jwtService.verifyAsync(token, { secret: process.env.JWT_SECRET });
      // request['user'] = payload;
      
      // Simulación de payload básico para fines de arquitectura
      request['user'] = {
        sub: 'dummy-user-uuid-1234',
        email: 'admin@eps.gob.pe',
        rol: 'JEFE_PROCESO',
      };
    } catch {
      throw new UnauthorizedException('Token de autenticación inválido o expirado');
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
