import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  IoPersonOutline,
  IoMailOutline,
  IoLockClosedOutline,
  IoSchoolOutline,
  IoBusinessOutline,
  IoKeyOutline,
  IoCallOutline,
  IoCheckmarkCircleOutline,
  IoAlertCircleOutline,
} from 'react-icons/io5';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import toast from 'react-hot-toast';
import styles from './Auth.module.css';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    roll_number: '',
    hostel_name: 'Aryabhatta Hostel',
    room_number: '',
    phone_number: '',
    password: '',
    confirm_password: '',
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [registeredSuccess, setRegisteredSuccess] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (formData.password !== formData.confirm_password) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    if (formData.password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      const res = await register({
        name: formData.name,
        email: formData.email,
        roll_number: formData.roll_number,
        hostel_name: formData.hostel_name,
        room_number: formData.room_number,
        phone_number: formData.phone_number,
        password: formData.password,
      });

      if (res.success) {
        setRegisteredSuccess(true);
        toast.success('Registration submitted for admin approval!');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  if (registeredSuccess) {
    return (
      <div className={styles.authContainer}>
        <Card className={styles.authCard}>
          <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
            <div style={{ color: 'var(--success-color)', marginBottom: '1rem' }}>
              <IoCheckmarkCircleOutline size={64} />
            </div>
            <h2 className={styles.title} style={{ color: 'var(--success-color)' }}>
              Registration Submitted!
            </h2>
            <p className={styles.subtitle} style={{ marginTop: '0.75rem', lineHeight: '1.6' }}>
              Your account has been registered with roll number <strong>{formData.roll_number}</strong>.
            </p>
            <div
              style={{
                backgroundColor: 'var(--warning-light)',
                border: '1px solid #fef3c7',
                borderRadius: 'var(--radius-sm)',
                padding: '1rem',
                margin: '1.5rem 0',
                color: '#92400e',
                fontSize: '0.9rem',
                textAlign: 'left',
              }}
            >
              <strong>Notice:</strong> As per hostel mess policy, new accounts are created with{' '}
              <em>unverified status</em>. The mess manager or warden must verify your student details
              before you can log in.
            </div>
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate('/login')}
              style={{ width: '100%' }}
            >
              Return to Sign In
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className={styles.authContainer}>
      <Card className={styles.authCard} style={{ maxWidth: '540px' }}>
        <div className={styles.cardHeader}>
          <h2 className={styles.title}>Student Account Registration</h2>
          <p className={styles.subtitle}>Register your details to request hostel dining hall access</p>
        </div>

        {errorMessage && (
          <div className={styles.errorAlert} role="alert" data-testid="register-error-alert">
            <IoAlertCircleOutline size={20} className={styles.errorIcon} />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Full Name</label>
            <div className={styles.inputWrapper}>
              <IoPersonOutline className={styles.fieldIcon} size={18} />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Aarav Sharma"
                required
                className={styles.inputWithIcon}
                data-testid="register-name"
              />
            </div>
          </div>

          <div className={styles.rowInputs}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>University Email</label>
              <div className={styles.inputWrapper}>
                <IoMailOutline className={styles.fieldIcon} size={18} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="student@smartmess.edu"
                  required
                  className={styles.inputWithIcon}
                  data-testid="register-email"
                />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>Roll / Student ID</label>
              <div className={styles.inputWrapper}>
                <IoSchoolOutline className={styles.fieldIcon} size={18} />
                <input
                  type="text"
                  name="roll_number"
                  value={formData.roll_number}
                  onChange={handleChange}
                  placeholder="CS2024001"
                  required
                  className={styles.inputWithIcon}
                  data-testid="register-roll"
                />
              </div>
            </div>
          </div>

          <div className={styles.rowInputs}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Hostel Residence</label>
              <div className={styles.inputWrapper}>
                <IoBusinessOutline className={styles.fieldIcon} size={18} />
                <select
                  name="hostel_name"
                  value={formData.hostel_name}
                  onChange={handleChange}
                  className={styles.inputWithIcon}
                  data-testid="register-hostel"
                >
                  <option value="Aryabhatta Hostel">Aryabhatta Hostel</option>
                  <option value="Bhaskara Hostel">Bhaskara Hostel</option>
                  <option value="Charaka Hostel">Charaka Hostel</option>
                  <option value="Gargi Girls Hostel">Gargi Girls Hostel</option>
                  <option value="Maitreyi Girls Hostel">Maitreyi Girls Hostel</option>
                </select>
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>Room Number</label>
              <div className={styles.inputWrapper}>
                <IoKeyOutline className={styles.fieldIcon} size={18} />
                <input
                  type="text"
                  name="room_number"
                  value={formData.room_number}
                  onChange={handleChange}
                  placeholder="B-204"
                  required
                  className={styles.inputWithIcon}
                  data-testid="register-room"
                />
              </div>
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Phone Number</label>
            <div className={styles.inputWrapper}>
              <IoCallOutline className={styles.fieldIcon} size={18} />
              <input
                type="tel"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                placeholder="+91 98765 43210"
                required
                className={styles.inputWithIcon}
                data-testid="register-phone"
              />
            </div>
          </div>

          <div className={styles.rowInputs}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Password</label>
              <div className={styles.inputWrapper}>
                <IoLockClosedOutline className={styles.fieldIcon} size={18} />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Min. 6 chars"
                  required
                  className={styles.inputWithIcon}
                  data-testid="register-password"
                />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>Confirm Password</label>
              <div className={styles.inputWrapper}>
                <IoLockClosedOutline className={styles.fieldIcon} size={18} />
                <input
                  type="password"
                  name="confirm_password"
                  value={formData.confirm_password}
                  onChange={handleChange}
                  placeholder="Confirm password"
                  required
                  className={styles.inputWithIcon}
                  data-testid="register-confirm-password"
                />
              </div>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={loading}
            className={styles.submitBtn}
            data-testid="register-submit-button"
          >
            Submit Registration
          </Button>
        </form>

        <div className={styles.cardFooter}>
          <p className={styles.footerText}>
            Already verified by your warden?{' '}
            <Link to="/login" className={styles.linkText}>
              Log in here
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
}
