import { TestBed } from '@angular/core/testing';
import { DraftService, ArticleDraft } from './draft.service';

describe('DraftService', () => {
  let service: DraftService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DraftService],
    });
    service = TestBed.inject(DraftService);
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('saveDraft', () => {
    it('should save draft with edit key when slug is provided', () => {
      const slug = 'test-article';
      const data = {
        title: 'Test Title',
        description: 'Test Description',
        body: 'Test Body',
        tags: ['tag1', 'tag2']
      };
      
      service.saveDraft(slug, data);
      
      const savedData = localStorage.getItem('conduit:draft:edit:test-article');
      expect(savedData).toBeDefined();
      
      const savedDraft = JSON.parse(savedData!) as ArticleDraft;
      expect(savedDraft.title).toBe(data.title);
      expect(savedDraft.description).toBe(data.description);
      expect(savedDraft.body).toBe(data.body);
      expect(savedDraft.tags).toEqual(data.tags);
      expect(savedDraft.savedAt).toBeDefined();
    });

    it('should save draft with new key when no slug is provided', () => {
      const data = {
        title: 'Test Title',
        description: 'Test Description',
        body: 'Test Body',
        tags: ['tag1', 'tag2']
      };
      
      service.saveDraft(undefined, data);
      
      const savedData = localStorage.getItem('conduit:draft:new');
      expect(savedData).toBeDefined();
      
      const savedDraft = JSON.parse(savedData!) as ArticleDraft;
      expect(savedDraft.title).toBe(data.title);
      expect(savedDraft.savedAt).toBeDefined();
    });

    it('should handle localStorage errors gracefully', () => {
      const data = {
        title: 'Test Title',
        description: 'Test Description',
        body: 'Test Body',
        tags: ['tag1', 'tag2']
      };
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = vi.fn(() => {
        throw new Error('localStorage quota exceeded');
      });
      
      expect(() => service.saveDraft('test', data)).not.toThrow();
      
      // Restore original function
      localStorage.setItem = originalSetItem;
    });
  });

  describe('loadDraft', () => {
    it('should return draft when it exists', () => {
      const slug = 'test-article';
      const draft: ArticleDraft = {
        title: 'Test Title',
        description: 'Test Description',
        body: 'Test Body',
        tags: ['tag1', 'tag2'],
        savedAt: new Date().toISOString()
      };
      localStorage.setItem('conduit:draft:edit:test-article', JSON.stringify(draft));
      
      const result = service.loadDraft(slug);
      
      expect(result).toEqual(draft);
    });

    it('should return null when draft does not exist', () => {
      const result = service.loadDraft('non-existent');
      
      expect(result).toBeNull();
    });

    it('should return null when JSON is corrupted', () => {
      localStorage.setItem('conduit:draft:edit:corrupted', 'invalid-json');
      
      const result = service.loadDraft('corrupted');
      
      expect(result).toBeNull();
    });
  });

  describe('clearDraft', () => {
    it('should remove draft with correct key', () => {
      const slug = 'test-article';
      localStorage.setItem('conduit:draft:edit:test-article', 'some-draft-data');
      
      service.clearDraft(slug);
      
      expect(localStorage.getItem('conduit:draft:edit:test-article')).toBeNull();
    });
  });

  describe('hasDraft', () => {
    it('should return true when draft exists', () => {
      const slug = 'test-article';
      const draft: ArticleDraft = {
        title: 'Test Title',
        description: 'Test Description',
        body: 'Test Body',
        tags: ['tag1', 'tag2'],
        savedAt: new Date().toISOString()
      };
      localStorage.setItem('conduit:draft:edit:test-article', JSON.stringify(draft));
      
      const result = service.hasDraft(slug);
      
      expect(result).toBe(true);
    });

    it('should return false when draft does not exist', () => {
      const result = service.hasDraft('non-existent');
      
      expect(result).toBe(false);
    });
  });
});