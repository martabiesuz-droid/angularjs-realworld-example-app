import { Component, input, computed } from '@angular/core';

/**
 * Renders a Conduit API error bag.
 * The API returns errors as: { errors: Record<string, string[]> }
 * This component flattens them into a bullet list.
 */
@Component({
  selector: 'app-list-errors',
  template: `
    @if (errorList().length > 0) {
      <ul class="error-messages">
        @for (error of errorList(); track error) {
          <li>{{ error }}</li>
        }
      </ul>
    }
  `,
})
export class ListErrorsComponent {
  /** Pass the raw errors object: Record<string, string[]> */
  readonly errors = input<Record<string, string[]> | null>(null);

  protected readonly errorList = computed<string[]>(() => {
    const errorsMap = this.errors();
    if (!errorsMap) {
      return [];
    }
    return Object.entries(errorsMap).flatMap(([field, messages]) =>
      messages.map((message) => `${field} ${message}`),
    );
  });
}
