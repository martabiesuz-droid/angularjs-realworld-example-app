import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User } from '../models/user.model';
import { JwtService } from './jwt.service';

export interface AuthCredentials {
  email: string;
  password: string;
  username?: string;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly jwtService = inject(JwtService);

  readonly currentUser = signal<User | null>(null);

  isAuthenticated(): boolean {
    return !!this.jwtService.get();
  }

  /**
   * Called once at app startup via provideAppInitializer.
   * If a JWT is stored, fetches the current user to populate the signal.
   */
  verifyAuth(): Observable<User | null> {
    if (!this.jwtService.get()) {
      return of(null);
    }

    return this.http.get<{ user: User }>(`${environment.apiUrl}/user`).pipe(
      tap(({ user }) => this.currentUser.set(user)),
      map(({ user }) => user),
      catchError(() => {
        this.jwtService.destroy();
        return of(null);
      }),
    );
  }

  setUser(user: User): void {
    this.jwtService.save(user.token);
    this.currentUser.set(user);
  }

  login(credentials: Pick<AuthCredentials, 'email' | 'password'>): Observable<User> {
    return this.http
      .post<{ user: User }>(`${environment.apiUrl}/users/login`, {
        user: credentials,
      })
      .pipe(
        map(({ user }) => user),
        tap((user) => this.setUser(user)),
      );
  }

  register(credentials: Required<AuthCredentials>): Observable<User> {
    return this.http
      .post<{ user: User }>(`${environment.apiUrl}/users`, {
        user: credentials,
      })
      .pipe(
        map(({ user }) => user),
        tap((user) => this.setUser(user)),
      );
  }

  update(
    data: Partial<Omit<User, 'token'>> & { password?: string },
  ): Observable<User> {
    return this.http
      .put<{ user: User }>(`${environment.apiUrl}/user`, { user: data })
      .pipe(
        map(({ user }) => user),
        tap((user) => this.setUser(user)),
      );
  }

  clearUser(): void {
    this.currentUser.set(null);
    this.jwtService.destroy();
  }
}
