import { Component, computed, inject, input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { ListConfig, ArticleListComponent } from '../../shared/article-list.component';

@Component({
  selector: 'app-profile-articles',
  imports: [ArticleListComponent],
  template: `
    <app-article-list [listConfig]="listConfig()" />
  `,
})
export class ProfileArticlesComponent {
  private readonly route = inject(ActivatedRoute);

  /** Inherited from parent route param @:username via withComponentInputBinding(). */
  readonly username = input.required<string>();

  /** True when this component is mounted on the 'favorites' child route. */
  protected readonly isFavoritesTab = computed(
    () => this.route.snapshot.routeConfig?.path === 'favorites',
  );

  protected readonly listConfig = computed<ListConfig>(() => {
    const username = this.username();
    return this.isFavoritesTab()
      ? { type: 'all', filters: { favorited: username } }
      : { type: 'all', filters: { author: username } };
  });
}
