import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LegalModal, TermsOfService, PrivacyPolicy } from '@/components/LegalModal';

describe('LegalModal', () => {
  const onClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders modal with title and content', () => {
    render(
      <LegalModal isOpen onClose={onClose} title="Terms of Service">
        <TermsOfService />
      </LegalModal>
    );

    expect(screen.getByText('Terms of Service')).toBeInTheDocument();
    expect(screen.getByText(/Welcome to our School Administration Platform/)).toBeInTheDocument();
  });

  it('renders privacy content when open', () => {
    render(
      <LegalModal isOpen onClose={onClose} title="Privacy Policy">
        <PrivacyPolicy />
      </LegalModal>
    );

    expect(screen.getByText('Privacy Policy')).toBeInTheDocument();
    expect(screen.getByText(/describes how we collect, use, and protect/)).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    render(
      <LegalModal isOpen={false} onClose={onClose} title="Terms">
        <TermsOfService />
      </LegalModal>
    );

    expect(screen.queryByText('Terms')).not.toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <LegalModal isOpen onClose={onClose} title="Terms of Service">
        <TermsOfService />
      </LegalModal>
    );

    const closeButton = screen.getByLabelText('Close');
    await user.click(closeButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when "I Understand" button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <LegalModal isOpen onClose={onClose} title="Terms of Service">
        <TermsOfService />
      </LegalModal>
    );

    const understandButton = screen.getByText('I Understand');
    await user.click(understandButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
