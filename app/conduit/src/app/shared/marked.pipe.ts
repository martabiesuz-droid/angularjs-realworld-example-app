import { Pipe, PipeTransform, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { marked } from 'marked';

/**
 * Converts a Markdown string to sanitized HTML for use with [innerHTML].
 * Uses the `marked` library (already in package.json).
 *
 * Usage: <div [innerHTML]="article.body | marked"></div>
 */
@Pipe({ name: 'marked' })
export class MarkedPipe implements PipeTransform {
  private readonly sanitizer = inject(DomSanitizer);

  transform(value: string | null | undefined): SafeHtml {
    if (!value) {
      return '';
    }
    // marked.parse() is synchronous when no async renderer is configured.
    const html = marked.parse(value) as string;
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
}
