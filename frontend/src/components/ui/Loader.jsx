import React from 'react';
import styles from './Loader.module.css';

export default function Loader({ message = 'Loading...', size = 'md' }) {
  return (
    <div className={styles.loaderContainer} role="status" aria-live="polite">
      <div className={`${styles.spinner} ${styles[size]}`} />
      {message && <p className={styles.message}>{message}</p>}
    </div>
  );
}
