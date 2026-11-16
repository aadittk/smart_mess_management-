import React from 'react';
import { describe, test, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import StarRating from '../components/ui/StarRating';

describe('StarRating Component Unit Tests', () => {
  test('TC-FE-STAR-01: renders exactly 5 star rating buttons', () => {
    render(<StarRating rating={3} />);
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(5);
  });

  test('TC-FE-STAR-02: clicking star button invokes onRatingChange with correct value', () => {
    const handleChange = vi.fn();
    render(<StarRating rating={2} onRatingChange={handleChange} />);

    const star4 = screen.getByTestId('star-4');
    fireEvent.click(star4);

    expect(handleChange).toHaveBeenCalledWith(4);
  });

  test('TC-FE-STAR-03: readOnly mode does not fire onRatingChange on click', () => {
    const handleChange = vi.fn();
    render(<StarRating rating={4} readOnly={true} onRatingChange={handleChange} />);

    const star5 = screen.getByTestId('star-5');
    fireEvent.click(star5);

    expect(handleChange).not.toHaveBeenCalled();
    expect(star5).toBeDisabled();
  });

  test('TC-FE-STAR-04: shows label when showLabel is true', () => {
    render(<StarRating rating={5} showLabel={true} />);
    expect(screen.getByText('Excellent')).toBeInTheDocument();
  });
});
