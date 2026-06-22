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

import { ArticlesService } from '../../core/services/articles.service';
import { ListErrorsComponent } from '../../shared/list-errors.component';

@Component({
  selector: 'app-editor',
  imports: [ReactiveFormsModule, ListErrorsComponent],
  template: `
    <div class="editor-page">
      <div class="container page">
        <div class="row">
          <div class="col-md-10 offset-md-1 col-xs-12">

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
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(FormBuilder);

  /** Present only in edit mode (/editor/:slug). Bound via withComponentInputBinding(). */
  readonly slug = input<string | undefined>(undefined);

  protected readonly isEditMode = computed(() => !!this.slug());

  protected readonly tags = signal<string[]>([]);
  protected readonly isSubmitting = signal(false);
  protected readonly errors = signal<Record<string, string[]> | null>(null);

  protected readonly articleForm = this.fb.nonNullable.group({
    title: ['', [Validators.required]],
    description: ['', [Validators.required]],
    body: ['', [Validators.required]],
  });

  /** Separate control for the tag input — not part of the submitted payload. */
  protected readonly tagInputControl = new FormControl('', { nonNullable: true });

  ngOnInit(): void {
    const slug = this.slug();
    if (!slug) {
      return;
    }

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
      });
  }

  protected onTagInputEnter(event: Event): void {
    event.preventDefault();
    const tag = this.tagInputControl.value.trim();
    if (tag && !this.tags().includes(tag)) {
      this.tags.update((current) => [...current, tag]);
    }
    this.tagInputControl.reset();
  }

  protected removeTag(tagToRemove: string): void {
    this.tags.update((current) => current.filter((tag) => tag !== tagToRemove));
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
          this.router.navigate(['/article', savedArticle.slug]);
        },
        error: (err) => {
          this.errors.set(err?.error?.errors ?? { '': ['An unexpected error occurred.'] });
          this.isSubmitting.set(false);
        },
      });
  }
}
