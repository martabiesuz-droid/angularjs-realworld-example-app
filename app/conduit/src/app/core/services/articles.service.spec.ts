import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { ArticlesService } from './articles.service';
import { Article, ArticleListResponse } from '../models/article.model';
import { environment } from '../../../environments/environment';

describe('ArticlesService', () => {
  let service: ArticlesService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ArticlesService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(ArticlesService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('query', () => {
    it('should make GET request to /articles/feed when type is feed', () => {
      const config = { type: 'feed' as const };
      const mockResponse: ArticleListResponse = {
        articles: [],
        articlesCount: 0
      };
      let actualResponse: ArticleListResponse | undefined;

      service.query(config).subscribe(response => {
        actualResponse = response;
      });

      const req = httpTestingController.expectOne(`${environment.apiUrl}/articles/feed`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);

      expect(actualResponse).toEqual(mockResponse);
    });

    it('should make GET request to /articles when type is not feed', () => {
      const config = { type: 'all' as const };
      const mockResponse: ArticleListResponse = {
        articles: [],
        articlesCount: 0
      };
      let actualResponse: ArticleListResponse | undefined;

      service.query(config).subscribe(response => {
        actualResponse = response;
      });

      const req = httpTestingController.expectOne(`${environment.apiUrl}/articles`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);

      expect(actualResponse).toEqual(mockResponse);
    });

    it('should not include undefined filters in query params', () => {
      const config = {
        type: 'all' as const,
        filters: {
          tag: 'angular',
          author: undefined,
          limit: 10
        }
      };
      const mockResponse: ArticleListResponse = {
        articles: [],
        articlesCount: 0
      };

      service.query(config).subscribe();

      const req = httpTestingController.expectOne(`${environment.apiUrl}/articles?tag=angular&limit=10`);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.has('author')).toBe(false);
      req.flush(mockResponse);
    });
  });

  describe('get', () => {
    it('should get article by slug and unwrap response', () => {
      const slug = 'test-article';
      const mockArticle: Article = {
        slug: 'test-article',
        title: 'Test Article',
        description: 'Test Description',
        body: 'Test Body',
        tagList: ['test'],
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z',
        favorited: false,
        favoritesCount: 0,
        author: {
          username: 'testuser',
          bio: null,
          image: null,
          following: false
        }
      };
      const mockResponse = { article: mockArticle };
      let actualArticle: Article | undefined;

      service.get(slug).subscribe(article => {
        actualArticle = article;
      });

      const req = httpTestingController.expectOne(`${environment.apiUrl}/articles/${slug}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);

      expect(actualArticle).toEqual(mockArticle);
    });
  });

  describe('save', () => {
    it('should PUT article with slug and unwrap response', () => {
      const articleWithSlug = {
        slug: 'test-article',
        title: 'Updated Title',
        description: 'Updated Description',
        body: 'Updated Body',
        tagList: ['updated']
      };
      const mockUpdatedArticle: Article = {
        slug: 'test-article',
        title: 'Updated Title',
        description: 'Updated Description',
        body: 'Updated Body',
        tagList: ['updated'],
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z',
        favorited: false,
        favoritesCount: 0,
        author: {
          username: 'testuser',
          bio: null,
          image: null,
          following: false
        }
      };
      const mockResponse = { article: mockUpdatedArticle };
      let actualArticle: Article | undefined;

      service.save(articleWithSlug).subscribe(article => {
        actualArticle = article;
      });

      const req = httpTestingController.expectOne(`${environment.apiUrl}/articles/test-article`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual({ article: { title: 'Updated Title', description: 'Updated Description', body: 'Updated Body', tagList: ['updated'] } });
      expect('slug' in req.request.body.article).toBe(false);
      req.flush(mockResponse);

      expect(actualArticle).toEqual(mockUpdatedArticle);
    });

    it('should POST article without slug and unwrap response', () => {
      const newArticle = {
        title: 'New Title',
        description: 'New Description',
        body: 'New Body',
        tagList: ['new']
      };
      const mockCreatedArticle: Article = {
        slug: 'new-article',
        title: 'New Title',
        description: 'New Description',
        body: 'New Body',
        tagList: ['new'],
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z',
        favorited: false,
        favoritesCount: 0,
        author: {
          username: 'testuser',
          bio: null,
          image: null,
          following: false
        }
      };
      const mockResponse = { article: mockCreatedArticle };
      let actualArticle: Article | undefined;

      service.save(newArticle).subscribe(article => {
        actualArticle = article;
      });

      const req = httpTestingController.expectOne(`${environment.apiUrl}/articles`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ article: newArticle });
      req.flush(mockResponse);

      expect(actualArticle).toEqual(mockCreatedArticle);
    });
  });

  describe('destroy', () => {
    it('should DELETE article by slug', () => {
      const slug = 'test-article';
      let deleteCompleted = false;

      service.destroy(slug).subscribe(() => {
        deleteCompleted = true;
      });

      const req = httpTestingController.expectOne(`${environment.apiUrl}/articles/${slug}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);

      expect(deleteCompleted).toBe(true);
    });
  });

  describe('favorite', () => {
    it('should POST favorite and unwrap response', () => {
      const slug = 'test-article';
      const mockArticle: Article = {
        slug: 'test-article',
        title: 'Test Article',
        description: 'Test Description',
        body: 'Test Body',
        tagList: ['test'],
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z',
        favorited: true,
        favoritesCount: 1,
        author: {
          username: 'testuser',
          bio: null,
          image: null,
          following: false
        }
      };
      const mockResponse = { article: mockArticle };
      let actualArticle: Article | undefined;

      service.favorite(slug).subscribe(article => {
        actualArticle = article;
      });

      const req = httpTestingController.expectOne(`${environment.apiUrl}/articles/${slug}/favorite`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({});
      req.flush(mockResponse);

      expect(actualArticle).toEqual(mockArticle);
    });
  });

  describe('unfavorite', () => {
    it('should DELETE unfavorite and unwrap response', () => {
      const slug = 'test-article';
      const mockArticle: Article = {
        slug: 'test-article',
        title: 'Test Article',
        description: 'Test Description',
        body: 'Test Body',
        tagList: ['test'],
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z',
        favorited: false,
        favoritesCount: 0,
        author: {
          username: 'testuser',
          bio: null,
          image: null,
          following: false
        }
      };
      const mockResponse = { article: mockArticle };
      let actualArticle: Article | undefined;

      service.unfavorite(slug).subscribe(article => {
        actualArticle = article;
      });

      const req = httpTestingController.expectOne(`${environment.apiUrl}/articles/${slug}/favorite`);
      expect(req.request.method).toBe('DELETE');
      req.flush(mockResponse);

      expect(actualArticle).toEqual(mockArticle);
    });
  });
});