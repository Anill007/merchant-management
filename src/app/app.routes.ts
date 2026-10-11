import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'application-review',
        pathMatch: 'full'
    },
    {
        path: 'application-review',
        loadComponent: () => import('./features/shared/application-review/application-review')
            .then(m => m.ApplicationReview),
    },
    {
        path: '**',
        loadComponent: () => import('./features/shared/page-404/page-404')
            .then(m => m.Page404)
    }
];
