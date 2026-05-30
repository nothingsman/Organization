import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PhoneNumberField } from '@/components/PhoneNumberField';

vi.mock('react-phone-number-input', () => ({
  default: (props: {
    value?: string;
    onChange?: (value?: string) => void;
    placeholder?: string;
    className?: string;
    numberInputProps?: Record<string, unknown>;
    countrySelectProps?: Record<string, unknown>;
  }) => {
    return (
      <input
        data-testid="phone-input"
        type="tel"
        value={props.value ?? ''}
        onChange={(e) => props.onChange?.(e.target.value)}
        placeholder={props.placeholder}
        className={props.className}
        required={props.numberInputProps?.required as boolean}
      />
    );
  },
}));

describe('PhoneNumberField', () => {
  const defaultProps = {
    name: 'phone',
    value: '',
    onChange: vi.fn(),
    placeholder: '+251 91 123 4567',
  };

  it('renders hidden input and phone input', () => {
    render(<PhoneNumberField {...defaultProps} />);
    const hiddenInput = document.querySelector('input[type="hidden"]') as HTMLInputElement;
    expect(hiddenInput).toBeInTheDocument();
    expect(hiddenInput.name).toBe('phone');
    expect(screen.getByTestId('phone-input')).toBeInTheDocument();
  });

  it('displays the current value', () => {
    render(<PhoneNumberField {...defaultProps} value="+251911111111" />);
    const input = screen.getByTestId('phone-input') as HTMLInputElement;
    expect(input.value).toBe('+251911111111');
  });

  it('calls onChange when user types', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<PhoneNumberField {...defaultProps} onChange={onChange} />);

    const input = screen.getByTestId('phone-input');
    await user.type(input, '1');

    expect(onChange).toHaveBeenCalled();
  });

  it('passes required to number input', () => {
    render(<PhoneNumberField {...defaultProps} required />);
    const input = screen.getByTestId('phone-input');
    expect(input).toHaveAttribute('required');
  });
});
