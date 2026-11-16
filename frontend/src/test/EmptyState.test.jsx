import React from 'react';
import { describe, test, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import EmptyState from '../components/ui/EmptyState';

describe('EmptyState Component Unit Tests', () => {
  test('TC-FE-EMPTY-01: renders title and description', () => {
    render(
      <EmptyState
        title="No Meals Today"
        description="The mess schedule has not been published yet."
      />
    );
    expect(screen.getByText('No Meals Today')).toBeInTheDocument();
    expect(screen.getByText(/schedule has not been published/i)).toBeInTheDocument();
  });

  test('TC-FE-EMPTY-02: renders action button and triggers onAction callback', () => {
    const handleAction = vi.fn();
    render(
      <EmptyState
        title="No Reviews"
        description="No reviews found"
        actionLabel="Add Review"
        onAction={handleAction}
      />
    );
    const actionBtn = screen.getByRole('button', { name: /add review/i });
    expect(actionBtn).toBeInTheDocument();
    fireEvent.click(actionBtn);
    expect(handleAction).toHaveBeenCalledTimes(1);
  });
});
