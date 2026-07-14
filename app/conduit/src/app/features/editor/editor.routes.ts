import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';
import { EditorComponent } from './editor.component';

export const EDITOR_ROUTES: Routes = [
  {
    path: '',
    component: EditorComponent,
    canActivate: [authGuard],
    title: 'New Article — Conduit',
  },
  {
    path: ':slug',
    component: EditorComponent,
    canActivate: [authGuard],
    title: 'Edit Article — Conduit',
  },
];
