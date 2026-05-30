import { describe, it, expect } from 'vitest';
import { getSchoolAvatarUrl } from '@/lib/utils/schoolAvatar';

describe('getSchoolAvatarUrl', () => {
  it('generates URL with encoded school name', () => {
    const url = getSchoolAvatarUrl('Sunrise Academy');
    expect(url).toContain('Sunrise%20Academy');
    expect(url).toContain('ui-avatars.com/api/');
  });

  it('includes background color', () => {
    const url = getSchoolAvatarUrl('Test');
    expect(url).toContain('background=020617');
  });

  it('includes white text color', () => {
    const url = getSchoolAvatarUrl('Test');
    expect(url).toContain('color=fff');
  });

  it('sets bold text', () => {
    const url = getSchoolAvatarUrl('Test');
    expect(url).toContain('bold=true');
  });

  it('returns SVG format', () => {
    const url = getSchoolAvatarUrl('Test');
    expect(url).toContain('format=svg');
  });

  it('encodes special characters in the name parameter', () => {
    const url = getSchoolAvatarUrl('St. Mary & Joseph');
    expect(url).toContain('St.%20Mary%20%26%20Joseph');
  });
});
