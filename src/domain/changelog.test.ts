import { describe, expect, it } from 'vitest';
import english from '../../CHANGELOG.md?raw';
import french from '../../CHANGELOG.fr.md?raw';
import {
  compareVersions, hasNews, localisedReleases, parseChangelog, unseenReleases,
} from './changelog';
import { VERSION } from '@/app-info';

const SAMPLE = `# Changelog
The changelog marks every line.

## 1.2.0

The intro, over
two lines.

🆕 **New thing.** It does
something.

🎨 **Redrawn.** Looks better.

🐛 **Fixed.** No longer breaks.

## 1.1.0

🐛 **Only a fix.** Nothing new.

## 1.0.0

🆕 **First.** Hello.
`;

describe('the changelog (#115)', () => {
  const releases = parseChangelog(SAMPLE);

  it('reads each release, its intro and its three kinds of change', () => {
    expect(releases.map((r) => r.version)).toEqual(['1.2.0', '1.1.0', '1.0.0']);
    expect(releases[0].intro).toBe('The intro, over two lines.');
    expect(releases[0].changes.map((c) => c.kind)).toEqual(['new', 'design', 'fix']);
    expect(releases[0].changes[0].text).toBe('**New thing.** It does something.');
  });

  it('compares versions as numbers', () => {
    expect(compareVersions('1.10.0', '1.9.3')).toBe(1);
    expect(compareVersions('1.2.0', '1.2.0')).toBe(0);
    expect(compareVersions('0.9.0', '1.0.0')).toBe(-1);
  });

  it('shows what came after the version last seen, up to the running one', () => {
    expect(unseenReleases(releases, '1.2.0', '1.0.0').map((r) => r.version)).toEqual(['1.2.0', '1.1.0']);
    expect(unseenReleases(releases, '1.1.0', '1.0.0').map((r) => r.version)).toEqual(['1.1.0']);
    expect(unseenReleases(releases, '1.2.0', '1.2.0')).toEqual([]);
  });

  it('shows only the running release to an account that never saw one', () => {
    expect(unseenReleases(releases, '1.2.0', null).map((r) => r.version)).toEqual(['1.2.0']);
  });

  it('is only worth a dialog when something is new', () => {
    expect(hasNews(unseenReleases(releases, '1.1.0', '1.0.0'))).toBe(false);
    expect(hasNews(unseenReleases(releases, '1.2.0', '1.1.0'))).toBe(true);
  });

  it('falls back to English for a release that is not translated', () => {
    const fr = parseChangelog('## 1.2.0\n\nEn français.\n\n🆕 **Nouveau.** Oui.\n');
    const merged = localisedReleases(releases, fr);
    expect(merged[0]).toMatchObject({ version: '1.2.0', intro: 'En français.', untranslated: false });
    expect(merged[1]).toMatchObject({ version: '1.1.0', untranslated: true });
  });

  it('reads the real files: the running version is described, and translated whole if at all', () => {
    const en = parseChangelog(english);
    expect(en.find((r) => r.version === VERSION)?.changes.length).toBeGreaterThan(0);
    for (const release of parseChangelog(french)) {
      const original = en.find((r) => r.version === release.version);
      expect(original, `CHANGELOG.fr.md has ${release.version}, CHANGELOG.md does not`).toBeDefined();
      expect(release.changes.map((c) => c.kind)).toEqual(original?.changes.map((c) => c.kind));
    }
  });
});
