import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Comment } from '../models/article.model';

@Injectable({ providedIn: 'root' })
export class CommentsService {
  private readonly http = inject(HttpClient);

  getCommentsForArticle(slug: string): Observable<Comment[]> {
    return this.http
      .get<{ comments: Comment[] }>(
        `${environment.apiUrl}/articles/${slug}/comments`,
      )
      .pipe(map(({ comments }) => comments));
  }

  addCommentToArticle(slug: string, body: string): Observable<Comment> {
    return this.http
      .post<{ comment: Comment }>(
        `${environment.apiUrl}/articles/${slug}/comments`,
        { comment: { body } },
      )
      .pipe(map(({ comment }) => comment));
  }

  deleteComment(slug: string, commentId: number): Observable<void> {
    return this.http.delete<void>(
      `${environment.apiUrl}/articles/${slug}/comments/${commentId}`,
    );
  }
}
