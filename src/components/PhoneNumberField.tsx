'use client';

import PhoneInput, { getCountryCallingCode } from 'react-phone-number-input';
import type { Country } from 'react-phone-number-input';

interface PhoneNumberFieldProps {
  name: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
  inputClassName?: string;
  defaultCountry?: Country;
  autoComplete?: string;
  id?: string;
}

export function PhoneNumberField({
  name,
  value,
  onChange,
  placeholder = 'Enter phone number',
  required = false,
  className = '',
  inputClassName = '',
  defaultCountry,
  autoComplete = 'tel',
  id,
}: PhoneNumberFieldProps) {
  const handleCountryChange = (country?: Country) => {
    if (!country) return;
    if (value) return;
    const callingCode = getCountryCallingCode(country);
    onChange(`+${callingCode}`);
  };

  return (
    <>
      <input type="hidden" name={name} value={value} />
      <PhoneInput
        id={id}
        defaultCountry={defaultCountry}
        placeholder={placeholder}
        value={value || undefined}
        onChange={(nextValue) => onChange(nextValue ?? '')}
        onCountryChange={handleCountryChange}
        className={`phone-input-base ${className}`.trim()}
        countrySelectProps={{
          'aria-label': 'Select phone country',
        }}
        numberInputProps={{
          required,
          type: 'tel',
          autoComplete,
          className: inputClassName,
        }}
      />
    </>
  );
}
