import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { IoShieldCheckmarkOutline, IoMailOutline, IoLockClosedOutline, IoAlertCircleOutline } from 'react-icons/io5';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import styles from '../Auth.module.css';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { adminLogin, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [isAuthenticated, isAdmin, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    if (!email || !password) {
      setErrorMessage('Please provide administrative email and password.');
      return;
    }

    setLoading(true);
    const result = await adminLogin(email, password);
    setLoading(false);

    if (result.success) {
      navigate('/admin/dashboard', { replace: true });
    } else {
      setErrorMessage(result.message);
    }
  };

  return (
    <div className={styles.authContainer}>
      <Card className={styles.authCard}>
        <div className={styles.cardHeader}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: '#fef3c7',
              color: '#b45309',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
            }}
          >
            <IoShieldCheckmarkOutline size={28} />
          </div>
          <h2 className={styles.title}>Warden / Admin Portal</h2>
          <p className={styles.subtitle}>Authorized personnel access for mess management operations</p>
        </div>

        {errorMessage && (
          <div className={styles.errorAlert} role="alert" data-testid="admin-login-error">
            <IoAlertCircleOutline size={20} className={styles.errorIcon} />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="admin-email" className={styles.label}>
              Administrative Email
            </label>
            <div className={styles.inputWrapper}>
              <IoMailOutline className={styles.fieldIcon} size={18} />
              <input
                id="admin-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@smartmess.edu"
                required
                className={styles.inputWithIcon}
                data-testid="admin-email-input"
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="admin-password" className={styles.label}>
              Administrative Password
            </label>
            <div className={styles.inputWrapper}>
              <IoLockClosedOutline className={styles.fieldIcon} size={18} />
              <input
                id="admin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className={styles.inputWithIcon}
                data-testid="admin-password-input"
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={loading}
            className={styles.submitBtn}
            data-testid="admin-login-submit"
          >
            Authenticate as Administrator
          </Button>
        </form>

        <div className={styles.cardFooter}>
          <p className={styles.footerText} style={{ fontSize: '0.8rem', color: 'var(--text-subtle)' }}>
            Note: Admin accounts cannot be self-registered. They are provisioned via server CLI script.
          </p>
          <div className={styles.divider}>
            <span>or</span>
          </div>
          <Link to="/login" className={styles.adminSwitchLink}>
            &larr; Return to Student Portal
          </Link>
        </div>
      </Card>
    </div>
  );
}
