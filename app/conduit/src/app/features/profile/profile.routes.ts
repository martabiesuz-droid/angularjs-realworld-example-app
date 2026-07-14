import { Routes } from '@angular/router';
import { ProfileComponent } from './profile.component';
import { ProfileArticlesComponent } from './profile-articles.component';

export const PROFILE_ROUTES: Routes = [
  {
    path: '',
    component: ProfileComponent,
    children: [
      { path: '', component: ProfileArticlesComponent, title: 'Profile — Conduit' },
      { path: 'favorites', component: ProfileArticlesComponent, title: 'Favorites — Conduit' },
    ],
  },
];
