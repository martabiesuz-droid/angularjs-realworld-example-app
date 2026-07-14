import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { CommentsService } from './comments.service';
import { Comment } from '../models/article.model';
import { environment } from '../../../environments/environment';

describe('CommentsService', () => {
  let service: CommentsService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        CommentsService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(CommentsService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getCommentsForArticle', () => {
    it('should get comments for an article', () => {
      const slug = 'test-article';
      const mockComments: Comment[] = [
        {
          id: 1,
          createdAt: '2023-01-01T00:00:00.000Z',
          updatedAt: '2023-01-01T00:00:00.000Z',
          body: 'Test comment',
          author: {
            username: 'testuser',
            bio: null,
            image: null,
            following: false
          }
        }
      ];
      const mockResponse = { comments: mockComments };
      let actualComments: Comment[] | undefined;

      service.getCommentsForArticle(slug).subscribe(comments => {
        actualComments = comments;
      });

      const req = httpTestingController.expectOne(`${environment.apiUrl}/articles/${slug}/comments`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);

      expect(actualComments).toEqual(mockComments);
    });
  });

  describe('addCommentToArticle', () => {
    it('should add comment to an article', () => {
      const slug = 'test-article';
      const body = 'New comment';
      const mockComment: Comment = {
        id: 2,
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z',
        body: 'New comment',
        author: {
          username: 'testuser',
          bio: null,
          image: null,
          following: false
        }
      };
      const mockResponse = { comment: mockComment };
      let actualComment: Comment | undefined;

      service.addCommentToArticle(slug, body).subscribe(comment => {
        actualComment = comment;
      });

      const req = httpTestingController.expectOne(`${environment.apiUrl}/articles/${slug}/comments`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ comment: { body } });
      req.flush(mockResponse);

      expect(actualComment).toEqual(mockComment);
    });
  });

  describe('deleteComment', () => {
    it('should delete a comment', () => {
      const slug = 'test-article';
      const commentId = 123;
      let deleteCompleted = false;

      service.deleteComment(slug, commentId).subscribe(() => {
        deleteCompleted = true;
      });

      const req = httpTestingController.expectOne(`${environment.apiUrl}/articles/${slug}/comments/${commentId}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);

      expect(deleteCompleted).toBe(true);
    });
  });
});