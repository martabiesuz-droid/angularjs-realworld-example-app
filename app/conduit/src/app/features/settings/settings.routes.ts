import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';
import { SettingsComponent } from './settings.component';

export const SETTINGS_ROUTES: Routes = [
  {
    path: '',
    component: SettingsComponent,
    canActivate: [authGuard],
    title: 'Settings — Conduit',
  },
];
