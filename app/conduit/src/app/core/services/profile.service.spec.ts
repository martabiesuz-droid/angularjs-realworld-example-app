import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { ProfileService } from './profile.service';
import { Profile } from '../models/profile.model';
import { environment } from '../../../environments/environment';

describe('ProfileService', () => {
  let service: ProfileService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ProfileService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(ProfileService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('get', () => {
    it('should get profile by username', () => {
      const username = 'testuser';
      const mockProfile: Profile = {
        username: 'testuser',
        bio: 'Test bio',
        image: 'test.jpg',
        following: false
      };
      const mockResponse = { profile: mockProfile };
      let actualProfile: Profile | undefined;

      service.get(username).subscribe(profile => {
        actualProfile = profile;
      });

      const req = httpTestingController.expectOne(`${environment.apiUrl}/profiles/${username}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);

      expect(actualProfile).toEqual(mockProfile);
    });
  });

  describe('follow', () => {
    it('should follow a user', () => {
      const username = 'testuser';
      const mockProfile: Profile = {
        username: 'testuser',
        bio: 'Test bio',
        image: 'test.jpg',
        following: true
      };
      const mockResponse = { profile: mockProfile };
      let actualProfile: Profile | undefined;

      service.follow(username).subscribe(profile => {
        actualProfile = profile;
      });

      const req = httpTestingController.expectOne(`${environment.apiUrl}/profiles/${username}/follow`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({});
      req.flush(mockResponse);

      expect(actualProfile).toEqual(mockProfile);
    });
  });

  describe('unfollow', () => {
    it('should unfollow a user', () => {
      const username = 'testuser';
      const mockProfile: Profile = {
        username: 'testuser',
        bio: 'Test bio',
        image: 'test.jpg',
        following: false
      };
      const mockResponse = { profile: mockProfile };
      let actualProfile: Profile | undefined;

      service.unfollow(username).subscribe(profile => {
        actualProfile = profile;
      });

      const req = httpTestingController.expectOne(`${environment.apiUrl}/profiles/${username}/follow`);
      expect(req.request.method).toBe('DELETE');
      req.flush(mockResponse);

      expect(actualProfile).toEqual(mockProfile);
    });
  });
});