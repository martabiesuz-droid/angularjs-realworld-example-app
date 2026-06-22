import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class JwtService {
  get(): string | null {
    return localStorage.getItem(environment.jwtKey);
  }

  save(token: string): void {
    localStorage.setItem(environment.jwtKey, token);
  }

  destroy(): void {
    localStorage.removeItem(environment.jwtKey);
  }
}
