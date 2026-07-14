import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { TagsService } from './tags.service';
import { environment } from '../../../environments/environment';

describe('TagsService', () => {
  let service: TagsService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        TagsService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(TagsService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAll', () => {
    it('should return tags array from API', () => {
      const mockResponse = { tags: ['foo', 'bar'] };
      let actualTags: string[] | undefined;

      service.getAll().subscribe(tags => {
        actualTags = tags;
      });

      const req = httpTestingController.expectOne(`${environment.apiUrl}/tags`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);

      expect(actualTags).toEqual(['foo', 'bar']);
    });
  });
});