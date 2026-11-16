import React, { useState } from 'react';
import { FaStar } from 'react-icons/fa';
import styles from './StarRating.module.css';

export default function StarRating({
  rating = 0,
  onRatingChange,
  readOnly = false,
  size = 22,
  showLabel = false,
}) {
  const [hoverRating, setHoverRating] = useState(0);

  const handleClick = (value) => {
    if (!readOnly && onRatingChange) {
      onRatingChange(value);
    }
  };

  const handleMouseEnter = (value) => {
    if (!readOnly) {
      setHoverRating(value);
    }
  };

  const handleMouseLeave = () => {
    if (!readOnly) {
      setHoverRating(0);
    }
  };

  const currentDisplay = hoverRating || rating || 0;

  const labels = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

  return (
    <div className={styles.container} data-testid="star-rating-container">
      <div className={styles.starsRow} onMouseLeave={handleMouseLeave}>
        {[1, 2, 3, 4, 5].map((starValue) => {
          const isFilled = starValue <= currentDisplay;
          return (
            <button
              key={starValue}
              type="button"
              disabled={readOnly}
              className={`${styles.starBtn} ${readOnly ? styles.readOnly : ''}`}
              onClick={() => handleClick(starValue)}
              onMouseEnter={() => handleMouseEnter(starValue)}
              aria-label={`Rate ${starValue} of 5 stars`}
              data-testid={`star-${starValue}`}
            >
              <FaStar
                size={size}
                className={isFilled ? styles.starFilled : styles.starEmpty}
              />
            </button>
          );
        })}
      </div>
      {showLabel && currentDisplay > 0 && (
        <span className={styles.labelText}>{labels[currentDisplay]}</span>
      )}
    </div>
  );
}
