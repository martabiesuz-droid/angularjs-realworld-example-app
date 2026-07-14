import {
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { Profile } from '../../core/models/profile.model';
import { ProfileService } from '../../core/services/profile.service';
import { UserService } from '../../core/services/user.service';

@Component({
  selector: 'app-profile',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div class="profile-page">

      <div class="user-info">
        <div class="container">
          <div class="row">
            <div class="col-xs-12 col-md-10 offset-md-1">

              @if (isLoading()) {
                <p>Loading profile...</p>
              } @else if (profile(); as prof) {
                @if (prof.image) {
                  <img [src]="prof.image" class="user-img" [alt]="prof.username" />
                }
                <h4>{{ prof.username }}</h4>
                @if (prof.bio) {
                  <p>{{ prof.bio }}</p>
                }

                @if (isOwnProfile()) {
                  <a
                    class="btn btn-sm btn-outline-secondary action-btn"
                    routerLink="/settings">
                    <i class="ion-gear-a"></i>&nbsp;Edit Profile Settings
                  </a>
                } @else {
                  <button
                    class="btn btn-sm action-btn"
                    [class.btn-secondary]="prof.following"
                    [class.btn-outline-secondary]="!prof.following"
                    [disabled]="isSubmittingFollow()"
                    (click)="toggleFollow()">
                    <i class="ion-plus-round"></i>&nbsp;
                    {{ prof.following ? 'Unfollow' : 'Follow' }} {{ prof.username }}
                  </button>
                }
              }

            </div>
          </div>
        </div>
      </div>

      <div class="container">
        <div class="row">
          <div class="col-xs-12 col-md-10 offset-md-1">

            <!-- Tab navigation -->
            <div class="articles-toggle">
              <ul class="nav nav-pills outline-active">
                <li class="nav-item">
                  <a
                    class="nav-link"
                    [routerLink]="['/@' + username()]"
                    routerLinkActive="active"
                    [routerLinkActiveOptions]="{ exact: true }">
                    My Articles
                  </a>
                </li>
                <li class="nav-item">
                  <a
                    class="nav-link"
                    [routerLink]="['/@' + username(), 'favorites']"
                    routerLinkActive="active">
                    Favorited Articles
                  </a>
                </li>
              </ul>
            </div>

            <!-- Child route renders ProfileArticlesComponent -->
            <router-outlet />

          </div>
        </div>
      </div>

    </div>
  `,
})
export class ProfileComponent implements OnInit {
  private readonly profileService = inject(ProfileService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly userService = inject(UserService);

  /** Bound from route param :username via withComponentInputBinding(). */
  readonly username = input.required<string>();

  protected readonly profile = signal<Profile | null>(null);
  protected readonly isLoading = signal(true);
  protected readonly isSubmittingFollow = signal(false);

  protected readonly isOwnProfile = computed(
    () => this.userService.currentUser()?.username === this.profile()?.username,
  );

  ngOnInit(): void {
    this.profileService
      .get(this.username())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (profile) => {
          this.profile.set(profile);
          this.isLoading.set(false);
        },
        error: () => this.isLoading.set(false),
      });
  }

  protected toggleFollow(): void {
    const currentProfile = this.profile();
    if (!currentProfile || this.isSubmittingFollow()) {
      return;
    }

    this.isSubmittingFollow.set(true);
    const action$ = currentProfile.following
      ? this.profileService.unfollow(currentProfile.username)
      : this.profileService.follow(currentProfile.username);

    action$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (updatedProfile) => {
        this.profile.set(updatedProfile);
        this.isSubmittingFollow.set(false);
      },
      error: () => this.isSubmittingFollow.set(false),
    });
  }
}
