import { Component, inject, input, output, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Article } from '../core/models/article.model';
import { ArticlesService } from '../core/services/articles.service';
import { UserService } from '../core/services/user.service';

@Component({
  selector: 'app-favorite-btn',
  template: `
    <button
      class="btn btn-sm"
      [class.btn-primary]="article().favorited"
      [class.btn-outline-primary]="!article().favorited"
      [disabled]="isSubmitting()"
      (click)="toggle()">
      <i class="ion-heart"></i>
      <ng-content />
    </button>
  `,
})
export class FavoriteBtnComponent {
  private readonly articlesService = inject(ArticlesService);
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);

  readonly article = input.required<Article>();
  readonly articleChange = output<Article>();

  protected readonly isSubmitting = signal(false);

  protected toggle(): void {
    if (!this.userService.currentUser()) {
      this.router.navigate(['/register']);
      return;
    }

    this.isSubmitting.set(true);
    const { slug, favorited } = this.article();
    const action$ = favorited
      ? this.articlesService.unfavorite(slug)
      : this.articlesService.favorite(slug);

    action$.subscribe({
      next: (updated) => {
        this.isSubmitting.set(false);
        this.articleChange.emit(updated);
      },
      error: () => this.isSubmitting.set(false),
    });
  }
}
