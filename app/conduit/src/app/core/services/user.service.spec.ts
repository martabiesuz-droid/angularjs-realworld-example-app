import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { UserService, AuthCredentials } from './user.service';
import { User } from '../models/user.model';
import { environment } from '../../../environments/environment';

describe('UserService', () => {
  let service: UserService;
  let httpTestingController: HttpTestingController;

  const mockUser: User = {
    email: 'test@example.com',
    username: 'testuser',
    bio: 'Test bio',
    image: 'test.jpg',
    token: 'test-jwt-token'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        UserService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(UserService);
    httpTestingController = TestBed.inject(HttpTestingController);
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('isAuthenticated', () => {
    it('should return false when no token in localStorage', () => {
      const result = service.isAuthenticated();
      
      expect(result).toBe(false);
    });

    it('should return true when token exists in localStorage', () => {
      localStorage.setItem(environment.jwtKey, 'some-token');
      
      const result = service.isAuthenticated();
      
      expect(result).toBe(true);
    });
  });

  describe('verifyAuth', () => {
    it('should emit null and not make HTTP request when no token stored', () => {
      let result: User | null | undefined;
      
      service.verifyAuth().subscribe(user => {
        result = user;
      });

      expect(result).toBe(null);
      httpTestingController.expectNone(`${environment.apiUrl}/user`);
    });

    it('should emit user and set currentUser when token exists and request succeeds', () => {
      localStorage.setItem(environment.jwtKey, 'test-token');
      let result: User | null | undefined;
      
      service.verifyAuth().subscribe(user => {
        result = user;
      });

      const req = httpTestingController.expectOne(`${environment.apiUrl}/user`);
      expect(req.request.method).toBe('GET');
      req.flush({ user: mockUser });

      expect(result).toEqual(mockUser);
      expect(service.currentUser()).toEqual(mockUser);
    });

    it('should emit null and clear token when request fails with 401', () => {
      localStorage.setItem(environment.jwtKey, 'test-token');
      let result: User | null | undefined;
      
      service.verifyAuth().subscribe(user => {
        result = user;
      });

      const req = httpTestingController.expectOne(`${environment.apiUrl}/user`);
      expect(req.request.method).toBe('GET');
      req.flush(null, { status: 401, statusText: 'Unauthorized' });

      expect(result).toBe(null);
      expect(localStorage.getItem(environment.jwtKey)).toBe(null);
    });
  });

  describe('setUser', () => {
    it('should save token to localStorage and set currentUser signal', () => {
      service.setUser(mockUser);

      expect(localStorage.getItem(environment.jwtKey)).toBe(mockUser.token);
      expect(service.currentUser()).toEqual(mockUser);
    });
  });

  describe('login', () => {
    it('should POST login credentials and set user on success', () => {
      const credentials: Pick<AuthCredentials, 'email' | 'password'> = {
        email: 'test@example.com',
        password: 'password123'
      };
      let result: User | undefined;

      service.login(credentials).subscribe(user => {
        result = user;
      });

      const req = httpTestingController.expectOne(`${environment.apiUrl}/users/login`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ user: credentials });
      req.flush({ user: mockUser });

      expect(result).toEqual(mockUser);
      expect(service.currentUser()).toEqual(mockUser);
      expect(localStorage.getItem(environment.jwtKey)).toBe(mockUser.token);
    });
  });

  describe('register', () => {
    it('should POST registration credentials and set user on success', () => {
      const credentials: Required<AuthCredentials> = {
        email: 'test@example.com',
        password: 'password123',
        username: 'testuser'
      };
      let result: User | undefined;

      service.register(credentials).subscribe(user => {
        result = user;
      });

      const req = httpTestingController.expectOne(`${environment.apiUrl}/users`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ user: credentials });
      req.flush({ user: mockUser });

      expect(result).toEqual(mockUser);
      expect(service.currentUser()).toEqual(mockUser);
      expect(localStorage.getItem(environment.jwtKey)).toBe(mockUser.token);
    });
  });

  describe('update', () => {
    it('should PUT user data and set user on success', () => {
      const updateData = {
        username: 'updateduser',
        bio: 'Updated bio'
      };
      const updatedUser: User = {
        ...mockUser,
        username: 'updateduser',
        bio: 'Updated bio'
      };
      let result: User | undefined;

      service.update(updateData).subscribe(user => {
        result = user;
      });

      const req = httpTestingController.expectOne(`${environment.apiUrl}/user`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual({ user: updateData });
      req.flush({ user: updatedUser });

      expect(result).toEqual(updatedUser);
      expect(service.currentUser()).toEqual(updatedUser);
      expect(localStorage.getItem(environment.jwtKey)).toBe(updatedUser.token);
    });
  });

  describe('clearUser', () => {
    it('should clear currentUser signal and localStorage token', () => {
      localStorage.setItem(environment.jwtKey, mockUser.token);
      service.currentUser.set(mockUser);

      service.clearUser();

      expect(service.currentUser()).toBe(null);
      expect(localStorage.getItem(environment.jwtKey)).toBe(null);
    });
  });
});