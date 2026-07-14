import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-list-pagination',
  template: `
    @if (totalPages() > 1) {
      <nav>
        <ul class="pagination">
          @for (page of pageRange(); track page) {
            <li class="page-item" [class.active]="page === currentPage()">
              <a class="page-link" href="" (click)="onPageClick($event, page)">
                {{ page }}
              </a>
            </li>
          }
        </ul>
      </nav>
    }
  `,
})
export class ListPaginationComponent {
  readonly totalPages = input.required<number>();
  readonly currentPage = input.required<number>();
  readonly pageChange = output<number>();

  protected pageRange(): number[] {
    return Array.from({ length: this.totalPages() }, (_, i) => i + 1);
  }

  protected onPageClick(event: Event, page: number): void {
    event.preventDefault();
    if (page !== this.currentPage()) {
      this.pageChange.emit(page);
    }
  }
}
