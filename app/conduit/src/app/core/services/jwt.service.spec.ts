import { TestBed } from '@angular/core/testing';
import { JwtService } from './jwt.service';
import { environment } from '../../../environments/environment';

describe('JwtService', () => {
  let service: JwtService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [JwtService],
    });
    service = TestBed.inject(JwtService);
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('get', () => {
    it('should return token when it exists in localStorage', () => {
      const testToken = 'test-jwt-token';
      localStorage.setItem(environment.jwtKey, testToken);
      
      const result = service.get();
      
      expect(result).toBe(testToken);
    });

    it('should return null when token does not exist in localStorage', () => {
      const result = service.get();
      
      expect(result).toBeNull();
    });
  });

  describe('save', () => {
    it('should save token to localStorage with correct key and value', () => {
      const testToken = 'test-jwt-token';
      
      service.save(testToken);
      
      expect(localStorage.getItem(environment.jwtKey)).toBe(testToken);
    });
  });

  describe('destroy', () => {
    it('should remove token from localStorage with correct key', () => {
      localStorage.setItem(environment.jwtKey, 'some-token');
      
      service.destroy();
      
      expect(localStorage.getItem(environment.jwtKey)).toBeNull();
    });
  });
});