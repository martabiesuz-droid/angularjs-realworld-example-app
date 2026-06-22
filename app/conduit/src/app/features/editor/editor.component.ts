import {
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime } from 'rxjs';

import { ArticlesService } from '../../core/services/articles.service';
import { DraftService, ArticleDraft } from '../../core/services/draft.service';
import { ListErrorsComponent } from '../../shared/list-errors.component';

@Component({
  selector: 'app-editor',
  imports: [ReactiveFormsModule, ListErrorsComponent],
  template: `
    <div class="editor-page">
      <div class="container page">
        <div class="row">
          <div class="col-md-10 offset-md-1 col-xs-12">

            <!-- Draft restore banner -->
            @if (showDraftBanner()) {
              <div class="draft-banner">
                <span class="draft-banner__message">
                  <i class="ion-document-text"></i>
                  You have an unsaved draft
                  @if (draftSavedAt()) {
                    <span class="draft-banner__time"> (saved at {{ draftSavedAt() }})</span>
                  }
                  . Do you want to continue where you left off?
                </span>
                <div class="draft-banner__actions">
                  <button class="btn btn-sm btn-outline-success" type="button" (click)="restoreDraft()">
                    Restore draft
                  </button>
                  <button class="btn btn-sm btn-outline-secondary" type="button" (click)="discardDraft()">
                    Discard
                  </button>
                </div>
              </div>
            }

            <app-list-errors [errors]="errors()" />

            <form [formGroup]="articleForm" (ngSubmit)="submit()">
              <fieldset [disabled]="isSubmitting()">

                <fieldset class="form-group">
                  <input
                    class="form-control form-control-lg"
                    type="text"
                    placeholder="Article Title"
                    formControlName="title" />
                </fieldset>

                <fieldset class="form-group">
                  <input
                    class="form-control"
                    type="text"
                    placeholder="What's this article about?"
                    formControlName="description" />
                </fieldset>

                <fieldset class="form-group">
                  <textarea
                    class="form-control"
                    rows="8"
                    placeholder="Write your article (in markdown)"
                    formControlName="body">
                  </textarea>
                </fieldset>

                <fieldset class="form-group">
                  <input
                    class="form-control"
                    type="text"
                    placeholder="Enter tags"
                    [formControl]="tagInputControl"
                    (keydown.enter)="onTagInputEnter($event)" />
                  <div class="tag-list">
                    @for (tag of tags(); track tag) {
                      <span class="tag-pill tag-default">
                        <i
                          class="ion-close-circled"
                          (click)="removeTag(tag)"
                          role="button"
                          [attr.aria-label]="'Remove tag ' + tag">
                        </i>
                        {{ tag }}
                      </span>
                    }
                  </div>
                </fieldset>

                <button
                  class="btn btn-lg pull-xs-right btn-primary"
                  type="submit"
                  [disabled]="isSubmitting() || articleForm.invalid">
                  {{ isEditMode() ? 'Update Article' : 'Publish Article' }}
                </button>

              </fieldset>
            </form>

          </div>
        </div>
      </div>
    </div>
  `,
})
export class EditorComponent implements OnInit {
  private readonly articlesService = inject(ArticlesService);
  private readonly draftService = inject(DraftService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(FormBuilder);

  /** Present only in edit mode (/editor/:slug). Bound via withComponentInputBinding(). */
  readonly slug = input<string | undefined>(undefined);

  protected readonly isEditMode = computed(() => !!this.slug());

  protected readonly tags = signal<string[]>([]);
  protected readonly isSubmitting = signal(false);
  protected readonly errors = signal<Record<string, string[]> | null>(null);

  protected readonly showDraftBanner = signal(false);
  protected readonly draftSavedAt = signal<string | null>(null);

  /** Holds the loaded draft until the user decides to restore or discard it. */
  private pendingDraft: ArticleDraft | null = null;

  protected readonly articleForm = this.fb.nonNullable.group({
    title: ['', [Validators.required]],
    description: ['', [Validators.required]],
    body: ['', [Validators.required]],
  });

  /** Separate control for the tag input — not part of the submitted payload. */
  protected readonly tagInputControl = new FormControl('', { nonNullable: true });

  ngOnInit(): void {
    const slug = this.slug();

    // Wire up auto-save with debounce on every form value change.
    this.articleForm.valueChanges
      .pipe(debounceTime(1500), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.saveDraft());

    if (!slug) {
      // New article mode: check for a draft immediately (synchronously).
      this.checkAndOfferDraft(undefined);
      return;
    }

    // Edit mode: fetch article from server first, then check for draft.
    this.articlesService
      .get(slug)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((article) => {
        this.articleForm.patchValue({
          title: article.title,
          description: article.description,
          body: article.body,
        });
        this.tags.set([...article.tagList]);
        // Check after the form has been populated with server data so that
        // "Restore draft" will visibly overwrite the server values.
        this.checkAndOfferDraft(slug);
      });
  }

  protected onTagInputEnter(event: Event): void {
    event.preventDefault();
    const tag = this.tagInputControl.value.trim();
    if (tag && !this.tags().includes(tag)) {
      this.tags.update((current) => [...current, tag]);
      this.saveDraft(); // tag changes are discrete events — save immediately
    }
    this.tagInputControl.reset();
  }

  protected removeTag(tagToRemove: string): void {
    this.tags.update((current) => current.filter((tag) => tag !== tagToRemove));
    this.saveDraft(); // tag changes are discrete events — save immediately
  }

  protected restoreDraft(): void {
    if (!this.pendingDraft) return;
    this.articleForm.patchValue({
      title: this.pendingDraft.title,
      description: this.pendingDraft.description,
      body: this.pendingDraft.body,
    });
    this.tags.set([...this.pendingDraft.tags]);
    this.pendingDraft = null;
    this.showDraftBanner.set(false);
  }

  protected discardDraft(): void {
    this.draftService.clearDraft(this.slug());
    this.pendingDraft = null;
    this.showDraftBanner.set(false);
  }

  protected submit(): void {
    if (this.articleForm.invalid || this.isSubmitting()) {
      return;
    }

    this.isSubmitting.set(true);
    this.errors.set(null);

    const { title, description, body } = this.articleForm.getRawValue();
    const slug = this.slug();

    const payload = {
      title,
      description,
      body,
      tagList: this.tags(),
      ...(slug ? { slug } : {}),
    };

    this.articlesService
      .save(payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (savedArticle) => {
          this.draftService.clearDraft(slug);
          this.router.navigate(['/article', savedArticle.slug]);
        },
        error: (err) => {
          this.errors.set(err?.error?.errors ?? { '': ['An unexpected error occurred.'] });
          this.isSubmitting.set(false);
        },
      });
  }

  private checkAndOfferDraft(slug: string | undefined): void {
    const draft = this.draftService.loadDraft(slug);
    if (!draft) return;

    this.pendingDraft = draft;
    this.draftSavedAt.set(this.formatTime(draft.savedAt));
    this.showDraftBanner.set(true);
  }

  private saveDraft(): void {
    const { title, description, body } = this.articleForm.getRawValue();
    // Only persist if there is something worth saving.
    if (!title && !description && !body && this.tags().length === 0) return;

    this.draftService.saveDraft(this.slug(), {
      title,
      description,
      body,
      tags: this.tags(),
    });
  }

  private formatTime(isoString: string): string {
    try {
      return new Date(isoString).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  }
}
