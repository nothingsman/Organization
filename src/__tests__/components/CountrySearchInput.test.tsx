import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { CountrySearchInput } from '@/components/CountrySearchInput';

const mockGetData = vi.hoisted(() => vi.fn(() => [
  { code: 'ET', name: 'Ethiopia' },
  { code: 'US', name: 'United States of America (the)' },
  { code: 'KE', name: 'Kenya' },
  { code: 'UG', name: 'Uganda' },
]));

vi.mock('country-list', () => ({
  getData: (...args: unknown[]) => mockGetData(...args),
}));

function TestWrapper({ initialValue = '' }: { initialValue?: string }) {
  const [value, setValue] = useState(initialValue);
  return <CountrySearchInput name="country" value={value} onChange={setValue} />;
}

describe('CountrySearchInput', () => {
  it('renders combobox input', () => {
    render(<TestWrapper />);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('shows dropdown with countries on input focus', async () => {
    const user = userEvent.setup();
    render(<TestWrapper />);

    const input = screen.getByRole('combobox');
    await user.click(input);

    expect(screen.getByText('Ethiopia')).toBeInTheDocument();
    expect(screen.getByText('Kenya')).toBeInTheDocument();
  });

  it('filters countries as user types', async () => {
    const user = userEvent.setup();
    render(<TestWrapper />);

    const input = screen.getByRole('combobox');
    await user.click(input);
    await user.type(input, 'eth');

    expect(screen.getByText('Ethiopia')).toBeInTheDocument();

    await user.clear(input);
    await user.type(input, 'xyz');

    expect(screen.queryByText('Ethiopia')).not.toBeInTheDocument();
  });

  it('calls onChange and updates value when country is typed', async () => {
    const user = userEvent.setup();
    render(<TestWrapper />);

    const input = screen.getByRole('combobox');
    await user.click(input);
    await user.type(input, 'Eth');

    expect((input as HTMLInputElement).value).toBe('Eth');
  });

  it('shows no matching countries message', async () => {
    const user = userEvent.setup();
    render(<TestWrapper />);

    const input = screen.getByRole('combobox');
    await user.click(input);
    await user.type(input, 'zzzzz');

    expect(screen.getByText('No matching countries found.')).toBeInTheDocument();
  });

  it('sets the input value from the value prop', () => {
    render(<TestWrapper initialValue="Ethiopia" />);
    const input = screen.getByRole('combobox') as HTMLInputElement;
    expect(input.value).toBe('Ethiopia');
  });
});
