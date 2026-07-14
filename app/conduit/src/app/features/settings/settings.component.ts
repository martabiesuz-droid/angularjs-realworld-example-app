import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { UserService } from '../../core/services/user.service';
import { ListErrorsComponent } from '../../shared/list-errors.component';

@Component({
  selector: 'app-settings',
  imports: [ReactiveFormsModule, ListErrorsComponent],
  template: `
    <div class="settings-page">
      <div class="container page">
        <div class="row">
          <div class="col-md-6 offset-md-3 col-xs-12">

            <h1 class="text-xs-center">Your Settings</h1>

            <app-list-errors [errors]="errors()" />

            @if (saved()) {
              <p class="text-xs-center text-success">
                ✓ Settings saved successfully.
              </p>
            }

            <form [formGroup]="settingsForm" (ngSubmit)="submit()">
              <fieldset [disabled]="isSubmitting()">

                <fieldset class="form-group">
                  <input
                    class="form-control"
                    type="url"
                    placeholder="URL of profile picture"
                    formControlName="image" />
                </fieldset>

                <fieldset class="form-group">
                  <input
                    class="form-control form-control-lg"
                    type="text"
                    placeholder="Your Name"
                    formControlName="username" />
                </fieldset>

                <fieldset class="form-group">
                  <textarea
                    class="form-control form-control-lg"
                    rows="8"
                    placeholder="Short bio about you"
                    formControlName="bio">
                  </textarea>
                </fieldset>

                <fieldset class="form-group">
                  <input
                    class="form-control form-control-lg"
                    type="email"
                    placeholder="Email"
                    formControlName="email" />
                </fieldset>

                <fieldset class="form-group">
                  <input
                    class="form-control form-control-lg"
                    type="password"
                    placeholder="New Password (leave blank to keep current)"
                    formControlName="password" />
                </fieldset>

                <button
                  class="btn btn-lg btn-primary pull-xs-right"
                  type="submit"
                  [disabled]="isSubmitting() || settingsForm.invalid">
                  Update Settings
                </button>

              </fieldset>
            </form>

            <hr />

            <button class="btn btn-outline-danger" type="button" (click)="logout()">
              Or click here to logout.
            </button>

          </div>
        </div>
      </div>
    </div>
  `,
})
export class SettingsComponent implements OnInit {
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(FormBuilder);

  protected readonly isSubmitting = signal(false);
  protected readonly errors = signal<Record<string, string[]> | null>(null);
  protected readonly saved = signal(false);

  protected readonly settingsForm = this.fb.nonNullable.group({
    image: [''],
    username: ['', [Validators.required]],
    bio: [''],
    email: ['', [Validators.required, Validators.email]],
    password: [''],
  });

  ngOnInit(): void {
    const user = this.userService.currentUser();
    if (user) {
      this.settingsForm.patchValue({
        image: user.image ?? '',
        username: user.username,
        bio: user.bio ?? '',
        email: user.email,
      });
    }
  }

  protected submit(): void {
    if (this.settingsForm.invalid || this.isSubmitting()) {
      return;
    }

    this.isSubmitting.set(true);
    this.errors.set(null);
    this.saved.set(false);

    const { image, username, bio, email, password } = this.settingsForm.getRawValue();

    // Only include password in the payload when the field is non-empty.
    const payload: Parameters<typeof this.userService.update>[0] = {
      image: image || null,
      username,
      bio: bio || null,
      email,
      ...(password.trim() ? { password } : {}),
    };

    this.userService
      .update(payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.saved.set(true);
          this.isSubmitting.set(false);
          // Clear the password field after a successful save.
          this.settingsForm.patchValue({ password: '' });
        },
        error: (err) => {
          this.errors.set(err?.error?.errors ?? { '': ['An unexpected error occurred.'] });
          this.isSubmitting.set(false);
        },
      });
  }

  protected logout(): void {
    this.userService.clearUser();
    this.router.navigateByUrl('/');
  }
}
