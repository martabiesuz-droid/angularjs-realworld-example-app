import { Injectable } from '@angular/core';

export interface ArticleDraft {
  title: string;
  description: string;
  body: string;
  tags: string[];
  savedAt: string; // ISO 8601 timestamp
}

const PREFIX = 'conduit:draft:';

@Injectable({ providedIn: 'root' })
export class DraftService {
  private buildKey(slug: string | undefined): string {
    return slug ? `${PREFIX}edit:${slug}` : `${PREFIX}new`;
  }

  saveDraft(slug: string | undefined, data: Omit<ArticleDraft, 'savedAt'>): void {
    const draft: ArticleDraft = { ...data, savedAt: new Date().toISOString() };
    try {
      localStorage.setItem(this.buildKey(slug), JSON.stringify(draft));
    } catch {
      // localStorage may be unavailable (private mode quota exceeded, etc.)
    }
  }

  loadDraft(slug: string | undefined): ArticleDraft | null {
    try {
      const raw = localStorage.getItem(this.buildKey(slug));
      return raw ? (JSON.parse(raw) as ArticleDraft) : null;
    } catch {
      return null;
    }
  }

  clearDraft(slug: string | undefined): void {
    try {
      localStorage.removeItem(this.buildKey(slug));
    } catch {
      // ignore
    }
  }

  hasDraft(slug: string | undefined): boolean {
    return this.loadDraft(slug) !== null;
  }
}
