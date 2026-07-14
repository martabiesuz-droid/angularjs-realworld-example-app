import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { LowerCasePipe } from '@angular/common';

import { environment } from '../../../environments/environment';
import { TagsService } from '../../core/services/tags.service';
import { UserService } from '../../core/services/user.service';
import { ArticleListComponent, ListConfig } from '../../shared/article-list.component';

@Component({
  selector: 'app-home',
  imports: [LowerCasePipe, ArticleListComponent],
  template: `
    <div class="home-page">

      <!-- Banner — only for guests -->
      @if (!userService.currentUser()) {
        <div class="banner">
          <div class="container">
            <h1 class="logo-font">{{ appName | lowercase }}</h1>
            <p>A place to share your knowledge.</p>
          </div>
        </div>
      }

      <div class="container page">
        <div class="row">

          <!-- Feed + article list -->
          <div class="col-md-9">
            <div class="feed-toggle">
              <ul class="nav nav-pills outline-active">

                @if (userService.currentUser()) {
                  <li class="nav-item">
                    <a class="nav-link"
                       [class.active]="activeTab() === 'feed'"
                       href=""
                       (click)="setTab($event, 'feed')">
                      Your Feed
                    </a>
                  </li>
                }

                <li class="nav-item">
                  <a class="nav-link"
                     [class.active]="activeTab() === 'all'"
                     href=""
                     (click)="setTab($event, 'all')">
                    Global Feed
                  </a>
                </li>

                @if (activeTab() === 'tag') {
                  <li class="nav-item">
                    <a class="nav-link active" href="" (click)="$event.preventDefault()">
                      <i class="ion-pound"></i> {{ selectedTag() }}
                    </a>
                  </li>
                }

              </ul>
            </div>

            <app-article-list [listConfig]="listConfig()" [limit]="10" />
          </div>

          <!-- Tags sidebar -->
          <div class="col-md-3">
            <div class="sidebar">
              <p>Popular Tags</p>

              @if (!tagsLoaded()) {
                <div>Loading tags...</div>
              } @else if (tags().length === 0) {
                <div class="post-preview">No tags are here... yet.</div>
              } @else {
                <div class="tag-list">
                  @for (tag of tags(); track tag) {
                    <a href="" class="tag-default tag-pill"
                       (click)="setTagFilter($event, tag)">
                      {{ tag }}
                    </a>
                  }
                </div>
              }
            </div>
          </div>

        </div>
      </div>
    </div>
  `,
})
export class HomeComponent implements OnInit {
  protected readonly userService = inject(UserService);
  private readonly tagsService = inject(TagsService);

  protected readonly appName = environment.appName;

  protected readonly activeTab = signal<'feed' | 'all' | 'tag'>(
    this.userService.currentUser() ? 'feed' : 'all',
  );
  protected readonly selectedTag = signal<string | null>(null);
  protected readonly tags = signal<string[]>([]);
  protected readonly tagsLoaded = signal(false);

  protected readonly listConfig = computed<ListConfig>(() => {
    const tab = this.activeTab();
    if (tab === 'feed') {
      return { type: 'feed' };
    }
    if (tab === 'tag') {
      return { type: 'all', filters: { tag: this.selectedTag() ?? '' } };
    }
    return { type: 'all' };
  });

  ngOnInit(): void {
    this.tagsService.getAll().subscribe({
      next: (tags) => {
        this.tags.set(tags);
        this.tagsLoaded.set(true);
      },
      error: () => this.tagsLoaded.set(true),
    });
  }

  protected setTab(event: Event, tab: 'feed' | 'all'): void {
    event.preventDefault();
    this.selectedTag.set(null);
    this.activeTab.set(tab);
  }

  protected setTagFilter(event: Event, tag: string): void {
    event.preventDefault();
    this.selectedTag.set(tag);
    this.activeTab.set('tag');
  }
}
