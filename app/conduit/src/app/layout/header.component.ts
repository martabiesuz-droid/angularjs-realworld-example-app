import { Component, inject } from '@angular/core';
import { LowerCasePipe } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { environment } from '../../environments/environment';
import { UserService } from '../core/services/user.service';

@Component({
  selector: 'app-header',
  imports: [LowerCasePipe, RouterLink, RouterLinkActive],
  template: `
    <nav class="navbar navbar-light">
      <div class="container">
        <a class="navbar-brand" routerLink="/">{{ appName | lowercase }}</a>

        @if (userService.currentUser(); as user) {
          <!-- Logged-in nav -->
          <ul class="nav navbar-nav pull-xs-right">
            <li class="nav-item">
              <a class="nav-link" routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">Home</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" routerLink="/editor" routerLinkActive="active">
                <i class="ion-compose"></i>&nbsp;New Article
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link" routerLink="/settings" routerLinkActive="active">
                <i class="ion-gear-a"></i>&nbsp;Settings
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link" [routerLink]="['/@' + user.username]" routerLinkActive="active">
                @if (user.image) {
                  <img [src]="user.image" class="user-pic" [alt]="user.username" />
                }
                {{ user.username }}
              </a>
            </li>
          </ul>
        } @else {
          <!-- Guest nav -->
          <ul class="nav navbar-nav pull-xs-right">
            <li class="nav-item">
              <a class="nav-link" routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">Home</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" routerLink="/login" routerLinkActive="active">Sign in</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" routerLink="/register" routerLinkActive="active">Sign up</a>
            </li>
          </ul>
        }
      </div>
    </nav>
  `,
})
export class HeaderComponent {
  protected readonly userService = inject(UserService);
  protected readonly appName = environment.appName;
}
