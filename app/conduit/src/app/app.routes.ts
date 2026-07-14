import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./features/home/home.routes').then((m) => m.HOME_ROUTES),
      },
      {
        path: 'login',
        loadChildren: () =>
          import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
        title: 'Sign in — Conduit',
      },
      {
        path: 'register',
        loadChildren: () =>
          import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
        title: 'Sign up — Conduit',
      },
      {
        path: 'article/:slug',
        loadChildren: () =>
          import('./features/article/article.routes').then(
            (m) => m.ARTICLE_ROUTES,
          ),
      },
      {
        path: 'editor',
        loadChildren: () =>
          import('./features/editor/editor.routes').then(
            (m) => m.EDITOR_ROUTES,
          ),
      },
      {
        path: 'settings',
        loadChildren: () =>
          import('./features/settings/settings.routes').then(
            (m) => m.SETTINGS_ROUTES,
          ),
      },
      {
        path: '@:username',
        loadChildren: () =>
          import('./features/profile/profile.routes').then(
            (m) => m.PROFILE_ROUTES,
          ),
      },
      { path: '**', redirectTo: '' },
    ],
  },
];
