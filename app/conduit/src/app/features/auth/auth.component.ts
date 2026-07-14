import { Component, inject, signal, computed, OnInit } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { UserService } from '../../core/services/user.service';
import { ListErrorsComponent } from '../../shared/list-errors.component';

@Component({
  selector: 'app-auth',
  imports: [ReactiveFormsModule, RouterLink, ListErrorsComponent],
  template: `
    <div class="auth-page">
      <div class="container page">
        <div class="row">
          <div class="col-md-6 offset-md-3 col-xs-12">

            <h1 class="text-xs-center">
              {{ isRegister() ? 'Sign up' : 'Sign in' }}
            </h1>

            <p class="text-xs-center">
              @if (isRegister()) {
                <a routerLink="/login">Have an account?</a>
              } @else {
                <a routerLink="/register">Need an account?</a>
              }
            </p>

            <app-list-errors [errors]="apiErrors()" />

            <form [formGroup]="form" (ngSubmit)="submit()">

              @if (isRegister()) {
                <fieldset class="form-group">
                  <input
                    class="form-control form-control-lg"
                    type="text"
                    placeholder="Your Name"
                    formControlName="username" />
                </fieldset>
              }

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
                  placeholder="Password"
                  formControlName="password" />
              </fieldset>

              <button
                class="btn btn-lg btn-primary pull-xs-right"
                type="submit"
                [disabled]="isSubmitting()">
                {{ isRegister() ? 'Sign up' : 'Sign in' }}
              </button>

            </form>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class AuthComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);

  protected readonly isRegister = signal(false);
  protected readonly isSubmitting = signal(false);
  protected readonly apiErrors = signal<Record<string, string[]> | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    username: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  ngOnInit(): void {
    this.isRegister.set(this.router.url.includes('/register'));
  }

  protected submit(): void {
    if (this.form.invalid || this.isSubmitting()) {
      return;
    }

    this.isSubmitting.set(true);
    this.apiErrors.set(null);

    const { username, email, password } = this.form.getRawValue();

    const request$ = this.isRegister()
      ? this.userService.register({ username, email, password })
      : this.userService.login({ email, password });

    request$.subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.router.navigateByUrl('/');
      },
      error: (err: HttpErrorResponse) => {
        this.isSubmitting.set(false);
        this.apiErrors.set(
          (err.error as { errors?: Record<string, string[]> })?.errors ?? {
            '': ['An unexpected error occurred. Please try again.'],
          },
        );
      },
    });
  }
}
