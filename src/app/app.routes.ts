import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: 'sign-in',
        loadComponent: () => import('./features/auth/sign-in/sign-in').then(m => m.SignIn),
    },
    {
        path: '',
        redirectTo: 'sign-in',
        pathMatch: 'full',
    },
    {
        path: '**',
        redirectTo: 'sign-in',
    },
];
