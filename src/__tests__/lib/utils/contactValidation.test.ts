import { describe, it, expect } from 'vitest';
import {
  normalizeCountryName,
  normalizeOptionalPhoneNumber,
  normalizeRequiredPhoneNumber,
} from '@/lib/utils/contactValidation';

describe('normalizeCountryName', () => {
  it('returns the country name for a valid country', () => {
    expect(normalizeCountryName('Ethiopia')).toBe('Ethiopia');
  });

  it('trims whitespace from input', () => {
    expect(normalizeCountryName('  Kenya  ')).toBe('Kenya');
  });

  it('throws for empty string', () => {
    expect(() => normalizeCountryName('')).toThrow('Country is required.');
  });

  it('throws for invalid country name', () => {
    expect(() => normalizeCountryName('Atlantis')).toThrow('Please choose a valid country');
  });
});

describe('normalizeOptionalPhoneNumber', () => {
  it('returns empty string for empty input', () => {
    expect(normalizeOptionalPhoneNumber('')).toBe('');
  });

  it('throws for invalid phone number', () => {
    expect(() => normalizeOptionalPhoneNumber('123')).toThrow('must be a valid phone number');
  });

  it('returns E.164 format for a valid number', () => {
    const result = normalizeOptionalPhoneNumber('+251911234567');
    expect(result).toMatch(/^\+251/);
  });

  it('uses custom label in error message', () => {
    expect(() => normalizeOptionalPhoneNumber('abc', 'Mobile')).toThrow('Mobile must be a valid phone number.');
  });
});

describe('normalizeRequiredPhoneNumber', () => {
  it('returns formatted number for valid input', () => {
    const result = normalizeRequiredPhoneNumber('+251911234567');
    expect(result).toMatch(/^\+251/);
  });

  it('throws when empty and required', () => {
    expect(() => normalizeRequiredPhoneNumber('')).toThrow('Phone number is required.');
  });
});
