import React from 'react';
import styles from './Card.module.css';

export default function Card({ children, title, subtitle, action, className = '', footer, ...props }) {
  return (
    <div className={`${styles.card} ${className}`} {...props}>
      {(title || subtitle || action) && (
        <div className={styles.header}>
          <div>
            {title && <h3 className={styles.title}>{title}</h3>}
            {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          </div>
          {action && <div className={styles.action}>{action}</div>}
        </div>
      )}
      <div className={styles.body}>{children}</div>
      {footer && <div className={styles.footer}>{footer}</div>}
    </div>
  );
}
