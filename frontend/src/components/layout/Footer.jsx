import React from 'react';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.info}>
          <p className={styles.brand}>SmartMess System</p>
          <p className={styles.desc}>
            University Hostel Dining & Smart Food Operations Management Platform.
          </p>
        </div>
        <div className={styles.meta}>
          <p className={styles.copy}>
            &copy; {new Date().getFullYear()} SmartMess Inc. Academic Software Engineering Project.
          </p>
          <div className={styles.status}>
            <span className={styles.statusDot} />
            <span>Operational (Client-Server REST)</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
