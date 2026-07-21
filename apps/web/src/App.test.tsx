// @vitest-environment jsdom
import { PROTOTYPE_DISCLAIMER } from '@egovai/core';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';
import { useDemoStore } from './store/useDemoStore';
import './test/setup';

describe('eGovAI interface', () => {
  afterEach(() => cleanup());

  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);
        if (url.endsWith('/api/notifications')) {
          return new Response(JSON.stringify([]), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }
        return new Response(JSON.stringify({}), { status: 200, headers: { 'Content-Type': 'application/json' } });
      }),
    );
    useDemoStore.setState({ conversationState: 'IDLE', messages: [] });
  });

  it('renders the persistent prototype disclaimer', () => {
    render(<MemoryRouter initialEntries={['/chat']}><App /></MemoryRouter>);
    expect(screen.getByText(PROTOTYPE_DISCLAIMER)).toBeVisible();
    expect(screen.getAllByText('HACKATHON PROTOTYPE').length).toBeGreaterThan(0);
  });

  it('supports keyboard-accessible booking choices', async () => {
    const user = userEvent.setup();
    render(<MemoryRouter initialEntries={['/chat']}><App /></MemoryRouter>);
    const start = screen.getByRole('button', { name: /book a dfa appointment/i });
    start.focus();
    await user.keyboard('{Enter}');
    expect(screen.getByRole('button', { name: /adult passport renewal/i })).toBeVisible();
  });

  it('masks sensitive demo values', () => {
    useDemoStore.setState({ conversationState: 'REVIEW_FORM' });
    render(<MemoryRouter initialEntries={['/profile']}><App /></MemoryRouter>);
    expect(screen.getByText('+63 917 *** 0184')).toBeVisible();
    expect(screen.queryByText(/\b\d{16}\b/)).not.toBeInTheDocument();
  });
});
