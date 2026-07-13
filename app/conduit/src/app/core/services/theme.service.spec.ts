import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  let service: ThemeService;

  const setMatchMedia = (matches: boolean) => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn((query: string) => ({
        matches,
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    });
  };

  const clearThemeData = () => {
    localStorage.clear();
    document.body.classList.remove('dark');
  };

  beforeEach(() => {
    clearThemeData();
    setMatchMedia(false); // Default to light mode
  });

  afterEach(() => {
    clearThemeData();
  });

  it('should initialize with dark mode when no preference saved and matchMedia prefers dark', () => {
    setMatchMedia(true); // Dark mode preferred
    
    TestBed.configureTestingModule({
      providers: [ThemeService],
    });
    service = TestBed.inject(ThemeService);

    expect(service.isDarkMode()).toBe(true);
    expect(document.body.classList.contains('dark')).toBe(true);
  });

  it('should initialize with light mode when no preference saved and matchMedia prefers light', () => {
    setMatchMedia(false); // Light mode preferred
    
    TestBed.configureTestingModule({
      providers: [ThemeService],
    });
    service = TestBed.inject(ThemeService);

    expect(service.isDarkMode()).toBe(false);
    expect(document.body.classList.contains('dark')).toBe(false);
  });

  it('should initialize with dark mode when localStorage has dark theme saved', () => {
    localStorage.setItem('conduit-theme', 'dark');
    setMatchMedia(false); // Even if OS prefers light, saved preference should win
    
    TestBed.configureTestingModule({
      providers: [ThemeService],
    });
    service = TestBed.inject(ThemeService);

    expect(service.isDarkMode()).toBe(true);
    expect(document.body.classList.contains('dark')).toBe(true);
    expect(localStorage.getItem('conduit-theme')).toBe('dark');
  });

  it('should initialize with light mode when localStorage has light theme saved', () => {
    localStorage.setItem('conduit-theme', 'light');
    setMatchMedia(true); // Even if OS prefers dark, saved preference should win
    
    TestBed.configureTestingModule({
      providers: [ThemeService],
    });
    service = TestBed.inject(ThemeService);

    expect(service.isDarkMode()).toBe(false);
    expect(document.body.classList.contains('dark')).toBe(false);
    expect(localStorage.getItem('conduit-theme')).toBe('light');
  });

  it('should toggle theme and update localStorage and body class', () => {
    setMatchMedia(false); // Start with light preference
    
    TestBed.configureTestingModule({
      providers: [ThemeService],
    });
    service = TestBed.inject(ThemeService);

    // Initial state should be light
    expect(service.isDarkMode()).toBe(false);
    expect(document.body.classList.contains('dark')).toBe(false);

    // Toggle to dark
    service.toggle();
    
    expect(service.isDarkMode()).toBe(true);
    expect(document.body.classList.contains('dark')).toBe(true);
    expect(localStorage.getItem('conduit-theme')).toBe('dark');

    // Toggle back to light
    service.toggle();
    
    expect(service.isDarkMode()).toBe(false);
    expect(document.body.classList.contains('dark')).toBe(false);
    expect(localStorage.getItem('conduit-theme')).toBe('light');
  });

  it('should initialize without throwing errors', () => {
    TestBed.configureTestingModule({
      providers: [ThemeService],
    });
    service = TestBed.inject(ThemeService);

    expect(() => service.initialize()).not.toThrow();
  });
});