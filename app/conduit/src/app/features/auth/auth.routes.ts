import { Routes } from '@angular/router';
import { noAuthGuard } from '../../core/guards/no-auth.guard';
import { AuthComponent } from './auth.component';

export const AUTH_ROUTES: Routes = [
  {
    path: '',
    component: AuthComponent,
    canActivate: [noAuthGuard],
  },
];
