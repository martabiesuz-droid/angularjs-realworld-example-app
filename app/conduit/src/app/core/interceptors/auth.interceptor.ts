import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { JwtService } from '../services/jwt.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(JwtService).get();

  if (!token) {
    return next(req);
  }

  return next(
    req.clone({ setHeaders: { Authorization: `Token ${token}` } }),
  );
};
