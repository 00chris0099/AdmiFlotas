import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolUsuario } from '../../../../generated/prisma';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<RolUsuario[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true; // Si no hay roles requeridos, se permite el acceso libre
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      throw new ForbiddenException('Usuario no autenticado o no encontrado en el contexto');
    }

    const tieneRol = requiredRoles.includes(user.rol);
    if (!tieneRol) {
      throw new ForbiddenException(`Su rol '${user.rol}' no tiene permisos para acceder a este recurso`);
    }

    return true;
  }
}
