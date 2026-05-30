import { describe, it, expect } from 'vitest';
import { formatAuthError, validatePassword, getPasswordRequirements } from '@/lib/utils/errorMessages';

describe('formatAuthError', () => {
  it('returns message for UNAUTHORIZED code', () => {
    const error = { normalized: { code: 'UNAUTHORIZED', message: '', originalStatus: 401 } };
    expect(formatAuthError(error)).toBe('Invalid email or password. Please check your credentials and try again.');
  });

  it('returns message for FORBIDDEN code', () => {
    const error = { normalized: { code: 'FORBIDDEN', message: '' } };
    expect(formatAuthError(error)).toBe('Access denied. Your account may not have the necessary permissions.');
  });

  it('returns message for NOT_FOUND code', () => {
    const error = { normalized: { code: 'NOT_FOUND', message: '' } };
    expect(formatAuthError(error)).toBe('Account not found. Please check your email or create a new account.');
  });

  it('returns message for NETWORK_ERROR code', () => {
    const error = { normalized: { code: 'NETWORK_ERROR', message: '' } };
    expect(formatAuthError(error)).toBe('Unable to connect to the server. Please check your internet connection.');
  });

  it('returns message for TIMEOUT code', () => {
    const error = { normalized: { code: 'TIMEOUT', message: '' } };
    expect(formatAuthError(error)).toBe('Request timed out. Please try again.');
  });

  it('returns message for SERVER_ERROR code', () => {
    const error = { normalized: { code: 'SERVER_ERROR', message: '' } };
    expect(formatAuthError(error)).toBe('Server error. Please try again later.');
  });

  it('uses custom message for VALIDATION_ERROR', () => {
    const error = { normalized: { code: 'VALIDATION_ERROR', message: 'Email is required.' } };
    expect(formatAuthError(error)).toBe('Email is required.');
  });

  it('handles 409 conflict status', () => {
    const error = { normalized: { code: 'UNKNOWN', message: '', originalStatus: 409 } };
    expect(formatAuthError(error)).toBe('An account with this email already exists. Please login instead.');
  });

  it('formats field errors with field names', () => {
    const error = {
      normalized: {
        code: 'VALIDATION_ERROR',
        message: '',
        fieldErrors: [
          { field: 'email', message: 'Enter a valid email.' },
          { field: 'password', message: 'Too short.' },
        ],
      },
    };
    expect(formatAuthError(error)).toBe('Email: Enter a valid email.. Password: Too short.');
  });

  it('handles standard Error objects', () => {
    expect(formatAuthError(new Error('Something broke'))).toBe('Something broke');
  });

  it('returns fallback for unknown input', () => {
    expect(formatAuthError(null)).toBe('An unexpected error occurred. Please try again.');
  });
});

describe('validatePassword', () => {
  it('returns valid for a strong password', () => {
    const result = validatePassword('StrongP@ss1');
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('rejects password shorter than 8 characters', () => {
    const result = validatePassword('Sh0rt!');
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Password must be at least 8 characters long');
  });

  it('rejects password without uppercase', () => {
    const result = validatePassword('lowercase1@');
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Password must contain at least one uppercase letter');
  });

  it('rejects password without lowercase', () => {
    const result = validatePassword('UPPERCASE1@');
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Password must contain at least one lowercase letter');
  });

  it('rejects password without number', () => {
    const result = validatePassword('NoNumbers@!');
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Password must contain at least one number');
  });

  it('rejects password without special character', () => {
    const result = validatePassword('NoSpecialChar1');
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Password must contain at least one special character');
  });

  it('reports multiple missing requirements', () => {
    const result = validatePassword('weak');
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(1);
  });
});

describe('getPasswordRequirements', () => {
  it('returns all four requirements', () => {
    const requirements = getPasswordRequirements();
    expect(requirements).toHaveLength(4);
    expect(requirements[0]).toContain('8 characters');
  });
});
