import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Article,
  ArticleListResponse,
  ArticleQueryConfig,
} from '../models/article.model';

@Injectable({ providedIn: 'root' })
export class ArticlesService {
  private readonly http = inject(HttpClient);

  query(config: ArticleQueryConfig): Observable<ArticleListResponse> {
    const path =
      config.type === 'feed' ? '/articles/feed' : '/articles';

    const rawFilters = config.filters ?? {};
    const defined = Object.fromEntries(
      Object.entries(rawFilters).filter(([, value]) => value !== undefined),
    ) as Record<string, string | number>;

    const params = new HttpParams({ fromObject: defined });

    return this.http.get<ArticleListResponse>(
      `${environment.apiUrl}${path}`,
      { params },
    );
  }

  get(slug: string): Observable<Article> {
    return this.http
      .get<{ article: Article }>(`${environment.apiUrl}/articles/${slug}`)
      .pipe(map(({ article }) => article));
  }

  save(article: Partial<Article> & { slug?: string }): Observable<Article> {
    if (article.slug) {
      const { slug, ...body } = article;
      return this.http
        .put<{ article: Article }>(
          `${environment.apiUrl}/articles/${slug}`,
          { article: body },
        )
        .pipe(map(({ article: updated }) => updated));
    }

    return this.http
      .post<{ article: Article }>(`${environment.apiUrl}/articles`, {
        article,
      })
      .pipe(map(({ article: created }) => created));
  }

  destroy(slug: string): Observable<void> {
    return this.http.delete<void>(
      `${environment.apiUrl}/articles/${slug}`,
    );
  }

  favorite(slug: string): Observable<Article> {
    return this.http
      .post<{ article: Article }>(
        `${environment.apiUrl}/articles/${slug}/favorite`,
        {},
      )
      .pipe(map(({ article }) => article));
  }

  unfavorite(slug: string): Observable<Article> {
    return this.http
      .delete<{ article: Article }>(
        `${environment.apiUrl}/articles/${slug}/favorite`,
      )
      .pipe(map(({ article }) => article));
  }
}
