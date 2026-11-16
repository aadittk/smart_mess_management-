import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { IoMailOutline, IoLockClosedOutline, IoAlertCircleOutline } from 'react-icons/io5';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import toast from 'react-hot-toast';
import styles from './Auth.module.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { login, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isAuthenticated) {
      navigate(isAdmin ? '/admin/dashboard' : '/dashboard', { replace: true });
    }
    const params = new URLSearchParams(location.search);
    if (params.get('expired')) {
      toast.error('Your session expired. Please sign in again.');
    }
  }, [isAuthenticated, isAdmin, navigate, location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    if (!email || !password) {
      setErrorMessage('Please provide both email and password.');
      return;
    }

    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      navigate('/dashboard', { replace: true });
    } else {
      setErrorMessage(result.message);
    }
  };

  return (
    <div className={styles.authContainer}>
      <Card className={styles.authCard}>
        <div className={styles.cardHeader}>
          <h2 className={styles.title}>Student Portal Sign In</h2>
          <p className={styles.subtitle}>Enter your university credentials to access the hostel mess</p>
        </div>

        {errorMessage && (
          <div className={styles.errorAlert} role="alert" data-testid="login-error-alert">
            <IoAlertCircleOutline size={20} className={styles.errorIcon} />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="email" className={styles.label}>
              University Email
            </label>
            <div className={styles.inputWrapper}>
              <IoMailOutline className={styles.fieldIcon} size={18} />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@smartmess.edu"
                required
                className={styles.inputWithIcon}
                data-testid="email-input"
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password" className={styles.label}>
              Password
            </label>
            <div className={styles.inputWrapper}>
              <IoLockClosedOutline className={styles.fieldIcon} size={18} />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className={styles.inputWithIcon}
                data-testid="password-input"
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={loading}
            className={styles.submitBtn}
            data-testid="login-submit-button"
          >
            Sign In to SmartMess
          </Button>
        </form>

        <div className={styles.cardFooter}>
          <p className={styles.footerText}>
            Don't have an account yet?{' '}
            <Link to="/register" className={styles.linkText}>
              Register here
            </Link>
          </p>
          <div className={styles.divider}>
            <span>or</span>
          </div>
          <Link to="/admin/login" className={styles.adminSwitchLink}>
            Switch to Mess Administrator Portal &rarr;
          </Link>
        </div>
      </Card>
    </div>
  );
}
