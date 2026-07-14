import { Injectable, signal } from '@angular/core';

const THEME_STORAGE_KEY = 'conduit-theme';
const DARK_CLASS = 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly isDarkMode = signal<boolean>(this.resolveInitialTheme());

  constructor() {
    this.applyTheme(this.isDarkMode());
  }

  toggle(): void {
    const nextValue = !this.isDarkMode();
    this.isDarkMode.set(nextValue);
    this.applyTheme(nextValue);
    localStorage.setItem(THEME_STORAGE_KEY, nextValue ? 'dark' : 'light');
  }

  /** Called by provideAppInitializer to ensure the class is applied before first render. */
  initialize(): void {
    // Constructor already applies the theme; this method exists so the service
    // is eagerly instantiated at app startup via provideAppInitializer.
  }

  private resolveInitialTheme(): boolean {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === 'dark') return true;
    if (stored === 'light') return false;
    // No stored preference — fall back to OS-level preference.
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
  }

  private applyTheme(isDark: boolean): void {
    document.body.classList.toggle(DARK_CLASS, isDark);
  }
}
