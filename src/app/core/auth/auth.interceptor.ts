import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const auth = inject(AuthService);
    const router = inject(Router);

    const token = auth.token;

    // Attach the JWT only to your backend API.
    const isApiRequest =
        req.url.startsWith('http://localhost:5000/api/') ||
        req.url.startsWith('/api/');

    const isLoginRequest =
        req.url.includes('/api/auth/login');

    const request = isApiRequest && token
        ? req.clone({
            setHeaders: {
                Authorization: `Bearer ${token}`
            }
        })
        : req;

    return next(request).pipe(
        catchError(error => {
            if (
                error.status === 401 &&
                isApiRequest &&
                !isLoginRequest
            ) {
                auth.logout();
                void router.navigate(['/login']);
            }

            return throwError(() => error);
        })
    );
};