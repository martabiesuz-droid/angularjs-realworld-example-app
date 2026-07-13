import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { provideRouter } from '@angular/router';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { noAuthGuard } from './no-auth.guard';
import { UserService } from '../services/user.service';
import { environment } from '../../../environments/environment';

describe('noAuthGuard', () => {
  let userService: UserService;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    });
    userService = TestBed.inject(UserService);
    router = TestBed.inject(Router);
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should return true when no token exists in localStorage', () => {
    const result = TestBed.runInInjectionContext(() => 
      noAuthGuard({} as any, {} as any)
    );

    expect(result).toBe(true);
  });

  it('should return UrlTree to / when token exists in localStorage', () => {
    localStorage.setItem(environment.jwtKey, 'valid-token');

    const result = TestBed.runInInjectionContext(() => 
      noAuthGuard({} as any, {} as any)
    );

    expect(result).not.toBe(true);
    expect(router.serializeUrl(result as any)).toBe('/');
  });
});