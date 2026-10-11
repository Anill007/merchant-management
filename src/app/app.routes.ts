import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'application-review',
        pathMatch: 'full'
    },
    {
        path: 'login',
        loadComponent: () => import('./features/shared/login/login')
            .then(m => m.Login),
    },
    {
        path: 'application-review',
        canActivate: [authGuard],
        loadComponent: () => import('./features/shared/application-review/application-review')
            .then(m => m.ApplicationReview),
    },
    {
        path: '**',
        loadComponent: () => import('./features/shared/page-404/page-404')
            .then(m => m.Page404)
    }
];
