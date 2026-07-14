import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserService } from '../services/user.service';

/**
 * Protects routes that should only be accessible to unauthenticated users.
 * Redirects authenticated users to the home page.
 */
export const noAuthGuard: CanActivateFn = () => {
  const userService = inject(UserService);
  const router = inject(Router);

  if (!userService.isAuthenticated()) {
    return true;
  }

  return router.createUrlTree(['/']);
};
