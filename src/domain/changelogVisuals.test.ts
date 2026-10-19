import { describe, expect, it } from 'vitest';
import english from '../../CHANGELOG.md?raw';
import french from '../../CHANGELOG.fr.md?raw';
import { parseChangelog } from './changelog';
import { CHANGELOG_VISUALS, changelogVisual } from './changelogVisuals';

describe('editorial changelog illustrations', () => {
  it('keeps illustrated entries aligned with both source histories', () => {
    const en = parseChangelog(english), fr = parseChangelog(french);
    for (const [key, visual] of Object.entries(CHANGELOG_VISUALS)) {
      const [version, index] = key.split(':');
      const source = en.find((release) => release.version === version)?.changes[Number(index)];
      expect(source, key).toBeDefined();
      expect(source?.kind, key).toBe(visual === 'composerImage' ? 'design' : 'new');
      expect(Number(version.split('.')[0]), key).toBeGreaterThanOrEqual(2);
      const translated = fr.find((release) => release.version === version);
      if (translated) expect(translated.changes[Number(index)]?.kind, key).toBe(source?.kind);
    }
  });
  it('illustrates the sidebar filters and keeps unrelated corrections text-only', () => {
    expect(changelogVisual('2.2.0', 0)).toBe('sidebarFilters');
    expect(changelogVisual('2.2.0', 1)).toBe('filterEditor');
    expect(changelogVisual('2.9.0', 6)).toBeNull();
    expect(changelogVisual('2.9.0', 3)).toBeNull();
    expect(changelogVisual('2.6.0', 0)).toBeNull();
    expect(changelogVisual('99.0.0', 0)).toBeNull();
    expect(changelogVisual('1.21.0', 0)).toBeNull();
    expect(changelogVisual('0.1.0', 0)).toBeNull();
    expect(changelogVisual('2.0.0', 6)).toBe('projectView');
  });
});
