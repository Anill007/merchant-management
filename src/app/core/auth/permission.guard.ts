import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const permissionGuard: CanActivateFn = route => {
    const auth = inject(AuthService);
    const router = inject(Router);

    const requiredPermissions =
        route.data['permissions'] as string[] | undefined;

    if (!auth.isAuthenticated) {
        return router.createUrlTree(['/login']);
    }

    if (
        !requiredPermissions ||
        auth.hasAllPermissions(requiredPermissions)
    ) {
        return true;
    }

    return router.createUrlTree(['/forbidden']);
};