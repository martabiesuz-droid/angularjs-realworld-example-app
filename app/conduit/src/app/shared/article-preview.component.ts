import { Component, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Article } from '../core/models/article.model';
import { FavoriteBtnComponent } from './favorite-btn.component';

@Component({
  selector: 'app-article-preview',
  imports: [DatePipe, RouterLink, FavoriteBtnComponent],
  template: `
    <div class="article-preview">
      <div class="article-meta">
        <a [routerLink]="['/@' + article().author.username]">
          <img [src]="article().author.image ?? ''" [alt]="article().author.username" />
        </a>
        <div class="info">
          <a class="author" [routerLink]="['/@' + article().author.username]">
            {{ article().author.username }}
          </a>
          <span class="date">{{ article().createdAt | date: 'longDate' }}</span>
        </div>
        <app-favorite-btn
          class="pull-xs-right"
          [article]="article()"
          (articleChange)="articleChange.emit($event)">
          {{ article().favoritesCount }}
        </app-favorite-btn>
      </div>

      <a [routerLink]="['/article', article().slug]" class="preview-link">
        <h1>{{ article().title }}</h1>
        <p>{{ article().description }}</p>
        <span>Read more...</span>
        <ul class="tag-list">
          @for (tag of article().tagList; track tag) {
            <li class="tag-default tag-pill tag-outline">{{ tag }}</li>
          }
        </ul>
      </a>
    </div>
  `,
})
export class ArticlePreviewComponent {
  readonly article = input.required<Article>();
  readonly articleChange = output<Article>();
}
