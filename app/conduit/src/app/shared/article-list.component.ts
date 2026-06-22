import {
  Component,
  DestroyRef,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, switchMap, catchError, of } from 'rxjs';
import { Article, ArticleQueryConfig } from '../core/models/article.model';
import { ArticlesService } from '../core/services/articles.service';
import { ArticlePreviewComponent } from './article-preview.component';
import { ListPaginationComponent } from './list-pagination.component';

export interface ListConfig {
  type: 'all' | 'feed';
  filters?: { tag?: string; author?: string; favorited?: string };
}

@Component({
  selector: 'app-article-list',
  imports: [ArticlePreviewComponent, ListPaginationComponent],
  template: `
    @if (isLoading()) {
      <div class="article-preview">Loading articles...</div>
    } @else if (articles().length === 0) {
      <div class="article-preview">No articles are here... yet.</div>
    } @else {
      @for (article of articles(); track article.slug) {
        <app-article-preview
          [article]="article"
          (articleChange)="replaceArticle($event)" />
      }
      <app-list-pagination
        [totalPages]="totalPages()"
        [currentPage]="currentPage()"
        (pageChange)="onPageChange($event)" />
    }
  `,
})
export class ArticleListComponent {
  private readonly articlesService = inject(ArticlesService);
  private readonly destroyRef = inject(DestroyRef);

  readonly listConfig = input.required<ListConfig>();
  readonly limit = input(10);

  protected readonly currentPage = signal(1);
  protected readonly articles = signal<Article[]>([]);
  protected readonly articlesCount = signal(0);
  protected readonly isLoading = signal(false);
  protected readonly totalPages = computed(() =>
    Math.ceil(this.articlesCount() / this.limit()),
  );

  private readonly fetchTrigger = new Subject<ArticleQueryConfig>();

  constructor() {
    // Wire the trigger through switchMap so in-flight requests are cancelled.
    this.fetchTrigger
      .pipe(
        switchMap((config) => {
          this.isLoading.set(true);
          return this.articlesService.query(config).pipe(
            catchError(() => of({ articles: [], articlesCount: 0 })),
          );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(({ articles, articlesCount }) => {
        this.articles.set(articles);
        this.articlesCount.set(articlesCount);
        this.isLoading.set(false);
      });

    // Re-fetch whenever listConfig changes; reset to page 1.
    effect(() => {
      const config = this.listConfig();
      this.currentPage.set(1);
      this.triggerFetch(config, 1);
    });
  }

  protected onPageChange(page: number): void {
    this.currentPage.set(page);
    this.triggerFetch(this.listConfig(), page);
  }

  protected replaceArticle(updated: Article): void {
    this.articles.update((list) =>
      list.map((article) =>
        article.slug === updated.slug ? updated : article,
      ),
    );
  }

  private triggerFetch(config: ListConfig, page: number): void {
    const offset = this.limit() * (page - 1);
    this.fetchTrigger.next({
      type: config.type,
      filters: { ...config.filters, limit: this.limit(), offset },
    });
  }
}
