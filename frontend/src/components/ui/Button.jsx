import React from 'react';
import styles from './Button.module.css';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  type = 'button',
  loading = false,
  disabled = false,
  onClick,
  className = '',
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${styles.button} ${styles[variant]} ${styles[size]} ${className}`}
      {...props}
    >
      {loading ? (
        <span className={styles.spinnerWrapper}>
          <span className={styles.spinner} />
          <span>Processing...</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
}
