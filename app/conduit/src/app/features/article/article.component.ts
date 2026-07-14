import {
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { DatePipe, NgTemplateOutlet } from '@angular/common';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin } from 'rxjs';

import { Article } from '../../core/models/article.model';
import { Comment } from '../../core/models/article.model';
import { Profile } from '../../core/models/profile.model';
import { ArticlesService } from '../../core/services/articles.service';
import { CommentsService } from '../../core/services/comments.service';
import { ProfileService } from '../../core/services/profile.service';
import { UserService } from '../../core/services/user.service';
import { FavoriteBtnComponent } from '../../shared/favorite-btn.component';
import { MarkedPipe } from '../../shared/marked.pipe';

@Component({
  selector: 'app-article',
  imports: [DatePipe, NgTemplateOutlet, ReactiveFormsModule, RouterLink, FavoriteBtnComponent, MarkedPipe],
  template: `
    @if (isLoading()) {
      <div class="article-page">
        <div class="banner"><div class="container"><p>Loading article...</p></div></div>
      </div>
    } @else if (article()) {
      <div class="article-page">

        <!-- Banner -->
        <div class="banner">
          <div class="container">
            <h1>{{ article()!.title }}</h1>
            <div class="article-meta">
              <ng-container *ngTemplateOutlet="authorMeta" />
            </div>
          </div>
        </div>

        <!-- Body -->
        <div class="container page">
          <div class="row article-content">
            <div class="col-md-12">
              <div [innerHTML]="article()!.body | marked"></div>
              <ul class="tag-list">
                @for (tag of article()!.tagList; track tag) {
                  <li class="tag-default tag-pill tag-outline">{{ tag }}</li>
                }
              </ul>
            </div>
          </div>

          <hr />

          <!-- Repeated article-meta below body -->
          <div class="article-actions">
            <div class="article-meta">
              <ng-container *ngTemplateOutlet="authorMeta" />
            </div>
          </div>

          <!-- Comments -->
          <div class="row">
            <div class="col-xs-12 col-md-8 offset-md-2">

              @if (userService.currentUser()) {
                <!-- Add comment form -->
                <form class="card comment-form" [formGroup]="commentForm" (ngSubmit)="addComment()">
                  <div class="card-block">
                    <textarea
                      class="form-control"
                      placeholder="Write a comment..."
                      rows="3"
                      formControlName="body">
                    </textarea>
                  </div>
                  <div class="card-footer">
                    @if (userService.currentUser()?.image) {
                      <img
                        [src]="userService.currentUser()!.image"
                        class="comment-author-img"
                        [alt]="userService.currentUser()!.username" />
                    }
                    <button
                      class="btn btn-sm btn-primary"
                      type="submit"
                      [disabled]="isSubmittingComment() || commentForm.invalid">
                      Post Comment
                    </button>
                  </div>
                </form>
              } @else {
                <p>
                  <a routerLink="/login">Sign in</a> or
                  <a routerLink="/register">sign up</a>
                  to add comments on this article.
                </p>
              }

              <!-- Comment list -->
              @for (comment of comments(); track comment.id) {
                <div class="card">
                  <div class="card-block">
                    <p class="card-text">{{ comment.body }}</p>
                  </div>
                  <div class="card-footer">
                    <a
                      [routerLink]="['/@' + comment.author.username]"
                      class="comment-author">
                      @if (comment.author.image) {
                        <img
                          [src]="comment.author.image"
                          class="comment-author-img"
                          [alt]="comment.author.username" />
                      }
                    </a>
                    &nbsp;
                    <a
                      [routerLink]="['/@' + comment.author.username]"
                      class="comment-author">
                      {{ comment.author.username }}
                    </a>
                    <span class="date-posted">
                      {{ comment.createdAt | date: 'longDate' }}
                    </span>
                    @if (userService.currentUser()?.username === comment.author.username) {
                      <span class="mod-options">
                        <i
                          class="ion-trash-a"
                          (click)="deleteComment(comment.id)"
                          role="button"
                          aria-label="Delete comment">
                        </i>
                      </span>
                    }
                  </div>
                </div>
              }

            </div>
          </div>
        </div>
      </div>
    } @else {
      <div class="article-page">
        <div class="banner"><div class="container"><p>Article not found.</p></div></div>
      </div>
    }

    <!-- Author meta template (reused in banner and article-actions) -->
    <ng-template #authorMeta>
      @if (article(); as art) {
        <a [routerLink]="['/@' + art.author.username]">
          @if (art.author.image) {
            <img [src]="art.author.image" [alt]="art.author.username" />
          }
        </a>
        <div class="info">
          <a class="author" [routerLink]="['/@' + art.author.username]">
            {{ art.author.username }}
          </a>
          <span class="date">{{ art.createdAt | date: 'longDate' }}</span>
        </div>

        @if (isOwner()) {
          <!-- Owner actions -->
          <a
            class="btn btn-sm btn-outline-secondary"
            [routerLink]="['/editor', art.slug]">
            <i class="ion-edit"></i> Edit Article
          </a>
          &nbsp;
          <button
            class="btn btn-sm btn-outline-danger"
            [disabled]="isDeleting()"
            (click)="deleteArticle()">
            <i class="ion-trash-a"></i> Delete Article
          </button>
        } @else {
          <!-- Visitor actions -->
          <button
            class="btn btn-sm"
            [class.btn-secondary]="author()?.following"
            [class.btn-outline-secondary]="!author()?.following"
            [disabled]="isSubmittingFollow()"
            (click)="toggleFollow()">
            <i class="ion-plus-round"></i>
            &nbsp;
            {{ author()?.following ? 'Unfollow' : 'Follow' }} {{ art.author.username }}
          </button>
          &nbsp;
          <app-favorite-btn [article]="art" (articleChange)="onArticleChange($event)">
            &nbsp;{{ art.favorited ? 'Unfavorite' : 'Favorite' }} Article
            <span class="counter">({{ art.favoritesCount }})</span>
          </app-favorite-btn>
        }
      }
    </ng-template>
  `,
})
export class ArticleComponent implements OnInit {
  private readonly articlesService = inject(ArticlesService);
  private readonly commentsService = inject(CommentsService);
  private readonly profileService = inject(ProfileService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  protected readonly userService = inject(UserService);

  /** Bound from route param :slug via withComponentInputBinding() */
  readonly slug = input.required<string>();

  protected readonly article = signal<Article | null>(null);
  protected readonly author = signal<Profile | null>(null);
  protected readonly comments = signal<Comment[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly isSubmittingComment = signal(false);
  protected readonly isSubmittingFollow = signal(false);
  protected readonly isDeleting = signal(false);

  protected readonly isOwner = computed(() => {
    const currentUser = this.userService.currentUser();
    const art = this.article();
    return !!currentUser && !!art && currentUser.username === art.author.username;
  });

  protected readonly commentForm = this.fb.nonNullable.group({
    body: ['', [Validators.required, Validators.minLength(1)]],
  });

  ngOnInit(): void {
    forkJoin({
      article: this.articlesService.get(this.slug()),
      comments: this.commentsService.getCommentsForArticle(this.slug()),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ article, comments }) => {
          this.article.set(article);
          this.author.set(article.author);
          this.comments.set(comments);
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
        },
      });
  }

  protected onArticleChange(updated: Article): void {
    this.article.set(updated);
  }

  protected toggleFollow(): void {
    const currentAuthor = this.author();
    if (!currentAuthor || this.isSubmittingFollow()) {
      return;
    }

    if (!this.userService.currentUser()) {
      this.router.navigate(['/register']);
      return;
    }

    this.isSubmittingFollow.set(true);
    const action$ = currentAuthor.following
      ? this.profileService.unfollow(currentAuthor.username)
      : this.profileService.follow(currentAuthor.username);

    action$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (updatedProfile) => {
        this.author.set(updatedProfile);
        this.isSubmittingFollow.set(false);
      },
      error: () => this.isSubmittingFollow.set(false),
    });
  }

  protected deleteArticle(): void {
    if (this.isDeleting()) {
      return;
    }
    this.isDeleting.set(true);
    this.articlesService
      .destroy(this.slug())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.router.navigateByUrl('/'),
        error: () => this.isDeleting.set(false),
      });
  }

  protected addComment(): void {
    if (this.commentForm.invalid || this.isSubmittingComment()) {
      return;
    }
    this.isSubmittingComment.set(true);
    const { body } = this.commentForm.getRawValue();

    this.commentsService
      .addCommentToArticle(this.slug(), body)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (comment) => {
          this.comments.update((list) => [comment, ...list]);
          this.commentForm.reset();
          this.isSubmittingComment.set(false);
        },
        error: () => this.isSubmittingComment.set(false),
      });
  }

  protected deleteComment(commentId: number): void {
    this.commentsService
      .deleteComment(this.slug(), commentId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.comments.update((list) =>
            list.filter((comment) => comment.id !== commentId),
          );
        },
      });
  }
}
