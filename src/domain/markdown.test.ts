import { describe, expect, it } from 'vitest';
import { plainTitle, renderTitle, titleLinks } from './markdown';

describe('task titles with links (#101)', () => {
  it('renders a Markdown link and a bare address as anchors that open a new tab', () => {
    const html = renderTitle('Read [the brief](https://example.com/a_b) and https://todoist.com/x');
    expect(html).toContain('<a href="https://example.com/a_b" target="_blank" rel="noopener noreferrer">the brief</a>');
    expect(html).toContain('<a href="https://todoist.com/x"');
  });

  it('never lets markup through', () => {
    expect(renderTitle('<img src=x onerror=alert(1)>')).not.toContain('<img');
    expect(renderTitle('[x](javascript:alert(1))')).not.toContain('<a');
  });

  it('reads as plain words where a title is text', () => {
    expect(plainTitle('Read [the brief](https://example.com) **now**')).toBe('Read the brief now');
  });

  it('lists the links a title carries, in order', () => {
    expect(titleLinks('[a](https://a.com) then https://b.com')).toEqual([
      { label: 'a', href: 'https://a.com' },
      { label: 'https://b.com', href: 'https://b.com' },
    ]);
    expect(titleLinks('no links here')).toEqual([]);
  });
});
