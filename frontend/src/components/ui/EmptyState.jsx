import React from 'react';
import { IoAlertCircleOutline } from 'react-icons/io5';
import Button from './Button';
import styles from './EmptyState.module.css';

export default function EmptyState({
  title = 'No records found',
  description = 'There is currently no data available to display.',
  icon: Icon = IoAlertCircleOutline,
  actionLabel,
  onAction,
}) {
  return (
    <div className={styles.emptyContainer} data-testid="empty-state">
      <div className={styles.iconCircle}>
        <Icon size={36} className={styles.icon} />
      </div>
      <h4 className={styles.title}>{title}</h4>
      <p className={styles.description}>{description}</p>
      {actionLabel && onAction && (
        <Button variant="primary" size="md" onClick={onAction} className={styles.actionBtn}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
